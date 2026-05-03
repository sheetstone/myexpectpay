import { Request, Response, NextFunction } from 'express'
import * as recipientService from '../services/recipientService'

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 20
    res.json(await recipientService.listRecipients(req.user.id, page, limit))
  } catch (err) { next(err) }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await recipientService.createRecipient(req.user.id, req.body))
  } catch (err) { next(err) }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await recipientService.updateRecipient(req.user.id, req.params['id'] as string, req.body))
  } catch (err) { next(err) }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await recipientService.deleteRecipient(req.user.id, req.params['id'] as string)
    res.status(204).send()
  } catch (err) { next(err) }
}
