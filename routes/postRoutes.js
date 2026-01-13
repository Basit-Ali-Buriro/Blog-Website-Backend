import express from "express";
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  getPostsByAuthor,
  getTrendingPosts,
  getRelatedPosts
} from "../controllers/postController.js";
import { protect, verifyToken } from "../middlewares/AuthMiddleware.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/", getPosts); // GET /api/posts - Get all posts
router.get("/trending", getTrendingPosts); // GET /api/posts/trending - Get trending posts
router.get("/author/:authorId", getPostsByAuthor); // GET /api/posts/author/:authorId - Get posts by author
router.get("/:id", getPostById); // GET /api/posts/:id - Get single post
router.get("/:id/related", getRelatedPosts); // GET /api/posts/:id/related - Get related posts

// Protected routes (authentication required)
router.post("/", verifyToken, upload.array("images", 5), createPost); // POST /api/posts - Create new post
router.put("/:id", verifyToken, upload.array("images", 5), updatePost); // PUT /api/posts/:id - Update post
router.delete("/:id", verifyToken, deletePost); // DELETE /api/posts/:id - Delete post
router.post("/:id/like", verifyToken, toggleLike); // POST /api/posts/:id/like - Like/unlike post

export default router;