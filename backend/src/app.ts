import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { errorHandler } from './middleware/errorHandler'
import { AppError } from './types/AppError'
import healthRouter from './routes/health'
import authRouter from './routes/auth'
import banksRouter from './routes/banks'
import casesRouter from './routes/cases'
import recipientsRouter from './routes/recipients'
import paymentsRouter from './routes/payments'
import messagesRouter from './routes/messages'
import dashboardRouter from './routes/dashboard'

function buildCorsOptions(): cors.CorsOptions {
  const allowed = [
    ...(process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()).filter(Boolean) ?? []),
    // always allow localhost in non-production so dev works even if env var is missing
    ...(process.env.NODE_ENV !== 'production' ? ['http://localhost:5173', 'http://localhost:3000'] : []),
  ]
  return {
    origin: (origin, cb) => {
      // allow requests with no origin (curl, mobile apps, server-to-server)
      if (!origin || allowed.includes(origin)) return cb(null, true)
      cb(new Error(`CORS: origin ${origin} not allowed`))
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
  }
}

export function createApp(): express.Application {
  const app = express()
  const corsOptions = buildCorsOptions()

  // Handle OPTIONS preflight for every route before any other middleware
  app.options('/{*path}', cors(corsOptions))

  // Security & parsing
  app.use(helmet())
  app.use(cors(corsOptions))
  app.use(express.json())
  app.use(morgan('dev'))

  // Routes
  app.use('/api/health', healthRouter)
  app.use('/api/auth', authRouter)
  app.use('/api/banks', banksRouter)
  app.use('/api/cases', casesRouter)
  app.use('/api/recipients', recipientsRouter)
  app.use('/api/payments', paymentsRouter)
  app.use('/api/messages', messagesRouter)
  app.use('/api/dashboard', dashboardRouter)

  // 404 for unknown routes
  app.use((_req, _res, next) => {
    next(new AppError('Route not found', 404))
  })

  // Global error handler — must be last
  app.use(errorHandler)

  return app
}
