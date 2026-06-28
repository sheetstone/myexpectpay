"use client"

import { useQuery } from "@tanstack/react-query"
import { useIntl } from "react-intl"
import { useState } from "react"
import Link from "next/link"
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts"
import { useAuth } from "@/components/providers/AuthProvider"
import { Spinner } from "@/components/ui"
import { formatMoney } from "@/utils/formatMoney"
import { formatDate } from "@/utils/formatDate"
import type { DashboardResponse } from "@/types"
import styles from "./dashboard.module.css"

type ChartType = "bar" | "line"

async function fetchDashboard(): Promise<DashboardResponse> {
  const res = await fetch("/api/dashboard")
  if (!res.ok) throw new Error("Failed to load dashboard")
  return res.json()
}

export function DashboardClient() {
  const intl = useIntl()
  const { user } = useAuth()
  const [chartType, setChartType] = useState<ChartType>("bar")

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    staleTime: 60_000,
  })

  const name = user?.displayName ?? user?.email ?? intl.formatMessage({ id: "dashboard.title" })

  if (isLoading) {
    return (
      <div className={styles.root}>
        <Spinner />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className={styles.root}>
        <p>{intl.formatMessage({ id: "common.error" })}</p>
      </div>
    )
  }

  const chartData = data.chart.map((item) => ({
    ...item,
    month: item.month.slice(5), // "2025-03" → "03"
  }))

  // Build current-month calendar
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const activeSet = new Set(data.calendarActivity.map((d) => d.slice(8)))

  const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  return (
    <div className={styles.root}>
      <h1 className={styles.greeting}>
        {intl.formatMessage({ id: "dashboard.hello" }, { name })}
      </h1>

      {/* Stat cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>{intl.formatMessage({ id: "dashboard.balance" })}</span>
          <span className={styles.statValue}>{formatMoney(data.balance)}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>{intl.formatMessage({ id: "dashboard.totalSent" })}</span>
          <span className={`${styles.statValue} ${styles.sent}`}>{formatMoney(data.totalSentThisMonth)}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>{intl.formatMessage({ id: "dashboard.totalReceived" })}</span>
          <span className={`${styles.statValue} ${styles.received}`}>{formatMoney(data.totalReceivedThisMonth)}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>{intl.formatMessage({ id: "dashboard.pendingCount" })}</span>
          <span className={`${styles.statValue} ${styles.pending}`}>{data.pendingCount}</span>
        </div>
      </div>

      {/* Payment activity chart */}
      <div className={styles.chartPanel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>{intl.formatMessage({ id: "dashboard.recentActivity" })}</h2>
          <div className={styles.chartToggle}>
            <button
              className={`${styles.toggleBtn} ${chartType === "bar" ? styles.active : ""}`}
              onClick={() => setChartType("bar")}
            >
              {intl.formatMessage({ id: "dashboard.barChart" })}
            </button>
            <button
              className={`${styles.toggleBtn} ${chartType === "line" ? styles.active : ""}`}
              onClick={() => setChartType("line")}
            >
              {intl.formatMessage({ id: "dashboard.lineChart" })}
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          {chartType === "bar" ? (
            <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => typeof v === "number" ? formatMoney(v) : String(v)} />
              <Legend />
              <Bar dataKey="sent" name="Sent" fill="var(--color-danger)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="received" name="Received" fill="var(--color-success)" radius={[3, 3, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => typeof v === "number" ? formatMoney(v) : String(v)} />
              <Legend />
              <Line type="monotone" dataKey="sent" name="Sent" stroke="var(--color-danger)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="received" name="Received" stroke="var(--color-success)" strokeWidth={2} dot={false} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Bottom row: calendar + messages */}
      <div className={styles.bottomRow}>
        {/* Activity calendar */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>{intl.formatMessage({ id: "dashboard.activityCalendar" })}</h2>
          </div>
          <div className={styles.calMonthLabel}>
            {new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(now)}
          </div>
          <div className={styles.calDayNames}>
            {DAY_NAMES.map((d) => (
              <span key={d} className={styles.calDayName}>{d}</span>
            ))}
          </div>
          <div className={styles.calGrid}>
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <span key={`empty-${i}`} className={`${styles.calCell} ${styles.empty}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = String(i + 1).padStart(2, "0")
              const isActive = activeSet.has(day)
              return (
                <span
                  key={i}
                  className={`${styles.calCell} ${isActive ? styles.active : ""}`}
                >
                  {i + 1}
                </span>
              )
            })}
          </div>
          {data.calendarActivity.length === 0 && (
            <p className={styles.calNoEvents}>{intl.formatMessage({ id: "dashboard.noEvents" })}</p>
          )}
        </div>

        {/* Recent messages */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>{intl.formatMessage({ id: "dashboard.recentMessages" })}</h2>
          </div>
          {data.recentMessages.length === 0 ? (
            <p className={styles.calNoEvents}>{intl.formatMessage({ id: "messages.empty" })}</p>
          ) : (
            <>
              <div className={styles.msgList}>
                {data.recentMessages.map((msg) => (
                  <div key={msg.id} className={`${styles.msgItem} ${!msg.isRead ? styles.unread : ""}`}>
                    <span className={styles.msgSender}>
                      {msg.sender}
                      <span className={styles.msgDate}>{formatDate(msg.createdAt)}</span>
                    </span>
                    <span className={styles.msgSubject}>{msg.subject}</span>
                  </div>
                ))}
              </div>
              <div className={styles.msgFooter}>
                <Link href="/messages" className={styles.viewAllBtn}>
                  {intl.formatMessage({ id: "dashboard.viewAllMessages" })}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
