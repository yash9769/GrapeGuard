import { useLang } from '../../lib/LangContext'
import { useAuth } from '../../lib/AuthContext'

export default function PageHeader({ title, subtitle, showLogout = false }) {
  const { lang, toggle } = useLang()
  const { logout }       = useAuth()

  return (
    <div className="bg-gradient-to-r from-grape-700 to-grape-500 px-5 pt-12 pb-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">{title}</h1>
          {subtitle && <p className="text-purple-200 text-sm mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={toggle}
            className="px-3 py-1.5 rounded-full bg-white/20 text-white text-xs font-body"
          >
            {lang === 'hi' ? 'EN' : 'हि'}
          </button>
          {showLogout && (
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-full bg-white/20 text-white text-xs"
            >
              🚪
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

