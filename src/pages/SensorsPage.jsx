import { useState, useEffect } from 'react'
import { useFarm }    from '../hooks/useFarm'
import { useSensors } from '../hooks/useSensors'
import { useLang }    from '../lib/LangContext'
import PageHeader     from '../components/ui/PageHeader'
import StatCard       from '../components/ui/StatCard'
import { THRESHOLDS } from '../lib/constants'

export default function SensorsPage() {
  const { lang }   = useLang()
  const { farm }   = useFarm()
  const { readings, loading, fetchLatest, fetchHistory, insertReading, getStatus } = useSensors(farm?.id)
  const [history, setHistory]   = useState([])
  const [showDemo, setShowDemo] = useState(false)
  const [demoVals, setDemoVals] = useState({ temperature: '28', humidity: '65', soil_moisture: '45' })

  useEffect(() => {
    if (farm?.id) fetchHistory(10).then(setHistory)
  }, [farm?.id])

  async function handleDemoInsert() {
    await insertReading({
      temperature:   parseFloat(demoVals.temperature),
      humidity:      parseFloat(demoVals.humidity),
      soil_moisture: parseFloat(demoVals.soil_moisture),
      sensor_id:     null,
    })
    const h = await fetchHistory(10)
    setHistory(h)
    setShowDemo(false)
  }

  const fields = [
    { key: 'temperature',   icon: '🌡️', label: lang === 'hi' ? 'तापमान'  : 'Temperature',   unit: '°C' },
    { key: 'humidity',      icon: '💧', label: lang === 'hi' ? 'नमी'     : 'Humidity',       unit: '%'  },
    { key: 'soil_moisture', icon: '🌱', label: lang === 'hi' ? 'मिट्टी'  : 'Soil Moisture',  unit: '%'  },
  ]

  return (
    <div className="page-enter">
      <PageHeader
        title={lang === 'hi' ? 'सेंसर डेटा 📡' : 'Sensor Data 📡'}
        subtitle={lang === 'hi' ? 'लाइव रीडिंग' : 'Live Readings'}
      />

      <div className="px-4 py-5 flex flex-col gap-5">
        {/* Live readings */}
        <div className="flex items-center gap-2">
          <div className="live-dot" />
          <span className="text-sm text-green-600 font-body">
            {lang === 'hi' ? 'लाइव अपडेट' : 'Live Updates'}
          </span>
          <button onClick={fetchLatest} className="ml-auto text-grape-600 text-sm">
            🔄 {lang === 'hi' ? 'रिफ्रेश' : 'Refresh'}
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-3">
            {[0,1,2].map(i => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {fields.map(f => (
              <StatCard
                key={f.key}
                icon={f.icon}
                label={f.label}
                value={readings?.[f.key]}
                unit={f.unit}
                status={getStatus(f.key, readings?.[f.key])}
              />
            ))}
          </div>
        )}

        {/* Threshold reference */}
        <div className="card">
          <p className="font-display font-bold text-gray-700 mb-3">
            {lang === 'hi' ? '📊 सामान्य सीमाएं' : '📊 Normal Ranges'}
          </p>
          {fields.map(f => {
            const t = THRESHOLDS[f.key]
            return (
              <div key={f.key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-600">{f.icon} {f.label}</span>
                <span className="text-sm font-semibold text-green-700">
                  {t.low}–{t.high} {f.unit}
                </span>
              </div>
            )
          })}
        </div>

        {/* Manual data entry (for testing without hardware) */}
        <div>
          <button
            className="btn-secondary"
            onClick={() => setShowDemo(!showDemo)}
          >
            🧪 {lang === 'hi' ? 'मैन्युअल डेटा डालें' : 'Enter Manual Reading'}
          </button>

          {showDemo && (
            <div className="card mt-3 flex flex-col gap-3">
              <p className="text-sm text-gray-500">
                {lang === 'hi' ? '(हार्डवेयर के बिना टेस्ट करें)' : '(Test without hardware)'}
              </p>
              {fields.map(f => (
                <div key={f.key} className="flex items-center gap-3">
                  <span className="text-xl">{f.icon}</span>
                  <label className="text-sm text-gray-600 w-24">{f.label}</label>
                  <input
                    type="number"
                    className="input-field flex-1 py-2 text-base"
                    value={demoVals[f.key]}
                    onChange={e => setDemoVals(prev => ({ ...prev, [f.key]: e.target.value }))}
                  />
                  <span className="text-sm text-gray-400">{f.unit}</span>
                </div>
              ))}
              <button className="btn-green mt-1" onClick={handleDemoInsert}>
                ✓ {lang === 'hi' ? 'सेव करें' : 'Save Reading'}
              </button>
            </div>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div>
            <p className="font-display font-bold text-gray-700 mb-3">
              📜 {lang === 'hi' ? 'पिछली रीडिंग' : 'Reading History'}
            </p>
            <div className="flex flex-col gap-2">
              {history.map(r => (
                <div key={r.id} className="card flex items-center justify-between py-3">
                  <div className="flex gap-4 text-sm">
                    <span>🌡️ <b>{r.temperature ?? '--'}°C</b></span>
                    <span>💧 <b>{r.humidity ?? '--'}%</b></span>
                    <span>🌱 <b>{r.soil_moisture ?? '--'}%</b></span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(r.recorded_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

