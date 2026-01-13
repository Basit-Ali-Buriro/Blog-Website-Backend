import express from "express";
import {
  getCommentsByPost,
  addComment,
  getCommentById,
  updateComment,
  deleteComment,
  getCommentsByUser
} from "../controllers/commentController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/post/:postId", getCommentsByPost); // GET /api/comments/post/:postId - Get comments for a post
router.get("/user/:userId", getCommentsByUser); // GET /api/comments/user/:userId - Get user's comments
router.get("/:id", getCommentById); // GET /api/comments/:id - Get single comment by ID

// Protected routes (authentication required)
router.post("/post/:postId", verifyToken, addComment); // POST /api/comments/post/:postId - Add comment to post
router.put("/:id", verifyToken, updateComment); // PUT /api/comments/:id - Update comment
router.delete("/:id", verifyToken, deleteComment); // DELETE /api/comments/:id - Delete comment

export default router;