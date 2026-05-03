import prisma from '../config/prisma'
import { AppError } from '../types/AppError'
import { CreateCaseInput, UpdateCaseInput } from '../validators/case.schema'

const SELECT = { id: true, caseNumber: true, ncpName: true, children: true, createdAt: true, updatedAt: true }

export async function listCases(userId: string, page: number, limit: number) {
  const [items, total] = await Promise.all([
    prisma.case.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: SELECT,
    }),
    prisma.case.count({ where: { userId } }),
  ])
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function createCase(userId: string, data: CreateCaseInput) {
  return prisma.case.create({
    data: { userId, ...data },
    select: SELECT,
  })
}

async function assertOwner(userId: string, id: string) {
  const c = await prisma.case.findUnique({ where: { id }, select: { userId: true } })
  if (!c) throw new AppError('Case not found', 404)
  if (c.userId !== userId) throw new AppError('Forbidden', 403)
}

export async function updateCase(userId: string, id: string, data: UpdateCaseInput) {
  await assertOwner(userId, id)
  return prisma.case.update({ where: { id }, data, select: SELECT })
}

export async function deleteCase(userId: string, id: string) {
  await assertOwner(userId, id)
  await prisma.case.delete({ where: { id } })
}
