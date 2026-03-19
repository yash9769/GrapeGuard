import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useLang } from '../lib/LangContext'
import { useAuth } from '../lib/AuthContext'
import Dashboard   from './Dashboard'
import SensorsPage from './SensorsPage'
import DetectPage  from './DetectPage'
import AlertsPage  from './AlertsPage'

const NAV = [
  { path: '/',          icon: '🏠', en: 'Home',    hi: 'होम' },
  { path: '/sensors',   icon: '📡', en: 'Sensors', hi: 'सेंसर' },
  { path: '/detect',    icon: '🔬', en: 'Check',   hi: 'जांच' },
  { path: '/alerts',    icon: '🔔', en: 'Alerts',  hi: 'अलर्ट' },
]

export default function AppShell() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { lang }  = useLang()

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Page content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <Routes>
          <Route path="/"        element={<Dashboard />} />
          <Route path="/sensors" element={<SensorsPage />} />
          <Route path="/detect"  element={<DetectPage />} />
          <Route path="/alerts"  element={<AlertsPage />} />
        </Routes>
      </div>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px]
                      bg-white border-t border-purple-100 flex justify-around
                      px-2 pb-safe-bottom z-50 shadow-[0_-4px_20px_rgba(101,0,224,0.08)]">
        {NAV.map(tab => {
          const active = location.pathname === tab.path
          return (
            <button
              key={tab.path}
              className={`nav-tab ${active ? 'active' : ''}`}
              onClick={() => navigate(tab.path)}
            >
              <span className={`text-2xl transition-transform ${active ? 'scale-125' : ''}`}>
                {tab.icon}
              </span>
              <span className={`font-body text-xs ${active ? 'font-semibold text-grape-700' : 'text-gray-400'}`}>
                {lang === 'hi' ? tab.hi : tab.en}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

