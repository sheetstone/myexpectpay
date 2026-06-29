"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useIntl } from "react-intl"
import { useAuth } from "@/components/providers/AuthProvider"
import { ConfirmDialog, useToast } from "@/components/ui"
import { LS_LOCALE, SUPPORTED_LOCALES, type SupportedLocale } from "@/constants"
import styles from "./settings.module.css"

function setLocale(locale: SupportedLocale) {
  localStorage.setItem(LS_LOCALE, locale)
  // Dispatch storage event so IntlProvider in this tab reacts
  window.dispatchEvent(new StorageEvent("storage", { key: LS_LOCALE, newValue: locale }))
}

function getStoredLocale(): SupportedLocale {
  if (typeof window === "undefined") return "en"
  const stored = localStorage.getItem(LS_LOCALE)
  if (stored && (SUPPORTED_LOCALES as readonly string[]).includes(stored)) {
    return stored as SupportedLocale
  }
  return "en"
}

const LOCALE_LABELS: Record<SupportedLocale, string> = {
  en: "English",
  de: "Deutsch",
  es: "Español",
}

export function SettingsClient() {
  const intl = useIntl()
  const router = useRouter()
  const { signOut } = useAuth()
  const toast = useToast()
  const [currentLocale, setCurrentLocale] = useState<SupportedLocale>(() => getStoredLocale())
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const t = (id: string) => intl.formatMessage({ id })

  function handleLocale(locale: SupportedLocale) {
    setCurrentLocale(locale)
    setLocale(locale)
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    try {
      const res = await fetch("/api/users/me", { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      await signOut()
      router.push("/login")
    } catch {
      toast.toast(t("common.error"), "error")
    } finally {
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.pageHead}>
        <h1>{t("settings.title")}</h1>
      </div>

      <div className={styles.stack}>
        {/* Language card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>{t("settings.language")}</h2>
          <div className={styles.localeRow}>
            {SUPPORTED_LOCALES.map((locale) => (
              <button
                key={locale}
                className={`${styles.localeBtn} ${currentLocale === locale ? styles.localeActive : ""}`}
                onClick={() => handleLocale(locale)}
              >
                <span className={styles.localeCode}>{locale.toUpperCase()}</span>
                <span className={styles.localeName}>{LOCALE_LABELS[locale]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Danger zone card */}
        <div className={`${styles.card} ${styles.dangerCard}`}>
          <h2 className={`${styles.cardTitle} ${styles.dangerTitle}`}>{t("settings.dangerZone")}</h2>
          <p className={styles.dangerDesc}>{t("settings.deleteAccountConfirm")}</p>
          <button
            className={styles.deleteBtn}
            onClick={() => setDeleteOpen(true)}
          >
            {t("settings.deleteAccount")}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title={t("settings.deleteAccountTitle")}
        message={t("settings.deleteAccountConfirm")}
        confirmLabel={deleting ? "Deleting…" : t("settings.deleteAccount")}
        onConfirm={handleDeleteAccount}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  )
}
