// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { Role } from '../../../generated/prisma';
import { AuthService } from '../../services/authService/authService';
import { signupSchema, loginSchema } from '../../validation/authValidation/authValidation';
import { ZodIssue } from 'zod';
function validateRole(role: any): role is Role {
  return ['super_admin', 'rd_department', 'other_department'].includes(role);
}
export class AuthController {
  static async signup(req: Request, res: Response) {
    try {
      const parsed = signupSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues.map((issue: ZodIssue) => issue.message).join(', ') });
      }
      const { username, password, role } = parsed.data;
      const user = await AuthService.signup(username, password, role);
      return res.status(201).json({ user });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues.map((issue: ZodIssue) => issue.message).join(', ') });
      }
      const { username, password } = parsed.data;
      const data = await AuthService.login(username, password);
      return res.status(200).json({ success: true, ...data });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  static async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ error: 'refreshToken is required' });
      }
      const tokens = await AuthService.refresh(refreshToken);
      return res.status(200).json({ success: true, ...tokens });
    } catch (err: any) {
      return res.status(401).json({ success: false, error: err.message });
    }
  }
}
