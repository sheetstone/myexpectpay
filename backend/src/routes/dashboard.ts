import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth'
import * as dashboard from '../controllers/dashboard'

const router = Router()

router.use(requireAuth)

router.get('/summary', dashboard.summary)
router.get('/activity', dashboard.activity)

export default router
