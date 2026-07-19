export const LS_LOCALE = "mep_locale"
export const DEFAULT_LOCALE = "en"
export const SUPPORTED_LOCALES = ["en", "de", "es"] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export const PAGE_SIZE = 20
export const BANK_ACCOUNTS_PAGE_SIZE = 10
export const TOAST_AUTO_DISMISS_MS = 5000
export const QUERY_STALE_TIME = 60_000
export const ROUTING_LOOKUP_DEBOUNCE_MS = 400

export const ABA_ROUTING_REGEX = /^\d{9}$/
export const ACCOUNT_NUMBER_MIN = 4
export const ACCOUNT_NUMBER_MAX = 17
