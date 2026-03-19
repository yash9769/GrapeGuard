import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { useLang } from '../lib/LangContext'

export default function LoginPage() {
  const { login } = useAuth()
  const { t, lang, toggle } = useLang()
  const navigate = useNavigate()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [busy, setBusy]         = useState(false)

  async function handleLogin() {
    if (!email || !password) return
    setBusy(true); setError('')
    const { error } = await login(email, password)
    setBusy(false)
    if (error) setError(error.message)
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-grape-600 to-grape-900 flex flex-col">
      {/* Header */}
      <div className="flex flex-col items-center pt-16 pb-10 px-6">
        <div className="text-7xl mb-4">🍇</div>
        <h1 className="font-display text-4xl font-bold text-white">GrapeGuard</h1>
        <p className="text-purple-200 mt-1 text-base">
          {lang === 'hi' ? 'अंगूर की देखभाल, अब आसान' : 'Smart Grape Farm Monitor'}
        </p>

        {/* Language toggle */}
        <button
          onClick={toggle}
          className="mt-4 px-4 py-1.5 rounded-full bg-white/20 text-white text-sm font-body"
        >
          {lang === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
        </button>
      </div>

      {/* Form card */}
      <div className="flex-1 bg-white rounded-t-3xl px-6 pt-8 pb-10 flex flex-col gap-5">
        <h2 className="font-display text-2xl font-bold text-grape-800">
          {lang === 'hi' ? 'लॉगिन करें' : 'Login'}
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-300 rounded-xl px-4 py-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <input
            className="input-field"
            type="email"
            placeholder={lang === 'hi' ? '📧 आपका ईमेल' : '📧 Your Email'}
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            className="input-field"
            type="password"
            placeholder={lang === 'hi' ? '🔒 पासवर्ड' : '🔒 Password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <button
          className="btn-primary mt-2"
          onClick={handleLogin}
          disabled={busy}
        >
          {busy ? <span className="spinner !w-6 !h-6 border-white border-t-transparent" /> : null}
          {lang === 'hi' ? 'लॉगिन करें' : 'Login'}
        </button>

        <p className="text-center text-gray-500 text-base">
          {lang === 'hi' ? 'नया खाता बनाएं?' : "Don't have an account?"}{' '}
          <Link to="/onboard" className="text-grape-600 font-bold">
            {lang === 'hi' ? 'रजिस्टर करें' : 'Register'}
          </Link>
        </p>
      </div>
    </div>
  )
}

