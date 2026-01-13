import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db.js";
import authRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();

// Initialize connections
connectDB();

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Auth specific rate limiting (relaxed for development)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 50, // 50 attempts in dev, 5 in production
  message: {
    error: 'Too many authentication attempts, please try again later.',
  },
});

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser())
app.use(limiter); // Apply general rate limiting to all requests

// Mount auth routes with stricter rate limiting
app.use('/api/auth', authLimiter, authRoutes);

// Mount post routes
app.use('/api/posts', postRoutes);

// Mount category routes
app.use('/api/categories', categoryRoutes);

// Mount comment routes
app.use('/api/comments', commentRoutes);

// Mount AI routes
app.use('/api/ai', aiRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.listen(process.env.PORT || 5000, () => {
  console.log(
    `Server is running on port ${process.env.PORT || 5000}`
  );
});
