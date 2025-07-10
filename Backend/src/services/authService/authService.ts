import { PrismaClient, Role } from '../../../generated/prisma';
import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { JWT } from '../../config/config';

const prisma = new PrismaClient();
export interface TokenPayload {
  sub: string;
  username: string;
  role: Role;
  iat: number;
  exp: number;
  iss: string;
}

export class AuthService {
  static async signup(username: string, password: string, role: Role) {
    if (await prisma.user.findUnique({ where: { username } })) {
      throw new Error('Username already exists');
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashed, role },
    });
    return { id: user.id, username: user.username, role: user.role };
  }
  static async login(username: string, password: string) {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid username or password');
    }
    const payload = { sub: user.id, username: user.username, role: user.role };
    const signOpts: SignOptions = {
      issuer: JWT.ISSUER,
      expiresIn: JWT.ACCESS_EXPIRES_IN,
    };
    const refreshOpts: SignOptions = {
      issuer: JWT.ISSUER,
      expiresIn: JWT.REFRESH_EXPIRES_IN,
    };

    const accessToken = jwt.sign(payload, JWT.SECRET as Secret, signOpts);
    const refreshToken = jwt.sign(payload, JWT.SECRET as Secret, refreshOpts);

    return {
      accessToken,
      refreshToken,
      accessExpiresIn: JWT.ACCESS_EXPIRES_IN,
      refreshExpiresIn: JWT.REFRESH_EXPIRES_IN,
      user: { id: user.id, username: user.username, role: user.role },
    };
  }

  static verifyToken(token: string): TokenPayload {
    return jwt.verify(token, JWT.SECRET as Secret, { issuer: JWT.ISSUER }) as TokenPayload;
  }

  static async refresh(refreshToken: string) {
    const decoded = this.verifyToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
    if (!user) throw new Error('User not found');

    const payload = { sub: user.id, username: user.username, role: user.role };
    const newAccess = jwt.sign(payload, JWT.SECRET as Secret, {
      issuer: JWT.ISSUER,
      expiresIn: JWT.ACCESS_EXPIRES_IN,
    });
    const newRefresh = jwt.sign(payload, JWT.SECRET as Secret, {
      issuer: JWT.ISSUER,
      expiresIn: JWT.REFRESH_EXPIRES_IN,
    });

    return {
      accessToken: newAccess,
      refreshToken: newRefresh,
      accessExpiresIn: JWT.ACCESS_EXPIRES_IN,
      refreshExpiresIn: JWT.REFRESH_EXPIRES_IN,
    };
  }
}
