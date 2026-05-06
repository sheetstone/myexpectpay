import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth'
import { validate } from '../middleware/validate'
import { createBankSchema, updateBankSchema } from '../validators/bank.schema'
import * as banks from '../controllers/banks'

const router = Router()

router.use(requireAuth)

router.get('/', banks.list)
router.get('/:id', banks.detail)
router.post('/', validate(createBankSchema), banks.create)
router.patch('/:id', validate(updateBankSchema), banks.update)
router.delete('/:id', banks.remove)
router.patch('/:id/verify', banks.verify)

export default router
