import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { 
  fetchPosts, 
  fetchPostById, 
  createPost, 
  updatePost, 
  deletePost, 
  likePost,
  fetchTrendingPosts,
  setFilters,
  setPagination,
  clearError,
  clearCurrentPost
} from '../store/slices/postsSlice';
import { useCallback } from 'react';

export const usePosts = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    posts, 
    currentPost, 
    trendingPosts, 
    filters, 
    pagination, 
    isLoading, 
    error 
  } = useSelector((state: RootState) => state.posts);

  const handleFetchPosts = useCallback(
    (params?: { filters?: any; pagination?: any }) => {
      return dispatch(fetchPosts(params));
    },
    [dispatch]
  );

  const handleFetchPostById = useCallback(
    (id: string) => {
      return dispatch(fetchPostById(id));
    },
    [dispatch]
  );

  const handleCreatePost = useCallback(
    (postData: any) => {
      return dispatch(createPost(postData));
    },
    [dispatch]
  );

  const handleUpdatePost = useCallback(
    (id: string, data: any) => {
      return dispatch(updatePost({ id, data }));
    },
    [dispatch]
  );

  const handleDeletePost = useCallback(
    (id: string) => {
      return dispatch(deletePost(id));
    },
    [dispatch]
  );

  const handleLikePost = useCallback(
    (id: string) => {
      return dispatch(likePost(id));
    },
    [dispatch]
  );

  const handleFetchTrendingPosts = useCallback(
    (limit?: number) => {
      return dispatch(fetchTrendingPosts(limit));
    },
    [dispatch]
  );

  const handleSetFilters = useCallback(
    (newFilters: any) => {
      dispatch(setFilters(newFilters));
    },
    [dispatch]
  );

  const handleSetPagination = useCallback(
    (newPagination: any) => {
      dispatch(setPagination(newPagination));
    },
    [dispatch]
  );

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleClearCurrentPost = useCallback(() => {
    dispatch(clearCurrentPost());
  }, [dispatch]);

  return {
    posts,
    currentPost,
    trendingPosts,
    filters,
    pagination,
    isLoading,
    error,
    fetchPosts: handleFetchPosts,
    fetchPostById: handleFetchPostById,
    createPost: handleCreatePost,
    updatePost: handleUpdatePost,
    deletePost: handleDeletePost,
    likePost: handleLikePost,
    fetchTrendingPosts: handleFetchTrendingPosts,
    setFilters: handleSetFilters,
    setPagination: handleSetPagination,
    clearError: handleClearError,
    clearCurrentPost: handleClearCurrentPost,
  };
};