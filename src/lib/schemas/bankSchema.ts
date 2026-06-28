import { z } from "zod"
import { validateRouting } from "@/utils/validateRouting"
import { ACCOUNT_NUMBER_MIN, ACCOUNT_NUMBER_MAX } from "@/constants"

export const createBankSchema = z
  .object({
    bankName: z.string().min(1).max(100),
    routingNumber: z
      .string()
      .length(9, "Routing number must be 9 digits")
      .regex(/^\d{9}$/, "Routing number must be numeric")
      .refine(validateRouting, "Invalid ABA routing number"),
    accountNumber: z
      .string()
      .min(ACCOUNT_NUMBER_MIN, `Account number must be at least ${ACCOUNT_NUMBER_MIN} digits`)
      .max(ACCOUNT_NUMBER_MAX, `Account number must be at most ${ACCOUNT_NUMBER_MAX} digits`)
      .regex(/^\d+$/, "Account number must be numeric"),
    confirmAccountNumber: z.string().min(1),
    accountType: z.enum(["checking", "saving"]),
    nickname: z.string().max(60).optional(),
  })
  .refine((d) => d.accountNumber === d.confirmAccountNumber, {
    message: "Account numbers do not match",
    path: ["confirmAccountNumber"],
  })

export const updateBankSchema = z.object({
  accountType: z.enum(["checking", "saving"]).optional(),
  nickname: z.string().max(60).nullable().optional(),
  receivePayments: z.boolean().optional(),
  sendPayments: z.boolean().optional(),
})

export type CreateBankInput = z.infer<typeof createBankSchema>
export type UpdateBankInput = z.infer<typeof updateBankSchema>
