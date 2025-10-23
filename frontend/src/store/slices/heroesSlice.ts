import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Hero, HeroFilters, PaginationQuery } from '../../types';
import { apiService } from '../../services/api';

interface HeroesState {
  heroes: Hero[];
  currentHero: Hero | null;
  popularHeroes: Hero[];
  roles: Array<{ role: string; count: number }>;
  difficulties: Array<{ difficulty: number; count: number }>;
  filters: HeroFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: HeroesState = {
  heroes: [],
  currentHero: null,
  popularHeroes: [],
  roles: [],
  difficulties: [],
  filters: {},
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchHeroes = createAsyncThunk(
  'heroes/fetchHeroes',
  async (params: { filters?: HeroFilters; pagination?: PaginationQuery } = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getHeroes(params.filters, params.pagination);
      if (response.success && response.data) {
        return {
          heroes: response.data,
          pagination: response.pagination || initialState.pagination,
        };
      }
      throw new Error(response.error || 'Failed to fetch heroes');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchHeroById = createAsyncThunk(
  'heroes/fetchHeroById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getHeroById(id);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch hero');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchHeroBySlug = createAsyncThunk(
  'heroes/fetchHeroBySlug',
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getHeroBySlug(slug);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch hero');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const searchHeroes = createAsyncThunk(
  'heroes/searchHeroes',
  async ({ query, limit }: { query: string; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await apiService.searchHeroes(query, limit);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to search heroes');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchHeroRoles = createAsyncThunk(
  'heroes/fetchHeroRoles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getHeroRoles();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch hero roles');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchHeroDifficulties = createAsyncThunk(
  'heroes/fetchHeroDifficulties',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getHeroDifficulties();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch hero difficulties');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchPopularHeroes = createAsyncThunk(
  'heroes/fetchPopularHeroes',
  async (limit: number | undefined, { rejectWithValue }) => {
    try {
      const response = await apiService.getPopularHeroes(limit);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch popular heroes');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const heroesSlice = createSlice({
  name: 'heroes',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<HeroFilters>) => {
      state.filters = action.payload;
    },
    setPagination: (state, action: PayloadAction<Partial<PaginationQuery>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentHero: (state) => {
      state.currentHero = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Heroes
      .addCase(fetchHeroes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHeroes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.heroes = action.payload.heroes;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchHeroes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Hero by ID
      .addCase(fetchHeroById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHeroById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentHero = action.payload;
        state.error = null;
      })
      .addCase(fetchHeroById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Hero by Slug
      .addCase(fetchHeroBySlug.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHeroBySlug.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentHero = action.payload;
        state.error = null;
      })
      .addCase(fetchHeroBySlug.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Search Heroes
      .addCase(searchHeroes.fulfilled, (state, action) => {
        state.heroes = action.payload;
      })
      // Fetch Hero Roles
      .addCase(fetchHeroRoles.fulfilled, (state, action) => {
        state.roles = action.payload;
      })
      // Fetch Hero Difficulties
      .addCase(fetchHeroDifficulties.fulfilled, (state, action) => {
        state.difficulties = action.payload;
      })
      // Fetch Popular Heroes
      .addCase(fetchPopularHeroes.fulfilled, (state, action) => {
        state.popularHeroes = action.payload;
      });
  },
});

export const { setFilters, setPagination, clearError, clearCurrentHero } = heroesSlice.actions;
export default heroesSlice.reducer;