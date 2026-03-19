# Quick Deployment Guide

## Prerequisites

- Supabase CLI installed: `npm install -g supabase`
- Node.js 18+ installed
- Access to your Supabase project

## Deployment Steps

### 1. Deploy Edge Function (5 minutes)

```bash
# Navigate to project
cd /Users/yashodhanrajapkar/Documents/Projects/GrapeGuard1/grapeguard

# Check Supabase installation
supabase --version

# Login to Supabase (if not already logged in)
supabase login

# Link to your project
supabase link --project-ref ydhojocruboucdhdbtzv

# Deploy the predict function
supabase functions deploy predict

# Expected output:
# ✓ Function predict deployed successfully with ID: ...
```

### 2. Set Environment Variables (3 minutes)

```bash
# Get your Service Role Key from Supabase Dashboard:
# Settings → API → Service Role Secret Key

# Set secrets
supabase secrets set SUPABASE_URL=https://ydhojocruboucdhdbtzv.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key

# Verify secrets are set
supabase secrets list

# Expected output shows both variables listed
```

### 3. Verify Deployment (2 minutes)

```bash
# Check function is deployed
supabase functions list

# Should show:
# Name       Status   Version  Regions
# predict    deployed v1       all

# Test the function locally
supabase functions serve

# In another terminal, test with curl:
curl -X POST \
  'http://localhost:54321/functions/v1/predict' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "image_url": "https://example.com/test.jpg",
    "farm_id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "550e8400-e29b-41d4-a716-446655440001"
  }'
```

### 4. Update Frontend .env (1 minute)

Verify your `.grapeguard/.env` has:

```env
VITE_SUPABASE_URL=https://ydhojocruboucdhdbtzv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

### 5. Test Frontend (5 minutes)

```bash
# Start development server
npm run dev

# Navigate to DetectPage
# - Upload an image
- Take a photo
# - Should see prediction result
```

## Troubleshooting

### "SUPABASE_URL is not set" Error

```bash
# Check if secrets are set
supabase secrets list

# If not shown, set them again
supabase secrets set SUPABASE_URL=https://ydhojocruboucdhdbtzv.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-key

# Redeploy function
supabase functions deploy predict
```

### "Function not found" (404 Error)

```bash
# Deploy function again
supabase functions deploy predict

# Check deployment status
supabase functions list

# Check function details
supabase functions describe predict
```

### "Unauthorized" (401/403 Error)

```bash
# Check if using correct key:
# - Frontend: Use VITE_SUPABASE_ANON_KEY
# - Edge Function: Use SERVICE_ROLE_KEY in secrets

# Verify ANON_KEY in frontend
echo $VITE_SUPABASE_ANON_KEY

# Verify SERVICE_ROLE_KEY is set in Supabase
supabase secrets list
```

### "Hugging Face API error" (502 Error)

```bash
# Check if Hugging Face model is running
curl https://geeteshh-app.hf.space/api/health

# If down, wait a few minutes and retry
# Model may be loading

# Test with smaller image
# Image should be < 5MB
```

### "Request timeout" (504 Error)

```bash
# Options:
# 1. Try with smaller image
# 2. Wait and retry (exponential backoff already in function)
# 3. Check internet connection
# 4. Try with URL-based prediction (faster than base64)
```

## Verification Checklist

- [ ] Edge Function deployed: `supabase functions list` shows `predict`
- [ ] Secrets set: `supabase secrets list` shows both variables
- [ ] Frontend .env configured with correct keys
- [ ] Test curl request returns success response
- [ ] Frontend upload/capture works
- [ ] Detection result displays correctly
- [ ] Database entries created (check Supabase dashboard)
- [ ] Alerts created for disease detections

## Local Testing (Without Deployment)

If you want to test before deploying to production:

```bash
# Serve functions locally
supabase functions serve

# In another terminal, test locally:
curl -X POST \
  'http://localhost:54321/functions/v1/predict' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1N...' \
  -H 'Content-Type: application/json' \
  -d '{...}'

# Frontend can call:
# http://localhost:54321/functions/v1/predict (instead of production URL)
```

## Production Deployment Checklist

Before going live:

- [ ] Tested Edge Function locally
- [ ] Tested with real Hugging Face API
- [ ] Set proper error handling in frontend
- [ ] Implemented retry logic
- [ ] Tested with various image sizes
- [ ] Verified RLS policies on database
- [ ] Set up monitoring/logging
- [ ] Documented API response formats
- [ ] Created user documentation
- [ ] Tested on actual mobile device

## Rollback Plan

If something goes wrong:

```bash
# Check current function version
supabase functions describe predict

# Rollback to previous version
# 1. Check git history: git log --oneline
# 2. Reset to previous version: git checkout HEAD~1 -- supabase/functions/predict
# 3. Redeploy: supabase functions deploy predict
```

## Support Contacts

- **Supabase Dashboard:** https://supabase.com/dashboard
- **Supabase Docs:** https://supabase.com/docs
- **Hugging Face Space:** https://geeteshh-app.hf.space/
- **GrapeGuard Issues:** Check project documentation

---

**Estimated Total Time:** 15 minutes ⏱️
