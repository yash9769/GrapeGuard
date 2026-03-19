import { useState } from 'react'
import { useLang } from '../../lib/LangContext'

export default function FarmSetup({ onCreate }) {
  const { lang } = useLang()
  const [name, setName]   = useState('')
  const [loc, setLoc]     = useState('')
  const [busy, setBusy]   = useState(false)

  async function handleCreate() {
    if (!name.trim()) return
    setBusy(true)
    await onCreate(name, loc)
    setBusy(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80dvh] px-6 gap-6">
      <div className="text-7xl">🌾</div>
      <h2 className="font-display text-2xl font-bold text-grape-800 text-center">
        {lang === 'hi' ? 'अपना खेत जोड़ें' : 'Add Your Farm'}
      </h2>
      <p className="text-gray-500 text-center">
        {lang === 'hi'
          ? 'शुरू करने के लिए अपने खेत का नाम डालें'
          : 'Enter your farm name to get started'}
      </p>
      <div className="w-full flex flex-col gap-4">
        <input
          className="input-field text-xl"
          placeholder={lang === 'hi' ? '🍇 खेत का नाम' : '🍇 Farm Name'}
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          className="input-field"
          placeholder={lang === 'hi' ? '📍 स्थान (वैकल्पिक)' : '📍 Location (optional)'}
          value={loc}
          onChange={e => setLoc(e.target.value)}
        />
        <button className="btn-primary" onClick={handleCreate} disabled={busy}>
          {busy ? '...' : (lang === 'hi' ? 'खेत बनाएं ✓' : 'Create Farm ✓')}
        </button>
      </div>
    </div>
  )
}

