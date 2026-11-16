import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'carecircle_super_secure_jwt_secret_2026';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    familyId: string;
  };
}

export function generateToken(payload: { id: string; email: string; familyId: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '14d' });
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  let token = '';
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query && typeof req.query.token === 'string') {
    token = req.query.token;
  }

  if (!token) {
    res.status(401).json({ error: 'Unauthorized: No authentication token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; familyId: string };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired authentication token. Please log in again.' });
    return;
  }
}
