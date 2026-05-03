import prisma from '../config/prisma'
import { encrypt } from '../utils/encrypt'
import { validateRoutingNumber } from '../utils/validateRoutingNumber'
import { AppError } from '../types/AppError'
import { CreateBankInput, UpdateBankInput } from '../validators/bank.schema'

export async function listBanks(userId: string, page: number, limit: number) {
  const [items, total] = await Promise.all([
    prisma.bankAccount.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        bankName: true,
        routingNumber: true,
        accountNumberLast4: true,
        accountType: true,
        verified: true,
        createdAt: true,
      },
    }),
    prisma.bankAccount.count({ where: { userId } }),
  ])

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function createBank(userId: string, data: CreateBankInput) {
  if (!validateRoutingNumber(data.routingNumber)) {
    throw new AppError('Invalid routing number', 400)
  }

  return prisma.bankAccount.create({
    data: {
      userId,
      bankName: data.bankName,
      routingNumber: data.routingNumber,
      accountNumber: encrypt(data.accountNumber),
      accountNumberLast4: data.accountNumber.slice(-4),
      accountType: data.accountType,
    },
    select: {
      id: true,
      bankName: true,
      routingNumber: true,
      accountNumberLast4: true,
      accountType: true,
      verified: true,
      createdAt: true,
    },
  })
}

export async function updateBank(userId: string, id: string, data: UpdateBankInput) {
  const bank = await prisma.bankAccount.findUnique({ where: { id }, select: { userId: true } })
  if (!bank) throw new AppError('Bank account not found', 404)
  if (bank.userId !== userId) throw new AppError('Forbidden', 403)

  return prisma.bankAccount.update({
    where: { id },
    data: { accountType: data.accountType },
    select: {
      id: true,
      bankName: true,
      routingNumber: true,
      accountNumberLast4: true,
      accountType: true,
      verified: true,
    },
  })
}

export async function deleteBank(userId: string, id: string) {
  const bank = await prisma.bankAccount.findUnique({ where: { id }, select: { userId: true } })
  if (!bank) throw new AppError('Bank account not found', 404)
  if (bank.userId !== userId) throw new AppError('Forbidden', 403)

  await prisma.bankAccount.delete({ where: { id } })
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
