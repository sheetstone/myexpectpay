import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { getAdminDb } from "@/lib/firebase/admin"
import { Timestamp } from "firebase-admin/firestore"
import type { DashboardResponse, ChartDataItem } from "@/types"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const db = getAdminDb()
  const uid = session.uid
  const userRef = db.collection("users").doc(uid)

  const now = new Date()
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`

  const [paymentsSnap, messagesSnap, unreadSnap] = await Promise.all([
    userRef.collection("payments").get(),
    userRef.collection("messages").orderBy("createdAt", "desc").limit(5).get(),
    userRef.collection("messages").where("isRead", "==", false).count().get(),
  ])

  // Build 12-month chart map (oldest → newest)
  const chartMap = new Map<string, { sent: number; received: number }>()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    chartMap.set(key, { sent: 0, received: 0 })
  }

  let totalSentThisMonth = 0
  let totalReceivedThisMonth = 0
  let pendingCount = 0
  const calendarSet = new Set<string>()

  paymentsSnap.docs.forEach((doc) => {
    const data = doc.data()
    const amount = data.amount as number
    const type = data.type as string
    const status = data.status as string
    const paymentDate = data.paymentDate as string // YYYY-MM-DD

    const monthKey = paymentDate.slice(0, 7)
    const entry = chartMap.get(monthKey)
    if (entry) {
      if (type === "sent" || type === "pending_sent") entry.sent += amount
      if (type === "received" || type === "pending_received") entry.received += amount
    }

    if (status === "in_progress" || status === "accepted") pendingCount++

    if (monthKey === thisMonthKey) {
      if (type === "sent" || type === "pending_sent") totalSentThisMonth += amount
      if (type === "received" || type === "pending_received") totalReceivedThisMonth += amount
      calendarSet.add(paymentDate)
    }
  })

  const chart: ChartDataItem[] = Array.from(chartMap.entries()).map(([month, vals]) => ({
    month,
    ...vals,
  }))

  const recentMessages = messagesSnap.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      sender: data.sender as string,
      subject: data.subject as string,
      isRead: data.isRead as boolean,
      createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
    }
  })

  const response: DashboardResponse = {
    balance: 0,
    totalSentThisMonth,
    totalReceivedThisMonth,
    pendingCount,
    unreadMessageCount: unreadSnap.data().count,
    recentMessages,
    chart,
    calendarActivity: Array.from(calendarSet).sort(),
  }

  return NextResponse.json(response)
}
