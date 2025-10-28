import prisma from '../config/database';
import { hashPassword, comparePassword, validatePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { RegisterRequest, LoginRequest } from '../types';
import { createError } from '../middleware/errorHandler';

export class AuthService {
  async register(data: RegisterRequest) {
    const { email, username, password } = data;

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw createError(passwordValidation.errors.join(', '), 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw createError('User with this email already exists', 409);
      }
      if (existingUser.username === username) {
        throw createError('User with this username already exists', 409);
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        avatar: true,
        createdAt: true,
      }
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user,
      token
    };
  }

  async login(data: LoginRequest) {
    const { email, password } = data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw createError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw createError('Account is deactivated', 401);
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw createError('Invalid email or password', 401);
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Update last login (optional)
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() }
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      token
    };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            heroBuilds: true,
          }
        }
      }
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    return user;
  }

  async updateProfile(userId: string, data: { username?: string; avatar?: string }) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    // Check if username is already taken
    if (data.username && data.username !== user.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username: data.username }
      });

      if (existingUser) {
        throw createError('Username already taken', 409);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        avatar: true,
        updatedAt: true,
      }
    });

    return updatedUser;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw createError('Current password is incorrect', 400);
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      throw createError(passwordValidation.errors.join(', '), 400);
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    return { message: 'Password updated successfully' };
  }

  async logout(userId: string, token: string) {
    // In a more sophisticated implementation, you might want to blacklist the token
    // For now, we'll just return success
    return { message: 'Logged out successfully' };
  }
}