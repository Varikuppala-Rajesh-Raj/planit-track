import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { loginSchema, signupSchema } from '../models/types';
import { AppError } from '../middleware/error.middleware';

export class AuthController {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request data
      const validatedData = signupSchema.parse(req.body);

      // Create user and generate token
      const { user, token } = await authService.signup(validatedData);

      // Set HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request data
      const validatedData = loginSchema.parse(req.body);

      // Authenticate user and generate token
      const { user, token } = await authService.login(validatedData);

      // Set HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        success: true,
        data: user,
        message: 'Login successful',
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // Log the logout action
      if (req.user) {
        await authService.logout(req.user.id);
      }

      // Clear the HTTP-only cookie
      res.clearCookie('token');

      res.json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const user = await authService.getMe(req.user.id);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();