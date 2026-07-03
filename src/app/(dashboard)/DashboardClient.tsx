"use client"

import { useQuery } from "@tanstack/react-query"
import { useIntl } from "react-intl"
import { useState } from "react"
import Link from "next/link"
import {
  ChartBarIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline"
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import { useAuth } from "@/components/providers/AuthProvider"
import { Spinner } from "@/components/ui"
import { formatMoney } from "@/utils/formatMoney"
import { formatDate } from "@/utils/formatDate"
import type { DashboardResponse } from "@/types"
import styles from "./dashboard.module.css"

type Tab = "summary" | "calendar" | "messages"
type ChartType = "bar" | "line"

async function fetchDashboard(): Promise<DashboardResponse> {
  const res = await fetch("/api/dashboard")
  if (!res.ok) throw new Error("Failed to load dashboard")
  return res.json()
}

function TabBtn({
  id, active, onClick, children,
}: {
  id: Tab; active: Tab; onClick: (t: Tab) => void; children: React.ReactNode
}) {
  const isActive = id === active
  return (
    <button
      role="tab"
      aria-selected={isActive}
      className={`${styles.tab}${isActive ? ` ${styles.tabActive}` : ""}`}
      onClick={() => onClick(id)}
    >
      {children}
    </button>
  )
}

export function DashboardClient() {
  const intl = useIntl()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>("summary")
  const [chartType, setChartType] = useState<ChartType>("bar")

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    staleTime: 60_000,
  })

  const name = user?.displayName ?? user?.email ?? ""
  const fmt = (id: string, values?: Record<string, string>) =>
    intl.formatMessage({ id }, values)

  if (isLoading) {
    return (
      <div className={styles.root}>
        <div className={styles.centred}><Spinner /></div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className={styles.root}>
        <p style={{ color: "var(--color-text-muted)" }}>{fmt("common.error")}</p>
      </div>
    )
  }

  // Chart data
  const chartData = data.chart.map((item) => ({
    ...item,
    month: item.month.slice(5),
  }))

  // Calendar
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const today = now.getDate()
  const activeSet = new Set(data.calendarActivity.map((d) => d.slice(8)))
  const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  const money = (n: number) =>
    intl.formatNumber(n, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className={styles.root}>
      {/* Welcome */}
      <div className={styles.welcomeRow}>
        <h2 className={styles.greeting}>
          {fmt("dashboard.hello", { name })}
        </h2>
      </div>

      {/* Tab bar */}
      <div className={styles.tabBar} role="tablist">
        <TabBtn id="summary" active={activeTab} onClick={setActiveTab}>
          <ChartBarIcon width={16} height={16} />
          {fmt("dashboard.accountSummary")}
        </TabBtn>
        <TabBtn id="calendar" active={activeTab} onClick={setActiveTab}>
          <CalendarDaysIcon width={16} height={16} />
          {fmt("dashboard.activityCalendar")}
        </TabBtn>
        <TabBtn id="messages" active={activeTab} onClick={setActiveTab}>
          <ChatBubbleLeftRightIcon width={16} height={16} />
          {fmt("dashboard.recentMessages")}
        </TabBtn>
      </div>

      {/* Tab content */}
      <div className={styles.tabContent}>

        {/* ── Account Summary tab ── */}
        {activeTab === "summary" && (
          <>
            <div className={styles.summarySection}>
              <div className={styles.balanceRow}>
                <span className={styles.dollarSign}>$</span>
                <span className={styles.balance}>{money(data.balance)}</span>
              </div>

              <div className={styles.statsGrid}>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>{fmt("dashboard.totalSent")}</span>
                  <span className={styles.statValueNeg}>-${money(data.totalSentThisMonth)}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>{fmt("dashboard.totalReceived")}</span>
                  <span className={styles.statValuePos}>+${money(data.totalReceivedThisMonth)}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>{fmt("dashboard.pendingCount")}</span>
                  <span className={styles.statValuePending}>{data.pendingCount}</span>
                </div>
              </div>
            </div>

            <div className={styles.divider} />

            {/* Payment chart */}
            <div className={styles.chartSection}>
              <div className={styles.chartHeader}>
                <h3 className={styles.chartTitle}>{fmt("dashboard.recentActivity")}</h3>
                <div className={styles.chartToggle}>
                  <button
                    className={`${styles.toggleBtn}${chartType === "bar" ? ` ${styles.toggleBtnActive}` : ""}`}
                    onClick={() => setChartType("bar")}
                  >
                    {fmt("dashboard.barChart")}
                  </button>
                  <button
                    className={`${styles.toggleBtn}${chartType === "line" ? ` ${styles.toggleBtnActive}` : ""}`}
                    onClick={() => setChartType("line")}
                  >
                    {fmt("dashboard.lineChart")}
                  </button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                {chartType === "bar" ? (
                  <BarChart data={chartData} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", fontSize: "0.8rem" }}
                      cursor={{ fill: "var(--color-primary-light)" }}
                      formatter={(v) => typeof v === "number" ? formatMoney(v) : String(v)}
                    />
                    <Bar dataKey="sent" name="Sent" fill="var(--color-danger)" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="received" name="Received" fill="var(--color-success)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                ) : (
                  <LineChart data={chartData} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", fontSize: "0.8rem" }}
                      formatter={(v) => typeof v === "number" ? formatMoney(v) : String(v)}
                    />
                    <Line type="monotone" dataKey="sent" name="Sent" stroke="var(--color-danger)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    <Line type="monotone" dataKey="received" name="Received" stroke="var(--color-success)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* ── Activity Calendar tab ── */}
        {activeTab === "calendar" && (
          <div className={styles.calSection}>
            <div className={styles.calHeader}>
              <span className={styles.calMonthLabel}>
                {new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(now).toUpperCase()}
              </span>
            </div>
            <div className={styles.calDayNames}>
              {DAY_NAMES.map((d) => (
                <span key={d} className={styles.calDayName}>{d}</span>
              ))}
            </div>
            <div className={styles.calGrid}>
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <span key={`e-${i}`} className={`${styles.calCell} ${styles.calEmpty}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = String(i + 1).padStart(2, "0")
                const isActive = activeSet.has(day)
                const isToday = i + 1 === today
                return (
                  <span
                    key={i}
                    className={[
                      styles.calCell,
                      isActive ? styles.calActive : "",
                      isToday && !isActive ? styles.calToday : "",
                    ].join(" ")}
                  >
                    {i + 1}
                  </span>
                )
              })}
            </div>
            {data.calendarActivity.length === 0 && (
              <p className={styles.calNoEvents}>{fmt("dashboard.noEvents")}</p>
            )}
          </div>
        )}

        {/* ── Recent Messages tab ── */}
        {activeTab === "messages" && (
          <div className={styles.msgSection}>
            {data.recentMessages.length === 0 ? (
              <p className={styles.calNoEvents}>{fmt("messages.empty")}</p>
            ) : (
              <>
                <div className={styles.msgList}>
                  {data.recentMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`${styles.msgItem}${!msg.isRead ? ` ${styles.msgUnread}` : ""}`}
                    >
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
                    {fmt("dashboard.viewAllMessages")}
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
