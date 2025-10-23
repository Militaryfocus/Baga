import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic request methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.api.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.api.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.api.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.api.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  // Auth methods
  async login(email: string, password: string) {
    return this.post('/auth/login', { email, password });
  }

  async register(email: string, username: string, password: string) {
    return this.post('/auth/register', { email, username, password });
  }

  async getProfile() {
    return this.get('/auth/profile');
  }

  async updateProfile(data: { username?: string; avatar?: string }) {
    return this.put('/auth/profile', data);
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.put('/auth/change-password', { currentPassword, newPassword });
  }

  async logout() {
    return this.post('/auth/logout');
  }

  // Post methods
  async getPosts(filters?: any, pagination?: any) {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }

    if (pagination) {
      Object.entries(pagination).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    return this.get(`/posts?${params.toString()}`);
  }

  async getPostById(id: string) {
    return this.get(`/posts/${id}`);
  }

  async createPost(data: any) {
    return this.post('/posts', data);
  }

  async updatePost(id: string, data: any) {
    return this.put(`/posts/${id}`, data);
  }

  async deletePost(id: string) {
    return this.delete(`/posts/${id}`);
  }

  async likePost(id: string) {
    return this.post(`/posts/${id}/like`);
  }

  async getTrendingPosts(limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    return this.get(`/posts/trending${params}`);
  }

  // Hero methods
  async getHeroes(filters?: any, pagination?: any) {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }

    if (pagination) {
      Object.entries(pagination).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    return this.get(`/heroes?${params.toString()}`);
  }

  async getHeroById(id: string) {
    return this.get(`/heroes/${id}`);
  }

  async getHeroBySlug(slug: string) {
    return this.get(`/heroes/slug/${slug}`);
  }

  async searchHeroes(query: string, limit?: number) {
    const params = new URLSearchParams();
    params.append('q', query);
    if (limit) params.append('limit', String(limit));
    return this.get(`/heroes/search?${params.toString()}`);
  }

  async getHeroRoles() {
    return this.get('/heroes/roles');
  }

  async getHeroDifficulties() {
    return this.get('/heroes/difficulties');
  }

  async getPopularHeroes(limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    return this.get(`/heroes/popular${params}`);
  }
}

export const apiService = new ApiService();
export default apiService;