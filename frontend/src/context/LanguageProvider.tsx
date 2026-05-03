import React, { createContext, useCallback, useContext, useState } from 'react'
import { IntlProvider } from 'react-intl'
import { LS_LOCALE, DEFAULT_LOCALE, SUPPORTED_LOCALES } from '../constants'

import en from '../translations/en.json'
import de from '../translations/de.json'
import es from '../translations/es.json'

type Locale = typeof SUPPORTED_LOCALES[number]

const messages: Record<Locale, Record<string, string>> = { en, de, es }

interface LanguageContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: DEFAULT_LOCALE as Locale,
  setLocale: () => {},
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const stored = localStorage.getItem(LS_LOCALE)
    return (SUPPORTED_LOCALES as readonly string[]).includes(stored ?? '')
      ? (stored as Locale)
      : (DEFAULT_LOCALE as Locale)
  })

  const setLocale = useCallback((l: Locale) => {
    localStorage.setItem(LS_LOCALE, l)
    setLocaleState(l)
  }, [])

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      <IntlProvider locale={locale} messages={messages[locale]} defaultLocale={DEFAULT_LOCALE}>
        {children}
      </IntlProvider>
    </LanguageContext.Provider>
  )
}

export function useLocale() {
  return useContext(LanguageContext)
}
