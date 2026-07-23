"use client"

import { useIntl } from "react-intl"
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts"
import { formatMoney } from "@/utils/formatMoney"
import type { ChartDataItem } from "@/types"
import styles from "../bankAccounts.module.css"

function monthLabel(monthKey: string) {
  const [y, m] = monthKey.split("-").map(Number)
  return new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(y, m - 1, 1))
}

interface PaymentTrendChartProps {
  trend: ChartDataItem[]
}

export function PaymentTrendChart({ trend }: PaymentTrendChartProps) {
  const intl = useIntl()
  const t = (id: string) => intl.formatMessage({ id })

  return (
    <div className={styles.section}>
      <div className={styles.trendHead}>
        <p className={styles.sectionTitle}>{t("bankAccount.paymentTrend")}</p>
        <span className={styles.trendLegend}>{t("bankAccount.twelveMonths")}</span>
      </div>
      <ResponsiveContainer width="100%" height={100}>
        <LineChart
          data={trend.map((item) => ({ ...item, month: monthLabel(item.month) }))}
          margin={{ top: 4, right: 8, left: -24, bottom: 0 }}
        >
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--color-text-muted)" }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip
            contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", fontSize: "0.75rem" }}
            formatter={(v) => (typeof v === "number" ? formatMoney(v) : String(v))}
          />
          <Line type="monotone" dataKey="sent" name={t("dashboard.totalSent")} stroke="var(--color-danger)" strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
          <Line type="monotone" dataKey="received" name={t("dashboard.totalReceived")} stroke="var(--color-success)" strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
