import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import type { FormDataState, ImageResult, ShotLabelKey } from '../types';
import type { GeminiResponse, GeminiCandidate, GeminiImagePart, VeoOperation } from '../types/api';
import { storage } from "../firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { retry, isRetryableError } from '../utils/retry';
import { blobToBase64, resolveImageBytes, createThumbnail, base64ToBlob } from '../utils/imageUtils';
import { buildApiBasePrompt, addShotInstruction, addReferenceImageInstructions } from '../utils/promptBuilder';
import { useApiKey } from './ApiKeyContext';

interface ApiContextValue {
  // Gemini API 相關
  generateImages: (formData: FormDataState, shotLabels: Record<ShotLabelKey, string>, signal?: AbortSignal) => Promise<ImageResult[]>;
  generateVideo: (imageSrc: string, aspectRatio: string) => Promise<string>;
  
  // Firebase Storage 相關（只上傳縮圖）
  uploadHistoryThumbnails: (uid: string, images: ImageResult[]) => Promise<string[]>;
  
  // 工具函數
  downloadResource: (url: string) => Promise<Blob>;
  checkApiKeyAvailable: () => boolean;
}

const ApiContext = createContext<ApiContextValue | undefined>(undefined);

const normalizeImageModel = (model?: string): string => {
  if (model === "gemini-3-pro-image-preview") {
    return "gemini-3-pro-image";
  }

  return model || "gemini-2.5-flash-image";
};

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 使用 ApiKeyContext 統一管理 API Key
  const apiKeyContext = useApiKey();
  
  // 檢查 API Key 是否可用
  const checkApiKeyAvailable = useCallback((): boolean => {
    return apiKeyContext.isApiKeyAvailable();
  }, [apiKeyContext]);
  
  // 初始化 Gemini AI 客戶端
  const getGeminiClient = useCallback((): GoogleGenAI | null => {
    const apiKey = apiKeyContext.getApiKey();
    
    // 確保 API Key 格式正確（移除所有空白字符）
    const cleanedApiKey = apiKey ? apiKey.trim().replace(/\s+/g, '') : '';
    
    // 如果有環境變數提供的 API Key，直接使用
    if (cleanedApiKey) {
      // 開發模式下記錄 API Key 前綴（用於除錯）
      if (import.meta.env.DEV) {
        console.log('[API] 使用 API Key:', cleanedApiKey.substring(0, 8) + '...');
      }
      try {
        return new GoogleGenAI({ apiKey: cleanedApiKey });
      } catch (error) {
        console.error('[API] GoogleGenAI 初始化失敗:', error);
        throw new Error(`API Key 初始化失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
      }
    }
    
    // 如果有擴充功能，擴充功能會自動注入 API Key
    if (apiKeyContext.isUsingExtension()) {
      try {
        // 擴充功能會自動處理 API Key，傳入空字串即可
        return new GoogleGenAI({ apiKey: '' });
      } catch (error) {
        console.error('[API] 擴充功能初始化失敗:', error);
        return null;
      }
    }
    
    return null;
  }, [apiKeyContext]);
  
  // 下載資源（統一處理，支援取消，包含重試機制）
  const downloadResource = useCallback(async (url: string, signal?: AbortSignal): Promise<Blob> => {
    const apiKey = apiKeyContext.getApiKey();
    // 如果 URL 需要 API Key，自動附加
    const finalUrl = url.includes('?') 
      ? `${url}&key=${apiKey}` 
      : `${url}?key=${apiKey}`;
    
    // 使用重試機制下載資源
    return retry(
      async () => {
        if (signal?.aborted) {
          throw new Error('Request cancelled');
        }
        
        const response = await fetch(finalUrl, { 
          signal,
          credentials: 'omit',
        });
        
        if (!response.ok) {
          throw new Error(`Failed to download resource: ${response.status} ${response.statusText}`);
        }
        
        return response.blob();
      },
      {
        maxRetries: 3,
        initialDelay: 1000,
        retryable: (error) => {
          if (signal?.aborted) return false;
          return isRetryableError(error);
        },
      }
    );
  }, [apiKeyContext]);
  
  
  // 解析 Gemini 回應中的圖片候選
  const extractCandidates = useCallback((rawResponse: GeminiResponse): GeminiCandidate[] | undefined => {
    if (rawResponse?.candidates) return rawResponse.candidates;
    if (rawResponse?.response?.candidates) return rawResponse.response.candidates;
    if (Array.isArray(rawResponse?.inlinedResponses)) {
      const inlineMatch = rawResponse.inlinedResponses.find(
        (item) => item?.response?.candidates && item.response.candidates.length > 0
      );
      if (inlineMatch?.response?.candidates) return inlineMatch.response.candidates;
    }
    if (Array.isArray(rawResponse?.response?.inlinedResponses)) {
      const inlineMatch = rawResponse.response.inlinedResponses.find(
        (item) => item?.response?.candidates && item.response.candidates.length > 0
      );
      if (inlineMatch?.response?.candidates) return inlineMatch.response.candidates;
    }
    return undefined;
  }, []);
  
  // 生成圖片（支援取消）
  const generateImages = useCallback(async (
    formData: FormDataState,
    shotLabels: Record<ShotLabelKey, string>,
    signal?: AbortSignal
  ): Promise<ImageResult[]> => {
    const client = getGeminiClient();
    if (!client) {
      throw new Error("API Key is not available. Please set VITE_API_KEY environment variable or use browser extension.");
    }
    
    // 檢查擴充功能（如果使用）
    if (apiKeyContext.isUsingExtension()) {
      const hasKey = await apiKeyContext.checkExtensionApiKey();
      if (!hasKey) {
        await apiKeyContext.openExtensionKeySelector();
        throw new Error("Please select API Key in browser extension");
      }
    }
    
    const basePrompt = buildApiBasePrompt(formData);

    const shotTypes: { key: ShotLabelKey }[] = [
      { key: 'fullBody' },
      { key: 'medium' },
      { key: 'closeUp' },
    ];

    // v1.1: 如果有上傳視角參考圖，額外增加第四個視角
    if (formData.angleImage) {
      shotTypes.push({ key: 'specialAngle' });
    }
    
    const imagePromises = shotTypes.map(async (shot) => {
      const parts: ({ text: string } | { inlineData: { data: string; mimeType: string } })[] = [];

      let promptWithInstructions = addShotInstruction(basePrompt, shot.key);
      promptWithInstructions = addReferenceImageInstructions(
        promptWithInstructions,
        formData
      );

      if (formData.faceImage) {
        parts.push({
          inlineData: {
            data: formData.faceImage.data,
            mimeType: formData.faceImage.mimeType,
          },
        });
      }
      if (formData.objectImage) {
        parts.push({
          inlineData: {
            data: formData.objectImage.data,
            mimeType: formData.objectImage.mimeType,
          },
        });
      }
      if (formData.poseImage) {
        parts.push({
          inlineData: {
            data: formData.poseImage.data,
            mimeType: formData.poseImage.mimeType,
          },
        });
      }
      if (formData.expressionImage) {
        parts.push({
          inlineData: {
            data: formData.expressionImage.data,
            mimeType: formData.expressionImage.mimeType,
          },
        });
      }
      if (formData.angleImage) {
        parts.push({
          inlineData: {
            data: formData.angleImage.data,
            mimeType: formData.angleImage.mimeType,
          },
        });
      }

      parts.push({ text: promptWithInstructions });

      // 檢查是否已取消
      if (signal?.aborted) {
        throw new Error('Request cancelled');
      }

      // 使用重試機制呼叫 API
      const response = await retry(
        () => {
          if (signal?.aborted) {
            throw new Error('Request cancelled');
          }
          return client.models.generateContent({
            model: normalizeImageModel(formData.imageModel),
            contents: [{
              role: 'user',
              parts,
            }],
            config: {
              responseModalities: [Modality.IMAGE],
              responseFormat: {
                image: {
                  aspectRatio: formData.aspectRatio,
                },
              },
            },
          }) as Promise<GeminiResponse>;
        },
        {
          maxRetries: 3,
          initialDelay: 1000,
          retryable: (error) => {
            if (signal?.aborted) return false;
            return isRetryableError(error);
          },
        }
      );

      const candidates = extractCandidates(response);
      const candidate = candidates?.[0] ?? null;
      const contentParts: GeminiImagePart[] | undefined = candidate?.content?.parts;

      if (!contentParts || contentParts.length === 0) {
        const blockReason =
          response.promptFeedback?.blockReason ??
          response.promptFeedback?.safetyRatings?.[0]?.category;
        throw new Error(blockReason ?? "API did not return image content");
      }

      const imagePart = contentParts.find(
        (part): part is GeminiImagePart => 
          !!(part.inlineData || part.fileData || (Array.isArray(part.parts) && part.parts.length > 0))
      );

      if (!imagePart) {
        throw new Error("API failed to return image for one of the viewpoints");
      }

      if (imagePart.inlineData?.data) {
        return {
          label: shotLabels[shot.key],
          labelKey: shot.key,
          mimeType: imagePart.inlineData.mimeType ?? "image/png",
          base64: imagePart.inlineData.data,
        };
      }

      if (imagePart.fileData?.fileUri) {
        const apiKey = apiKeyContext.getApiKey();
        const downloadUrl = imagePart.fileData.fileUri.includes("?") 
          ? `${imagePart.fileData.fileUri}&key=${apiKey}` 
          : `${imagePart.fileData.fileUri}?key=${apiKey}`;
        
        // 使用重試機制下載圖片（支援取消）
        const blob = await retry(
          async () => {
            if (signal?.aborted) {
              throw new Error('Request cancelled');
            }
            const imageResponse = await fetch(downloadUrl, { signal });
            if (!imageResponse.ok) {
              throw new Error(`Failed to download generated image: ${imageResponse.status}`);
            }
            return imageResponse.blob();
          },
          {
            maxRetries: 3,
            initialDelay: 1000,
            retryable: (error) => {
              if (signal?.aborted) return false;
              return isRetryableError(error);
            },
          }
        );
        
        const base64 = await blobToBase64(blob);
        const resolvedMimeType =
          imagePart.fileData.mimeType ??
          (blob.type ? blob.type : undefined) ??
          "image/png";
        return {
          label: shotLabels[shot.key],
          labelKey: shot.key,
          mimeType: resolvedMimeType,
          base64,
        };
      }

      if (Array.isArray(imagePart.parts)) {
        const nestedInline = imagePart.parts.find((part): part is GeminiImagePart => !!part.inlineData);
        if (nestedInline?.inlineData?.data) {
          return {
            label: shotLabels[shot.key],
            labelKey: shot.key,
            mimeType: nestedInline.inlineData.mimeType ?? "image/png",
            base64: nestedInline.inlineData.data,
          };
        }
      }

      throw new Error("Unrecognized image structure in API response");
    });

    const generatedImagesRaw = await Promise.all(imagePromises);
    
    // v1.1: 檢查生成的圖片數量是否與要求的視角數量一致
    if (generatedImagesRaw.length !== shotTypes.length) {
      throw new Error(`Insufficient images generated. Expected ${shotTypes.length}, got ${generatedImagesRaw.length}`);
    }

    return generatedImagesRaw.map(({ label, labelKey, mimeType, base64 }) => {
      const blob = base64ToBlob(base64, mimeType);
      const blobUrl = URL.createObjectURL(blob);
      return {
        src: blobUrl,
        blobUrl: blobUrl,
        base64: base64,
        label,
        labelKey,
        videoSrc: null,
        isGeneratingVideo: false,
        videoError: null,
      };
    });
  }, [getGeminiClient, extractCandidates, apiKeyContext]);
  
  // 生成影片（支援取消）
  const generateVideo = useCallback(async (
    imageSrc: string,
    aspectRatio: string,
    signal?: AbortSignal
  ): Promise<string> => {
    const client = getGeminiClient();
    if (!client) {
      throw new Error("API Key is not available");
    }
    
    // 檢查擴充功能
    if (apiKeyContext.isUsingExtension()) {
      const hasKey = await apiKeyContext.checkExtensionApiKey();
      if (!hasKey) {
        await apiKeyContext.openExtensionKeySelector();
        throw new Error("Please select API Key in browser extension");
      }
    }
    
    const { imageBytes, mimeType } = await resolveImageBytes(imageSrc);

    if (signal?.aborted) {
      throw new Error('Request cancelled');
    }

    const videoPrompt =
      "Make this a subtle, high-quality cinemagraph. The model's hair and clothing should move slightly in a gentle breeze.";

    // 使用重試機制啟動影片生成（支援取消）
    let operation = await retry(
      () => {
        if (signal?.aborted) {
          throw new Error('Request cancelled');
        }
        return client.models.generateVideos({
          model: "veo-3.1-fast-generate-preview",
          prompt: videoPrompt,
          image: {
            imageBytes,
            mimeType,
          },
          config: {
            numberOfVideos: 1,
            resolution: "720p",
            aspectRatio: aspectRatio,
          },
        }) as Promise<VeoOperation>;
      },
      {
        maxRetries: 3,
        initialDelay: 1000,
        retryable: (error) => {
          if (signal?.aborted) return false;
          return isRetryableError(error);
        },
      }
    );

    // 輪詢直到完成（使用重試機制，支援取消）
    while (!operation.done) {
      if (signal?.aborted) {
        throw new Error('Request cancelled');
      }
      await new Promise((resolve) => setTimeout(resolve, 5000));
      operation = await retry(
        () => {
          if (signal?.aborted) {
            throw new Error('Request cancelled');
          }
          return client.operations.getVideosOperation({ operation }) as Promise<VeoOperation>;
        },
        {
          maxRetries: 3,
          initialDelay: 2000,
          retryable: (error) => {
            if (signal?.aborted) return false;
            return isRetryableError(error);
          },
        }
      );
    }

    if (operation.error) {
      throw new Error(operation.error.message || "Video generation failed");
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      throw new Error("Unable to retrieve video download link");
    }

    const apiKey = apiKeyContext.getApiKey();
    const separator = downloadLink.includes("?") ? "&" : "?";
    const signedUrl = `${downloadLink}${separator}alt=media&key=${apiKey}`;
    const videoBlob = await downloadResource(signedUrl, signal);
    return URL.createObjectURL(videoBlob);
  }, [getGeminiClient, downloadResource, apiKeyContext]);
  
  /**
   * 上傳歷史縮圖到 Firebase Storage
   * 原圖保留在本地（Data URL），只上傳縮圖供 History 顯示
   */
  const uploadHistoryThumbnails = useCallback(async (
    uid: string,
    images: ImageResult[]
  ): Promise<string[]> => {
    if (!storage) {
      console.warn("Firebase Storage is not initialized; returning empty thumbnails.");
      return [];
    }

    const timestamp = Date.now();
    const thumbnailUrls = await Promise.all(
      images.map(async (image, index) => {
        if (!image.src.startsWith("data:") && !image.src.startsWith("blob:")) {
          // 如果是其他 URL（例如歷史紀錄的外部連結）
          return image.src;
        }

        try {
          // 建立縮圖（最大 200x200）
          const thumbnailDataUrl = await createThumbnail(image.src, 200);
          
          const storageRef = ref(storage, `users/${uid}/history/${timestamp}-${index}-thumb.jpg`);
          await uploadString(storageRef, thumbnailDataUrl, "data_url");
          return await getDownloadURL(storageRef);
        } catch (error) {
          console.error('Failed to create/upload thumbnail:', error);
          return ''; // 返回空字串，History 會顯示佔位圖
        }
      })
    );
    return thumbnailUrls;
  }, []);
  
  // Firestore 相關方法已解耦到各自的 Hooks 與 Services 中
  
  const value = useMemo<ApiContextValue>(
    () => ({
      generateImages,
      generateVideo,
      uploadHistoryThumbnails,
      downloadResource,
      checkApiKeyAvailable,
    }),
    [
      generateImages,
      generateVideo,
      uploadHistoryThumbnails,
      downloadResource,
      checkApiKeyAvailable,
    ]
  );

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};

export const useApi = (): ApiContextValue => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApi must be used within ApiProvider");
  }
  return context;
};
