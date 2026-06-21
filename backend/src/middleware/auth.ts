import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export interface AuthRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'Unauthorized' });
  const token = auth.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET || 'change_this_secret';
    const payload = jwt.verify(token, secret) as any;
    req.userId = payload.userId;
    console.log('🔑 Authenticated user:', req.userId);
    console.log('🔑 Authenticated token:', token);
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
