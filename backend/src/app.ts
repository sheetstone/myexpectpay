import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { errorHandler } from './middleware/errorHandler'
import { AppError } from './types/AppError'
import healthRouter from './routes/health'

export function createApp(): express.Application {
  const app = express()

  // Security & parsing
  app.use(helmet())
  app.use(cors({ origin: process.env.CORS_ORIGIN }))
  app.use(express.json())
  app.use(morgan('dev'))

  // Routes
  app.use('/api/health', healthRouter)

  // 404 for unknown routes
  app.use((_req, _res, next) => {
    next(new AppError('Route not found', 404))
  })

  // Global error handler — must be last
  app.use(errorHandler)

  return app
}
