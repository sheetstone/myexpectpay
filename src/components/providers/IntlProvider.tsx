"use client"

import { useEffect, useState } from "react"
import { IntlProvider as ReactIntlProvider } from "react-intl"
import { DEFAULT_LOCALE, LS_LOCALE, SUPPORTED_LOCALES, type SupportedLocale } from "@/constants"

import en from "@/translations/en.json"
import de from "@/translations/de.json"
import es from "@/translations/es.json"

const messages: Record<SupportedLocale, Record<string, string>> = { en, de, es }

function getLocale(): SupportedLocale {
  if (typeof window === "undefined") return DEFAULT_LOCALE
  const stored = localStorage.getItem(LS_LOCALE)
  if (stored && SUPPORTED_LOCALES.includes(stored as SupportedLocale)) {
    return stored as SupportedLocale
  }
  return DEFAULT_LOCALE
}

export function IntlProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<SupportedLocale>(() =>
    typeof window !== "undefined" ? getLocale() : DEFAULT_LOCALE,
  )

  useEffect(() => {
    const handler = () => setLocale(getLocale())
    window.addEventListener("storage", handler)
    return () => window.removeEventListener("storage", handler)
  }, [])

  return (
    <ReactIntlProvider locale={locale} messages={messages[locale]} defaultLocale={DEFAULT_LOCALE}>
      {children}
    </ReactIntlProvider>
  )
}
