import { z } from 'zod'

export const createRecipientSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  caseId: z.string().uuid().optional(),
})

export const updateRecipientSchema = createRecipientSchema.partial()

export type CreateRecipientInput = z.infer<typeof createRecipientSchema>
export type UpdateRecipientInput = z.infer<typeof updateRecipientSchema>
