import { Request, Response, NextFunction } from 'express'
import * as bankService from '../services/bankService'

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 20
    res.json(await bankService.listBanks(req.user.id, page, limit))
  } catch (err) { next(err) }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await bankService.createBank(req.user.id, req.body))
  } catch (err) { next(err) }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await bankService.updateBank(req.user.id, req.params['id'] as string, req.body))
  } catch (err) { next(err) }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await bankService.deleteBank(req.user.id, req.params['id'] as string)
    res.status(204).send()
  } catch (err) { next(err) }
}

export async function verify(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await bankService.verifyBank(req.user.id, req.params['id'] as string))
  } catch (err) { next(err) }
}
