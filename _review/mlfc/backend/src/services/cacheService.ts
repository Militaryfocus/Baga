import { getRedisClient } from '../config/redis';

export class CacheService {
  private redis = getRedisClient();

  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    try {
      await this.redis.setEx(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(keys);
      }
    } catch (error) {
      console.error('Cache delete pattern error:', error);
    }
  }

  // Cache key generators
  static getHeroesKey(filters: any, pagination: any): string {
    const filterStr = JSON.stringify(filters);
    const paginationStr = JSON.stringify(pagination);
    return `heroes:${Buffer.from(filterStr + paginationStr).toString('base64')}`;
  }

  static getHeroKey(id: string): string {
    return `hero:${id}`;
  }

  static getHeroSlugKey(slug: string): string {
    return `hero:slug:${slug}`;
  }

  static getPostsKey(filters: any, pagination: any): string {
    const filterStr = JSON.stringify(filters);
    const paginationStr = JSON.stringify(pagination);
    return `posts:${Buffer.from(filterStr + paginationStr).toString('base64')}`;
  }

  static getPostKey(id: string): string {
    return `post:${id}`;
  }

  static getPopularHeroesKey(limit: number): string {
    return `heroes:popular:${limit}`;
  }

  static getTrendingPostsKey(limit: number): string {
    return `posts:trending:${limit}`;
  }

  static getSearchKey(type: string, query: string, limit: number): string {
    return `${type}:search:${Buffer.from(query).toString('base64')}:${limit}`;
  }
}