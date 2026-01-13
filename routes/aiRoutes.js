import express from 'express';
import { generateBlogAssistance, generateBlogIdeas } from '../controllers/aiController.js';
import { verifyToken } from '../middlewares/AuthMiddleware.js';

const router = express.Router();

// Protected routes (authentication required)
router.post('/assist', verifyToken, generateBlogAssistance);
router.post('/ideas', verifyToken, generateBlogIdeas);

export default router;
