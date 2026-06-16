# Deploying Your Resume Tailoring Application with Docker on Render

This guide provides step-by-step instructions on how to build, run, and deploy this full-stack application using **Docker** to **Render**.

---

## Technical Overview

The application features a modern, ultra-slim, full-stack architecture:
- **Build Stage**: Consolidates and compiles the React SPA frontend with active Vite assets, while using `esbuild` to bundle the backend `server.ts` into a standalone high-performance `dist/server.cjs`.
- **Runner Stage**: A slim, non-root alpine-based Node.js runtime containing only production-level dependencies (`node_modules`) and the compiled `dist` directory, reducing runtime weight.
- **Port Ingress**: Configured to run on port `3000` inside the container.

---

## Table of Contents
1. [Local Verification](#1-local-verification)
2. [Prerequisites](#2-prerequisites)
3. [Deploying to Render via Web Service](#3-deploying-to-render-via-web-service)
4. [Environmental Configurations](#4-environmental-configurations)
5. [Connecting Your Firebase Backend](#5-connecting-your-firebase-backend)
6. [Troubleshooting & Logs](#6-troubleshooting-and-logs)

---

## 1. Local Verification

To verify that your Docker image builds and starts up correctly on your machine before pushing to production, execute the following commands in your local terminal:

```bash
# 1. Build the Docker image
docker build -t resumyy-app .

# 2. Run the Docker container locally (binding port 3000)
docker run -p 3000:3000 \
  -e GEMINI_API_KEY="your_actual_gemini_api_key" \
  resumyy-app
```

Navigate to `http://localhost:3000` to confirm everything is up and running.

---

## 2. Prerequisites

1. **A GitHub or GitLab repository** containing this project's code. Make sure your newly added `Dockerfile` is committed and pushed.
2. **A free Render account** (sign up at [render.com](https://render.com)).
3. **A Gemini API Key** (obtainable from the [Google AI Studio console](https://aistudio.google.com/)).
4. **Firebase Project details** (for authentication and database persistence).

---

## 3. Deploying to Render via Web Service

Render handles Docker-based deployments automatically. Follow these simple steps:

1. **Create a New Web Service**:
   - Log in to your Render Dashboard.
   - Click the **New +** button in the top-right corner and select **Web Service**.
   - Connect your GitHub or GitLab account and select this repository.

2. **Select Runtime Style**:
   - Render will inspect the repository. Ensure that the **Runtime** is set to **Docker** (Render usually auto-detects this if a `Dockerfile` exists at the root).

3. **Service Details**:
   - **Name**: e.g., `resumyy-tailoring-service`
   - **Region**: Select the region closest to your target audience.
   - **Branch**: Specify your production branch (usually `main` or `master`).
   - **Instance Type**: Choose **Free** or **Starter**.

4. **Click Create Web Service**! Render will pull your repository, start building the multi-stage Docker image, and deploy it to a secured URL.

---

## 4. Environmental Configurations

Your application requires secret keys (such as the Gemini AI SDK credentials) to execute resume scans, analyses, and neural reconstructions.

1. In the left-hand navigation sidebar of your Render Web Service page, click **Env Groups** or **Environment**.
2. Add the following environment variables:

| Key | Value | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | *Your Google AI Studio API Key* | Required by the server for executing advanced OCR scans and tailored resume creations. |
| `NODE_ENV` | `production` | Signals optimization pathways inside the Express server. |
| `PORT` | `3000` | Instructs Render to map the target ingress traffic to our container port. |

---

## 5. Connecting Your Firebase Backend

Your client-side web application relies on Firebase Auth and Firestore database schemas to maintain dashboard records, system states, and operator profiles.

By default, the React frontend loads configurations directly from `firebase-applet-config.json` bundled at build-time. For public hosting, you can configure these securely or rely on standard client variables. 

Ensure that your `firebase-applet-config.json` remains present during the compilation/build stage in your Docker execution, or is committed to your repository so Vite can bundle it seamlessly.

---

## 6. Troubleshooting and Logs

- **Vite Asset Serving**: The production server uses local Node Express route handling to fallback to the React UI `dist/index.html`. If you see a blank page, inspect the Build logs for Vite compilation warnings.
- **OCR Engine Failures**: Scanned PDFs rely on image-based parsing through Gemini-3-flash-preview. Ensure your `GEMINI_API_KEY` has active quotas.
- **Port Mapping**: Render automatically detects the `EXPOSE 3000` instruction in the `Dockerfile`. If it complains about a mismatch, manually verify the `PORT` env variable is set to `3000`.
