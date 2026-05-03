import { Request, Response, NextFunction } from 'express'
import admin from '../config/firebase'
import { AppError } from '../types/AppError'
import prisma from '../config/prisma'

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('Missing auth token', 401))
  }

  const token = authHeader.slice(7)

  try {
    const decoded = await admin.auth().verifyIdToken(token)

    const user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
      select: { id: true, email: true },
    })

    if (!user) {
      return next(new AppError('User not found', 401))
    }

    req.user = { id: user.id, email: user.email }
    next()
  } catch {
    next(new AppError('Invalid or expired token', 401))
  }
}
