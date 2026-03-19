# GrapeGuard Hugging Face Integration

Complete integration of the GrapeGuard ML model (hosted on Hugging Face) with Supabase Edge Functions for secure, serverless disease prediction.

## 🎯 Quick Start

### For Developers

1. **Read the Implementation Summary:**
   - [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Overview of architecture and flow

2. **Deploy the Edge Function:**
   - [QUICK_DEPLOYMENT.md](./QUICK_DEPLOYMENT.md) - Step-by-step deployment guide

3. **Configure Environment:**
   - [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md) - Environment variables setup

4. **API Documentation:**
   - [HUGGING_FACE_API_EXAMPLES.md](./HUGGING_FACE_API_EXAMPLES.md) - Request/response examples

5. **Error Handling:**
   - [RESPONSE_PARSING_GUIDE.md](./RESPONSE_PARSING_GUIDE.md) - Parsing and error handling

### For Integration

```javascript
import { useDetection } from './src/hooks/useDetection'

function DetectPage() {
  const { detect, result, loading, error } = useDetection(farmId)
  
  const handleUpload = async (file) => {
    await detect(file)
  }
  
  return (
    <div>
      <input type="file" onChange={e => handleUpload(e.target.files[0])} />
      {loading && <p>Analyzing...</p>}
      {result && <p>Disease: {result.result_label}</p>}
    </div>
  )
}
```

## 📁 Files Overview

### Edge Function
- **`supabase/functions/predict/index.ts`** - Main Edge Function
  - Accepts image URL or base64
  - Calls Hugging Face API
  - Saves results to database
  - Creates alerts
  - Error handling with retries

### Frontend
- **`src/hooks/useDetection.js`** - Updated detection hook
  - `detect(file)` - Main prediction
  - `fileToBase64(file)` - Convert file
  - `fetchHistory()` - Get past detections
  
- **Example:** `DETECT_PAGE_EXAMPLE.jsx` - Reference implementation

### Configuration
- **`.env`** - Frontend variables
- **`SUPABASE_SECRETS`** - Edge Function secrets (set in dashboard)

### Documentation
| File | Purpose |
|------|---------|
| IMPLEMENTATION_SUMMARY.md | Architecture overview |
| QUICK_DEPLOYMENT.md | 15-minute deployment guide |
| HUGGING_FACE_INTEGRATION.md | Complete setup instructions |
| HUGGING_FACE_API_EXAMPLES.md | cURL, JavaScript, Python examples |
| ENV_SETUP_GUIDE.md | Environment configuration |
| RESPONSE_PARSING_GUIDE.md | Error handling patterns |

## 🚀 Deployment

### 1 minute setup:
```bash
cd grapeguard

# Deploy function
supabase functions deploy predict

# Set secrets
supabase secrets set SUPABASE_URL=https://ydhojocruboucdhdbtzv.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-key

# Test
npm run dev
```

See [QUICK_DEPLOYMENT.md](./QUICK_DEPLOYMENT.md) for detailed steps.

## 🔄 How It Works

```
1. User selects/captures image → React component
2. Image uploaded to Supabase Storage → Public URL
3. Frontend calls Edge Function → /functions/v1/predict
4. Edge Function calls Hugging Face API → ML inference
5. Results saved to Supabase database → detections table
6. Alerts created for diseases → alerts table
7. Result returned to frontend → Display to user
```

## 📊 API Response

### Success Response
```json
{
  "success": true,
  "prediction": {
    "id": "uuid",
    "disease": "Downy Mildew (Davnya)",
    "confidence": 92.5,
    "severity": "High",
    "is_healthy": false
  },
  "stored": true
}
```

### Error Response
```json
{
  "success": false,
  "error": "Hugging Face API error",
  "details": "HTTP 502: Service Unavailable"
}
```

## 🌐 Hugging Face API

**Model Details:**
- **Space:** https://geeteshh-app.hf.space/
- **API Endpoint:** https://geeteshh-app.hf.space/api/predict
- **URL Endpoint:** https://geeteshh-app.hf.space/predict_from_url
- **Health Check:** https://geeteshh-app.hf.space/api/health

**Supported Diseases:**
- ✓ Downy Mildew (Davnya)
- ✓ Powdery Mildew
- ✓ Black Measles
- ✓ Anthracnose
- ✓ Leaf Spot
- ✓ Healthy

## 💾 Database Schema

### detections table
```sql
- id: UUID (Primary Key)
- farm_id: UUID (FK to farms)
- user_id: UUID (FK to auth.users)
- image_url: TEXT
- result: TEXT ('healthy', 'downy_mildew', etc.)
- result_label: TEXT ('Healthy', 'Downy Mildew', etc.)
- confidence: NUMERIC (0-100)
- is_healthy: BOOLEAN
- notes: TEXT (JSON with details)
- detected_at: TIMESTAMPTZ
```

### alerts table
```sql
- id: UUID (Primary Key)
- farm_id: UUID (FK to farms)
- user_id: UUID (FK to auth.users)
- type: TEXT ('disease_detected')
- severity: TEXT ('low', 'medium', 'high')
- title: TEXT
- message: TEXT
- source_id: UUID (detections.id)
- source_table: TEXT ('detections')
- created_at: TIMESTAMPTZ
```

## ⚙️ Configuration

### Frontend (.env)
```env
VITE_SUPABASE_URL=https://ydhojocruboucdhdbtzv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### Edge Function (Supabase Secrets)
```env
SUPABASE_URL=https://ydhojocruboucdhdbtzv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

## 🧪 Testing

### Test with cURL
```bash
curl -X POST \
  https://ydhojocruboucdhdbtzv.supabase.co/functions/v1/predict \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://example.com/image.jpg",
    "farm_id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "550e8400-e29b-41d4-a716-446655440001"
  }'
```

### Test with Frontend
```javascript
const { detect, result, loading, error } = useDetection(farmId)
await detect(imageFile)
console.log(result) // Detection result
```

## 🔐 Security Features

✅ **Frontend:** Uses ANON_KEY with limited permissions  
✅ **Backend:** Uses SERVICE_ROLE_KEY only in secure Edge Functions  
✅ **Database:** User can only access their own detections (RLS)  
✅ **Secrets:** Never exposed in frontend code  
✅ **Validation:** All inputs validated before processing  

## ⚡ Performance

### Optimization
- **Caching:** Predictions cached to avoid duplicate calls
- **Batch:** Process multiple images efficiently
- **Retry:** Exponential backoff on failures
- **Timeout:** 30 second limit with proper error handling

### Benchmarks
- **Average latency:** 5-10 seconds per image
- **Model accuracy:** 85-95% depending on disease
- **Concurrent requests:** Handled via Edge Function infrastructure

## 🐛 Troubleshooting

### "Function not found" (404)
```bash
supabase functions deploy predict
```

### "Hugging Face API error" (502)
- Wait a few minutes (model may be loading)
- Check health: https://geeteshh-app.hf.space/api/health
- Retry automatically with backoff

### "Request timeout" (504)
- Use smaller images (< 5MB)
- Retry with exponential backoff (built-in)
- Check internet connection

### "Unauthorized" (401/403)
- Verify frontend uses ANON_KEY
- Verify Edge Function has SERVICE_ROLE_KEY set
- Check Supabase dashboard secrets

## 📚 Extended Documentation

For detailed information, see:

- **Architecture & Flow:** [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- **Deployment Steps:** [QUICK_DEPLOYMENT.md](./QUICK_DEPLOYMENT.md)
- **Complete Setup:** [HUGGING_FACE_INTEGRATION.md](./HUGGING_FACE_INTEGRATION.md)
- **API Examples:** [HUGGING_FACE_API_EXAMPLES.md](./HUGGING_FACE_API_EXAMPLES.md)
- **Environment Setup:** [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md)
- **Error Handling:** [RESPONSE_PARSING_GUIDE.md](./RESPONSE_PARSING_GUIDE.md)

## 📞 Support

### Common Issues
- **Space sleeping?** → Visit https://geeteshh-app.hf.space/api/health
- **Model outdated?** → Check Hugging Face Space for updates
- **Database full?** → Archive old detections or increase quota

### Resources
- [Supabase Docs](https://supabase.com/docs)
- [Hugging Face Spaces](https://huggingface.co/spaces)
- [Edge Functions](https://supabase.com/docs/guides/functions)

## 📈 Next Steps

1. ✅ Read [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
2. ✅ Follow [QUICK_DEPLOYMENT.md](./QUICK_DEPLOYMENT.md)
3. ✅ Test with cURL examples
4. ✅ Integrate in your React components
5. ✅ Monitor predictions and accuracy
6. ✅ Gather user feedback

---

**Version:** 1.0  
**Last Updated:** 2026-03-19  
**Status:** ✅ Ready for Production
