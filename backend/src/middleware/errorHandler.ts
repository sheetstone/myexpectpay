import { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { AppError } from '../types/AppError'

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message })
    return
  }

  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Validation failed', details: err.format() })
    return
  }

  console.error('Unhandled error:', err instanceof Error ? err.message : err)
  res.status(500).json({ error: 'Internal server error' })
}
