# GrapeGuard Hugging Face Integration - Edge Function

## Overview
This Supabase Edge Function handles disease prediction using the GrapeGuard Hugging Face model API.

- **API Endpoint**: `https://geeteshh-app.hf.space/api/predict` (multipart upload)
- **URL Endpoint**: `https://geeteshh-app.hf.space/predict_from_url` (URL-based)
- **Health Check**: `https://geeteshh-app.hf.space/api/health`

## Setup Instructions

### 1. Deploy Edge Function to Supabase

```bash
# Navigate to project root
cd /path/to/GrapeGuard1/grapeguard

# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your Supabase project
supabase link --project-ref ydhojocruboucdhdbtzv

# Deploy the function
supabase functions deploy predict
```

### 2. Set Environment Variables in Supabase

In Supabase Dashboard → Edge Functions → Settings:

```
SUPABASE_URL=https://ydhojocruboucdhdbtzv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get your service role key from:
- Supabase Dashboard → Settings → API → Service Role Secret Key

### 3. Update .env (Frontend)

```env
VITE_SUPABASE_URL=https://ydhojocruboucdhdbtzv.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## API Usage

### Request Format

#### Option 1: Image URL (Recommended for efficiency)

```javascript
POST /functions/v1/predict

{
  "image_url": "https://example.com/image.jpg",
  "farm_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "550e8400-e29b-41d4-a716-446655440001"
}
```

#### Option 2: Image Base64 (For freshly captured images)

```javascript
POST /functions/v1/predict

{
  "image_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
  "farm_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "550e8400-e29b-41d4-a716-446655440001"
}
```

### Response Format

**Success (200)**:
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

**Error (400-504)**:
```json
{
  "success": false,
  "error": "Hugging Face API error",
  "details": "HTTP 502: Service Unavailable"
}
```

## Implementation in Frontend

### React Hook (useDetection.js)

```javascript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const callPredictFunction = async (imageUrl, farmId, userId) => {
  try {
    const { data, error } = await supabase.functions.invoke("predict", {
      body: {
        image_url: imageUrl,
        farm_id: farmId,
        user_id: userId,
      },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Prediction error:", error);
    throw error;
  }
};

export const callPredictWithBase64 = async (
  imageBase64,
  farmId,
  userId
) => {
  try {
    const { data, error } = await supabase.functions.invoke("predict", {
      body: {
        image_base64: imageBase64,
        farm_id: farmId,
        user_id: userId,
      },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Prediction error:", error);
    throw error;
  }
};
```

## Error Handling

### Timeout Handling (30s)
```javascript
try {
  const result = await callPredictFunction(imageUrl, farmId, userId);
} catch (error) {
  if (error.status === 504) {
    console.error("API timeout - image may be too large or API is slow");
  }
}
```

### Invalid Response
```javascript
try {
  const result = await callPredictFunction(imageUrl, farmId, userId);
  if (!result.success) {
    throw new Error("Prediction returned success:false");
  }
} catch (error) {
  // Retry logic or show user-friendly message
}
```

### No Prediction
```javascript
const result = await callPredictFunction(imageUrl, farmId, userId);
if (result.prediction.confidence < 50) {
  console.warn("Low confidence prediction - may not be reliable");
}
```

## Optimization

### Low Latency
- **Use URL-based prediction** when image is already in cloud storage (preferred)
- **Avoid repeated calls** for same image - cache results
- **Batch requests** if processing multiple images

### Minimal Cost
- **Reuse image URLs** instead of uploading base64
- **Cache predictions** in `detections` table
- **Retry with exponential backoff** (2, 4, 8 seconds) - already implemented

## Database Schema

### Detections Table
```sql
id              UUID (Primary Key)
farm_id         UUID (Foreign Key)
user_id         UUID (Foreign Key)
image_url       TEXT (Original image location)
result          TEXT ('healthy', 'downy_mildew', 'powdery_mildew', etc.)
result_label    TEXT ('Healthy', 'Downy Mildew', etc.)
confidence      NUMERIC (0-100)
is_healthy      BOOLEAN
notes           TEXT (JSON with severity, details)
detected_at     TIMESTAMPTZ
```

### Alerts Table (Auto-created)
```sql
id              UUID (Primary Key)
farm_id         UUID (Foreign Key)
user_id         UUID (Foreign Key)
type            TEXT ('disease_detected')
severity        TEXT ('low', 'medium', 'high')
title           TEXT
title_hi        TEXT (Hindi translation)
message         TEXT
source_id       UUID (detections.id)
source_table    TEXT ('detections')
created_at      TIMESTAMPTZ
```

## Testing

### cURL Examples

**Test with image URL:**
```bash
curl -X POST https://ydhojocruboucdhdbtzv.supabase.co/functions/v1/predict \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://example.com/grape-leaf.jpg",
    "farm_id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "550e8400-e29b-41d4-a716-446655440001"
  }'
```

**Test with base64:**
```bash
curl -X POST https://ydhojocruboucdhdbtzv.supabase.co/functions/v1/predict \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "image_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
    "farm_id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "550e8400-e29b-41d4-a716-446655440001"
  }'
```

## Monitoring

Check function logs in Supabase Dashboard:
- **Success**: Status 200, contains prediction ID
- **API Error**: Status 502, details.includes("API error")
- **Timeout**: Status 504, indicates slow response
- **Validation Error**: Status 400, missing required fields

## Troubleshooting

### "SUPABASE_URL not found"
- Ensure environment variables are set in Supabase Dashboard
- Check that SERVICE_ROLE_KEY is correct (not the ANON_KEY)

### "Hugging Face API error: 503"
- Model may be sleeping - visit `https://geeteshh-app.hf.space/api/health`
- Wait a few moments and retry

### "Request timeout"
- Image may be too large (resize to < 5MB)
- API is processing slowly - retry with exponential backoff
- Check network connectivity

### No alert created
- Alert creation failure doesn't block the prediction result
- Check alerts table manually if needed
