# Response Parsing & Error Handling Guide

## Response Parsing

### Understanding the Prediction Response

```json
{
  "success": true,
  "prediction": {
    "id": "uuid",
    "disease": "Disease Name",
    "confidence": 92.5,
    "severity": "High",
    "is_healthy": false
  },
  "stored": true
}
```

### Parsing in JavaScript

```javascript
const response = await supabase.functions.invoke('predict', { body })

if (!response.data.success) {
  throw new Error(response.data.error)
}

const { prediction } = response.data
const { disease, confidence, severity, is_healthy, id } = prediction

console.log(`
  Detection ID: ${id}
  Disease: ${disease}
  Confidence: ${confidence}%
  Severity: ${severity}
  Status: ${is_healthy ? '✅ Healthy' : '⚠️ Disease Detected'}
`)
```

### Confidence Score Interpretation

```javascript
function getConfidenceLevel(confidence) {
  if (confidence >= 90) return 'Very High'
  if (confidence >= 75) return 'High'
  if (confidence >= 50) return 'Medium'
  if (confidence >= 30) return 'Low'
  return 'Very Low'
}

// Example usage
const confidenceLevel = getConfidenceLevel(prediction.confidence)
console.log(`Confidence Level: ${confidenceLevel}`)
```

### Severity Level Mapping

```javascript
const severityConfig = {
  'Low': {
    color: 'green',
    icon: '🟢',
    action: 'Monitor and document'
  },
  'Medium': {
    color: 'yellow',
    icon: '🟡',
    action: 'Begin treatment plan'
  },
  'High': {
    color: 'red',
    icon: '🔴',
    action: 'Immediate intervention required'
  }
}

const config = severityConfig[prediction.severity]
console.log(`${config.icon} ${config.action}`)
```

### Disease Classification

```javascript
const diseaseCategories = {
  fungal: ['Downy Mildew', 'Powdery Mildew', 'Black Measles'],
  bacterial: ['Anthracnose', 'Angular Leaf Spot'],
  viral: ['Grape Virus A', 'Grape Virus B'],
  environmental: ['Sunburn', 'Cold Damage'],
  healthy: ['Healthy']
}

function categorizeDisease(diseaseName) {
  for (const [category, diseases] of Object.entries(diseaseCategories)) {
    if (diseases.some(d => diseaseName.includes(d))) {
      return category
    }
  }
  return 'unknown'
}

const category = categorizeDisease(prediction.disease)
console.log(`Category: ${category}`)
```

---

## Error Handling

### Error Types and Responses

#### 1. Validation Error (400)

**When:** Missing required fields or invalid parameters

```json
{
  "success": false,
  "error": "Missing farm_id or user_id",
  "details": "Missing farm_id or user_id"
}
```

**Handling:**
```javascript
try {
  const { data, error } = await supabase.functions.invoke('predict', {
    body: { /* incomplete body */ }
  })
  
  if (error || !data.success) {
    if (data.error === 'Missing farm_id or user_id') {
      console.error('Please provide valid farm and user IDs')
      // Show user-friendly message
    }
  }
} catch (err) {
  console.error('Validation error:', err)
}
```

#### 2. API Error (502/503)

**When:** Hugging Face API is unavailable or returns error

```json
{
  "success": false,
  "error": "Hugging Face API error",
  "details": "HTTP 502: Service Unavailable"
}
```

**Handling:**
```javascript
async function predictWithRetry(payload, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const { data, error } = await supabase.functions.invoke('predict', {
        body: payload
      })
      
      if (error) throw error
      if (!data.success) {
        throw new Error(data.error)
      }
      
      return data.prediction // Success
      
    } catch (err) {
      console.warn(`Attempt ${attempt + 1} failed:`, err.message)
      
      if (attempt === maxRetries) {
        // All retries exhausted
        showError('ML API is currently unavailable. Please try again later.')
        throw err
      }
      
      // Exponential backoff: 2s, 4s, 8s
      const delay = Math.pow(2, attempt + 1) * 1000
      console.log(`Retrying in ${delay / 1000}s...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}
```

#### 3. Timeout Error (504)

**When:** Request takes longer than 30 seconds

```json
{
  "success": false,
  "error": "Request timeout",
  "details": "Please retry after a few seconds"
}
```

**Handling:**
```javascript
async function handleTimeout(error, imageUrl) {
  console.error('Request timeout:', error)
  
  // Check if image is too large
  const response = await fetch(imageUrl, { method: 'HEAD' })
  const size = parseInt(response.headers.get('content-length'), 10)
  
  if (size > 5 * 1024 * 1024) { // 5MB
    showError('Image is too large. Please select a smaller image.')
  } else {
    showError('Request took too long. Please try again.')
  }
}
```

#### 4. No Prediction (Low Confidence)

**When:** Model is uncertain about the prediction

```javascript
const { prediction } = response.data

if (prediction.confidence < 30) {
  console.warn('Low confidence prediction')
  
  showWarning(
    `Prediction confidence is only ${prediction.confidence}%. ` +
    'This may not be reliable. Please try with a clearer image.'
  )
}
```

### Comprehensive Error Handler

```javascript
async function handlePredictionError(error, context) {
  const errorMessages = {
    // Network errors
    'TypeError': 'Network error - please check your connection',
    'NetworkError': 'Network connection failed',
    
    // Validation errors
    'Missing farm_id': 'Invalid farm ID',
    'Missing user_id': 'Invalid user ID',
    'Missing image_url': 'No image provided',
    
    // API errors
    'Hugging Face API error': 'ML model service is unavailable',
    'HTTP 502': 'ML model is loading - please wait a moment and retry',
    'HTTP 503': 'ML model service is temporarily unavailable',
    
    // Timeout
    'Request timeout': 'Image processing timed out - try a smaller image',
    
    // Database errors
    'Failed to save detection': 'Could not save prediction result',
  }
  
  let message = 'An unknown error occurred'
  
  for (const [key, msg] of Object.entries(errorMessages)) {
    if (error.message.includes(key)) {
      message = msg
      break
    }
  }
  
  console.error('Prediction Error:', {
    message,
    originalError: error.message,
    context
  })
  
  return { message, canRetry: shouldRetry(error) }
}

function shouldRetry(error) {
  const retryableErrors = [
    'timeout',
    'HTTP 502',
    'HTTP 503',
    'NetworkError'
  ]
  
  return retryableErrors.some(e => error.message.includes(e))
}
```

---

## User-Friendly Error Messages

### Component for Error Display

```javascript
import React from 'react'

function PredictionError({ error, onRetry, onDismiss }) {
  const getErrorUI = () => {
    if (error.includes('timeout')) {
      return {
        icon: '⏱️',
        title: 'Processing Took Too Long',
        message: 'Try using a smaller or clearer image',
        color: 'orange'
      }
    }
    
    if (error.includes('Hugging Face')) {
      return {
        icon: '🔧',
        title: 'Service Unavailable',
        message: 'The AI model is temporarily unavailable. Please try again in a moment.',
        color: 'red'
      }
    }
    
    if (error.includes('Network')) {
      return {
        icon: '🌐',
        title: 'Connection Error',
        message: 'Check your internet connection and try again',
        color: 'red'
      }
    }
    
    return {
      icon: '⚠️',
      title: 'Error',
      message: error,
      color: 'red'
    }
  }
  
  const ui = getErrorUI()
  
  return (
    <div className={`bg-${ui.color}-50 border-l-4 border-${ui.color}-500 p-4`}>
      <div className="flex">
        <div className="flex-shrink-0 text-2xl">{ui.icon}</div>
        <div className="ml-3">
          <h3 className="text-sm font-medium">{ui.title}</h3>
          <p className="mt-2 text-sm text-gray-600">{ui.message}</p>
          <div className="mt-4 flex gap-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Retry
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="px-3 py-2 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PredictionError
```

---

## Logging and Monitoring

### Structured Logging

```javascript
function logPrediction(prediction, success, error = null) {
  const log = {
    timestamp: new Date().toISOString(),
    success,
    prediction: success ? {
      id: prediction.id,
      disease: prediction.disease,
      confidence: prediction.confidence,
      severity: prediction.severity
    } : null,
    error: error ? {
      message: error.message,
      code: error.code
    } : null
  }
  
  console.log('[PREDICTION]', JSON.stringify(log, null, 2))
  
  // Send to analytics or logging service
  if (window.gtag) {
    gtag('event', 'plant_detection', {
      disease: prediction?.disease || 'unknown',
      success,
      confidence: prediction?.confidence || 0
    })
  }
}
```

### Error Tracking Integration

```javascript
// For Sentry, Rollbar, or similar
function captureError(error, context) {
  if (window.Sentry) {
    window.Sentry.captureException(error, {
      contexts: {
        prediction: context
      },
      level: context.isRetryable ? 'warning' : 'error'
    })
  }
}
```

---

## Testing Error Scenarios

### Test Cases

```javascript
// Test 1: Invalid farm ID
async function test_invalidFarmId() {
  const result = await supabase.functions.invoke('predict', {
    body: {
      image_url: 'https://example.com/test.jpg',
      farm_id: 'invalid-id',
      user_id: 'valid-uuid'
    }
  })
  
  assert(result.data.success === false)
  assert(result.data.error.includes('farm_id'))
}

// Test 2: Missing both image sources
async function test_noImageProvided() {
  const result = await supabase.functions.invoke('predict', {
    body: {
      farm_id: 'uuid',
      user_id: 'uuid'
      // No image_url or image_base64
    }
  })
  
  assert(result.data.success === false)
  assert(result.data.error.includes('image'))
}

// Test 3: Timeout handling
async function test_timeoutRetry() {
  let attempts = 0
  
  try {
    await predictWithRetry(payload, maxRetries = 2)
  } catch (error) {
    assert(error.message.includes('timeout'))
    assert(attempts === 3) // Initial + 2 retries
  }
}
```

---

## Best Practices Summary

✅ **Always:**
- Check `response.data.success` before accessing prediction
- Handle timeout errors with retry logic
- Validate input parameters before sending
- Log errors for debugging
- Show user-friendly error messages
- Cache successful predictions

❌ **Never:**
- Ignore error responses
- Make assumptions about response structure
- Retry without backoff
- Send sensitive data in logs
- Block UI without timeout
- Make repeated calls for same image
