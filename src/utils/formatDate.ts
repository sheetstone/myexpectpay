export function formatDate(date: string | Date, locale = "en-US"): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d)
}

export function formatDateTime(date: string | Date, locale = "en-US"): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d)
}
