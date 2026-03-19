import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { useLang } from '../lib/LangContext'

export default function OnboardPage() {
  const { register } = useAuth()
  const { lang, toggle } = useLang()
  const navigate = useNavigate()

  const [step, setStep]         = useState(1)
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [busy, setBusy]         = useState(false)

  async function handleRegister() {
    if (!name || !email || !password) return
    setBusy(true); setError('')
    const { error } = await register(email, password, name)
    setBusy(false)
    if (error) setError(error.message)
    // After signup, Supabase sends a confirmation email
    // For demo, navigate to login
    else navigate('/login')
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-leaf-600 to-grape-800 flex flex-col">
      <div className="flex flex-col items-center pt-14 pb-8 px-6">
        <div className="text-6xl mb-3">🌱</div>
        <h1 className="font-display text-3xl font-bold text-white">
          {lang === 'hi' ? 'नया खाता बनाएं' : 'Create Account'}
        </h1>
        <button onClick={toggle} className="mt-3 px-4 py-1.5 rounded-full bg-white/20 text-white text-sm">
          {lang === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
        </button>
      </div>

      <div className="flex-1 bg-white rounded-t-3xl px-6 pt-8 pb-10 flex flex-col gap-5">
        {/* Progress dots */}
        <div className="flex gap-2 justify-center mb-2">
          {[1, 2].map(s => (
            <div key={s} className={`h-2 rounded-full transition-all ${s === step ? 'w-8 bg-grape-600' : 'w-2 bg-grape-200'}`} />
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 rounded-xl px-4 py-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-2xl text-grape-800">
              {lang === 'hi' ? '👋 आपका स्वागत है!' : '👋 Welcome!'}
            </h2>
            <p className="text-gray-500">
              {lang === 'hi' ? 'अपना नाम बताएं' : 'What should we call you?'}
            </p>
            <input
              className="input-field text-2xl"
              placeholder={lang === 'hi' ? '🧑‍🌾 आपका नाम' : '🧑‍🌾 Your Name'}
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <button
              className="btn-primary mt-4"
              onClick={() => { if (name.trim()) setStep(2) }}
            >
              {lang === 'hi' ? 'आगे बढ़ें →' : 'Continue →'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-2xl text-grape-800">
              {lang === 'hi' ? `नमस्ते, ${name}! 🙏` : `Hello, ${name}! 🙏`}
            </h2>
            <p className="text-gray-500">
              {lang === 'hi' ? 'ईमेल और पासवर्ड डालें' : 'Set up your login'}
            </p>
            <input
              className="input-field"
              type="email"
              placeholder="📧 Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              className="input-field"
              type="password"
              placeholder={lang === 'hi' ? '🔒 पासवर्ड (6+ अक्षर)' : '🔒 Password (6+ chars)'}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <div className="flex gap-3 mt-2">
              <button className="btn-secondary flex-1" onClick={() => setStep(1)}>
                ← {lang === 'hi' ? 'वापस' : 'Back'}
              </button>
              <button
                className="btn-primary flex-1"
                onClick={handleRegister}
                disabled={busy}
              >
                {busy ? '...' : (lang === 'hi' ? 'बनाएं ✓' : 'Create ✓')}
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-gray-400 text-sm mt-2">
          {lang === 'hi' ? 'पहले से खाता है?' : 'Already have an account?'}{' '}
          <Link to="/login" className="text-grape-600 font-bold">
            {lang === 'hi' ? 'लॉगिन करें' : 'Login'}
          </Link>
        </p>
      </div>
    </div>
  )
}

