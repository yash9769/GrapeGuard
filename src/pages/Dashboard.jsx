import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFarm }     from '../hooks/useFarm'
import { useSensors }  from '../hooks/useSensors'
import { useAlerts }   from '../hooks/useAlerts'
import { useAuth }     from '../lib/AuthContext'
import { useLang }     from '../lib/LangContext'
import PageHeader      from '../components/ui/PageHeader'
import StatCard        from '../components/ui/StatCard'
import AlertCard       from '../components/ui/AlertCard'
import FarmSetup       from '../components/ui/FarmSetup'

export default function Dashboard() {
  const { profile }               = useAuth()
  const { lang }                  = useLang()
  const navigate                  = useNavigate()
  const { farm, loading: farmL, createFarm } = useFarm()
  const { readings, loading: senL, getStatus } = useSensors(farm?.id)
  const { alerts, unreadCount, loading: alertL, markRead } = useAlerts(farm?.id)

  const greeting = lang === 'hi'
    ? `नमस्ते, ${profile?.full_name || 'किसान'} 🙏`
    : `Hello, ${profile?.full_name || 'Farmer'} 🙏`

  if (farmL) return <LoadingScreen />

  if (!farm) return (
    <div>
      <PageHeader title="GrapeGuard 🍇" showLogout />
      <FarmSetup onCreate={createFarm} />
    </div>
  )

  const recentAlerts = alerts.slice(0, 3)

  return (
    <div className="page-enter">
      <PageHeader
        title="GrapeGuard 🍇"
        subtitle={farm.name}
        showLogout
      />

      <div className="px-4 py-5 flex flex-col gap-5">
        {/* Greeting */}
        <div className="card bg-gradient-to-r from-grape-50 to-purple-50">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🧑‍🌾</span>
            <div>
              <p className="font-display text-lg font-bold text-grape-800">{greeting}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="live-dot" />
                <span className="text-xs text-green-600 font-body">
                  {lang === 'hi' ? 'लाइव डेटा' : 'Live Data'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sensor Cards */}
        <div>
          <SectionTitle
            icon="📡"
            title={lang === 'hi' ? 'सेंसर डेटा' : 'Sensor Data'}
            onMore={() => navigate('/sensors')}
            lang={lang}
          />
          {senL ? (
            <div className="flex gap-3">
              {[0,1,2].map(i => <div key={i} className="flex-1 h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <StatCard
                icon="🌡️"
                label={lang === 'hi' ? 'तापमान' : 'Temp'}
                value={readings?.temperature}
                unit="°C"
                status={getStatus('temperature', readings?.temperature)}
                onClick={() => navigate('/sensors')}
              />
              <StatCard
                icon="💧"
                label={lang === 'hi' ? 'नमी' : 'Humidity'}
                value={readings?.humidity}
                unit="%"
                status={getStatus('humidity', readings?.humidity)}
                onClick={() => navigate('/sensors')}
              />
              <StatCard
                icon="🌱"
                label={lang === 'hi' ? 'मिट्टी' : 'Soil'}
                value={readings?.soil_moisture}
                unit="%"
                status={getStatus('soil_moisture', readings?.soil_moisture)}
                onClick={() => navigate('/sensors')}
              />
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <SectionTitle icon="⚡" title={lang === 'hi' ? 'त्वरित कार्य' : 'Quick Actions'} lang={lang} />
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/detect')}
              className="card flex flex-col items-center gap-2 py-5 active:scale-95 transition"
            >
              <span className="text-4xl">🔬</span>
              <span className="font-display font-bold text-grape-700">
                {lang === 'hi' ? 'रोग जांचें' : 'Check Disease'}
              </span>
              <span className="text-xs text-gray-400">
                {lang === 'hi' ? 'पत्ती की फोटो लें' : 'Take leaf photo'}
              </span>
            </button>
            <button
              onClick={() => navigate('/alerts')}
              className="card flex flex-col items-center gap-2 py-5 active:scale-95 transition relative"
            >
              {unreadCount > 0 && (
                <span className="absolute top-3 right-3 bg-red-500 text-white text-xs
                                  font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
              <span className="text-4xl">🔔</span>
              <span className="font-display font-bold text-grape-700">
                {lang === 'hi' ? 'अलर्ट' : 'Alerts'}
              </span>
              <span className="text-xs text-gray-400">
                {unreadCount > 0
                  ? (lang === 'hi' ? `${unreadCount} नए` : `${unreadCount} new`)
                  : (lang === 'hi' ? 'सब ठीक है' : 'All good')}
              </span>
            </button>
          </div>
        </div>

        {/* Recent Alerts */}
        {recentAlerts.length > 0 && (
          <div>
            <SectionTitle
              icon="🚨"
              title={lang === 'hi' ? 'हाल के अलर्ट' : 'Recent Alerts'}
              onMore={() => navigate('/alerts')}
              lang={lang}
            />
            <div className="flex flex-col gap-2">
              {recentAlerts.map(alert => (
                <AlertCard key={alert.id} alert={alert} lang={lang} onRead={markRead} />
              ))}
            </div>
          </div>
        )}

        {recentAlerts.length === 0 && !alertL && (
          <div className="card-green flex items-center gap-3">
            <span className="text-3xl">✅</span>
            <div>
              <p className="font-display font-bold text-green-800">
                {lang === 'hi' ? 'सब ठीक है!' : 'All Clear!'}
              </p>
              <p className="text-sm text-green-700">
                {lang === 'hi' ? 'कोई अलर्ट नहीं' : 'No alerts today'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SectionTitle({ icon, title, onMore, lang }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="font-display text-lg font-bold text-gray-800">
        {icon} {title}
      </h2>
      {onMore && (
        <button onClick={onMore} className="text-grape-600 text-sm font-semibold">
          {lang === 'hi' ? 'सभी देखें →' : 'See all →'}
        </button>
      )}
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh gap-4">
      <div className="text-5xl">🍇</div>
      <div className="spinner" />
    </div>
  )
}

