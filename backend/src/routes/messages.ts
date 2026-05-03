import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth'
import * as messages from '../controllers/messages'

const router = Router()

router.use(requireAuth)

router.get('/', messages.list)
router.patch('/:id/read', messages.markRead)

export default router
