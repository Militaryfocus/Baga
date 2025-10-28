export interface User {
  id: string;
  email: string;
  username: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    posts: number;
    comments: number;
    heroBuilds: number;
  };
}

export interface Post {
  id: string;
  title: string;
  content: string;
  category: 'GUIDES' | 'NEWS' | 'FANART' | 'GAMEPLAY' | 'DISCUSSION' | 'MEMES';
  authorId: string;
  heroId?: string;
  isPublished: boolean;
  isPinned: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  hero?: {
    id: string;
    name: string;
    avatar?: string;
  };
  tags: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
      color?: string;
    };
  }>;
  comments: Comment[];
  _count: {
    comments: number;
    likes: number;
  };
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  parentId?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  replies: Comment[];
  _count: {
    likes: number;
    replies: number;
  };
}

export interface Hero {
  id: string;
  name: string;
  slug: string;
  description: string;
  role: 'TANK' | 'FIGHTER' | 'ASSASSIN' | 'MAGE' | 'MARKSMAN' | 'SUPPORT';
  difficulty: number;
  avatar?: string;
  banner?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  health: number;
  mana: number;
  physicalAttack: number;
  physicalDefense: number;
  magicPower: number;
  magicResistance: number;
  speed: number;
  attackSpeed: number;
  abilities: HeroAbility[];
  tags: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
      color?: string;
    };
  }>;
  builds: HeroBuild[];
  posts: Post[];
  _count: {
    posts: number;
    builds: number;
  };
}

export interface HeroAbility {
  id: string;
  heroId: string;
  name: string;
  description: string;
  cooldown?: number;
  manaCost?: number;
  damage?: string;
  type: 'Passive' | 'Active' | 'Ultimate';
  level: number;
  icon?: string;
}

export interface HeroBuild {
  id: string;
  heroId: string;
  authorId: string;
  title: string;
  description: string;
  type: 'DAMAGE' | 'TANK' | 'SUPPORT' | 'HYBRID';
  items: string[];
  emblem?: string;
  isPublic: boolean;
  likes: number;
  createdAt: string;
  updatedAt: string;
  hero: Hero;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color?: string;
  createdAt: string;
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