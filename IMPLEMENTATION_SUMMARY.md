# Hugging Face Integration - Complete Implementation Summary

## 📋 Overview

This document provides a complete summary of the Hugging Face ML model integration for GrapeGuard. The integration uses Supabase Edge Functions as a secure backend layer to communicate with the Hugging Face API.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      React Frontend                              │
│              (GrapeGuard Mobile/Web App)                         │
│                                                                   │
│  ┌──────────────┐         ┌────────────────────────────────┐   │
│  │  useDetection│         │ Components (DetectPage.jsx)     │   │
│  │  Hook        │────────▶│ - File upload                  │   │
│  └──────────────┘         │ - Camera capture               │   │
│         │                 │ - Result display               │   │
│         │                 └────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
         │
         │ Image + Farm/User IDs
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Supabase Edge Function                         │
│               (/functions/predict/index.ts)                      │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 1. Validate request (farm_id, user_id, image)           │   │
│  │ 2. Call Hugging Face API with image URL                 │   │
│  │ 3. Parse response (disease, confidence, severity)       │   │
│  │ 4. Save to detections table                             │   │
│  │ 5. Create alerts if disease detected                    │   │
│  │ 6. Return prediction result                             │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
         │
         │ Disease prediction + Detection ID
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Hugging Face API                               │
│  https://geeteshh-app.hf.space/api/predict                       │
│  https://geeteshh-app.hf.space/predict_from_url                  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ GrapeGuard ML Model                                      │   │
│  │ - Input: Grape leaf image (224x224)                      │   │
│  │ - Output: Disease name, confidence, severity             │   │
│  │ - Supported diseases:                                    │   │
│  │   * Downy Mildew, Powdery Mildew, Anthracnose          │   │
│  │   * Black Measles, Leaf Spot, Healthy                   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
         │
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase Database                             │
│                                                                   │
│  ┌──────────────┐     ┌────────────┐     ┌─────────────┐       │
│  │  detections  │     │   alerts   │     │  profiles   │       │
│  ├──────────────┤     ├────────────┤     ├─────────────┤       │
│  │ id           │     │ id         │     │ id          │       │
│  │ farm_id      │────▶│ farm_id    │     │ full_name   │       │
│  │ user_id      │     │ user_id    │────▶│ language    │       │
│  │ image_url    │     │ type       │     │ phone       │       │
│  │ result       │     │ severity   │     └─────────────┘       │
│  │ confidence   │     │ title      │                           │
│  │ is_healthy   │     │ message    │                           │
│  │ detected_at  │     │ created_at │                           │
│  └──────────────┘     └────────────┘                           │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 File Structure

```
grapeguard/
├── supabase/
│   ├── schema.sql                    # Database schema
│   └── functions/
│       └── predict/
│           ├── index.ts              # Main Edge Function
│           └── deno.json             # Dependencies
│
├── src/
│   ├── hooks/
│   │   └── useDetection.js           # Detection hook (UPDATED)
│   └── pages/
│       └── DetectPage.jsx            # Detection UI
│
├── .env                              # Frontend environment variables
├── HUGGING_FACE_INTEGRATION.md       # Setup guide
├── HUGGING_FACE_API_EXAMPLES.md      # API usage examples
├── ENV_SETUP_GUIDE.md                # Environment configuration
├── RESPONSE_PARSING_GUIDE.md         # Error handling
└── DETECT_PAGE_EXAMPLE.jsx           # Example implementation
```

## 🚀 Implementation Checklist

### 1. Backend Setup

- [x] Create Edge Function (`supabase/functions/predict/index.ts`)
- [x] Configure Edge Function dependencies (`deno.json`)
- [ ] Deploy to Supabase:
  ```bash
  cd grapeguard
  supabase functions deploy predict
  ```

### 2. Environment Configuration

- [ ] Set Edge Function secrets in Supabase Dashboard:
  ```bash
  supabase secrets set SUPABASE_URL=https://ydhojocruboucdhdbtzv.supabase.co
  supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-key-here
  ```

- [ ] Verify frontend environment variables in `.env`:
  ```env
  VITE_SUPABASE_URL=https://ydhojocruboucdhdbtzv.supabase.co
  VITE_SUPABASE_ANON_KEY=your-key-here
  ```

### 3. Frontend Integration

- [x] Update `useDetection.js` hook with Edge Function calls
- [x] Example `DetectPage` component (see `DETECT_PAGE_EXAMPLE.jsx`)
- [ ] Test in application:
  ```bash
  npm run dev
  ```

### 4. Database Verification

- [ ] Ensure tables exist:
  ```sql
  SELECT * FROM detections LIMIT 1;
  SELECT * FROM alerts LIMIT 1;
  ```

- [ ] Check storage bucket exists:
  ```bash
  # Supabase Dashboard → Storage → detection-images
  ```

### 5. Testing

- [ ] Test Edge Function with cURL (see API EXAMPLES)
- [ ] Test frontend upload with camera/gallery
- [ ] Test alert creation (for disease detection)
- [ ] Verify data saved to database

## 📊 Response Examples

### Successful Prediction

**Request:**
```json
{
  "image_url": "https://storage.example.com/image.jpg",
  "farm_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Response (200):**
```json
{
  "success": true,
  "prediction": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "disease": "Downy Mildew (Davnya)",
    "confidence": 92.5,
    "severity": "High",
    "is_healthy": false
  },
  "stored": true
}
```

### Error Handling

**Validation Error (400):**
```json
{
  "success": false,
  "error": "Missing farm_id or user_id",
  "details": "Missing farm_id or user_id"
}
```

**API Error (502):**
```json
{
  "success": false,
  "error": "Hugging Face API error",
  "details": "HTTP 502: Service Unavailable"
}
```

**Timeout (504):**
```json
{
  "success": false,
  "error": "Request timeout",
  "details": "Please retry after a few seconds"
}
```

## 🔄 Data Flow

### Step 1: User Uploads Image

```javascript
// Frontend - DetectPage.jsx
const handleFileUpload = async (file) => {
  const { result } = await detect(file)
  setDetection(result)
}
```

### Step 2: Upload to Storage & Call API

```javascript
// useDetection.js
- Upload image to Supabase Storage
- Get public URL
- Call Edge Function with image URL
```

### Step 3: Edge Function Processing

```typescript
// supabase/functions/predict/index.ts
1. Validate parameters (farm_id, user_id, image)
2. Call Hugging Face API
3. Parse response
4. Save to detections table
5. Create alert (if disease detected)
6. Return prediction
```

### Step 4: Database Storage

```sql
INSERT INTO detections (farm_id, user_id, image_url, result, confidence, is_healthy)
VALUES (...)

-- If disease detected:
INSERT INTO alerts (farm_id, user_id, type, severity, title, message)
VALUES (...)
```

## 🛠️ Configuration Details

### Edge Function Settings

| Setting | Value |
|---------|-------|
| **Name** | `predict` |
| **Language** | TypeScript (Deno) |
| **Timeout** | 30 seconds |
| **Memory** | 512MB (default) |
| **Secrets** | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY |

### Hugging Face API

| Property | Value |
|----------|-------|
| **Base URL** | https://geeteshh-app.hf.space |
| **Prediction Endpoint** | /api/predict |
| **URL Endpoint** | /predict_from_url |
| **Health Check** | /api/health |
| **Timeout** | 30 seconds |
| **Max Retries** | 2 |

### Database Constraints

```sql
-- detections table constraints
- farm_id: Required, Foreign Key to farms(id)
- user_id: Required, Foreign Key to auth.users(id)
- image_url: Required, TEXT
- result: Required, e.g., 'healthy', 'downy_mildew'
- confidence: 0-100 NUMERIC
- is_healthy: BOOLEAN, computed from result
- detected_at: Auto timestamp

-- alerts table constraints
- farm_id: Required, Foreign Key to farms(id)
- user_id: Required, Foreign Key to auth.users(id)
- type: Required, e.g., 'disease_detected'
- severity: Required, 'low', 'medium', 'high'
- source_id: Links to detections(id)
- source_table: 'detections'
```

## ⚡ Performance Optimization

### 1. Image Optimization
- Resize to 224x224 (model expects this)
- Compress JPEG quality to 80%
- Max file size: 5MB

### 2. Caching Strategy
```javascript
// Cache predictions to avoid duplicate calls
const predictionCache = new Map()
cache_key = `${imageUrl}:${farmId}`
```

### 3. Batch Processing
```javascript
// For multiple images
const results = await Promise.all(
  images.map(img => predict(img, farmId, userId))
)
```

### 4. Network Optimization
- Use CDN for image storage (GCS, S3)
- URL-based prediction preferred over base64
- Implement exponential backoff retry

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `HUGGING_FACE_INTEGRATION.md` | Complete setup guide |
| `HUGGING_FACE_API_EXAMPLES.md` | API request/response examples |
| `ENV_SETUP_GUIDE.md` | Environment variables configuration |
| `RESPONSE_PARSING_GUIDE.md` | Error handling & parsing |
| `DETECT_PAGE_EXAMPLE.jsx` | Example React component |

## 🧪 Testing

### Unit Tests

```javascript
// Test prediction hook
describe('useDetection', () => {
  it('should call predict function', async () => {
    const { detect } = useDetection(farmId)
    const result = await detect(imageFile)
    
    expect(result.disease).toBeDefined()
    expect(result.confidence).toBeGreaterThan(0)
  })
  
  it('should handle errors', async () => {
    const { detect, error } = useDetection(farmId)
    await detect(null) // Invalid input
    
    expect(error).toBeDefined()
  })
})
```

### Integration Tests

```bash
# Test Edge Function
supabase functions test predict

# Test with real Hugging Face API
curl -X POST http://localhost:54321/functions/v1/predict \
  -H "Authorization: Bearer eyJ..." \
  -d '{"image_url": "...", "farm_id": "...", "user_id": "..."}'
```

## 🔐 Security

### Frontend Security
✅ Use `VITE_SUPABASE_ANON_KEY` (limited permissions)
✅ Store keys in `.env`
✅ Add `.env` to `.gitignore`

### Backend Security
✅ Use `SUPABASE_SERVICE_ROLE_KEY` only in Edge Functions
✅ Validate all inputs
✅ Never log sensitive data
✅ Use HTTPS only
✅ Implement rate limiting

### Database Security
✅ Row-level security (RLS) policies
✅ User can only see own detections
✅ Automatic user_id capture

## 📞 Support

### Hugging Face Issues
- **Space is sleeping?** Visit: https://geeteshh-app.hf.space/api/health
- **Model stuck loading?** Wait a few minutes, then retry
- **API errors?** Check Hugging Face Space logs

### Supabase Issues
- **Function not found?** Deploy: `supabase functions deploy predict`
- **Secrets not set?** Run: `supabase secrets set KEY=VALUE`
- **Database error?** Check SQL Editor for table creation

### App Issues
- **Images not uploading?** Check storage bucket permissions
- **High latency?** Reduce image size or enable caching
- **Timeouts?** Increase timeout threshold or retry logic

## 📈 Monitoring

### Key Metrics to Track

```javascript
// In analytics/monitoring service
- Prediction accuracy (by disease type)
- Average processing time
- Error rate (by error type)
- Cache hit rate
- User satisfaction (feedback on accuracy)
```

### Logs to Monitor

```bash
# Edge Function logs
supabase functions logs predict

# Application errors
console.error('[Detection]', error)

# API response times
const startTime = performance.now()
const result = await predict(...)
const duration = performance.now() - startTime
```

## 🎯 Next Steps

1. **Deploy Edge Function**
   ```bash
   supabase functions deploy predict
   ```

2. **Set Environment Variables**
   ```bash
   supabase secrets set SUPABASE_URL=...
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...
   ```

3. **Test the Integration**
   - Test Edge Function with cURL
   - Test frontend with camera/gallery upload
   - Verify database entries created

4. **Monitor Performance**
   - Track prediction accuracy
   - Monitor API latency
   - Analyze error patterns

5. **Optimize as Needed**
   - Enable caching for repeated calls
   - Batch process multiple images
   - Implement user feedback loop

## 📖 Additional Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Hugging Face Spaces API](https://huggingface.co/docs/hub/spaces-overview)
- [Supabase Database Docs](https://supabase.com/docs/guides/database)
- [React Hooks Best Practices](https://react.dev/reference/rules/rules-of-hooks)

---

**Version:** 1.0  
**Last Updated:** 2026-03-19  
**Maintainer:** GrapeGuard Team
