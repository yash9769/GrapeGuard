# 🍇 GrapeGuard — PART 3: ML API + Android Guide

---

## SECTION A: Connect ML API (3 Options)

---

### OPTION 1 — Run API on your Mac (Development / Testing)

**Step 1: Setup**
```bash
cd grapeguard-ml
bash run.sh
# API starts at http://localhost:8000
```

**Step 2: Test it works**
```bash
curl http://localhost:8000/health
# Expected: {"status":"ok","model_loaded":false}

# Test prediction with an image
curl -X POST http://localhost:8000/predict \
  -F "image=@/path/to/leaf.jpg"
# Expected: {"result":"healthy","confidence":85.2,"is_healthy":true,"mode":"mock"}
```

**Step 3: Connect to GrapeGuard app**

In your GrapeGuard `.env` file:
```env
VITE_ML_API_URL=http://localhost:8000/predict
```

> ⚠️ `localhost` works in browser but NOT in Android app.
> For Android, you need Option 2 or 3.

---

### OPTION 2 — Expose Mac API to Android via ngrok (Easiest for testing)

This lets your Android phone hit your Mac's API over the internet.

**Step 1: Install ngrok**
```bash
brew install ngrok
# OR download from https://ngrok.com
```

**Step 2: Start your ML API**
```bash
cd grapeguard-ml && bash run.sh
```

**Step 3: In a NEW terminal, run ngrok**
```bash
ngrok http 8000
```

You'll see output like:
```
Forwarding  https://abc123.ngrok-free.app → http://localhost:8000
```

**Step 4: Update .env**
```env
VITE_ML_API_URL=https://abc123.ngrok-free.app/predict
```

**Step 5: Rebuild and sync to Android**
```bash
npm run build
npx cap sync android
# Then run from Android Studio or: npx cap run android
```

> ✅ This works perfectly for development and demos.
> ngrok URL changes each time unless you have a paid account.

---

### OPTION 3 — Deploy ML API to a Server (Production)

#### Option 3A: Deploy to Render.com (FREE tier, easiest)

1. Push `grapeguard-ml/` to a GitHub repo
2. Go to → https://render.com → New → **Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Environment:** Python 3
5. Click **Deploy**
6. Copy the URL: `https://grapeguard-ml.onrender.com`

Update `.env`:
```env
VITE_ML_API_URL=https://grapeguard-ml.onrender.com/predict
```

> ⚠️ Free tier spins down after 15 min inactivity (first request is slow).

#### Option 3B: Deploy to Railway.app (Easiest paid option, ~$5/mo)

```bash
npm install -g @railway/cli
railway login
cd grapeguard-ml
railway init
railway up
```

---

## SECTION B: Add Your Real ML Model

Once you have a trained model file (`.pth`):

**Step 1: Place model file**
```bash
# Put your model in:
grapeguard-ml/model/grape_disease_model.pth
```

**Step 2: Enable real model in `app/main.py`**
```python
# Change line 20 from:
USE_REAL_MODEL = False
# to:
USE_REAL_MODEL = True
```

**Step 3: Train your own model (if needed)**
```bash
# Organize dataset like this:
# dataset/healthy/img1.jpg, img2.jpg ...
# dataset/powdery_mildew/img1.jpg ...
# dataset/downy_mildew/img1.jpg ...

cd grapeguard-ml
python train.py --data ./dataset --epochs 20
# Model saved to model/grape_disease_model.pth
```

> **Free dataset:** PlantVillage dataset on Kaggle has grape disease images.
> Search: "PlantVillage grape disease dataset kaggle"

**Step 4: Test your model**
```bash
curl -X POST http://localhost:8000/predict \
  -F "image=@test_leaf.jpg"
# Should return your actual prediction now
```

---

## SECTION C: Android App — Complete Steps

### Prerequisites
- Android Studio installed ✅ (you already have this)
- Java 17+ installed
- Android SDK installed (Android Studio installs this)

### Step 1: Make sure .env is set correctly
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_ML_API_URL=https://your-ngrok-or-render-url/predict
```

### Step 2: Build web app
```bash
cd grapeguard
npm run build
# Creates dist/ folder
```

### Step 3: Sync to Android
```bash
npx cap sync android
```

### Step 4: Open Android Studio
```bash
npx cap open android
```

### Step 5: Wait for Gradle sync
- Bottom bar shows "Gradle sync" progress
- Wait until it says "BUILD SUCCESSFUL"
- Takes 2–5 min first time

### Step 6: Run on your phone
1. Connect phone via USB cable
2. On phone: **Settings → Developer Options → USB Debugging → ON**
   - (To enable Developer Options: Settings → About Phone → tap "Build Number" 7 times)
3. In Android Studio: click the ▶️ **Run** button (green triangle)
4. Select your phone from the device list
5. App installs and opens on phone!

### Step 7: Build APK (to share with others)
```
Android Studio menu:
Build → Generate Signed Bundle / APK
→ Choose: APK
→ Create new keystore (first time):
    - Key store path: ~/grapeguard.jks
    - Password: (set a strong password, SAVE IT)
    - Key alias: grapeguard
→ Next → Release → Finish
```

APK will be at:
```
android/app/build/outputs/apk/release/app-release.apk
```

Share this `.apk` file — farmers can install it directly!

### Step 8: Install APK on any Android phone
```bash
# Via ADB (USB):
adb install android/app/build/outputs/apk/release/app-release.apk

# OR: Send the .apk via WhatsApp/email
# Phone needs: Settings → Install unknown apps → ON
```

---

## SECTION D: Fix Common Android Issues

### Issue: "Cleartext HTTP traffic not permitted"
Your ML API URL is `http://` not `https://`.

Fix — add to `android/app/src/main/AndroidManifest.xml`:
```xml
<application
    android:usesCleartextTraffic="true"   ← add this line
    ...>
```

### Issue: Camera not working on Android
Add permissions to `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

### Issue: "Network error" when calling API from phone
- If using `localhost` → switch to ngrok URL
- If using ngrok → check the URL didn't expire
- Check phone and Mac are on same WiFi (for local API)

### Issue: White screen on app launch
```bash
# Rebuild everything fresh
npm run build
npx cap sync android
# Then run again from Android Studio
```

---

## SECTION E: Quick Checklist

```
✅ Supabase project created
✅ schema.sql run in Supabase SQL Editor
✅ Storage bucket 'detection-images' created (Public ON)
✅ Email confirmation disabled (for testing)
✅ .env filled with Supabase URL + Key
✅ ML API running (mock mode is fine to start)
✅ ML API URL in .env points to ngrok/render (not localhost)
✅ npm run build → npx cap sync android
✅ App runs in Android Studio
✅ APK built and tested on phone
```

---

## Quick Reference Commands

```bash
# Start ML API (Mac)
cd grapeguard-ml && bash run.sh

# Expose via ngrok
ngrok http 8000

# Rebuild + sync after any code change
cd grapeguard
npm run build && npx cap sync android

# Run directly on connected phone
npx cap run android

# Check API is working
curl https://your-url.ngrok-free.app/health
```

