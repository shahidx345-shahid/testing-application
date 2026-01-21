# 🚀 Vercel Deployment Guide - Save2740 App

## Overview

Your Save2740 application will be deployed as **two separate projects** on Vercel:
1. **Frontend** (Next.js) - User interface
2. **Backend** (Express.js API) - Server and database logic

---

## 📦 Project Structure

```
save-2740-app/
├── frontend/          → Deploy to Vercel as "save2740-frontend"
└── backend/           → Deploy to Vercel as "save2740-backend"
```

---

## 🎯 Deployment Steps

### **Option 1: Deploy from GitHub (Recommended)**

#### Step 1: Create Two GitHub Repositories

1. **Frontend Repository:**
   ```bash
   cd frontend
   git init
   git add .
   git commit -m "Initial commit - Frontend"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/save2740-frontend.git
   git push -u origin main
   ```

2. **Backend Repository:**
   ```bash
   cd ../backend
   git init
   git add .
   git commit -m "Initial commit - Backend"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/save2740-backend.git
   git push -u origin main
   ```

#### Step 2: Deploy Backend First

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your `save2740-backend` repository
3. **Project Settings:**
   - **Framework Preset:** Other
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. **Environment Variables:** Click "Environment Variables" and add:

   ```env
   NODE_ENV=production
   PORT=5000
   
   # Database (MongoDB Atlas)
   DATABASE_URL=mongodb+srv://admin:admin@cluster0.tdf9l0r.mongodb.net/?appName=Cluster0
   MONGODB_URI=mongodb+srv://admin:admin@cluster0.tdf9l0r.mongodb.net/?appName=Cluster0
   
   # Security
   JWT_SECRET=vuif fudl eqik ouvc
   CRON_SECRET=your-cron-job-secret-key-for-daily-savings
   
   # Email
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=shahidx345@gmail.com
   SMTP_PASSWORD=bmywrjumiemwqkaw
   SMTP_FROM=shahidx345@gmail.com
   
   # Payment (Optional)
   STRIPE_SECRET_KEY=sk_test_your_key_here
   STRIPE_WEBHOOK_SECRET=whsec_test_your_key_here
   
   # IMPORTANT: Will be updated after frontend deployment
   FRONTEND_URL=https://save-2740-frrontend.vercel.app
   ```

5. Click **Deploy**
6. **Copy the deployed URL** (e.g., `https://save2740-backend.vercel.app`)

#### Step 3: Deploy Frontend

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your `save2740-frontend` repository
3. **Project Settings:**
   - **Framework Preset:** Next.js
   - **Build Command:** `next build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)

4. **Environment Variables:**

   ```env
   NODE_ENV=production
   
   # CRITICAL: Update with your actual backend URL from Step 2
   NEXT_PUBLIC_API_URL=https://save2740-backend.vercel.app
   
   NEXT_PUBLIC_APP_URL=https://save2740-frontend.vercel.app
   
   # Stripe (Optional)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   ```

5. Click **Deploy**
6. **Copy the deployed URL** (e.g., `https://save2740-frontend.vercel.app`)

#### Step 4: Update Backend FRONTEND_URL

1. Go to Vercel Dashboard → Your Backend Project
2. Go to **Settings** → **Environment Variables**
3. Update `FRONTEND_URL` with your frontend URL:
   ```
   FRONTEND_URL=https://save2740-frontend.vercel.app
   ```
4. Go to **Deployments** → Click **Redeploy** (3 dots menu)

---

### **Option 2: Deploy Using Vercel CLI**

#### Install Vercel CLI
```bash
npm install -g vercel
```

#### Deploy Backend
```bash
cd backend
vercel --prod
# Follow prompts, select "Other" as framework
```

#### Deploy Frontend
```bash
cd ../frontend
vercel --prod
# Follow prompts, select "Next.js" as framework
```

---

## ⚙️ Backend Configuration (API Routes)

### Create `vercel.json` in Backend

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "dist/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "dist/server.js"
    }
  ]
}
```

This file is **already included** in your backend folder.

---

## 🔒 Important Security Notes

### ⚠️ Never Commit These Files:
- `.env` files (both frontend and backend)
- Database credentials
- API keys

### ✅ What to Commit:
- `.env.example` (template files)
- Source code
- `package.json` and `package-lock.json`

---

## 🔗 CORS Configuration

Your backend already has CORS configured in `src/app.ts`:

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

Make sure `FRONTEND_URL` environment variable is set correctly in Vercel.

---

## 🧪 Testing Your Deployment

### 1. Test Backend API
```bash
# Health check
curl https://save2740-backend.vercel.app/health

# Login
curl -X POST https://save2740-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### 2. Test Frontend
- Visit: `https://save2740-frontend.vercel.app`
- Try logging in
- Check browser console for API errors

---

## 📝 Environment Variables Checklist

### Backend (Required):
- [x] `DATABASE_URL` - MongoDB connection string
- [x] `MONGODB_URI` - Same as DATABASE_URL
- [x] `JWT_SECRET` - Authentication secret
- [x] `FRONTEND_URL` - Your deployed frontend URL
- [x] `NODE_ENV=production`

### Frontend (Required):
- [x] `NEXT_PUBLIC_API_URL` - Your deployed backend URL
- [x] `NODE_ENV=production`

### Optional:
- [ ] Stripe keys (if using payments)
- [ ] SMTP credentials (if using email)
- [ ] Analytics keys

---

## 🐛 Troubleshooting

### Issue: "Failed to fetch" errors
**Solution:** Check that `NEXT_PUBLIC_API_URL` in frontend matches backend URL

### Issue: CORS errors
**Solution:** Verify `FRONTEND_URL` in backend matches frontend URL

### Issue: Database connection timeout
**Solution:** Ensure MongoDB Atlas allows connections from `0.0.0.0/0` (all IPs)

### Issue: Build fails
**Solution:** 
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Issue: Environment variables not working
**Solution:** 
- Frontend variables MUST start with `NEXT_PUBLIC_`
- After changing env vars in Vercel, redeploy the project

---

## 🔄 Continuous Deployment

Once connected to GitHub:
- **Push to main branch** → Automatic deployment
- **Pull requests** → Preview deployments
- **Rollback** → One-click in Vercel Dashboard

---

## 📊 Monitoring

### Vercel Dashboard provides:
- Real-time logs
- Function analytics
- Performance metrics
- Error tracking

### Enable Analytics:
Frontend already has `@vercel/analytics` installed. It will automatically track page views in production.

---

## 🎉 Post-Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Environment variables set correctly
- [ ] Database connection working
- [ ] Login/signup working
- [ ] API calls successful (check Network tab)
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic)

---

## 🌐 Custom Domain (Optional)

### Add Custom Domain to Frontend:
1. Go to Vercel → Your Project → Settings → Domains
2. Add your domain (e.g., `save2740.com`)
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` environment variable

### Add Custom Domain to Backend:
1. Add subdomain (e.g., `api.save2740.com`)
2. Update `NEXT_PUBLIC_API_URL` in frontend
3. Update `FRONTEND_URL` in backend
4. Redeploy both projects

---

## 📦 Build Commands Reference

### Backend:
```json
{
  "build": "tsc",
  "start": "node dist/server.js"
}
```

### Frontend:
```json
{
  "build": "next build",
  "start": "next start"
}
```

---

## ⚡ Performance Tips

1. **Enable Edge Functions** (Vercel Pro)
2. **Image Optimization** - Next.js handles this automatically
3. **API Caching** - Implement Redis for frequently accessed data
4. **Database Indexing** - Already configured in models
5. **CDN** - Vercel's CDN is automatic

---

## 🆘 Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **MongoDB Atlas:** https://www.mongodb.com/docs/atlas/

---

## 🎯 Quick Reference URLs

After deployment, bookmark these:

- **Frontend:** `https://[your-frontend].vercel.app`
- **Backend API:** `https://[your-backend].vercel.app/api`
- **Vercel Dashboard:** `https://vercel.com/dashboard`
- **GitHub:** Your repository URLs

---

**✅ Your Save2740 app is ready for production deployment!**

Made with ❤️ using Next.js, Express.js, MongoDB, and Vercel.
