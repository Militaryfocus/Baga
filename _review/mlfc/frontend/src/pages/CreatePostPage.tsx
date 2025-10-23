import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { usePosts } from '../hooks/usePosts';
import { useHeroes } from '../hooks/useHeroes';
import LoadingSpinner from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorBoundary';
import { postValidation, validateForm, hasValidationErrors } from '../utils/validation';
import { ArrowLeft, Plus, X } from 'lucide-react';

interface CreatePostForm {
  title: string;
  content: string;
  category: string;
  heroId: string;
  tags: string[];
}

const CreatePostPage = () => {
  const [newTag, setNewTag] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { createPost, isLoading, error } = usePosts();
  const { heroes, fetchHeroes } = useHeroes();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreatePostForm>({
    defaultValues: {
      category: 'DISCUSSION',
      tags: [],
    },
  });

  const watchedTags = watch('tags');

  const categories = [
    { value: 'GUIDES', label: 'Guides' },
    { value: 'NEWS', label: 'News' },
    { value: 'FANART', label: 'Fan Art' },
    { value: 'GAMEPLAY', label: 'Gameplay' },
    { value: 'DISCUSSION', label: 'Discussion' },
    { value: 'MEMES', label: 'Memes' },
  ];

  const onSubmit = async (data: CreatePostForm) => {
    try {
      await createPost(data).unwrap();
      navigate('/posts');
    } catch (error) {
      // Error is handled by the posts slice
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !watchedTags.includes(newTag.trim())) {
      setValue('tags', [...watchedTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue('tags', watchedTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Post</h1>
          <p className="text-gray-600 dark:text-gray-400">Share your Mobile Legends knowledge with the community</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Post Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                {...register('title', { required: 'Title is required' })}
                type="text"
                placeholder="Enter a compelling title..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <select
                {...register('category', { required: 'Category is required' })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hero (Optional)
              </label>
              <select
                {...register('heroId')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a hero...</option>
                {heroes.map((hero) => (
                  <option key={hero.id} value={hero.id}>
                    {hero.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Content</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Post Content *
            </label>
            <textarea
              {...register('content', { required: 'Content is required' })}
              rows={12}
              placeholder="Write your post content here... You can use markdown formatting."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.content.message}</p>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Tags</h2>
          
          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {watchedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {watchedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              'Create Post'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePostPage;