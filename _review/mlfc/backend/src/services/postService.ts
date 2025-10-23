import prisma from '../config/database';
import { CreatePostRequest, PostFilters, PaginationQuery } from '../types';
import { createError } from '../middleware/errorHandler';
import { CacheService } from './cacheService';

export class PostService {
  private cache = new CacheService();

  async createPost(authorId: string, data: CreatePostRequest) {
    const { title, content, category, heroId, tags = [] } = data;

    // Validate hero exists if provided
    if (heroId) {
      const hero = await prisma.hero.findUnique({
        where: { id: heroId }
      });

      if (!hero) {
        throw createError('Hero not found', 404);
      }
    }

    // Create post
    const post = await prisma.post.create({
      data: {
        title,
        content,
        category: category as any,
        authorId,
        heroId,
        tags: {
          create: tags.map(tagName => ({
            tag: {
              connectOrCreate: {
                where: { name: tagName },
                create: { name: tagName, slug: tagName.toLowerCase().replace(/\s+/g, '-') }
              }
            }
          }))
        }
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        hero: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        },
        _count: {
          select: {
            comments: true,
            likes: true
          }
        }
      }
    });

    return post;
  }

  async getPosts(filters: PostFilters = {}, pagination: PaginationQuery = {}) {
    const cacheKey = CacheService.getPostsKey(filters, pagination);
    
    // Try to get from cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = pagination;

    const {
      category,
      heroId,
      authorId,
      search,
      tags = []
    } = filters;

    const where: any = {
      isPublished: true
    };

    if (category) {
      where.category = category;
    }

    if (heroId) {
      where.heroId = heroId;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (tags.length > 0) {
      where.tags = {
        some: {
          tag: {
            name: { in: tags }
          }
        }
      };
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          },
          hero: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          tags: {
            include: {
              tag: true
            }
          },
          _count: {
            select: {
              comments: true,
              likes: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.post.count({ where })
    ]);

    const result = {
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

    // Cache the result for 2 minutes
    await this.cache.set(cacheKey, result, 120);
    
    return result;
  }

  async getPostById(id: string) {
    const cacheKey = CacheService.getPostKey(id);
    
    // Try to get from cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        hero: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        },
        comments: {
          where: { isDeleted: false },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            },
            _count: {
              select: {
                likes: true,
                replies: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: {
            comments: true,
            likes: true
          }
        }
      }
    });

    if (!post) {
      throw createError('Post not found', 404);
    }

    // Increment view count
    await prisma.post.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    });

    return post;
  }

  async updatePost(id: string, authorId: string, data: Partial<CreatePostRequest>) {
    const post = await prisma.post.findUnique({
      where: { id }
    });

    if (!post) {
      throw createError('Post not found', 404);
    }

    if (post.authorId !== authorId) {
      throw createError('Not authorized to update this post', 403);
    }

    const updateData: any = {};

    if (data.title) updateData.title = data.title;
    if (data.content) updateData.content = data.content;
    if (data.category) updateData.category = data.category;
    if (data.heroId !== undefined) updateData.heroId = data.heroId;

    const updatedPost = await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        hero: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        },
        _count: {
          select: {
            comments: true,
            likes: true
          }
        }
      }
    });

    return updatedPost;
  }

  async deletePost(id: string, authorId: string) {
    const post = await prisma.post.findUnique({
      where: { id }
    });

    if (!post) {
      throw createError('Post not found', 404);
    }

    if (post.authorId !== authorId) {
      throw createError('Not authorized to delete this post', 403);
    }

    await prisma.post.delete({
      where: { id }
    });

    return { message: 'Post deleted successfully' };
  }

  async likePost(postId: string, userId: string) {
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      throw createError('Post not found', 404);
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId
        }
      }
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { id: existingLike.id }
      });

      return { liked: false, message: 'Post unliked' };
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId,
          postId
        }
      });

      return { liked: true, message: 'Post liked' };
    }
  }

  async getTrendingPosts(limit: number = 10) {
    const cacheKey = CacheService.getTrendingPostsKey(limit);
    
    // Try to get from cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const posts = await prisma.post.findMany({
      where: {
        isPublished: true,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        hero: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        _count: {
          select: {
            comments: true,
            likes: true
          }
        }
      },
      orderBy: [
        { likes: { _count: 'desc' } },
        { comments: { _count: 'desc' } },
        { viewCount: 'desc' }
      ],
      take: limit
    });

    // Cache the result for 5 minutes
    await this.cache.set(cacheKey, posts, 300);
    
    return posts;
  }

  // Cache invalidation methods
  async invalidatePostCache(postId?: string) {
    if (postId) {
      await this.cache.del(CacheService.getPostKey(postId));
    }
    // Invalidate lists
    await this.cache.delPattern('posts:*');
    await this.cache.delPattern('posts:trending:*');
  }
}