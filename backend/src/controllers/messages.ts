import { Request, Response, NextFunction } from 'express'
import * as messageService from '../services/messageService'

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await messageService.listMessages(req.user.id))
  } catch (err) { next(err) }
}

export async function markRead(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await messageService.markRead(req.user.id, req.params['id'] as string))
  } catch (err) { next(err) }
}
