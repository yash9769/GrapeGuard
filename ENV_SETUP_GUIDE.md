# Environment Variables Setup for Hugging Face Integration

## Frontend Environment Variables (.env)

These variables are used by the frontend React application.

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://ydhojocruboucdhdbtzv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkaG9qb2NydWJvdWNkaGRidHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4OTUxODQsImV4cCI6MjA4OTQ3MTE4NH0.NSFLQZgtPeh2GJ9ECyFmHqx2Qe2Ndo6kJe50XvdIaEo
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_fLrend8JhQ4HQq1G6b60GA_4TCREEKB

# Hugging Face Model (For reference - API is called via Edge Function)
VITE_HUGGING_FACE_MODEL_URL=https://geeteshh-app.hf.space/api/predict
VITE_HUGGING_FACE_SPACE_URL=https://geeteshh-app.hf.space/
```

## Edge Function Environment Variables (Supabase Dashboard)

These variables are used by the Supabase Edge Function and are configured in the Supabase Dashboard.

### In Supabase Dashboard:

1. Go to: **Settings → Edge Functions → Settings (or environment variable panel)**
2. Add these variables:

```env
SUPABASE_URL=https://ydhojocruboucdhdbtzv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Where to Find These Keys:

**SUPABASE_URL:**
- Supabase Dashboard → Settings → API → Project URL
- You can see it in your browser URL: `https://ydhojocruboucdhdbtzv.supabase.co`

**SUPABASE_SERVICE_ROLE_KEY:**
- Supabase Dashboard → Settings → API → Service Role Secret Key
- ⚠️ **CRITICAL**: This is different from ANON_KEY - it has elevated permissions
- **Do NOT use this in frontend code**
- **Keep this secret** - treat like a password

## How to Configure in Supabase

### Step 1: Get Your Service Role Key

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref ydhojocruboucdhdbtzv

# View secrets (requires authentication)
supabase secrets list
```

### Step 2: Set Edge Function Secrets

```bash
# Set individual secrets
supabase secrets set SUPABASE_URL=https://ydhojocruboucdhdbtzv.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-actual-key-here

# Verify they're set
supabase secrets list
```

### Step 3: Deploy Function

```bash
# Deploy the predict function
supabase functions deploy predict

# You should see:
# ✓ Function predict deployed successfully
```

### Step 4: Test the Function

```bash
# Test with cURL
curl -X POST \
  https://ydhojocruboucdhdbtzv.supabase.co/functions/v1/predict \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://example.com/test.jpg",
    "farm_id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "550e8400-e29b-41d4-a716-446655440001"
  }'
```

## Environment Variables Reference

### Frontend Variables (in .env)

| Variable | Purpose | Example | Required |
|----------|---------|---------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://ydhojocruboucdhdbtzv.supabase.co` | ✅ Yes |
| `VITE_SUPABASE_ANON_KEY` | Public API key for frontend | `eyJhbGciOiJIUzI1NiIs...` | ✅ Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Optional: Publishable key | `sb_publishable_...` | ❌ No |
| `VITE_HUGGING_FACE_MODEL_URL` | Reference to HF endpoint | `https://geeteshh-app.hf.space/api/predict` | ❌ No |
| `VITE_HUGGING_FACE_SPACE_URL` | Hugging Face Space URL | `https://geeteshh-app.hf.space/` | ❌ No |

### Edge Function Environment Variables (Supabase Secrets)

| Variable | Purpose | Example | Required |
|----------|---------|---------|----------|
| `SUPABASE_URL` | Supabase URL for Edge Function | `https://ydhojocruboucdhdbtzv.supabase.co` | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for database operations | `eyJhbGc...` | ✅ Yes |

## Checking Your Configuration

### Verify Frontend Variables

```javascript
// In browser console
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Has Anon Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY)
```

### Verify Edge Function Deployment

```bash
# Check function status
supabase functions list

# Expected output:
# Name       Status   Version  Regions
# predict    deployed v1       all
```

### Test Edge Function

**Using Supabase Dashboard:**
1. Go to: Edge Functions → predict → Function Details
2. Click "Execute Function"
3. Provide sample request body:
   ```json
   {
     "image_url": "https://example.com/test.jpg",
     "farm_id": "550e8400-e29b-41d4-a716-446655440000",
     "user_id": "550e8400-e29b-41d4-a716-446655440001"
   }
   ```

**Using Frontend:**
```javascript
const { data, error } = await supabase.functions.invoke('predict', {
  body: {
    image_url: 'https://example.com/test.jpg',
    farm_id: '550e8400-e29b-41d4-a716-446655440000',
    user_id: '550e8400-e29b-41d4-a716-446655440001'
  }
})

console.log('Response:', data, error)
```

## Troubleshooting

### "SUPABASE_URL is not set"

**Cause:** Edge Function environment variables not configured

**Solution:**
```bash
supabase secrets set SUPABASE_URL=https://ydhojocruboucdhdbtzv.supabase.co
supabase functions deploy predict
```

### "Unauthorized" or "403 Forbidden"

**Cause:** Wrong service role key or ANON_KEY used in edge function

**Solution:**
- Verify SUPABASE_SERVICE_ROLE_KEY is the **service role** key, not ANON_KEY
- Re-deploy function: `supabase functions deploy predict`

### "Function not found" (404)

**Cause:** Function not deployed or incorrect name

**Solution:**
```bash
# Deploy function
supabase functions deploy predict

# Verify deployment
supabase functions list
```

### "Timeout" when calling function

**Cause:** Edge function takes too long or network issue

**Solution:**
- Check Hugging Face model health: `https://geeteshh-app.hf.space/api/health`
- Reduce image size (should be < 5MB)
- Retry with exponential backoff

## Security Best Practices

### ✅ DO

- Store `SUPABASE_SERVICE_ROLE_KEY` **only** in Supabase secrets
- Use `VITE_SUPABASE_ANON_KEY` in frontend (has limited permissions)
- Rotate keys periodically
- Use environment variables for all sensitive data
- Never commit .env files to git

### ❌ DON'T

- Put `SUPABASE_SERVICE_ROLE_KEY` in frontend code
- Commit .env file to version control
- Share service keys in Slack, email, or GitHub issues
- Use hardcoded URLs in production
- Store API keys in comments

## Example .env File

```env
# ============================================================
# SUPABASE - Frontend Config
# ============================================================
VITE_SUPABASE_URL=https://ydhojocruboucdhdbtzv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkaG9qb2NydWJvdWNkaGRidHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4OTUxODQsImV4cCI6MjA4OTQ3MTE4NH0.NSFLQZgtPeh2GJ9ECyFmHqx2Qe2Ndo6kJe50XvdIaEo

# ============================================================
# HUGGING FACE - For Reference (API called via Edge Function)
# ============================================================
VITE_HUGGING_FACE_MODEL_URL=https://geeteshh-app.hf.space/api/predict
VITE_HUGGING_FACE_SPACE_URL=https://geeteshh-app.hf.space/
```

## .gitignore Configuration

Make sure your .gitignore includes:

```
# Environment variables
.env
.env.local
.env.*.local

# Supabase secrets
.env.supabase

# IDE
.vscode/settings.json
.idea/
```
