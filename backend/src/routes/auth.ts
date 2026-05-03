import { Router } from 'express'
import { verifyToken, register } from '../controllers/auth'

const router = Router()

router.post('/verify', verifyToken)
router.post('/register', register)

export default router
