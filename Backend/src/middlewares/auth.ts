// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService, TokenPayload } from '../services/authService/authService';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: string;
  };
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    console.log('🔐 Auth middleware called for:', req.method, req.path);
    console.log('🔐 Headers:', req.headers);
    
    const header = req.headers.authorization;
    console.log('🔐 Authorization header:', header);
    
    if (!header?.startsWith('Bearer ')) {
      console.log('❌ Missing or malformed Authorization header');
      return res.status(401).json({ error: 'Missing or malformed Authorization header' });
    }
    
    const token = header.slice(7);
    console.log('🔐 Token (first 20 chars):', token.substring(0, 20) + '...');
    
    const tokenPayload = AuthService.verifyToken(token);
    console.log('🔐 Token payload:', tokenPayload);
    
    // Map the JWT payload to the expected user object structure
    req.user = {
      id: tokenPayload.sub, // JWT uses 'sub' for user ID
      username: tokenPayload.username,
      role: tokenPayload.role
    };
    
    console.log('✅ User authenticated:', req.user);
    next();
  } catch (error) {
    console.log('❌ Auth error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
