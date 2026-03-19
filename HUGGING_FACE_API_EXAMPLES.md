# Hugging Face API Request Examples

## 1. JavaScript/Frontend (Using Supabase Client)

### Setup

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### Example 1: Predict from Image URL

```javascript
async function analyzePlantFromUrl() {
  try {
    const { data, error } = await supabase.functions.invoke('predict', {
      body: {
        image_url: 'https://example.com/grape-leaf.jpg',
        farm_id: '550e8400-e29b-41d4-a716-446655440000',
        user_id: '550e8400-e29b-41d4-a716-446655440001',
      },
    })

    if (error) throw error

    console.log('Prediction Result:')
    console.log(data.prediction)
    // Output:
    // {
    //   id: "550e8400-e29b-41d4-a716-446655440002",
    //   disease: "Downy Mildew (Davnya)",
    //   confidence: 92.5,
    //   severity: "High",
    //   is_healthy: false
    // }
  } catch (error) {
    console.error('Error:', error.message)
  }
}
```

### Example 2: Predict from Camera Capture (Base64)

```javascript
async function analyzePlantFromCamera(file) {
  try {
    // Convert file to base64
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = e.target.result.split('base64,')[1]

      const { data, error } = await supabase.functions.invoke('predict', {
        body: {
          image_base64: base64,
          farm_id: '550e8400-e29b-41d4-a716-446655440000',
          user_id: '550e8400-e29b-41d4-a716-446655440001',
        },
      })

      if (error) throw error
      console.log('Prediction:', data.prediction)
    }
    reader.readAsDataURL(file)
  } catch (error) {
    console.error('Error:', error.message)
  }
}
```

### Example 3: Using the useDetection Hook

```javascript
import { useDetection } from '../hooks/useDetection'

function DetectPage() {
  const { detect, result, loading, error } = useDetection(farmId)

  async function handleFileUpload(e) {
    const file = e.target.files[0]
    await detect(file)
  }

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileUpload} />
      {loading && <p>Analyzing...</p>}
      {error && <p>Error: {error}</p>}
      {result && (
        <div>
          <p>Disease: {result.result_label}</p>
          <p>Confidence: {result.confidence}%</p>
          <p>Severity: {JSON.parse(result.notes).severity}</p>
        </div>
      )}
    </div>
  )
}
```

---

## 2. cURL Examples

### Request 1: Analyze Image URL

```bash
curl -X POST \
  'https://ydhojocruboucdhdbtzv.supabase.co/functions/v1/predict' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "image_url": "https://example.com/grape-leaf.jpg",
    "farm_id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "550e8400-e29b-41d4-a716-446655440001"
  }'
```

**Response:**
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

### Request 2: Analyze Base64 Image

```bash
# First, encode image to base64
BASE64_IMAGE=$(base64 < path/to/image.jpg)

curl -X POST \
  'https://ydhojocruboucdhdbtzv.supabase.co/functions/v1/predict' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d "{
    \"image_base64\": \"$BASE64_IMAGE\",
    \"farm_id\": \"550e8400-e29b-41d4-a716-446655440000\",
    \"user_id\": \"550e8400-e29b-41d4-a716-446655440001\"
  }"
```

### Request 3: Batch Processing

```bash
#!/bin/bash

FARM_ID="550e8400-e29b-41d4-a716-446655440000"
USER_ID="550e8400-e29b-41d4-a716-446655440001"
API_KEY="YOUR_ANON_KEY"

# Process multiple images
for image in *.jpg; do
  echo "Processing $image..."
  
  curl -X POST \
    'https://ydhojocruboucdhdbtzv.supabase.co/functions/v1/predict' \
    -H "Authorization: Bearer $API_KEY" \
    -H 'Content-Type: application/json' \
    -d "{
      \"image_url\": \"https://storage.example.com/$image\",
      \"farm_id\": \"$FARM_ID\",
      \"user_id\": \"$USER_ID\"
    }"
  
  sleep 1  # Rate limiting
done
```

---

## 3. Python Examples

### Request 1: Using requests library

```python
import requests
import base64
from pathlib import Path

SUPABASE_URL = "https://ydhojocruboucdhdbtzv.supabase.co"
ANON_KEY = "YOUR_ANON_KEY"

def predict_from_url(image_url, farm_id, user_id):
    """Predict disease from image URL"""
    headers = {
        "Authorization": f"Bearer {ANON_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "image_url": image_url,
        "farm_id": farm_id,
        "user_id": user_id
    }
    
    response = requests.post(
        f"{SUPABASE_URL}/functions/v1/predict",
        json=payload,
        headers=headers,
        timeout=35
    )
    
    response.raise_for_status()
    return response.json()

def predict_from_file(image_path, farm_id, user_id):
    """Predict disease from local image file"""
    # Read and encode image
    with open(image_path, 'rb') as f:
        image_data = base64.b64encode(f.read()).decode('utf-8')
    
    headers = {
        "Authorization": f"Bearer {ANON_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "image_base64": image_data,
        "farm_id": farm_id,
        "user_id": user_id
    }
    
    response = requests.post(
        f"{SUPABASE_URL}/functions/v1/predict",
        json=payload,
        headers=headers,
        timeout=35
    )
    
    response.raise_for_status()
    return response.json()

# Usage
try:
    result = predict_from_url(
        "https://example.com/grape-leaf.jpg",
        "550e8400-e29b-41d4-a716-446655440000",
        "550e8400-e29b-41d4-a716-446655440001"
    )
    
    print(f"Disease: {result['prediction']['disease']}")
    print(f"Confidence: {result['prediction']['confidence']}%")
    print(f"Severity: {result['prediction']['severity']}")
    
except requests.RequestException as e:
    print(f"Error: {e}")
```

### Request 2: Batch Processing with Error Handling

```python
import requests
import base64
import time
from pathlib import Path
from typing import List, Dict

class GrapeGuardPredictor:
    def __init__(self, api_key: str, base_url: str):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    def predict(self, image_url: str, farm_id: str, user_id: str) -> Dict:
        """Send prediction request with retry logic"""
        payload = {
            "image_url": image_url,
            "farm_id": farm_id,
            "user_id": user_id
        }
        
        retries = 2
        for attempt in range(retries + 1):
            try:
                response = requests.post(
                    f"{self.base_url}/functions/v1/predict",
                    json=payload,
                    headers=self.headers,
                    timeout=35
                )
                response.raise_for_status()
                return response.json()
            
            except requests.Timeout:
                if attempt < retries:
                    wait_time = 2 ** (attempt + 1)
                    print(f"Timeout, retrying in {wait_time}s...")
                    time.sleep(wait_time)
                else:
                    raise Exception("Max retries exceeded due to timeout")
            
            except requests.HTTPError as e:
                raise Exception(f"HTTP {response.status_code}: {response.text}")
    
    def batch_predict(self, 
                     image_urls: List[str], 
                     farm_id: str, 
                     user_id: str,
                     rate_limit: float = 1.0) -> List[Dict]:
        """Process multiple images with rate limiting"""
        results = []
        
        for i, url in enumerate(image_urls, 1):
            try:
                print(f"Processing {i}/{len(image_urls)}: {url}")
                result = self.predict(url, farm_id, user_id)
                results.append({
                    'url': url,
                    'prediction': result['prediction'],
                    'success': True
                })
            
            except Exception as e:
                results.append({
                    'url': url,
                    'error': str(e),
                    'success': False
                })
            
            if i < len(image_urls):
                time.sleep(rate_limit)
        
        return results

# Usage
predictor = GrapeGuardPredictor(
    api_key="YOUR_ANON_KEY",
    base_url="https://ydhojocruboucdhdbtzv.supabase.co"
)

results = predictor.batch_predict(
    image_urls=[
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg",
        "https://example.com/image3.jpg"
    ],
    farm_id="550e8400-e29b-41d4-a716-446655440000",
    user_id="550e8400-e29b-41d4-a716-446655440001",
    rate_limit=1.5
)

for result in results:
    if result['success']:
        print(f"{result['url']}: {result['prediction']['disease']} ({result['prediction']['confidence']}%)")
    else:
        print(f"{result['url']}: Error - {result['error']}")
```

---

## 4. Response Parsing

### Success Response (200)

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

**Parse in JavaScript:**
```javascript
const response = await supabase.functions.invoke('predict', { body })

if (response.data.success) {
  const pred = response.data.prediction
  
  console.log(`Disease: ${pred.disease}`)
  console.log(`Confidence: ${pred.confidence}%`)
  console.log(`Status: ${pred.is_healthy ? 'Healthy' : 'Disease Detected'}`)
  console.log(`Detection ID: ${pred.id}`)  // Use for follow-up actions
}
```

### Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Missing farm_id or user_id",
  "details": "Missing farm_id or user_id"
}
```

**502 Bad Gateway:**
```json
{
  "success": false,
  "error": "Hugging Face API error",
  "details": "HTTP 502: Service Unavailable"
}
```

**504 Gateway Timeout:**
```json
{
  "success": false,
  "error": "Request timeout",
  "details": "Please retry after a few seconds"
}
```

**Parse in JavaScript:**
```javascript
try {
  const { data, error } = await supabase.functions.invoke('predict', { body })
  
  if (error) {
    throw new Error(`Function error: ${error.message}`)
  }
  
  if (!data.success) {
    switch(data.error) {
      case 'Missing farm_id or user_id':
        console.error('Invalid request parameters')
        break
      case 'Hugging Face API error':
        console.error('ML API is unavailable, retrying...')
        // Implement exponential backoff retry
        break
      case 'Request timeout':
        console.warn('Image processing took too long, try with smaller image')
        break
      default:
        console.error(data.details)
    }
    throw new Error(data.error)
  }
  
  // Success - handle prediction
  handlePrediction(data.prediction)
} catch (error) {
  showErrorMessage(error.message)
}
```

---

## 5. Testing Endpoints

### Health Check (Before making requests)

```bash
curl https://geeteshh-app.hf.space/api/health
```

**Success Response:**
```json
{
  "status": "ok",
  "model_loaded": true
}
```

### Direct Hugging Face API (For reference)

**Image URL endpoint:**
```bash
curl -X POST https://geeteshh-app.hf.space/predict_from_url \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://example.com/image.jpg"}'
```

**Multipart file upload:**
```bash
curl -X POST https://geeteshh-app.hf.space/api/predict \
  -F "image=@path/to/image.jpg"
```

---

## 6. Best Practices

### Request Validation
```javascript
function validatePredictRequest(imageUrl, farmId, userId) {
  const errors = []
  
  if (!imageUrl && !imageBase64) {
    errors.push('Either imageUrl or imageBase64 is required')
  }
  if (!farmId || !isValidUUID(farmId)) {
    errors.push('Invalid farm_id')
  }
  if (!userId || !isValidUUID(userId)) {
    errors.push('Invalid user_id')
  }
  if (imageUrl && !isValidUrl(imageUrl)) {
    errors.push('Invalid image URL')
  }
  
  return errors
}
```

### Retry Logic with Exponential Backoff
```javascript
async function predictWithRetry(payload, maxRetries = 2) {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const { data, error } = await supabase.functions.invoke('predict', { body: payload })
      if (error) throw error
      if (data.success) return data
    } catch (error) {
      if (i === maxRetries) throw error
      const delay = Math.pow(2, i + 1) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}
```

### Caching to Avoid Duplicate Calls
```javascript
const predictionCache = new Map()

async function predictWithCache(imageUrl, farmId, userId) {
  const cacheKey = `${imageUrl}:${farmId}:${userId}`
  
  if (predictionCache.has(cacheKey)) {
    console.log('Returning cached prediction')
    return predictionCache.get(cacheKey)
  }
  
  const result = await predict(imageUrl, farmId, userId)
  predictionCache.set(cacheKey, result)
  return result
}
```
