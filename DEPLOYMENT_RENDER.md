# 🚀 Deploying BX Analytics to Render

This guide outlines how to deploy both the **Backend API** and **Frontend React UI** to [Render](https://render.com).

---

## ⚡ Option 1: Automatic 1-Click Blueprint (Recommended)

Because a [`render.yaml`](./render.yaml) file is included in your repository, Render can deploy both the Frontend and Backend automatically.

### Steps:
1. **Push your code to GitHub / GitLab:**
   ```bash
   git add .
   git commit -m "Configure Render deployment"
   git push origin main
   ```
2. Go to your **[Render Dashboard](https://dashboard.render.com)**.
3. Click **New +** in the top navigation and select **Blueprint**.
4. Connect your Git repository (`BX_Member_Activity_Tracker`).
5. Render will automatically detect `render.yaml` and configure:
   - **`bx-analytics-backend`** (Web Service, Node.js)
   - **`bx-analytics-frontend`** (Static Site, React Vite)
6. Under Environment Variables for `bx-analytics-backend`, provide:
   - `MONGODB_URI`: Your MongoDB Atlas connection string (or leave empty to run in Mock Data mode).
   - `USE_MOCK_DATA`: `true` (or `false` if using live MongoDB).
7. Click **Apply**. Render will build and deploy both services!

---

## 🛠️ Option 2: Manual Deployment (2 Services)

If you prefer to configure each service manually in the Render dashboard:

### 1. Deploy the Backend (Web Service)
1. In Render Dashboard, click **New +** → **Web Service**.
2. Connect your repository.
3. Configure settings:
   - **Name**: `bx-analytics-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
4. Add **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `SESSION_SECRET`: *(A random 32+ character string)*
   - `USE_MOCK_DATA`: `true` *(or `false` with live Atlas DB)*
   - `MONGODB_URI`: *(Your MongoDB connection string)*
   - `FRONTEND_URL`: *(Your frontend Render URL, e.g. `https://bx-analytics-frontend.onrender.com`)*
5. Click **Create Web Service**.
6. Copy the generated backend URL (e.g., `https://bx-analytics-backend.onrender.com`).

---

### 2. Deploy the Frontend (Static Site)
1. In Render Dashboard, click **New +** → **Static Site**.
2. Connect the same repository.
3. Configure settings:
   - **Name**: `bx-analytics-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add **Environment Variables**:
   - `VITE_API_URL`: `https://bx-analytics-backend.onrender.com` *(Paste your backend URL from step 1)*
5. Under **Redirects / Rewrites**, add a rewrite rule for Single Page Application (SPA) routing:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`
6. Click **Create Static Site**.

---

## 📦 Option 3: Single Full-Stack Web Service

You can also deploy frontend + backend together as a single unified service:

1. Click **New +** → **Web Service**.
2. Leave **Root Directory** blank (root level).
3. **Build Command**: `npm run build`
4. **Start Command**: `npm start`
5. **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `USE_MOCK_DATA`: `true`
   - `SESSION_SECRET`: *(Random secret key)*
   - `MONGODB_URI`: *(Optional: MongoDB Atlas URI)*
6. Click **Create Web Service**. The backend server will automatically serve the built React UI and all `/api` endpoints on one single domain.

---

## 🧪 Verification & Testing
Once deployed:
1. Visit `https://<your-backend-url>.onrender.com/api/health` to verify backend status (`status: online`).
2. Open your frontend URL to access the dashboard, analytics, attendance scanner, and reports.
