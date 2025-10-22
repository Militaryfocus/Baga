import { Request } from 'express';
import { UserRole } from '@prisma/client';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  isActive: boolean;
  avatar: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: UserProfile;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  category: string;
  heroId?: string;
  tags?: string[];
}

export interface CreateCommentRequest {
  content: string;
  postId: string;
  parentId?: string;
}

export interface CreateHeroBuildRequest {
  heroId: string;
  title: string;
  description: string;
  type: string;
  items: string[];
  emblem?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PostFilters {
  category?: string;
  heroId?: string;
  authorId?: string;
  search?: string;
  tags?: string[];
}

export interface HeroFilters {
  role?: string;
  difficulty?: number;
  search?: string;
  tags?: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

export interface NotificationData {
  title: string;
  message: string;
  type: 'LIKE' | 'COMMENT' | 'MENTION' | 'SYSTEM';
  data?: any;
}

export interface ReportRequest {
  postId?: string;
  commentId?: string;
  reason: string;
  description?: string;
}