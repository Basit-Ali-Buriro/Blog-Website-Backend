import express from 'express'
import { register, login, logout, getProfile } from '../controllers/authController.js'
import {protect, verifyToken} from '../middlewares/AuthMiddleware.js'
const router = express.Router()

router.post('/register', register)
router.post('/login', login)

router.post('/logout', protect, logout)
router.get('/profile', protect, getProfile)

// Test auth endpoint
router.get('/test-auth', verifyToken, (req, res) => {
  res.json({ 
    message: 'Auth working!', 
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email
    }
  })
})

export default router;