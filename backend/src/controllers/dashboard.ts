import { Request, Response, NextFunction } from 'express'
import * as dashboardService from '../services/dashboardService'

export async function summary(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await dashboardService.getSummary(req.user.id))
  } catch (err) { next(err) }
}

export async function activity(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await dashboardService.getActivity(req.user.id))
  } catch (err) { next(err) }
}
