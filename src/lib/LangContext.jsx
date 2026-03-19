import { createContext, useContext, useState } from 'react'
import { STRINGS } from '../lib/constants'

const LangContext = createContext()

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('gg_lang') || 'hi')

  const t = (key) => {
    const entry = STRINGS[key]
    if (!entry) return key
    return entry[lang] || entry['en'] || key
  }

  const toggle = () => {
    const next = lang === 'hi' ? 'en' : 'hi'
    setLang(next)
    localStorage.setItem('gg_lang', next)
  }

  return (
    <LangContext.Provider value={{ lang, t, toggle }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)

