import prisma from '../config/prisma'
import { encrypt } from '../utils/encrypt'
import { validateRoutingNumber } from '../utils/validateRoutingNumber'
import { AppError } from '../types/AppError'
import { CreateBankInput, UpdateBankInput } from '../validators/bank.schema'

const BANK_SELECT = {
  id: true,
  bankName: true,
  nickname: true,
  routingNumber: true,
  accountNumberLast4: true,
  accountType: true,
  verified: true,
  isPrimary: true,
  receivePayments: true,
  sendPayments: true,
  createdAt: true,
} as const

export async function listBanks(userId: string, page: number, limit: number) {
  const [items, total] = await Promise.all([
    prisma.bankAccount.findMany({
      where: { userId },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
      select: {
        ...BANK_SELECT,
        _count: { select: { payments: true } },
      },
    }),
    prisma.bankAccount.count({ where: { userId } }),
  ])

  const mapped = items.map(({ _count, ...bank }) => ({
    ...bank,
    linkedPayments: _count.payments,
  }))

  return { items: mapped, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function getBankDetail(userId: string, id: string) {
  const bank = await prisma.bankAccount.findUnique({
    where: { id },
    select: {
      ...BANK_SELECT,
      payments: {
        where: { userId },
        select: { type: true, amount: true, paymentDate: true, caseNumber: true },
        orderBy: { paymentDate: 'desc' },
        take: 8,
      },
    },
  })

  if (!bank) throw new AppError('Bank account not found', 404)
  if (bank.payments.some((p) => p) && bank.id) {
    // check ownership via userId on bank
  }

  const allPayments = await prisma.payment.findMany({
    where: { userId, bankId: id },
    select: { type: true, amount: true, paymentDate: true },
  })

  const totalReceived = allPayments
    .filter((p) => p.type === 'received' || p.type === 'pending_received')
    .reduce((s, p) => s + Number(p.amount), 0)

  const totalSent = allPayments
    .filter((p) => p.type === 'sent' || p.type === 'pending_sent')
    .reduce((s, p) => s + Number(p.amount), 0)

  const linkedCases = new Set(
    allPayments.filter((p) => p.type === 'received' || p.type === 'pending_received')
      .map((p) => (p as { caseNumber?: string }).caseNumber)
  ).size

  const lastActivity =
    allPayments.length > 0
      ? allPayments.reduce((latest, p) =>
          p.paymentDate > latest ? p.paymentDate : latest,
          allPayments[0].paymentDate
        )
      : null

  const { payments, ...bankData } = bank
  return {
    ...bankData,
    stats: { totalReceived, totalSent, linkedCases, lastActivity },
    recentPayments: payments,
  }
}

export async function createBank(userId: string, data: CreateBankInput) {
  if (!validateRoutingNumber(data.routingNumber)) {
    throw new AppError('Invalid routing number', 400)
  }

  const existingPrimary = await prisma.bankAccount.count({ where: { userId, isPrimary: true } })

  return prisma.bankAccount.create({
    data: {
      userId,
      bankName: data.bankName,
      nickname: data.nickname ?? null,
      routingNumber: data.routingNumber,
      accountNumber: encrypt(data.accountNumber),
      accountNumberLast4: data.accountNumber.slice(-4),
      accountType: data.accountType,
      isPrimary: existingPrimary === 0,
    },
    select: BANK_SELECT,
  })
}

export async function updateBank(userId: string, id: string, data: UpdateBankInput) {
  const bank = await prisma.bankAccount.findUnique({ where: { id }, select: { userId: true } })
  if (!bank) throw new AppError('Bank account not found', 404)
  if (bank.userId !== userId) throw new AppError('Forbidden', 403)

  if (data.isPrimary) {
    await prisma.bankAccount.updateMany({
      where: { userId, id: { not: id } },
      data: { isPrimary: false },
    })
  }

  return prisma.bankAccount.update({
    where: { id },
    data: {
      ...(data.accountType !== undefined && { accountType: data.accountType }),
      ...(data.nickname !== undefined && { nickname: data.nickname }),
      ...(data.isPrimary !== undefined && { isPrimary: data.isPrimary }),
      ...(data.receivePayments !== undefined && { receivePayments: data.receivePayments }),
      ...(data.sendPayments !== undefined && { sendPayments: data.sendPayments }),
    },
    select: BANK_SELECT,
  })
}

export async function deleteBank(userId: string, id: string) {
  const bank = await prisma.bankAccount.findUnique({ where: { id }, select: { userId: true, isPrimary: true } })
  if (!bank) throw new AppError('Bank account not found', 404)
  if (bank.userId !== userId) throw new AppError('Forbidden', 403)

  await prisma.bankAccount.delete({ where: { id } })

  if (bank.isPrimary) {
    const next = await prisma.bankAccount.findFirst({ where: { userId }, orderBy: { createdAt: 'asc' } })
    if (next) await prisma.bankAccount.update({ where: { id: next.id }, data: { isPrimary: true } })
  }
}

export async function verifyBank(userId: string, id: string) {
  const bank = await prisma.bankAccount.findUnique({ where: { id }, select: { userId: true } })
  if (!bank) throw new AppError('Bank account not found', 404)
  if (bank.userId !== userId) throw new AppError('Forbidden', 403)

  return prisma.bankAccount.update({
    where: { id },
    data: { verified: true },
    select: { id: true, verified: true },
  })
}
