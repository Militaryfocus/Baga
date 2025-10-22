import { Request, Response, NextFunction } from 'express';
import { PostService } from '../services/postService';
import { ApiResponse } from '../types';

const postService = new PostService();

export class PostController {
  async createPost(req: Request, res: Response, next: NextFunction) {
    try {
      const authorId = (req as any).user.id;
      const post = await postService.createPost(authorId, req.body);
      
      const response: ApiResponse = {
        success: true,
        data: post,
        message: 'Post created successfully'
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        category: (req.query as any)['category'] as string | undefined,
        heroId: (req.query as any)['heroId'] as string | undefined,
        authorId: (req.query as any)['authorId'] as string | undefined,
        search: (req.query as any)['search'] as string | undefined,
        tags: (req.query as any)['tags'] ? ((req.query as any)['tags'] as string).split(',') : []
      } as const;

      const pagination = {
        page: parseInt((req.query as any)['page'] as string) || 1,
        limit: parseInt((req.query as any)['limit'] as string) || 10,
        sortBy: ((req.query as any)['sortBy'] as string) || 'createdAt',
        sortOrder: (((req.query as any)['sortOrder'] as 'asc' | 'desc') || 'desc') as 'asc' | 'desc',
      } as const;

      const result = await postService.getPosts(filters, pagination);
      
      const response: ApiResponse = {
        success: true,
        data: result.posts,
        pagination: result.pagination
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getPostById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const post = await postService.getPostById(id);
      
      const response: ApiResponse = {
        success: true,
        data: post
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async updatePost(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const authorId = (req as any).user.id;
      const post = await postService.updatePost(id, authorId, req.body);
      
      const response: ApiResponse = {
        success: true,
        data: post,
        message: 'Post updated successfully'
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async deletePost(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const authorId = (req as any).user.id;
      const result = await postService.deletePost(id, authorId);
      
      const response: ApiResponse = {
        success: true,
        data: result
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async likePost(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      const result = await postService.likePost(id, userId);
      
      const response: ApiResponse = {
        success: true,
        data: result
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getTrendingPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const posts = await postService.getTrendingPosts(limit);
      
      const response: ApiResponse = {
        success: true,
        data: posts
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}