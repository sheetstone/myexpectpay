import { Request, Response, NextFunction } from 'express'
import * as caseService from '../services/caseService'

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 20
    res.json(await caseService.listCases(req.user.id, page, limit))
  } catch (err) { next(err) }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await caseService.createCase(req.user.id, req.body))
  } catch (err) { next(err) }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await caseService.updateCase(req.user.id, req.params['id'] as string, req.body))
  } catch (err) { next(err) }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await caseService.deleteCase(req.user.id, req.params['id'] as string)
    res.status(204).send()
  } catch (err) { next(err) }
}
