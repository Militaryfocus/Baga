import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Post, PostFilters, PaginationQuery, CreatePostRequest } from '../../types';
import { apiService } from '../../services/api';

interface PostsState {
  posts: Post[];
  currentPost: Post | null;
  trendingPosts: Post[];
  filters: PostFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: PostsState = {
  posts: [],
  currentPost: null,
  trendingPosts: [],
  filters: {},
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (params: { filters?: PostFilters; pagination?: PaginationQuery } = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getPosts(params.filters, params.pagination);
      if (response.success && response.data) {
        return {
          posts: response.data,
          pagination: response.pagination || initialState.pagination,
        };
      }
      throw new Error(response.error || 'Failed to fetch posts');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchPostById = createAsyncThunk(
  'posts/fetchPostById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getPostById(id);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch post');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData: CreatePostRequest, { rejectWithValue }) => {
    try {
      const response = await apiService.createPost(postData);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to create post');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ id, data }: { id: string; data: Partial<CreatePostRequest> }, { rejectWithValue }) => {
    try {
      const response = await apiService.updatePost(id, data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to update post');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.deletePost(id);
      if (response.success) {
        return id;
      }
      throw new Error(response.error || 'Failed to delete post');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const likePost = createAsyncThunk(
  'posts/likePost',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.likePost(id);
      if (response.success && response.data) {
        return { id, liked: response.data.liked };
      }
      throw new Error(response.error || 'Failed to like post');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchTrendingPosts = createAsyncThunk(
  'posts/fetchTrendingPosts',
  async (limit?: number, { rejectWithValue }) => {
    try {
      const response = await apiService.getTrendingPosts(limit);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch trending posts');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<PostFilters>) => {
      state.filters = action.payload;
    },
    setPagination: (state, action: PayloadAction<Partial<PaginationQuery>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Posts
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload.posts;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Post by ID
      .addCase(fetchPostById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPost = action.payload;
        state.error = null;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Post
      .addCase(createPost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts.unshift(action.payload);
        state.error = null;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Post
      .addCase(updatePost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.posts.findIndex(post => post.id === action.payload.id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
        if (state.currentPost?.id === action.payload.id) {
          state.currentPost = action.payload;
        }
        state.error = null;
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete Post
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(post => post.id !== action.payload);
        if (state.currentPost?.id === action.payload) {
          state.currentPost = null;
        }
      })
      // Like Post
      .addCase(likePost.fulfilled, (state, action) => {
        const { id, liked } = action.payload;
        const post = state.posts.find(p => p.id === id);
        if (post) {
          post._count.likes += liked ? 1 : -1;
        }
        if (state.currentPost?.id === id) {
          state.currentPost._count.likes += liked ? 1 : -1;
        }
      })
      // Fetch Trending Posts
      .addCase(fetchTrendingPosts.fulfilled, (state, action) => {
        state.trendingPosts = action.payload;
      });
  },
});

export const { setFilters, setPagination, clearError, clearCurrentPost } = postsSlice.actions;
export default postsSlice.reducer;