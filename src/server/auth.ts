import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'dentacare-jwt-production-secret-98427984372';
export const AUTH_COOKIE_NAME = 'dentacare_admin_token';

export interface AdminJwtPayload {
  userId: string;
  username: string;
  role: string;
}

// In-Memory sliding-window rate limit store
interface RateLimitRecord {
  attempts: number;
  resetTime: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * Basic IP rate limiter for security
 */
export function createRateLimiter(maxAttempts: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown-ip';
    const key = `${req.path}:${ip}`;
    const now = Date.now();

    const record = rateLimitMap.get(key);
    if (!record || now > record.resetTime) {
      rateLimitMap.set(key, { attempts: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.attempts >= maxAttempts) {
      const waitSeconds = Math.ceil((record.resetTime - now) / 1000);
      return res.status(429).json({
        error: `Too many requests. Please try again in ${waitSeconds} seconds.`,
      });
    }

    record.attempts += 1;
    next();
  };
}

/**
 * Sign JWT for Admin
 */
export function signAdminToken(payload: AdminJwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}

/**
 * Middleware: Verify Admin Authentication
 */
export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  let token = req.cookies?.[AUTH_COOKIE_NAME];

  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminJwtPayload;

    // Verify admin user still exists in database
    const admin = db.prepare('SELECT id, username, name, role FROM admin_users WHERE id = ?').get(decoded.userId) as
      | { id: string; username: string; name: string; role: string }
      | undefined;

    if (!admin) {
      return res.status(401).json({ error: 'Session expired or user not found.' });
    }

    // Attach admin info to request
    (req as any).adminUser = admin;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }
}
