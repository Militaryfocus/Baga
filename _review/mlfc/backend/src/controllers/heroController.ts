import { Request, Response, NextFunction } from 'express';
import { HeroService } from '../services/heroService';
import { ApiResponse } from '../types';

const heroService = new HeroService();

export class HeroController {
  async getHeroes(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        role: req.query.role as string,
        difficulty: req.query.difficulty ? parseInt(req.query.difficulty as string) : undefined,
        search: req.query.search as string,
        tags: req.query.tags ? (req.query.tags as string).split(',') : []
      };

      const pagination = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        sortBy: req.query.sortBy as string || 'name',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc'
      };

      const result = await heroService.getHeroes(filters, pagination);
      
      const response: ApiResponse = {
        success: true,
        data: result.heroes,
        pagination: result.pagination
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getHeroById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const hero = await heroService.getHeroById(id);
      
      const response: ApiResponse = {
        success: true,
        data: hero
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getHeroBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const hero = await heroService.getHeroBySlug(slug);
      
      const response: ApiResponse = {
        success: true,
        data: hero
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getHeroRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await heroService.getHeroRoles();
      
      const response: ApiResponse = {
        success: true,
        data: roles
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getHeroDifficulties(req: Request, res: Response, next: NextFunction) {
    try {
      const difficulties = await heroService.getHeroDifficulties();
      
      const response: ApiResponse = {
        success: true,
        data: difficulties
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getPopularHeroes(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const heroes = await heroService.getPopularHeroes(limit);
      
      const response: ApiResponse = {
        success: true,
        data: heroes
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async searchHeroes(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
      }

      const heroes = await heroService.searchHeroes(q as string, limit);
      
      const response: ApiResponse = {
        success: true,
        data: heroes
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}