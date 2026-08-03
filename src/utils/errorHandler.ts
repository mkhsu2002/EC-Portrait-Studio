/**
 * 統一錯誤處理機制
 */

export enum ErrorType {
  NETWORK = 'NETWORK',
  API = 'API',
  VALIDATION = 'VALIDATION',
  AUTH = 'AUTH',
  QUOTA = 'QUOTA',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: unknown;
  retryable: boolean;
  userMessage?: string; // 友善的使用者訊息
}

function extractErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== 'object') {
    return null;
  }

  const record = error as Record<string, unknown>;
  const directMessage = record.message;
  if (typeof directMessage === 'string' && directMessage.trim()) {
    return directMessage;
  }

  const nestedError = record.error;
  if (nestedError && typeof nestedError === 'object') {
    const nestedMessage = (nestedError as Record<string, unknown>).message;
    if (typeof nestedMessage === 'string' && nestedMessage.trim()) {
      return nestedMessage;
    }
  }

  const details = record.details;
  if (Array.isArray(details)) {
    const detailMessage = details
      .map((detail) => extractErrorMessage(detail))
      .find((message): message is string => !!message);
    if (detailMessage) {
      return detailMessage;
    }
  }

  return null;
}

/**
 * 處理錯誤並轉換為 AppError
 */
export function handleError(error: unknown, userMessage?: string): AppError {
  // 網路錯誤
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      type: ErrorType.NETWORK,
      message: '網路連線失敗',
      originalError: error,
      retryable: true,
      userMessage: userMessage || '網路連線失敗，請檢查您的網路連線後重試',
    };
  }

  // HTTP 錯誤
  if (error instanceof Response) {
    if (error.status >= 500 && error.status < 600) {
      return {
        type: ErrorType.API,
        message: `伺服器錯誤: ${error.status}`,
        originalError: error,
        retryable: true,
        userMessage: userMessage || '伺服器暫時無法回應，請稍後再試',
      };
    }
    if (error.status === 401 || error.status === 403) {
      return {
        type: ErrorType.AUTH,
        message: `認證錯誤: ${error.status}`,
        originalError: error,
        retryable: false,
        userMessage: userMessage || '認證失敗，請重新登入',
      };
    }
    // 400 錯誤可能是請求格式問題，不一定是 API Key 問題
    if (error.status === 400) {
      return {
        type: ErrorType.API,
        message: `請求錯誤: ${error.status}`,
        originalError: error,
        retryable: false,
        userMessage: userMessage || '請求格式錯誤，請檢查輸入內容後重試',
      };
    }
  }

  // Error 物件
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();
    const originalMessage = error.message;

    // Gemini API 安全過濾錯誤
    if (
      errorMessage.includes('safety') ||
      errorMessage.includes('blocked') ||
      errorMessage.includes('blockreason') ||
      errorMessage.includes('content was blocked')
    ) {
      return {
        type: ErrorType.API,
        message: originalMessage,
        originalError: error,
        retryable: false,
        userMessage: userMessage || '內容被安全過濾系統阻擋，請調整提示詞後重試',
      };
    }

    // API Key 相關錯誤
    if (
      errorMessage.includes('api key') ||
      errorMessage.includes('invalid api key') ||
      errorMessage.includes('authentication') ||
      errorMessage.includes('unauthorized')
    ) {
      return {
        type: ErrorType.AUTH,
        message: originalMessage,
        originalError: error,
        retryable: false,
        userMessage: userMessage || 'API Key 無效或已過期，請檢查 API Key 設定',
      };
    }

    // 配額/限制相關錯誤
    if (
      errorMessage.includes('quota') ||
      errorMessage.includes('rate limit') ||
      errorMessage.includes('too many requests') ||
      errorMessage.includes('resource exhausted')
    ) {
      return {
        type: ErrorType.QUOTA,
        message: originalMessage,
        originalError: error,
        retryable: true,
        userMessage: userMessage || 'API 配額已用完或達到速率限制，請稍後再試',
      };
    }

    // API 相關錯誤
    if (
      errorMessage.includes('api') ||
      errorMessage.includes('gemini') ||
      errorMessage.includes('veo') ||
      errorMessage.includes('request failed') ||
      errorMessage.includes('failed to download') ||
      errorMessage.includes('api did not return') ||
      errorMessage.includes('insufficient images')
    ) {
      // 嘗試提取更具體的錯誤訊息
      let specificMessage = 'API 呼叫失敗，請稍後再試';
      if (originalMessage.includes('download')) {
        specificMessage = '圖片下載失敗，請檢查網路連線後重試';
      } else if (originalMessage.includes('did not return')) {
        specificMessage = 'API 未返回圖片內容，可能是提示詞不符合規範，請調整後重試';
      } else if (originalMessage.includes('Insufficient')) {
        specificMessage = '生成的圖片數量不足，請重試';
      }

      return {
        type: ErrorType.API,
        message: originalMessage,
        originalError: error,
        retryable: true,
        userMessage: userMessage || specificMessage,
      };
    }

    // 驗證錯誤
    if (
      errorMessage.includes('validation') ||
      errorMessage.includes('invalid') ||
      errorMessage.includes('required')
    ) {
      return {
        type: ErrorType.VALIDATION,
        message: error.message,
        originalError: error,
        retryable: false,
        userMessage: userMessage || error.message,
      };
    }

    // 配額錯誤
    if (
      errorMessage.includes('quota') ||
      errorMessage.includes('credits') ||
      errorMessage.includes('no_credits') ||
      errorMessage === 'no_credits'
    ) {
      return {
        type: ErrorType.QUOTA,
        message: error.message,
        originalError: error,
        retryable: false,
        userMessage: userMessage || '您的免費生成次數已用完',
      };
    }

    // 認證錯誤
    if (
      errorMessage.includes('auth') ||
      errorMessage.includes('login') ||
      errorMessage.includes('unauthorized')
    ) {
      return {
        type: ErrorType.AUTH,
        message: error.message,
        originalError: error,
        retryable: false,
        userMessage: userMessage || '請先登入後再使用',
      };
    }

    // 網路相關錯誤
    if (
      errorMessage.includes('cross-origin') ||
      errorMessage.includes('access-control-allow-origin') ||
      errorMessage.includes('無法載入圖片')
    ) {
      return {
        type: ErrorType.NETWORK,
        message: originalMessage,
        originalError: error,
        retryable: false,
        userMessage: userMessage || '圖片載入失敗，請稍後再試。',
      };
    }

    // 網路相關錯誤
    if (
      errorMessage.includes('network') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('econnrefused') ||
      errorMessage.includes('enotfound') ||
      errorMessage.includes('failed to download') ||
      errorMessage.includes('failed to load')
    ) {
      return {
        type: ErrorType.NETWORK,
        message: originalMessage,
        originalError: error,
        retryable: true,
        userMessage: userMessage || '網路連線失敗，請檢查您的網路連線後重試',
      };
    }

    // 其他 Error - 嘗試顯示原始錯誤訊息
    return {
      type: ErrorType.UNKNOWN,
      message: error.message,
      originalError: error,
      retryable: false,
      userMessage: userMessage || (error.message.length > 100 ? '發生錯誤，請檢查設定後重試' : error.message),
    };
  }

  const extractedMessage = extractErrorMessage(error);
  if (extractedMessage) {
    return handleError(new Error(extractedMessage), userMessage);
  }

  // 未知錯誤類型 - 在開發模式下顯示更多資訊
  const errorString = String(error);
  const errorInfo = import.meta.env.DEV 
    ? `（開發模式：${errorString.substring(0, 200)}）`
    : '';

  return {
    type: ErrorType.UNKNOWN,
    message: '發生未知錯誤',
    originalError: error,
    retryable: false,
    userMessage: userMessage || `發生未知錯誤，請稍後再試${errorInfo}`,
  };
}

/**
 * 判斷錯誤是否可重試
 */
export function isRetryableErrorType(error: AppError): boolean {
  return error.retryable;
}

/**
 * 取得錯誤的使用者友善訊息
 */
export function getUserFriendlyMessage(error: AppError): string {
  return error.userMessage || error.message;
}

/**
 * 記錄錯誤（開發模式）
 */
export function logError(error: AppError, context?: string): void {
  if (import.meta.env.DEV) {
    console.error(`[${error.type}] ${context || 'Error'}:`, {
      message: error.message,
      userMessage: error.userMessage,
      originalError: error.originalError,
    });
  }
}

