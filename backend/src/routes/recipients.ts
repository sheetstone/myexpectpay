import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth'
import { validate } from '../middleware/validate'
import { createRecipientSchema, updateRecipientSchema } from '../validators/recipient.schema'
import * as recipients from '../controllers/recipients'

const router = Router()

router.use(requireAuth)

router.get('/', recipients.list)
router.post('/', validate(createRecipientSchema), recipients.create)
router.patch('/:id', validate(updateRecipientSchema), recipients.update)
router.delete('/:id', recipients.remove)

export default router
