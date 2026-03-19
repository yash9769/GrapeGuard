import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { THRESHOLDS } from '../lib/constants'

export function useSensors(farmId) {
  const [readings, setReadings] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    if (!farmId) return
    fetchLatest()

    // Real-time subscription
    const channel = supabase
      .channel('sensor_readings')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'sensor_readings',
        filter: `farm_id=eq.${farmId}`,
      }, payload => {
        setReadings(payload.new)
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [farmId])

  async function fetchLatest() {
    setLoading(true)
    const { data, error } = await supabase
      .from('sensor_readings')
      .select('*')
      .eq('farm_id', farmId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') setError(error.message)
    else setReadings(data)
    setLoading(false)
  }

  async function fetchHistory(limit = 20) {
    const { data } = await supabase
      .from('sensor_readings')
      .select('*')
      .eq('farm_id', farmId)
      .order('recorded_at', { ascending: false })
      .limit(limit)
    return data || []
  }

  // Insert a manual reading (for testing without hardware)
  async function insertReading({ temperature, humidity, soil_moisture, sensor_id }) {
    const { data, error } = await supabase
      .from('sensor_readings')
      .insert({ farm_id: farmId, sensor_id, temperature, humidity, soil_moisture })
      .select()
      .single()
    if (!error) {
      setReadings(data)
      checkThresholds(data)
    }
    return { data, error }
  }

  async function checkThresholds(reading) {
    const alerts = []
    const { temperature: temp, humidity: hum, soil_moisture: soil } = reading

    if (temp !== null) {
      if (temp > THRESHOLDS.temperature.high)
        alerts.push({ type: 'sensor_high', severity: 'high',
          title: 'High Temperature Alert', title_hi: 'तापमान बहुत अधिक',
          message: `Temperature is ${temp}°C — too hot for grapes!`,
          message_hi: `तापमान ${temp}°C है — बहुत अधिक!` })
      else if (temp < THRESHOLDS.temperature.low)
        alerts.push({ type: 'sensor_low', severity: 'medium',
          title: 'Low Temperature Alert', title_hi: 'तापमान बहुत कम',
          message: `Temperature is ${temp}°C — risk of frost.`,
          message_hi: `तापमान ${temp}°C है — पाले का खतरा।` })
    }
    if (hum !== null && hum > THRESHOLDS.humidity.high)
      alerts.push({ type: 'sensor_high', severity: 'medium',
        title: 'High Humidity Alert', title_hi: 'नमी बहुत अधिक',
        message: `Humidity is ${hum}% — disease risk high!`,
        message_hi: `नमी ${hum}% है — रोग का खतरा!` })
    if (soil !== null && soil < THRESHOLDS.soil_moisture.low)
      alerts.push({ type: 'sensor_low', severity: 'high',
        title: 'Low Soil Moisture', title_hi: 'मिट्टी सूखी है',
        message: `Soil moisture is ${soil}% — irrigate now!`,
        message_hi: `मिट्टी की नमी ${soil}% — अभी सिंचाई करें!` })

    for (const alert of alerts) {
      await supabase.from('alerts').insert({
        ...alert, farm_id: farmId,
        user_id: (await supabase.auth.getUser()).data.user.id,
        source_id: reading.id, source_table: 'sensor_readings',
      })
    }
  }

  function getStatus(field, value) {
    if (value === null || value === undefined) return 'unknown'
    const t = THRESHOLDS[field]
    if (!t) return 'normal'
    if (value > t.high || value < t.low) return 'danger'
    if (value > t.high * 0.9 || value < t.low * 1.1) return 'warn'
    return 'normal'
  }

  return { readings, loading, error, fetchLatest, fetchHistory, insertReading, getStatus }
}

