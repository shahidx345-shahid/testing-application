# 🔑 How to Fix "Access Token Required" in Postman

## 😤 The Problem

Testing APIs is annoying because you need to:
- Copy token manually
- Paste into every request
- Re-login when token expires

## ✅ The Solution (2 Minutes Setup)

Follow these steps once, never copy-paste tokens again!

---

## 🚀 QUICK FIX (Copy-Paste Ready)

### Step 1: Import Postman Files

**In Postman:**
1. Click **Import** button (top left)
2. Drag these 2 files:
   - `Save2740_API.postman_collection.json`
   - `Save2740_Environment.postman_environment.json`
3. Click **Import**

### Step 2: Select Environment

1. Click environment dropdown **(top right corner)**
2. Select **"Save2740 Local Development"**

### Step 3: Get Your Token

**Open:** `Authentication` folder → `Login`

**Send this request:**
```json
{
  "email": "postman@test.com",
  "password": "Test123456"
}
```

**The token will AUTO-SAVE to your environment!** 🎉

### Step 4: Test Any Endpoint

Now all protected endpoints work automatically:
- Click `Wallet` → `Get Wallet`
- Click `Send`
- **IT JUST WORKS!** ✅

---

## 🎯 HOW IT WORKS

### Magic Script in Login/Verify Requests

The collection includes this auto-save script:

```javascript
// Automatically runs after successful login
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    if (jsonData.data && jsonData.data.accessToken) {
        pm.environment.set('access_token', jsonData.data.accessToken);
        console.log('✅ Token saved!');
    }
}
```

### All Protected Endpoints Use This Header

```
Authorization: Bearer {{access_token}}
```

The `{{access_token}}` variable is filled automatically from your environment!

---

## 📋 STEP-BY-STEP FIRST TIME SETUP

### 1. Start Your Backend Server

```bash
cd backend
npm run dev
```

Wait for:
```
🚀 Server is running on port 5000
✅ Database connected successfully
```

### 2. Import to Postman

- Import `Save2740_API.postman_collection.json`
- Import `Save2740_Environment.postman_environment.json`
- Select the environment (top right)

### 3. Create Test Account (FIRST TIME ONLY)

**A. Sign Up**
```
POST /api/auth/signup

{
  "email": "postman@test.com",
  "password": "Test123456",
  "firstName": "Postman",
  "lastName": "Tester"
}
```

**B. Check Your Terminal**
Look for:
```
📧 Email verification code for postman@test.com: 123456
```

**C. Verify Email**
```
POST /api/auth/verify-email

{
  "email": "postman@test.com",
  "code": "123456"
}
```

✅ **Token automatically saved!**

### 4. Test Any Endpoint

Click any endpoint → Send → It works! 🎉

---

## 🔄 WHEN TOKEN EXPIRES (15 Minutes)

### Option 1: Refresh Token (Recommended)

```
POST /api/auth/refresh
```

✅ New token auto-saved!

### Option 2: Login Again

```
POST /api/auth/login

{
  "email": "postman@test.com",
  "password": "Test123456"
}
```

✅ New token auto-saved!

---

## 🎯 MANUAL SETUP (If Import Doesn't Work)

### Step 1: Create Environment

1. Click **Environments** (left sidebar)
2. Click **+** (create new)
3. Name it: "Save2740 Local"
4. Add these variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `http://localhost:5000/api` | |
| `access_token` | (leave empty) | |

5. Click **Save**

### Step 2: Set Authorization on Collection

1. Right-click **Save2740 Backend API** collection
2. Click **Edit**
3. Go to **Authorization** tab
4. Type: **Bearer Token**
5. Token: `{{access_token}}`
6. Click **Update**

### Step 3: Add Auto-Save Script to Login

1. Click `Authentication` → `Login`
2. Go to **Tests** tab
3. Paste this:

```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    if (jsonData.data && jsonData.data.accessToken) {
        pm.environment.set('access_token', jsonData.data.accessToken);
        console.log('✅ Token saved to environment!');
    }
}
```

4. Save request

### Step 4: Test It

1. Send **Login** request
2. Check Postman console (bottom) for: `✅ Token saved!`
3. Click **Environments** → Your environment
4. Verify `access_token` has a value
5. Try any protected endpoint → It works!

---

## 🎓 UNDERSTANDING THE SETUP

### Why This Works

**1. Environment Variable:**
```
access_token = "your_jwt_token"
```

**2. Collection-Level Authorization:**
```
Authorization: Bearer {{access_token}}
```

**3. All Requests Inherit It:**
- Every endpoint in the collection automatically uses the token
- No need to set it per-request
- Just update the environment variable once

### What Gets Inherited

✅ **Authorization header** - Set at collection level
✅ **base_url** - Used in all requests
✅ **Any environment variable** - Available in all requests

---

## 🆘 TROUBLESHOOTING

### Issue: "access_token is not defined"

**Solution:**
- Make sure environment is selected (top right dropdown)
- Check environment has `access_token` variable
- Run Login request to populate it

### Issue: "401 Unauthorized" on every request

**Solution:**
- Token might be expired (15 min lifetime)
- Run Login again
- Or use Refresh Token endpoint

### Issue: Token not auto-saving

**Solution:**
- Check the **Tests** tab in Login request has the auto-save script
- Check Console (bottom of Postman) for "Token saved" message
- Manually copy token and paste in environment

### Issue: "Cannot read property 'accessToken'"

**Solution:**
- Login response might have failed
- Check status code is 200
- Check response body has `data.accessToken` field

---

## ✅ VERIFICATION

After setup, verify it works:

### Test 1: Public Endpoint (No Token)
```
GET /api/health
```
Should return: `200 OK`

### Test 2: Login (Gets Token)
```
POST /api/auth/login
{
  "email": "postman@test.com",
  "password": "Test123456"
}
```
Should return: `200 OK` + token auto-saves

### Test 3: Protected Endpoint (Uses Token)
```
GET /api/wallet
```
Should return: `200 OK` + wallet data

**No manual token copy needed!** ✅

---

## 🎉 YOU'RE DONE!

Now you can:
- ✅ Login once
- ✅ Test all 52 endpoints
- ✅ No manual token copying
- ✅ Auto-refresh when expired
- ✅ Fast testing workflow

---

## 📞 QUICK COMMANDS

**Get Token:**
```
POST /api/auth/login + use Test tab script
```

**Use Token:**
```
Authorization: Bearer {{access_token}}
```

**Refresh Token:**
```
POST /api/auth/refresh
```

**Check Token Works:**
```
GET /api/auth/me
```

---

**🎊 No more "access token required" frustration!**

**Import the files and test away!**
