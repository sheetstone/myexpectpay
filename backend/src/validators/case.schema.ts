import { z } from 'zod'

export const createCaseSchema = z.object({
  caseNumber: z.string().min(1).regex(/^[\w\-\/]+$/, 'Invalid case number format'),
  ncpName: z.string().min(1),
  children: z.array(z.string().min(1)).min(1),
})

export const updateCaseSchema = createCaseSchema.partial()

export type CreateCaseInput = z.infer<typeof createCaseSchema>
export type UpdateCaseInput = z.infer<typeof updateCaseSchema>
