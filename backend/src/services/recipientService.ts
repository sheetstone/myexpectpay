import prisma from '../config/prisma'
import { AppError } from '../types/AppError'
import { CreateRecipientInput, UpdateRecipientInput } from '../validators/recipient.schema'

const SELECT = { id: true, firstName: true, lastName: true, email: true, caseId: true, createdAt: true, updatedAt: true }

export async function listRecipients(userId: string, page: number, limit: number) {
  const [items, total] = await Promise.all([
    prisma.recipient.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: SELECT,
    }),
    prisma.recipient.count({ where: { userId } }),
  ])
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function createRecipient(userId: string, data: CreateRecipientInput) {
  if (data.caseId) {
    const c = await prisma.case.findUnique({ where: { id: data.caseId }, select: { userId: true } })
    if (!c) throw new AppError('Case not found', 404)
    if (c.userId !== userId) throw new AppError('Forbidden', 403)
  }
  return prisma.recipient.create({ data: { userId, ...data }, select: SELECT })
}

async function assertOwner(userId: string, id: string) {
  const r = await prisma.recipient.findUnique({ where: { id }, select: { userId: true } })
  if (!r) throw new AppError('Recipient not found', 404)
  if (r.userId !== userId) throw new AppError('Forbidden', 403)
}

export async function updateRecipient(userId: string, id: string, data: UpdateRecipientInput) {
  await assertOwner(userId, id)
  return prisma.recipient.update({ where: { id }, data, select: SELECT })
}

export async function deleteRecipient(userId: string, id: string) {
  await assertOwner(userId, id)
  await prisma.recipient.delete({ where: { id } })
}
