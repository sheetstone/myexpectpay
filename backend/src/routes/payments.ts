import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth'
import { validate } from '../middleware/validate'
import { sendPaymentSchema, requestPaymentSchema } from '../validators/payment.schema'
import * as payments from '../controllers/payments'

const router = Router()

router.use(requireAuth)

router.get('/', payments.list)
router.post('/send', validate(sendPaymentSchema), payments.send)
router.post('/request', validate(requestPaymentSchema), payments.request)

export default router
