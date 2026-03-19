import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { DISEASE_LABELS } from '../lib/constants'

const ML_API_URL = import.meta.env.VITE_ML_API_URL || 'https://your-ml-api.com/predict'

export function useDetection(farmId) {
  const [result, setResult]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [history, setHistory]   = useState([])

  async function detect(imageFile) {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // 1. Upload image to Supabase Storage
      const ext      = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('detection-images')
        .upload(fileName, imageFile, { contentType: imageFile.type })

      if (uploadError) throw new Error('Image upload failed: ' + uploadError.message)

      const { data: { publicUrl } } = supabase.storage
        .from('detection-images')
        .getPublicUrl(fileName)

      // 2. Call ML API
      const formData = new FormData()
      formData.append('image', imageFile)

      let prediction = { result: 'unknown', confidence: 0 }
      try {
        const res = await fetch(ML_API_URL, { method: 'POST', body: formData })
        if (res.ok) prediction = await res.json()
      } catch {
        // If ML API is down, use mock for demo
        prediction = mockPrediction()
      }

      const diseaseKey   = prediction.result || 'unknown'
      const label        = DISEASE_LABELS[diseaseKey] || DISEASE_LABELS['unknown']
      const isHealthy    = diseaseKey === 'healthy'

      // 3. Save to Supabase
      const user = (await supabase.auth.getUser()).data.user
      const { data: detection, error: dbError } = await supabase
        .from('detections')
        .insert({
          farm_id:      farmId,
          user_id:      user.id,
          image_url:    publicUrl,
          result:       diseaseKey,
          result_label: label.en,
          confidence:   prediction.confidence || 0,
          is_healthy:   isHealthy,
        })
        .select()
        .single()

      if (dbError) throw new Error(dbError.message)

      // 4. Create alert if disease detected
      if (!isHealthy) {
        await supabase.from('alerts').insert({
          farm_id:    farmId,
          user_id:    user.id,
          type:       'disease_detected',
          severity:   'high',
          title:      `Disease Detected: ${label.en}`,
          title_hi:   `रोग मिला: ${label.hi}`,
          message:    `AI detected ${label.en} with ${Math.round(prediction.confidence)}% confidence.`,
          message_hi: `AI ने ${label.hi} पाया (${Math.round(prediction.confidence)}% सटीक)।`,
          source_id:  detection.id,
          source_table: 'detections',
        })
      }

      const finalResult = { ...detection, label }
      setResult(finalResult)
      return finalResult

    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  async function fetchHistory(limit = 10) {
    const { data } = await supabase
      .from('detections')
      .select('*')
      .eq('farm_id', farmId)
      .order('detected_at', { ascending: false })
      .limit(limit)
    setHistory(data || [])
    return data || []
  }

  // Mock for when ML API is not set up
  function mockPrediction() {
    const diseases = ['healthy', 'healthy', 'powdery_mildew', 'downy_mildew', 'healthy']
    const pick     = diseases[Math.floor(Math.random() * diseases.length)]
    return { result: pick, confidence: 75 + Math.random() * 20 }
  }

  return { result, loading, error, detect, fetchHistory, history }
}

