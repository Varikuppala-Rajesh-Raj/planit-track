import bcrypt from 'bcryptjs';
import { prisma } from '../db/prisma';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middleware/error.middleware';
import { LoginRequest, SignupRequest, UserModel } from '../models/types';
import { auditService } from './audit.service';

export class AuthService {
  async signup(data: SignupRequest): Promise<{ user: UserModel; token: string }> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('User already exists with this email', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: 'USER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Log audit event
    await auditService.log({
      actorId: user.id,
      action: 'user_signup',
      targetType: 'user',
      targetId: user.id,
      metadata: { email: user.email },
    });

    return { user, token };
  }

  async login(data: LoginRequest): Promise<{ user: UserModel; token: string }> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    // Log audit event
    await auditService.log({
      actorId: user.id,
      action: 'user_login',
      targetType: 'user',
      targetId: user.id,
      metadata: { email: user.email },
    });

    return { user: userWithoutPassword, token };
  }

  async getMe(userId: string): Promise<UserModel> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  async logout(userId: string): Promise<void> {
    // Log audit event
    await auditService.log({
      actorId: userId,
      action: 'user_logout',
      targetType: 'user',
      targetId: userId,
    });

    // Note: With HTTP-only cookies, logout is handled by clearing the cookie
    // on the client side. This method mainly serves for audit logging.
  }
}

export const authService = new AuthService();