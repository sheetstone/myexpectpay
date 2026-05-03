import { z } from 'zod'

const PaymentStatusEnum = z.enum([
  'accepted', 'cancelled', 'completed', 'expired', 'in_progress',
  'rejected', 'returned', 'reversal_in_progress', 'reversal_completed', 'reversal_rejected',
])

export const sendPaymentSchema = z.object({
  bankId: z.string().uuid(),
  recipientId: z.string().uuid().optional(),
  recipientName: z.string().min(1),
  caseNumber: z.string().min(1),
  amount: z.number().positive(),
  paymentDate: z.string().datetime(),
})

export const requestPaymentSchema = z.object({
  recipientId: z.string().uuid().optional(),
  recipientName: z.string().min(1),
  caseNumber: z.string().min(1),
  amount: z.number().positive(),
  paymentDate: z.string().datetime(),
})

export const paymentQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.union([PaymentStatusEnum, z.array(PaymentStatusEnum)]).optional().transform(v =>
    v === undefined ? undefined : Array.isArray(v) ? v : [v]
  ),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export type SendPaymentInput = z.infer<typeof sendPaymentSchema>
export type RequestPaymentInput = z.infer<typeof requestPaymentSchema>
export type PaymentQuery = z.infer<typeof paymentQuerySchema>
