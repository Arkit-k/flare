import { NextFunction, Request , Response } from "express";
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from "@repo/backend-common/config";

declare global {
      namespace Express {
            interface Request {
                  userId?: string;
            }
      }
}

export function middleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header is required" });
  }
  
  // Extract token from "Bearer <token>" format
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId?: string; username?: string };
    
    if (decoded && decoded.userId) {
      req.userId = decoded.userId;
      next();
    } else {
      return res.status(403).json({ message: "Invalid token: userId missing" });
    }
  } catch (error) {
    return res.status(403).json({
      message: "Invalid or expired token",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}