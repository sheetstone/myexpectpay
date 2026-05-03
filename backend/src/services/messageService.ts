import prisma from '../config/prisma'
import { AppError } from '../types/AppError'

export async function listMessages(userId: string) {
  const items = await prisma.message.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, sender: true, subject: true, body: true, isRead: true, createdAt: true },
  })
  const unreadCount = items.filter(m => !m.isRead).length
  return { items, unreadCount }
}

export async function markRead(userId: string, id: string) {
  const msg = await prisma.message.findUnique({ where: { id }, select: { userId: true } })
  if (!msg) throw new AppError('Message not found', 404)
  if (msg.userId !== userId) throw new AppError('Forbidden', 403)

  return prisma.message.update({
    where: { id },
    data: { isRead: true },
    select: { id: true, isRead: true },
  })
}
