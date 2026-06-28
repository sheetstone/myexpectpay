import { z } from "zod"
import { validateCaseNumber } from "@/utils/validateCaseNumber"

export const createCaseSchema = z.object({
  caseNumber: z
    .string()
    .min(1)
    .refine(validateCaseNumber, "Invalid case number format"),
  ncpName: z.string().min(1).max(100),
  children: z.array(z.string().min(1).max(100)),
})

export const updateCaseSchema = createCaseSchema.partial()

export type CreateCaseInput = z.infer<typeof createCaseSchema>
export type UpdateCaseInput = z.infer<typeof updateCaseSchema>
