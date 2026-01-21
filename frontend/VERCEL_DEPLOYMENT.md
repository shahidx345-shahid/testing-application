# Vercel Deployment Instructions

## Environment Variables Setup

You **MUST** configure the following environment variable in Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variable:

### Required Variable:
- **Name:** `NEXT_PUBLIC_API_URL`
- **Value:** `https://save-2740-backend.vercel.app`
- **Environment:** Production, Preview, and Development

## Why This is Critical

The frontend uses Next.js rewrites to proxy all `/api/*` requests to the backend. Without this environment variable, the frontend won't know where to send API requests, causing 500 and 400 errors on login/signup.

## Deployment Steps

1. Push code to GitHub
2. Set environment variable in Vercel (as shown above)
3. Trigger a new deployment or wait for automatic deployment
4. The frontend will now correctly communicate with the backend

## Local Development

For local development, copy `.env.example` to `.env.local` and update the backend URL:

```bash
cp .env.example .env.local
```

Then edit `.env.local` to point to your local backend:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```
