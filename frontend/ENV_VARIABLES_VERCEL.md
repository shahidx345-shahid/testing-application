# ENVIRONMENT VARIABLES - FRONTEND (VERCEL)

## Copy these to Vercel Dashboard → Your Frontend Project → Settings → Environment Variables

### ✅ REQUIRED VARIABLES

```env
# Backend API URL (CRITICAL!)
NEXT_PUBLIC_API_URL=https://save-2740-backend.vercel.app

# Application URL
NEXT_PUBLIC_APP_URL=https://save-2740-frrontend.vercel.app

# Environment
NODE_ENV=production
```

### 🔧 OPTIONAL VARIABLES

```env
# Stripe Public Key (for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_publishable_key

# Stripe (Live - only when ready)
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key

# Feature Flags
NEXT_PUBLIC_FEATURE_STRIPE_ENABLED=false
NEXT_PUBLIC_FEATURE_DWOLLA_ENABLED=false

# Analytics (Optional)
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX
NEXT_PUBLIC_AMPLITUDE_KEY=your-amplitude-key
```

---

## 📝 IMPORTANT NOTES

### Variable Naming Rules:
- **MUST** start with `NEXT_PUBLIC_` to be accessible in browser
- Without this prefix, variables won't work in client-side code

### Backend URL:
- **CRITICAL:** This MUST match your deployed backend URL
- NO trailing slash
- Example: `https://save-2740-backend.vercel.app` ✅
- Wrong: `https://save-2740-backend.vercel.app/` ❌

### App URL:
- Should match your Vercel deployment URL
- Used for callbacks, redirects, etc.

---

## 🚀 HOW TO SET IN VERCEL

1. Go to: https://vercel.com/dashboard
2. Select your frontend project (save-2740-frrontend)
3. Click "Settings" → "Environment Variables"
4. Add each variable:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://save-2740-backend.vercel.app`
   - **Environments:** Check all (Production, Preview, Development)
5. Click "Save"
6. **IMPORTANT:** Redeploy after adding variables

---

## 🔍 VERIFICATION

### Check in Browser Console:
```javascript
console.log(process.env.NEXT_PUBLIC_API_URL)
// Should print: https://save-2740-backend.vercel.app
```

### Test API Call:
```javascript
fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`)
  .then(res => res.json())
  .then(data => console.log(data))
// Should return: {status: "ok", timestamp: "..."}
```

---

## ⚠️ TROUBLESHOOTING

### Problem: API calls go to localhost
**Cause:** Environment variable not set or not starting with `NEXT_PUBLIC_`

**Fix:**
1. Ensure variable name is `NEXT_PUBLIC_API_URL` (exact)
2. Redeploy frontend
3. Hard refresh browser (Ctrl+Shift+R)

### Problem: Variable is undefined
**Cause:** Forgot `NEXT_PUBLIC_` prefix

**Fix:**
1. Rename variable to include `NEXT_PUBLIC_` prefix
2. Redeploy
3. Clear browser cache

### Problem: Still using old URL
**Cause:** Browser cache or build cache

**Fix:**
1. Redeploy in Vercel
2. Clear browser cache
3. Open in incognito mode to test

---

## 📋 FINAL CHECKLIST

- [ ] `NEXT_PUBLIC_API_URL` set to backend URL
- [ ] `NEXT_PUBLIC_APP_URL` set to frontend URL
- [ ] `NODE_ENV` set to `production`
- [ ] All variables redeployed
- [ ] Tested in browser console
- [ ] API calls working (check Network tab)
- [ ] No CORS errors
- [ ] No 404 errors on API endpoints

---

## 🎯 NEXT STEPS

After setting environment variables:

1. **Redeploy:** Vercel automatically redeploys when you add env vars
2. **Wait:** Give it 1-2 minutes to complete
3. **Test:** Visit your frontend URL
4. **Verify:** Check browser console for any errors
5. **Monitor:** Check Vercel logs for issues

---

## ✅ SUCCESS INDICATORS

Your frontend is correctly configured when:
- ✅ Page loads without errors
- ✅ Can sign up/login
- ✅ Dashboard shows data
- ✅ No CORS errors in console
- ✅ API calls go to correct backend URL
- ✅ Network tab shows calls to `save-2740-backend.vercel.app`
