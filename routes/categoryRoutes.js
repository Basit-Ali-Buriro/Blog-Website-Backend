import express from "express";
import {
  getCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory
} from "../controllers/categoryController.js";
import { verifyToken, admin } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/", getCategories); // GET /api/categories - Get all categories
router.get("/:id", getCategoryById); // GET /api/categories/:id - Get single category by ID or slug

// Protected routes (admin only)
router.post("/", verifyToken, admin, createCategory); // POST /api/categories - Create new category
router.put("/:id", verifyToken, admin, updateCategory); // PUT /api/categories/:id - Update category
router.delete("/:id", verifyToken, admin, deleteCategory); // DELETE /api/categories/:id - Delete category

export default router;