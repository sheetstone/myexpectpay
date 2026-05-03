import { z } from 'zod'

export const createBankSchema = z.object({
  bankName: z.string().min(1),
  routingNumber: z.string().length(9).regex(/^\d{9}$/),
  accountNumber: z.string().min(4).max(17).regex(/^\d+$/),
  accountType: z.enum(['checking', 'saving']),
})

export const updateBankSchema = z.object({
  accountType: z.enum(['checking', 'saving']),
})

export const bankQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export type CreateBankInput = z.infer<typeof createBankSchema>
export type UpdateBankInput = z.infer<typeof updateBankSchema>
