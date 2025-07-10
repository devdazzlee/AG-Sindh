// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { Role } from '../../../generated/prisma';
import { AuthService } from '../../services/authService/authService';

function validateRole(role: any): role is Role {
  return ['super_admin', 'rd_department', 'other_department'].includes(role);
}

export class AuthController {
  static async signup(req: Request, res: Response) {
    try {
      const { username, password, role } = req.body;
      if (!username || !password || !role) {
        return res.status(400).json({ error: 'username, password & role are required' });
      }
      if (!validateRole(role)) {
        return res.status(400).json({ error: 'Invalid role provided' });
      }
      const user = await AuthService.signup(username, password, role);
      return res.status(201).json({ user });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'username & password are required' });
      }
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
