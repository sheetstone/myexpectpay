import { Request, Response, NextFunction } from 'express'
import admin from '../config/firebase'
import prisma from '../config/prisma'
import { AppError } from '../types/AppError'

export async function verifyToken(req: Request, res: Response, next: NextFunction) {
  const { idToken } = req.body

  if (!idToken) {
    return next(new AppError('idToken is required', 400))
  }

  try {
    const decoded = await admin.auth().verifyIdToken(idToken)

    const user = await prisma.user.upsert({
      where: { firebaseUid: decoded.uid },
      update: {},
      create: {
        firebaseUid: decoded.uid,
        email: decoded.email ?? '',
        displayName: decoded.name ?? decoded.email ?? '',
      },
      select: { id: true, email: true, displayName: true },
    })

    res.json(user)
  } catch {
    next(new AppError('Invalid or expired token', 401))
  }
}

export async function register(req: Request, res: Response, next: NextFunction) {
  const { email, password, displayName } = req.body

  if (!email || !password) {
    return next(new AppError('email and password are required', 400))
  }

  try {
    const firebaseUser = await admin.auth().createUser({ email, password, displayName })

    const user = await prisma.user.upsert({
      where: { firebaseUid: firebaseUser.uid },
      update: {},
      create: {
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email ?? email,
        displayName: displayName ?? email,
      },
      select: { id: true, email: true, displayName: true },
    })

    res.status(201).json(user)
  } catch (err: unknown) {
    const code = (err as { code?: string }).code
    if (code === 'auth/email-already-exists') {
      return next(new AppError('Email already registered', 409))
    }
    next(err)
  }
}
