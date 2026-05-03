import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth'
import { validate } from '../middleware/validate'
import { createCaseSchema, updateCaseSchema } from '../validators/case.schema'
import * as cases from '../controllers/cases'

const router = Router()

router.use(requireAuth)

router.get('/', cases.list)
router.post('/', validate(createCaseSchema), cases.create)
router.patch('/:id', validate(updateCaseSchema), cases.update)
router.delete('/:id', cases.remove)

export default router
