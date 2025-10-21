import prisma from '../config/database';
import { HeroFilters, PaginationQuery } from '../types';
import { createError } from '../middleware/errorHandler';

export class HeroService {
  async getHeroes(filters: HeroFilters = {}, pagination: PaginationQuery = {}) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'name',
      sortOrder = 'asc'
    } = pagination;

    const {
      role,
      difficulty,
      search,
      tags = []
    } = filters;

    const where: any = {
      isActive: true
    };

    if (role) {
      where.role = role;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
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

    const [heroes, total] = await Promise.all([
      prisma.hero.findMany({
        where,
        include: {
          abilities: {
            orderBy: { level: 'asc' }
          },
          tags: {
            include: {
              tag: true
            }
          },
          _count: {
            select: {
              posts: true,
              builds: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.hero.count({ where })
    ]);

    return {
      heroes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getHeroById(id: string) {
    const hero = await prisma.hero.findUnique({
      where: { id },
      include: {
        abilities: {
          orderBy: { level: 'asc' }
        },
        tags: {
          include: {
            tag: true
          }
        },
        builds: {
          where: { isPublic: true },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          },
          orderBy: { likes: 'desc' },
          take: 10
        },
        posts: {
          where: { isPublished: true },
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
                comments: true,
                likes: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        _count: {
          select: {
            posts: true,
            builds: true
          }
        }
      }
    });

    if (!hero) {
      throw createError('Hero not found', 404);
    }

    return hero;
  }

  async getHeroBySlug(slug: string) {
    const hero = await prisma.hero.findUnique({
      where: { slug },
      include: {
        abilities: {
          orderBy: { level: 'asc' }
        },
        tags: {
          include: {
            tag: true
          }
        },
        builds: {
          where: { isPublic: true },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          },
          orderBy: { likes: 'desc' },
          take: 10
        },
        posts: {
          where: { isPublished: true },
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
                comments: true,
                likes: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        _count: {
          select: {
            posts: true,
            builds: true
          }
        }
      }
    });

    if (!hero) {
      throw createError('Hero not found', 404);
    }

    return hero;
  }

  async getHeroRoles() {
    const roles = await prisma.hero.groupBy({
      by: ['role'],
      _count: {
        role: true
      },
      orderBy: {
        _count: {
          role: 'desc'
        }
      }
    });

    return roles.map(role => ({
      role: role.role,
      count: role._count.role
    }));
  }

  async getHeroDifficulties() {
    const difficulties = await prisma.hero.groupBy({
      by: ['difficulty'],
      _count: {
        difficulty: true
      },
      orderBy: {
        difficulty: 'asc'
      }
    });

    return difficulties.map(diff => ({
      difficulty: diff.difficulty,
      count: diff._count.difficulty
    }));
  }

  async getPopularHeroes(limit: number = 10) {
    const heroes = await prisma.hero.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            posts: true,
            builds: true
          }
        }
      },
      orderBy: [
        { posts: { _count: 'desc' } },
        { builds: { _count: 'desc' } }
      ],
      take: limit
    });

    return heroes;
  }

  async searchHeroes(query: string, limit: number = 10) {
    const heroes = await prisma.hero.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        _count: {
          select: {
            posts: true,
            builds: true
          }
        }
      },
      orderBy: { name: 'asc' },
      take: limit
    });

    return heroes;
  }
}