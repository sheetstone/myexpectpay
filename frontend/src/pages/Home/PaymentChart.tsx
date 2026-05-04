import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useIntl } from 'react-intl'
import {
  ResponsiveContainer, BarChart, Bar,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import { dashboardApi } from '../../api/dashboardApi'
import { Spinner, ErrorMessage } from '../../components/ui'
import styles from './PaymentChart.module.css'

type ChartType = 'bar' | 'line'

export function PaymentChart() {
  const intl = useIntl()
  const fmt = (id: string) => intl.formatMessage({ id })
  const [chartType, setChartType] = useState<ChartType>('bar')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard.activity'],
    queryFn: dashboardApi.activity,
  })

  if (isLoading) return <div className={styles.loading}><Spinner /></div>
  if (isError || !data) return <ErrorMessage message={fmt('common.error')} />

  const formatted = data.map(entry => ({
    ...entry,
    label: intl.formatDate(entry.date, { month: 'short', day: 'numeric' }),
  }))

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h3 className={styles.title}>{fmt('dashboard.recentActivity')}</h3>
        <div className={styles.toggle}>
          <button
            className={`${styles.toggleBtn}${chartType === 'bar' ? ` ${styles.active}` : ''}`}
            onClick={() => setChartType('bar')}
          >
            {fmt('dashboard.barChart')}
          </button>
          <button
            className={`${styles.toggleBtn}${chartType === 'line' ? ` ${styles.active}` : ''}`}
            onClick={() => setChartType('line')}
          >
            {fmt('dashboard.lineChart')}
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        {chartType === 'bar' ? (
          <BarChart data={formatted} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}
              cursor={{ fill: 'var(--color-primary-light)' }}
            />
            <Bar dataKey="count" fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
          </BarChart>
        ) : (
          <LineChart data={formatted} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}
            />
            <Line type="monotone" dataKey="count" stroke="var(--color-primary)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
