import { z } from "zod"

export const createRecipientSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email(),
  caseId: z.string().optional(),
})

export const updateRecipientSchema = createRecipientSchema.partial()

export type CreateRecipientInput = z.infer<typeof createRecipientSchema>
export type UpdateRecipientInput = z.infer<typeof updateRecipientSchema>
