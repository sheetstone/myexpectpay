import prisma from '../config/prisma'

export async function getSummary(userId: string) {
  const [sent, received, pending, unreadMessageCount] = await Promise.all([
    prisma.payment.aggregate({
      where: { userId, status: 'completed', type: 'sent' },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { userId, status: 'completed', type: 'received' },
      _sum: { amount: true },
    }),
    prisma.payment.count({
      where: { userId, type: { in: ['pending_sent', 'pending_received'] } },
    }),
    prisma.message.count({ where: { userId, isRead: false } }),
  ])

  const totalSent = Number(sent._sum.amount ?? 0)
  const totalReceived = Number(received._sum.amount ?? 0)

  return {
    balance: totalReceived - totalSent,
    totalSent,
    totalReceived,
    pendingCount: pending,
    unreadMessageCount,
  }
}

export async function getActivity(userId: string) {
  const days = 30
  const since = new Date()
  since.setDate(since.getDate() - days + 1)
  since.setHours(0, 0, 0, 0)

  const rows = await prisma.$queryRaw<{ date: Date; count: bigint }[]>`
    SELECT DATE_TRUNC('day', "paymentDate") AS date, COUNT(*) AS count
    FROM "Payment"
    WHERE "userId" = ${userId}
      AND "paymentDate" >= ${since}
    GROUP BY DATE_TRUNC('day', "paymentDate")
    ORDER BY date ASC
  `

  const byDate = new Map(rows.map(r => [r.date.toISOString().slice(0, 10), Number(r.count)]))

  return Array.from({ length: days }, (_, i) => {
    const d = new Date(since)
    d.setDate(d.getDate() + i)
    const key = d.toISOString().slice(0, 10)
    return { date: key, count: byDate.get(key) ?? 0 }
  })
}
