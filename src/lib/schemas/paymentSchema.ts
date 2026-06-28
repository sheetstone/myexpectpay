import { z } from "zod"
import { PAYMENT_STATUS } from "@/types"

type PaymentStatusValue = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS]
const statusValues = Object.values(PAYMENT_STATUS) as [PaymentStatusValue, ...PaymentStatusValue[]]

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")

export const sendPaymentSchema = z.object({
  bankId: z.string().min(1),
  recipientId: z.string().optional(),
  recipientName: z.string().min(1).max(100),
  caseNumber: z.string().min(1),
  amount: z.number().positive().max(999999),
  paymentDate: dateString,
  note: z.string().max(500).optional(),
})

export const requestPaymentSchema = z.object({
  recipientId: z.string().optional(),
  recipientName: z.string().min(1).max(100),
  caseNumber: z.string().min(1),
  amount: z.number().positive().max(999999),
  paymentDate: dateString,
  note: z.string().max(500).optional(),
})

export const paymentFiltersSchema = z.object({
  startDate: dateString.optional(),
  endDate: dateString.optional(),
  status: z.array(z.enum(statusValues)).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type SendPaymentInput = z.infer<typeof sendPaymentSchema>
export type RequestPaymentInput = z.infer<typeof requestPaymentSchema>
export type PaymentFiltersInput = z.infer<typeof paymentFiltersSchema>
