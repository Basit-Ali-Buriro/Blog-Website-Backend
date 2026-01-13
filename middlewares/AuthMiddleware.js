import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";

export const verifyToken = async (req, res, next) => {
  try {
    let token =
      req.cookies.token ||
      (req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) {
      console.log('❌ No token provided');
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    console.log('🔍 Verifying token:', token.substring(0, 20) + '...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded:', decoded);
    
    req.user = await User.findById(decoded.id).select("-password");
    
    if (!req.user) {
      console.log('❌ User not found for ID:', decoded.id);
      return res.status(401).json({ message: "User not found" });
    }
    
    console.log('✅ User authenticated:', req.user.username);
    next();
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    res.status(401).json({ message: "Token is not valid" });
  }
};

// Keep protect as alias for backward compatibility
export const protect = verifyToken;

export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Admin access required" });
  }
};
