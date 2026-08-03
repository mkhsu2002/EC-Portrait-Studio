# AI Digital Portrait Studio

**Version: v1.5**

AI Digital Portrait Studio is a React + Vite web application that integrates Google Gemini image models with Firebase services to help brands quickly generate multi-angle portrait product images. The project is open source—feel free to deploy and customize according to your needs.

中文說明（Chinese Guide）：[README.md](./README.md)

## 🌐 Try it Now

No deployment needed! Click the link below and enter your own Gemini API Key (with billing and proper permissions enabled) to start using immediately:

👉 <a href="https://portrait.icareu.tw/" target="_blank" rel="noopener noreferrer">https://portrait.icareu.tw/</a>

If you want to deploy it yourself, please refer to the GitHub/Cloudflare Pages deployment guide below!

## 📋 Version Information

### v1.5 (Current)

**Major Changes**:

- Fixed deployed image generation failures by updating Gemini image generation requests to the current API contract: `responseFormat.image.aspectRatio`.
- Updated the Gemini 3 Pro image model from the old preview name to the official `gemini-3-pro-image`, while preserving compatibility for old history records that still contain the preview model value.
- Improved Google Gemini SDK error parsing so production no longer collapses API failures into only "unknown error".

### v1.0 (Official Release)

**Major Changes**:

- ✅ **New Architecture Integration**: Moved source code to `src` directory for better development efficiency
- ✅ **Performance & Memory Optimization**: Implemented `AbortController` and `Blob URL` cleanup to significantly reduce memory footprint
- ✅ **Menu Options Optimization**: Optimized options for clothing styles, backgrounds, expressions, poses, and lighting
- ✅ **Code Modularization**: Completed Context decoupling for improved rendering performance and scalability
- ✅ **Automated Testing Foundation**: Introduced Vitest framework and unit test templates
- ✅ **API Key Unified Management**: Use `ApiKeyContext` to centrally manage API Keys, supporting multiple input sources

## Core Features

- **Multi-angle Image Generation**: Generate full-body, half-body, and close-up images in one go, automatically applying the selected aspect ratio.
- **Optional Reference Materials**: Support uploading face images and product objects to enhance generation consistency.
- **History & Restore**: Each logged-in user can keep the latest 5 generation records and load settings with one click.
- **Dynamic Image Extension**: Convert any image to Gemini Veo for 720p dynamic video generation.
- **Complete Account Experience**: Firebase Authentication provides registration, login, and password recovery, with remaining generation count display.

## Tech Stack

- React 19, TypeScript, Vite 6
- Firebase Authentication, Firestore, Storage
- Google Gemini image generation models:
  - `gemini-2.5-flash-image`: default fast image generation model
  - `gemini-3-pro-image`: high-quality professional image generation model
- Gemini image aspect ratio configuration uses the current API contract: `responseFormat.image.aspectRatio`
- Veo video generation: `veo-3.1-fast-generate-preview`
- Tailwind-style utility classes written directly via `className`

## Local Development

1. **Get the code**
   ```bash
   git clone <a href="https://github.com/mkhsu2002/AI_Digital_Portrait_Studio.git" target="_blank" rel="noopener noreferrer">https://github.com/mkhsu2002/AI_Digital_Portrait_Studio.git</a>
   cd AI_Digital_Portrait_Studio
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure environment variables** (create `.env.local` in the project root)

   ```dotenv
   # Gemini API Key (optional, but not recommended. After deployment, users can manually enter their Gemini API Key on the homepage after login. Storing the API Key locally reduces the risk of exposure)
   VITE_API_KEY=YOUR_GEMINI_OR_VEO_API_KEY

   # Firebase Configuration (required)
   VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
   VITE_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
   VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
   VITE_FIREBASE_APP_ID=YOUR_APP_ID
   ```

   **📝 v1.0 Update: API Key Management**

   API Key acquisition and management have been unified using `ApiKeyContext`:
   - **Priority**: Environment variable `VITE_API_KEY` > Browser extension `window.aistudio`
   - **Benefits**: Unified management logic, easy to test and extend
   - **Backward Compatible**: Existing functionality is unaffected, only internal implementation uses Context
   - For detailed information, please refer to [API_KEY_CONTEXT_REFACTOR.md](./API_KEY_CONTEXT_REFACTOR.md)

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The server is available at `http://localhost:5173`.
5. **Build and preview production version**
   ```bash
   npm run build
   npm run preview
   ```

## 🚀 Deployment Guide

### Automated Deployment (Recommended)

The project has GitHub Actions automated deployment workflows configured. When you push code to the `main` branch, it will automatically build and deploy.

#### GitHub Pages Deployment

**Advantages**:

- ✅ Completely free
- ✅ Automatic HTTPS
- ✅ Great GitHub integration
- ✅ Automatic deployment (via GitHub Actions)

**Setup Steps**:

1. **Create GitHub Actions Workflow**

   Create `.github/workflows/deploy-pages.yml` in the project root:

   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches:
         - main
     workflow_dispatch:

   permissions:
     contents: read
     pages: write
     id-token: write

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v4

         - name: Setup Node.js
           uses: actions/setup-node@v4
           with:
             node-version: '20'
             cache: 'npm'

         - name: Install dependencies
           run: npm ci

         - name: Build
           run: npm run build
           env:
             VITE_API_KEY: ${{ secrets.VITE_API_KEY }}
             VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
             VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
             VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
             VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
             VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
             VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
             VITE_BASE_PATH: ${{ secrets.VITE_BASE_PATH || '/' }}

         - name: Setup Pages
           uses: actions/configure-pages@v4

         - name: Upload artifact
           uses: actions/upload-pages-artifact@v3
           with:
             path: './dist'

     deploy:
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       runs-on: ubuntu-latest
       needs: build
       steps:
         - name: Deploy to GitHub Pages
           id: deployment
           uses: actions/deploy-pages@v4
   ```

2. **Configure GitHub Secrets**
   - Go to GitHub repository → **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret** and add the following Secrets:
     ```
     VITE_API_KEY=YOUR_GEMINI_API_KEY (optional, but not recommended. After deployment, users can manually enter their Gemini API Key on the homepage after login. Storing the API Key locally reduces the risk of exposure)
     VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
     VITE_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
     VITE_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
     VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
     VITE_FIREBASE_APP_ID=YOUR_APP_ID
     ```
   - **Important**: If the repository name is not `username.github.io`, you need to set:
     ```
     VITE_BASE_PATH=/your-repository-name/
     ```
     For example: If the repository name is `AI_Digital_Portrait_Studio`, set it to `/AI_Digital_Portrait_Studio/`

3. **Enable GitHub Pages**
   - Go to **Settings** → **Pages**
   - Select **GitHub Actions** in **Source**
   - Save settings

4. **Push code**

   ```bash
   git add .
   git commit -m "Configure GitHub Pages deployment"
   git push origin main
   ```

5. **Check deployment status**
   - Go to **Actions** tab to view deployment progress
   - After deployment completes, the app will be automatically published to `https://<username>.github.io/<repository-name>`

**⚠️ Notes**:

- GitHub Pages will expose all environment variables in frontend code
- It's recommended to set API Key usage limits (quota, IP restrictions)
- For detailed security information, please refer to [SECURITY.md](./SECURITY.md)

---

#### Cloudflare Pages Deployment

**Advantages**:

- ✅ Free tier available
- ✅ Global CDN, extremely fast
- ✅ Automatic HTTPS
- ✅ User-friendly environment variable management interface
- ✅ Automatic deployment (when pushing code)

**Setup Steps**:

1. **Create a project in Cloudflare**
   - Go to <a href="https://dash.cloudflare.com" target="_blank" rel="noopener noreferrer">Cloudflare Dashboard</a>
   - Select **Pages** → **Create a project**
   - Choose **Connect to Git**
   - Link your GitHub repository
   - Select `main` branch

2. **Configure build settings**

   In Cloudflare Pages project settings, go to **Builds & deployments**:
   - **Framework preset**: Vite (or leave empty)
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (or leave empty, default is root)
   - **Node.js version**: 20 (or higher)

3. **Configure environment variables** ⚠️ **Important: Must be set manually**

   **Cloudflare Pages will NOT automatically fill in environment variables**. You need to manually set them in the Cloudflare Dashboard.

   **Setup Steps**:
   1. Go to **Settings** → **Environment Variables**
   2. Click **Add variable** (add variable)
   3. Select **Production** (production environment)
   4. Add the following variables in order:

   **Required Variables (Firebase)**:

   ```
   VITE_FIREBASE_API_KEY = YOUR_FIREBASE_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN = xxx.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID = YOUR_PROJECT_ID
   VITE_FIREBASE_STORAGE_BUCKET = YOUR_STORAGE_BUCKET
   VITE_FIREBASE_MESSAGING_SENDER_ID = YOUR_SENDER_ID
   VITE_FIREBASE_APP_ID = YOUR_APP_ID
   ```

   **Optional Variables**:

   ```
   VITE_API_KEY = YOUR_GEMINI_API_KEY (optional, but not recommended. After deployment, users can manually enter their Gemini API Key on the homepage after login. Storing the API Key locally reduces the risk of exposure)
   VITE_BASE_PATH = / (usually keep as /)
   ```

   **⚠️ Notes**:
   - Variable names must be exactly correct (must start with `VITE_`)
   - Variable values should not contain extra spaces or quotes
   - After setting, you need to redeploy for changes to take effect

   **Detailed setup steps** please refer to: [CLOUDFLARE_ENV_SETUP.md](./CLOUDFLARE_ENV_SETUP.md)

4. **Branch Control**
   - **Production branch**: `main`
   - **Automatic deployment**: Enabled ✅
   - Each time you push code to the production branch, Cloudflare will automatically trigger build and deployment

5. **Deploy**
   - **Automatic deployment**: Push code to `main` branch, Cloudflare will automatically deploy
   - **Manual deployment**: In Cloudflare Dashboard → Pages → Your project → **Create Deployment**

6. **Check deployment status**
   - Go to Cloudflare Dashboard → Pages → Your project
   - Click **Deployments** tab to view deployment progress and logs
   - After deployment completes, the app will be automatically published to `https://<project-name>.pages.dev`

**⚠️ Notes**:

- Cloudflare Pages will expose all environment variables in frontend code
- It's recommended to use Cloudflare's environment variable management feature, not GitHub Secrets
- Ensure `VITE_BASE_PATH` is set to `/` (unless using custom domain with subpath configuration)
- For detailed setup, please refer to [cloudflare-pages-setup.md](./cloudflare-pages-setup.md)

---

### Other Deployment Options

#### Vercel (Recommended)

**Advantages**:

- ✅ Free tier available
- ✅ Best support for Vite projects
- ✅ Automatic HTTPS and CDN
- ✅ Best environment variable management interface

**Setup Steps**:

1. Go to <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">Vercel</a> and register, link GitHub
2. Click **New Project** → Select your repository
3. Set all environment variables in **Environment Variables**
4. Click **Deploy**

For detailed instructions, please refer to [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

#### Firebase Hosting

**Advantages**:

- ✅ Good integration with Firebase services
- ✅ Free tier available

**Setup Steps**:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase Hosting
firebase init hosting

# Build project
npm run build

# Deploy
firebase deploy --only hosting
```

---

### Deployment Checklist

Before deploying, please confirm:

- [ ] All required environment variables are set
- [ ] `.env.local` file is added to `.gitignore` (will not be committed)
- [ ] Local build has been tested (`npm run build`)
- [ ] Deployment method has been selected and configured
- [ ] Understand that API Keys will be exposed in frontend code

---

### Troubleshooting

#### GitHub Pages Deployment Failed

1. **Check Actions logs**
   - Go to **Actions** tab to view error messages

2. **Confirm base path setting**
   - If repository name is not `username.github.io`, you must set `VITE_BASE_PATH`
   - Format: `/repository-name/` (slashes on both sides)

3. **Confirm Secrets settings**
   - Check if all required Secrets are set
   - Confirm names match those in workflow file

#### Cloudflare Pages Deployment Failed

1. **Check build logs**
   - In Cloudflare Dashboard → Pages → Project → Deployments to view logs

2. **Confirm environment variables**
   - Check if environment variables in Cloudflare Pages project settings are correct

3. **Confirm build settings**
   - Build command: `npm run build`
   - Build output directory: `dist`

---

### Firebase Configuration Parameters

This project uses Firebase to provide the following services:

| Service            | Purpose                                                      | Environment Variables                                         |
| ------------------ | ------------------------------------------------------------ | ------------------------------------------------------------- |
| **Authentication** | User authentication (login, registration, password recovery) | `VITE_FIREBASE_API_KEY`<br>`VITE_FIREBASE_AUTH_DOMAIN`        |
| **Firestore**      | Store user history records, usage counts                     | `VITE_FIREBASE_PROJECT_ID`                                    |
| **Storage**        | Store generated images                                       | `VITE_FIREBASE_STORAGE_BUCKET`                                |
| **App Config**     | Firebase application configuration                           | `VITE_FIREBASE_MESSAGING_SENDER_ID`<br>`VITE_FIREBASE_APP_ID` |

**Get Firebase Configuration Parameters**:

1. Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer">Firebase Console</a>
2. Select or create a project
3. Go to **Project Settings** (⚙️) → **General** tab
4. Scroll to **Your apps** section
5. Select Web app (or create new)
6. Copy parameter values from Firebase configuration object

**Required Parameters** (6):

- `VITE_FIREBASE_API_KEY` - Firebase API Key
- `VITE_FIREBASE_AUTH_DOMAIN` - Authentication domain (format: `<project-id>.firebaseapp.com`)
- `VITE_FIREBASE_PROJECT_ID` - Project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Storage bucket (format: `<project-id>.appspot.com`)
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Messaging sender ID
- `VITE_FIREBASE_APP_ID` - Application ID

**Firebase Service Configuration**:

- **Authentication**: Enable Email/Password login method
- **Firestore Database**: Create database (recommended to use test mode first, then set security rules)
- **Storage**: Enable Storage, set security rules to allow authenticated users to upload/read

For detailed setup, please refer to <a href="https://firebase.google.com/docs/web/setup" target="_blank" rel="noopener noreferrer">Firebase Official Documentation</a>

---

### Detailed Documentation

- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Complete deployment guide
- [QUICK_START_DEPLOYMENT.md](./QUICK_START_DEPLOYMENT.md) - Quick start guide
- [SECURITY.md](./SECURITY.md) - Security deployment guide
- [API_KEY_CONTEXT_REFACTOR.md](./API_KEY_CONTEXT_REFACTOR.md) - API Key unified management explanation (v1.0)
- [cloudflare-pages-setup.md](./cloudflare-pages-setup.md) - Cloudflare Pages detailed setup guide

> ⚠️ **Security Reminder**: When deploying to public platforms, API Keys will be exposed in frontend code. It's recommended to use Firebase Cloud Functions as an API proxy. For details, see [SECURITY.md](./SECURITY.md).

## 💬 Technical Support & Discussion

If you have any questions, suggestions, or need technical support, welcome to join the FlyPig LINE group:

👉 <a href="https://line.me/R/ti/g/@icareuec" target="_blank" rel="noopener noreferrer">Join FlyPig LINE Group</a>

We provide:

- Technical support and Q&A
- Feature updates and usage tutorials
- Community discussions and experience sharing
- Latest feature previews and testing

## ☕ Buy Me a Coffee

If this project is helpful to you, welcome to buy me a coffee:

👉 <a href="https://buymeacoffee.com/mkhsu2002w" target="_blank" rel="noopener noreferrer">Buy me a coffee</a>

Your support is the motivation for my continued development!

For managed deployment or custom feature requests (e.g., additional scenes or poses), contact FlyPig AI:
Email: flypig@icareu.tw / LINE ID: icareuec

## License

This project is licensed under the **MIT License**. You are free to use, modify, and self-host.

**Open sourced by <a href="https://flypigai.icareu.tw/" target="_blank" rel="noopener noreferrer">FlyPig AI</a>**

For full license text, see: [LICENSE](./LICENSE)
