import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useIntl } from 'react-intl'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { paymentsApi } from '../../api/paymentsApi'
import { Spinner, ErrorMessage } from '../../components/ui'
import type { Payment } from '../../types/api'
import styles from './ActivityCalendar.module.css'

const DAY_KEYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  events: Payment[]
}

function buildGrid(year: number, month: number, events: Payment[]): CalendarDay[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const eventsByDate: Record<string, Payment[]> = {}
  for (const p of events) {
    const key = p.paymentDate.slice(0, 10)
    ;(eventsByDate[key] ??= []).push(p)
  }

  const firstOfMonth = new Date(year, month, 1)
  const startOffset = firstOfMonth.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const days: CalendarDay[] = []

  for (let i = startOffset - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    days.push({ date: d, isCurrentMonth: false, isToday: false, events: [] })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    days.push({
      date,
      isCurrentMonth: true,
      isToday: date.getTime() === today.getTime(),
      events: eventsByDate[key] ?? [],
    })
  }

  const trailing = 7 - (days.length % 7 === 0 ? 7 : days.length % 7)
  for (let d = 1; d <= trailing; d++) {
    const date = new Date(year, month + 1, d)
    days.push({ date, isCurrentMonth: false, isToday: false, events: [] })
  }

  return days
}

export function ActivityCalendar() {
  const intl = useIntl()
  const fmt = (id: string) => intl.formatMessage({ id })
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedEvent, setSelectedEvent] = useState<Payment | null>(null)

  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const lastDay = new Date(year, month + 1, 0).getDate()
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  const { data, isLoading, isError } = useQuery({
    queryKey: ['payments.calendar', year, month],
    queryFn: () => paymentsApi.list({ startDate, endDate, limit: 200 }),
  })

  const grid = useMemo(
    () => buildGrid(year, month, data?.items ?? []),
    [year, month, data]
  )

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
    setSelectedEvent(null)
  }

  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
    setSelectedEvent(null)
  }

  const monthLabel = intl.formatDate(new Date(year, month, 1), { month: 'long', year: 'numeric' })

  return (
    <div className={styles.root}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.arrowBtn} onClick={prevMonth} aria-label="Previous month">
          <ChevronLeftIcon width={20} height={20} />
        </button>
        <span className={styles.monthLabel}>{monthLabel.toUpperCase()}</span>
        <button className={styles.arrowBtn} onClick={nextMonth} aria-label="Next month">
          <ChevronRightIcon width={20} height={20} />
        </button>
      </div>

      {/* Weekday header */}
      <div className={styles.weekHeader}>
        {DAY_KEYS.map(d => (
          <div key={d} className={styles.weekHeaderCell}>{d}</div>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className={styles.loadingRow}><Spinner /></div>
      ) : isError ? (
        <div className={styles.loadingRow}><ErrorMessage message={fmt('common.error')} /></div>
      ) : (
        <div className={styles.grid}>
          {grid.map((day, i) => (
            <div
              key={i}
              className={`${styles.cell}${day.isToday ? ` ${styles.todayCell}` : ''}${!day.isCurrentMonth ? ` ${styles.otherMonth}` : ''}`}
            >
              <span className={`${styles.dayNum}${day.isToday ? ` ${styles.todayBadge}` : ''}`}>
                {day.date.getDate()}
              </span>
              {day.events.length > 0 && (
                <ul className={styles.eventList}>
                  {day.events.slice(0, 3).map(ev => (
                    <li
                      key={ev.id}
                      className={`${styles.eventItem}${selectedEvent?.id === ev.id ? ` ${styles.eventActive}` : ''}`}
                      onClick={() => setSelectedEvent(prev => prev?.id === ev.id ? null : ev)}
                    >
                      <span>{ev.recipientName || ev.type}</span>
                    </li>
                  ))}
                  {day.events.length > 3 && (
                    <li className={styles.moreLabel}>+{day.events.length - 3}</li>
                  )}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Event detail */}
      {selectedEvent && (
        <EventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} intl={intl} fmt={fmt} />
      )}
    </div>
  )
}

function EventDetail({ event, onClose, intl, fmt }: {
  event: Payment
  onClose: () => void
  intl: ReturnType<typeof useIntl>
  fmt: (id: string) => string
}) {
  return (
    <div className={styles.detail}>
      <div className={styles.detailHeader}>
        <span>{intl.formatDate(event.paymentDate, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">×</button>
      </div>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>{fmt('payments.recipient')}</span>
        <span>{event.recipientName}</span>
      </div>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>{fmt('payments.amount')}</span>
        <span>${event.amount}</span>
      </div>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>{fmt('payments.caseNumber')}</span>
        <span>{event.caseNumber}</span>
      </div>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>{fmt('payments.filterByStatus')}</span>
        <span>{fmt(`payments.status.${event.status}`)}</span>
      </div>
    </div>
  )
}
