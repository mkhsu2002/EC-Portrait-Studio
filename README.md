# AI Digital Portrait Studio

**版本：v1.5**

「電商人像攝影棚」是一套基於 React + Vite 的網頁應用，整合 Google Gemini 影像模型與 Firebase 服務，協助品牌快速生成多視角的人像商品圖。專案已開源，歡迎自行部署並依需求調整。

英語說明（English Guide）：[README.en.md](./README.en.md)

## 🌐 立即體驗 (Try it Now)

免部署，點擊下方連結填入您自己的，已正確開啟付費及授權的 Gemini API Key，即可立即體驗：

👉 <a href="https://portrait.icareu.tw/" target="_blank" rel="noopener noreferrer">https://portrait.icareu.tw/</a>

若希望自行部署，請參考下方 Cloudflare Pages 的部署指南！

### 📊 版本歷史

- **v1.5 (Current)**:
  - 修復部署後圖片生成任務失敗問題，Gemini 影像生成請求已改用目前 API 契約的 `responseFormat.image.aspectRatio`。
  - 將 Gemini 3 Pro 影像模型從舊 preview 名稱更新為正式 `gemini-3-pro-image`，並保留舊歷史紀錄模型值的相容轉換。
  - 改善 Google Gemini SDK 錯誤解析，避免正式環境只顯示「發生未知錯誤」。
- **v1.2**:
  - 導入 Gemini 2.5 Flash 生成/優化提示詞功能。
  - 新增「補充描述」專用的 AI 產生器按鈕。
- **v1.1**:
  - 導入 Gemini 3 Pro 生成預覽預設選項。
  - 新增四重視角參考圖上傳（正面/商品/姿勢/表情或視角）。
  - 將 Gemini 2.0 Flash 升級至 2.5 版本。
  - 更新環境變數與提示詞生成邏輯。
- **v1.0 (Initial Release)**:

**主要改動**：
- ✅ **全新架構整合**：將原始碼整合至 `src` 目錄，提升開發維護效率
- ✅ **效能與記憶體優化**：引入 `AbortController` 與 `Blob URL` 釋放機制，大幅減少記憶體佔用
- ✅ **功能選單優化**：優化服裝風格、背景、表情、姿勢、光線等選單內容
- ✅ **程式碼模組化**：完成 Context 解耦，提升渲染效能與可擴展性
- ✅ **自動化測試基礎**：導入 Vitest 框架與單元測試範本
- ✅ **API Key 統一管理**：使用 `ApiKeyContext` 統一管理 API Key，支援多來源輸入

## 核心功能

- **多視角影像生成**：一次產出全身、半身、特寫三張圖，並自動套用選定的長寬比。
- **可選參考素材**：支援上傳人物臉孔與商品物件，強化生成一致性。
- **歷史紀錄與還原**：每位登入使用者可保留最近 5 筆生成紀錄，一鍵載入設定。
- **圖片下載**：每張圖片提供下載按鈕，支援手機和桌面瀏覽器，使用 Firebase Storage SDK 確保穩定下載。
- **完善帳號體驗**：Firebase Authentication 提供註冊、登入、忘記密碼流程。

## 技術概覽

- React 19、TypeScript、Vite 6
- Firebase Authentication、Firestore、Storage
- Google Gemini 影像生成模型：
  - `gemini-2.5-flash-image`：預設快速影像生成模型
  - `gemini-3-pro-image`：高品質專業影像生成模型
- Gemini 影像長寬比設定採用目前 API 契約：`responseFormat.image.aspectRatio`
- Tailwind CSS 原子化樣式（以 `className` 直接撰寫）

## 本地部署流程

1. **取得程式碼**
   ```bash
   git clone <a href="https://github.com/mkhsu2002/AI_Digital_Portrait_Studio.git" target="_blank" rel="noopener noreferrer">https://github.com/mkhsu2002/AI_Digital_Portrait_Studio.git</a>
   cd AI_Digital_Portrait_Studio
   ```
2. **安裝依賴**
   ```bash
   npm install
   ```
3. **設定環境變數**（於專案根目錄建立 `.env.local`）
   ```dotenv
   # Gemini API Key（可選，但不建議，可待部署完成後，直接於登入後首頁上手動輸入 Gemini API Key，將API Key 儲存於本地，可降低外洩風險）
   VITE_API_KEY=你的_GEMINI_API_KEY
   
   # Firebase 設定（必要）
   VITE_FIREBASE_API_KEY=你的_FIREBASE_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=你的_PROJECT_ID
   VITE_FIREBASE_STORAGE_BUCKET=你的_STORAGE_BUCKET
   VITE_FIREBASE_MESSAGING_SENDER_ID=你的_SENDER_ID
   VITE_FIREBASE_APP_ID=你的_APP_ID
   ```
   
   **📝 v1.0 更新：API Key 管理方式**
   
   API Key 的取得與管理已統一改為使用 `ApiKeyContext` 管理：
   - **優先順序**：環境變數 `VITE_API_KEY` > 瀏覽器擴充功能 `window.aistudio`
   - **優點**：統一管理邏輯，易於測試與擴展
   - **向後相容**：現有功能不受影響，只是內部實作改為使用 Context
   - 詳細說明請參考 [API_KEY_CONTEXT_REFACTOR.md](./API_KEY_CONTEXT_REFACTOR.md)
   
4. **啟動開發伺服器**
   ```bash
   npm run dev
   ```
   伺服器預設位於 `http://localhost:5173`。
5. **建置與預覽正式版**
   ```bash
   npm run build
   npm run preview
   ```

## 🚀 部署指南

### Cloudflare Pages 部署（推薦）

**優點**：
- ✅ 免費方案
- ✅ 全球 CDN，速度極快
- ✅ 自動 HTTPS
- ✅ 環境變數管理介面友善
- ✅ 自動部署（推送程式碼時）

**設定步驟**：

1. **在 Cloudflare 建立專案**
   - 前往 <a href="https://dash.cloudflare.com" target="_blank" rel="noopener noreferrer">Cloudflare Dashboard</a>
   - 選擇 **Pages** → **Create a project**
   - 選擇 **Connect to Git**
   - 連結您的 GitHub 倉庫
   - 選擇 `main` 分支

2. **設定建置設定**
   
   在 Cloudflare Pages 專案設定中，前往 **Builds & deployments**：
   - **Framework preset**: Vite（或留空）
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`（留空也可以，預設就是根目錄）
   - **Node.js version**: 20（或更高）

3. **設定環境變數** ⚠️ **重要：必須手動設定**
   
   **Cloudflare Pages 不會自動填入環境變數**，您需要手動在 Cloudflare Dashboard 中設定。
   
   **設定步驟**：
   1. 前往 **Settings** → **Environment Variables**
   2. 點擊 **Add variable**（新增變數）
   3. 選擇 **Production**（生產環境）
   4. 依序新增以下變數：
   
   **必要變數（Firebase）**：
   ```
   VITE_FIREBASE_API_KEY = 你的_FIREBASE_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN = xxx.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID = 你的_PROJECT_ID
   VITE_FIREBASE_STORAGE_BUCKET = 你的_STORAGE_BUCKET
   VITE_FIREBASE_MESSAGING_SENDER_ID = 你的_SENDER_ID
   VITE_FIREBASE_APP_ID = 你的_APP_ID
   ```
   
   **可選變數**：
   ```
   VITE_API_KEY = 你的_GEMINI_API_KEY（可選，但不建議，可待部署完成後，直接於登入後首頁上手動輸入 Gemini API Key，將API Key 儲存於本地，可降低外洩風險）
   VITE_BASE_PATH = /（通常保持為 /）
   ```
   
   **⚠️ 注意事項**：
   - 變數名稱必須完全正確（必須以 `VITE_` 開頭）
   - 變數值不要包含多餘的空格或引號
   - 設定完成後需要重新部署才會生效
   
   **詳細設定步驟**請參考：[CLOUDFLARE_PAGES_SETUP.md](./CLOUDFLARE_PAGES_SETUP.md)

4. **分支控制**
   - **生產分支**：`main`
   - **自動部署**：已啟用 ✅
   - 每次推送程式碼到生產分支時，Cloudflare 會自動觸發建置和部署

5. **部署**
   - **自動部署**：推送程式碼到 `main` 分支，Cloudflare 會自動部署
   - **手動部署**：在 Cloudflare Dashboard → Pages → 您的專案 → **Create Deployment**

6. **查看部署狀態**
   - 前往 Cloudflare Dashboard → Pages → 您的專案
   - 點擊 **Deployments** 標籤查看部署進度和日誌
   - 部署完成後，應用會自動發布到 `https://<project-name>.pages.dev`

**⚠️ 注意事項**：
- Cloudflare Pages 會將所有環境變數暴露在前端程式碼中
- 建議使用 Cloudflare 的環境變數管理功能，而非 GitHub Secrets
- 確保 `VITE_BASE_PATH` 設為 `/`（除非使用自訂域名且設定子路徑）
- 詳細設定請參考 [CLOUDFLARE_PAGES_SETUP.md](./CLOUDFLARE_PAGES_SETUP.md)

---

### 部署檢查清單

部署前請確認：

- [ ] 所有必要的環境變數都已設定
- [ ] `.env.local` 檔案已加入 `.gitignore`（不會被提交）
- [ ] 已測試本地建置 (`npm run build`)
- [ ] 已選擇部署方式並完成設定
- [ ] 已了解 API Key 會暴露在前端程式碼中

---

### 故障排除

#### Cloudflare Pages 部署失敗

1. **檢查建置日誌**
   - 在 Cloudflare Dashboard → Pages → 專案 → Deployments 查看日誌

2. **確認環境變數**
   - 檢查 Cloudflare Pages 專案設定中的環境變數是否正確

3. **確認建置設定**
   - Build command: `npm run build`
   - Build output directory: `dist`

---

### Firebase 設定參數說明

本專案使用 Firebase 提供以下服務：

| 服務 | 用途 | 環境變數 |
|------|------|----------|
| **Authentication** | 使用者認證（登入、註冊、忘記密碼） | `VITE_FIREBASE_API_KEY`<br>`VITE_FIREBASE_AUTH_DOMAIN` |
| **Firestore** | 儲存使用者歷史紀錄、使用次數 | `VITE_FIREBASE_PROJECT_ID` |
| **Storage** | 儲存生成的圖片 | `VITE_FIREBASE_STORAGE_BUCKET` |
| **App Config** | Firebase 應用程式設定 | `VITE_FIREBASE_MESSAGING_SENDER_ID`<br>`VITE_FIREBASE_APP_ID` |

**取得 Firebase 設定參數**：

1. 前往 <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer">Firebase Console</a>
2. 選擇或建立專案
3. 前往 **專案設定**（⚙️） → **一般** 標籤
4. 滾動到 **您的應用程式** 區塊
5. 選擇 Web 應用程式（或建立新的）
6. 複製 Firebase 設定物件中的參數值

**必要參數**（6 個）：
- `VITE_FIREBASE_API_KEY` - Firebase API Key
- `VITE_FIREBASE_AUTH_DOMAIN` - 認證網域（格式：`<project-id>.firebaseapp.com`）
- `VITE_FIREBASE_PROJECT_ID` - 專案 ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Storage 儲存桶（格式：`<project-id>.appspot.com`）
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - 訊息發送者 ID
- `VITE_FIREBASE_APP_ID` - 應用程式 ID

**Firebase 服務設定**：

- **Authentication**：啟用 Email/Password 登入方式
- **Firestore Database**：建立資料庫（建議使用測試模式，然後設定安全規則）
- **Storage**：啟用 Storage，設定安全規則允許已認證使用者上傳/讀取

詳細設定請參考 <a href="https://firebase.google.com/docs/web/setup" target="_blank" rel="noopener noreferrer">Firebase 官方文檔</a>

---

### 詳細文檔

- [CLOUDFLARE_PAGES_SETUP.md](./CLOUDFLARE_PAGES_SETUP.md) - Cloudflare Pages 完整設定指南
- [SECURITY.md](./SECURITY.md) - 安全部署指南
- [API_KEY_CONTEXT_REFACTOR.md](./API_KEY_CONTEXT_REFACTOR.md) - API Key 統一管理說明（v1.0）

> ⚠️ **安全提醒**：部署到公開平台時，API Key 會暴露在前端程式碼中。建議使用 Firebase Cloud Functions 作為 API 代理，詳見 [SECURITY.md](./SECURITY.md)。

## 💬 技術支援與討論

如有任何問題、建議或需要技術支援，歡迎加入 FlyPig 專屬 LINE 群組：

👉 <a href="https://line.me/R/ti/g/@icareuec" target="_blank" rel="noopener noreferrer">加入 FlyPig LINE 群組</a>

我們會在這裡提供：
- 技術支援與問題解答
- 功能更新與使用教學
- 社群討論與經驗分享
- 最新功能預覽與測試

## 🔗 推薦同步參考

如果您對 AI 視覺行銷工具感興趣，歡迎同步參考以下相關專案：

- [AI-PM-Designer-Pro](https://github.com/mkhsu2002/AI-PM-Designer-Pro) - AI 視覺行銷生產力工具，基於 Google Gemini 2.5 Flash 與 Gemini 3 Pro Image，從產品圖自動生成完整行銷素材包
- [AI EC SEO Booster](https://mkhsu2002.github.io/AI-EC-SEO-Booster/) - 由AI驅動的智能電商市場分析與 SEO 內容策略生成工具，透過 Google Gemini API 提供專業的市場洞察、競爭分析、買家人物誌描繪，並自動生成 SEO 優化的內容策略與前導頁提示詞。

## ☕ 請我喝杯咖啡

如果這個專案對您有幫助，歡迎請我喝杯咖啡：

👉 <a href="https://buymeacoffee.com/mkhsu2002w" target="_blank" rel="noopener noreferrer">Buy me a coffee</a>

您的支持是我持續開發的動力！

若需協助委外部署或客製化選項開發（例如新增場景、人物姿態)，歡迎聯絡 FlyPig AI
Email: flypig@icareu.tw  / LINE ID: icareuec

## 授權條款

本專案採用 **MIT 授權**。您可以自由使用、修改與自建部署。

**Open sourced by <a href="https://flypigai.icareu.tw/" target="_blank" rel="noopener noreferrer">FlyPig AI</a>**

詳見授權全文：[LICENSE](./LICENSE)
