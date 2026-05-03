import { Request, Response, NextFunction } from 'express'
import * as paymentService from '../services/paymentService'
import { paymentQuerySchema } from '../validators/payment.schema'

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = paymentQuerySchema.parse(req.query)
    res.json(await paymentService.listPayments(req.user.id, query))
  } catch (err) { next(err) }
}

export async function send(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await paymentService.sendPayment(req.user.id, req.body))
  } catch (err) { next(err) }
}

export async function request(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await paymentService.requestPayment(req.user.id, req.body))
  } catch (err) { next(err) }
}
