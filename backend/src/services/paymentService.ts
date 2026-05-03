import prisma from '../config/prisma'
import { AppError } from '../types/AppError'
import { SendPaymentInput, RequestPaymentInput, PaymentQuery } from '../validators/payment.schema'

const SELECT = {
  id: true, amount: true, caseNumber: true, recipientName: true,
  paymentDate: true, status: true, type: true, createdAt: true,
  bank: { select: { id: true, bankName: true, accountNumberLast4: true } },
  recipient: { select: { id: true, firstName: true, lastName: true } },
}

export async function listPayments(userId: string, query: PaymentQuery) {
  const { page, limit, startDate, endDate, status } = query

  const where = {
    userId,
    ...(startDate || endDate ? {
      paymentDate: {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDate ? { lte: new Date(endDate) } : {}),
      },
    } : {}),
    ...(status?.length ? { status: { in: status } } : {}),
  }

  const [items, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { paymentDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: SELECT,
    }),
    prisma.payment.count({ where }),
  ])

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function sendPayment(userId: string, data: SendPaymentInput) {
  const bank = await prisma.bankAccount.findUnique({
    where: { id: data.bankId },
    select: { userId: true, verified: true },
  })
  if (!bank) throw new AppError('Bank account not found', 404)
  if (bank.userId !== userId) throw new AppError('Forbidden', 403)
  if (!bank.verified) throw new AppError('Bank account must be verified', 400)

  return prisma.payment.create({
    data: {
      userId,
      bankId: data.bankId,
      recipientId: data.recipientId,
      recipientName: data.recipientName,
      caseNumber: data.caseNumber,
      amount: data.amount,
      paymentDate: new Date(data.paymentDate),
      status: 'in_progress',
      type: 'sent',
    },
    select: SELECT,
  })
}

export async function requestPayment(userId: string, data: RequestPaymentInput) {
  return prisma.payment.create({
    data: {
      userId,
      recipientId: data.recipientId,
      recipientName: data.recipientName,
      caseNumber: data.caseNumber,
      amount: data.amount,
      paymentDate: new Date(data.paymentDate),
      status: 'in_progress',
      type: 'pending_received',
    },
    select: SELECT,
  })
}
