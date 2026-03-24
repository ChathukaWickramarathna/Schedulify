# 🔧 FIXES APPLIED - Testing Guide (PowerShell)

## ✅ Issues Fixed

### **1. Missing `/api` prefix** ✅
- Changed: `baseURL: "http://localhost:5000"`
- To: `baseURL: "http://localhost:5000/api"`

### **2. Wrong verify endpoint** ✅
- Changed: `api.get("/auth/verify")`
- To: `api.get("/auth/me")`

### **3. Role case-sensitivity** ✅
- Backend uses: "admin", "user", "staff" (lowercase)
- Frontend expects: "ADMIN", "USER" (uppercase)
- Fixed: Now case-insensitive comparison

---

## 🚀 Testing Guide (PowerShell Commands)

### **Step 1: Clear Cache**

```powershell
# You're already in frontend folder, right?
# Run this to clear cache:
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
```

---

### **Step 2: Verify Files**

```powershell
# Check postcss.config.js
Get-Content postcss.config.js

# Check index.css (first line should be: @import "tailwindcss";)
Get-Content src\index.css -Head 3

# Check axios.js has /api prefix
Get-Content src\api\axios.js | Select-String -Pattern "baseURL"
```

**Expected output for axios.js:**
```
baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
```

---

### **Step 3: Rebuild Frontend**

```powershell
npm run build
```

**Expected output:**
```
✓ built in 1.21s
dist/assets/index-XXXXX.css   35.13 kB  ← Should be ~35 KB
```

---

### **Step 4: Start Backend Server**

Open a **NEW PowerShell window** and run:

```powershell
# Go to backend folder
cd C:\Users\MSI Modern\OneDrive\Desktop\Schedulify\backend

# Start backend server
npm start
```

**Expected output:**
```
Server running on port 5000
MongoDB connected successfully
```

**If backend is not running, you'll get 404 errors!** ⚠️

---

### **Step 5: Start Frontend Server**

In your **original PowerShell window** (in frontend folder), run:

```powershell
npm run dev
```

**Expected output:**
```
VITE v8.0.0  ready in 500 ms

➜  Local:   http://localhost:5173/
```

---

### **Step 6: Test in Browser**

1. **Open:** http://localhost:5173/login

2. **Hard refresh:** Press `Ctrl + Shift + R`

3. **Test Login:**
   - Enter email: `test@example.com`
   - Enter password: `password123`
   - Click "Sign In"

4. **Test Register:**
   - Go to http://localhost:5173/register
   - Fill out the form
   - Click "Create Account"

---

## 🎯 Complete PowerShell Test Script

Copy this entire script and run it:

```powershell
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  SCHEDULIFY AUTHENTICATION - TESTING SCRIPT            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Step 1: Clear cache
Write-Host "`n🧹 Step 1: Clearing cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
Write-Host "✅ Cache cleared" -ForegroundColor Green

# Step 2: Check postcss.config.js
Write-Host "`n📝 Step 2: Checking postcss.config.js..." -ForegroundColor Yellow
if (Test-Path postcss.config.js) {
    Write-Host "✅ postcss.config.js exists" -ForegroundColor Green
    Get-Content postcss.config.js
} else {
    Write-Host "❌ postcss.config.js NOT FOUND!" -ForegroundColor Red
}

# Step 3: Check index.css
Write-Host "`n📝 Step 3: Checking index.css..." -ForegroundColor Yellow
$firstLine = Get-Content src\index.css -Head 1
if ($firstLine -match "@import") {
    Write-Host "✅ index.css has correct import" -ForegroundColor Green
    Write-Host $firstLine
} else {
    Write-Host "❌ index.css missing @import 'tailwindcss';" -ForegroundColor Red
}

# Step 4: Check axios baseURL
Write-Host "`n📝 Step 4: Checking axios baseURL..." -ForegroundColor Yellow
$axiosLine = Get-Content src\api\axios.js | Select-String -Pattern "baseURL"
if ($axiosLine -match "/api") {
    Write-Host "✅ axios baseURL has /api prefix" -ForegroundColor Green
    Write-Host $axiosLine
} else {
    Write-Host "❌ axios baseURL missing /api prefix" -ForegroundColor Red
}

# Step 5: Check packages
Write-Host "`n📦 Step 5: Checking packages..." -ForegroundColor Yellow
npm list @tailwindcss/postcss autoprefixer --depth=0

# Step 6: Build
Write-Host "`n🔨 Step 6: Building project..." -ForegroundColor Yellow
npm run build

# Step 7: Check CSS size
Write-Host "`n📊 Step 7: Checking CSS file size..." -ForegroundColor Yellow
$cssFiles = Get-ChildItem dist\assets\*.css
foreach ($file in $cssFiles) {
    $sizeKB = [math]::Round($file.Length / 1KB, 2)
    Write-Host "$($file.Name): $sizeKB KB" -ForegroundColor Cyan
    if ($sizeKB -gt 30) {
        Write-Host "✅ Tailwind CSS is working! (Size: $sizeKB KB)" -ForegroundColor Green
    } else {
        Write-Host "❌ Tailwind CSS not working (Size too small: $sizeKB KB)" -ForegroundColor Red
    }
}

Write-Host "`n`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ FRONTEND SETUP COMPLETE                            ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`n⚠️  IMPORTANT: Make sure backend is running!" -ForegroundColor Yellow
Write-Host "   Open a NEW PowerShell window and run:" -ForegroundColor Yellow
Write-Host "   cd ..\backend" -ForegroundColor Cyan
Write-Host "   npm start" -ForegroundColor Cyan

Write-Host "`n🚀 Now starting frontend dev server..." -ForegroundColor Green
Write-Host "   Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""
npm run dev
```

---

## 🔥 Quick Fix Commands (If Script Above is Too Long)

```powershell
# 1. Clear cache
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue

# 2. Check axios has /api
Get-Content src\api\axios.js | Select-String "baseURL"

# 3. Build
npm run build

# 4. Start frontend
npm run dev
```

**Then in ANOTHER PowerShell window:**

```powershell
# Go to backend
cd ..\backend

# Start backend
npm start
```

---

## ✅ What Should Happen Now

### **After running both servers:**

1. **Frontend:** http://localhost:5173/login
2. **Backend:** http://localhost:5000

### **Test Login:**
- Email: Any registered email
- Password: Corresponding password
- Should work without 404 error!

### **Test Register:**
- Fill out form
- Click "Create Account"
- Should work without 404 error!
- Auto-login and redirect to dashboard

---

## 🔍 Verify Backend is Running

```powershell
# Test backend directly
Invoke-WebRequest -Uri http://localhost:5000 -Method GET
```

**Expected response:**
```
StatusCode: 200
Content: Schedulify API is running...
```

**If you get an error, backend is NOT running!**

---

## 📊 Summary of Changes

| File | Change | Reason |
|------|--------|--------|
| `axios.js` | Added `/api` to baseURL | Backend routes are at `/api/auth/*` |
| `AuthContext.jsx` | Changed `/auth/verify` to `/auth/me` | Backend doesn't have verify endpoint |
| `tokenHelper.js` | Made role comparison case-insensitive | Backend uses lowercase, frontend uses uppercase |

---

## 🎯 Quick Checklist

- [ ] Frontend axios.js has `baseURL: "http://localhost:5000/api"` ✅
- [ ] Backend is running on port 5000 ⚠️ **Check this!**
- [ ] MongoDB is connected ⚠️ **Check this!**
- [ ] Frontend is running on port 5173
- [ ] No 404 errors when logging in

---

## 🚨 Troubleshooting

### **Still getting 404?**

**Check if backend is running:**
```powershell
# In a new window, go to backend
cd ..\backend

# Check if server.js exists
dir server.js

# Start backend
npm start
```

### **Backend won't start?**

**Check if MongoDB is running:**
```powershell
# Check if MongoDB service is running (Windows)
Get-Service -Name MongoDB* -ErrorAction SilentlyContinue
```

If MongoDB isn't running, you need to start it or check your `.env` file.

### **Want to test backend directly?**

```powershell
# Test backend health
Invoke-RestMethod -Uri http://localhost:5000 -Method GET

# Test login endpoint (replace with real user)
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:5000/api/auth/login -Method POST -Body $body -ContentType "application/json"
```

---

## 📞 Next Steps

1. **Run the test script above**
2. **Make sure BOTH servers are running:**
   - Backend: http://localhost:5000
   - Frontend: http://localhost:5173
3. **Try logging in again**
4. **If still not working, share:**
   - Backend console output
   - Frontend error message
   - Browser console errors (F12)

Let me know if it works now! 🚀
