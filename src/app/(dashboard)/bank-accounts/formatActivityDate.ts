// lastActivity is a plain YYYY-MM-DD string with no time component; parsing it with
// `new Date(string)` reads it as UTC midnight and can shift the displayed day
// backward in timezones behind UTC, so build the Date from local components instead.
export function formatActivityDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(y, m - 1, d)
  )
}
