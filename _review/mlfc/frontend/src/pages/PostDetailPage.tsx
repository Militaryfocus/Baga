import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePosts } from '../hooks/usePosts';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import { Heart, MessageCircle, Eye, Calendar, User, Edit, Trash2 } from 'lucide-react';
import { formatRelativeTime } from '../utils/format';

const PostDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { currentPost, isLoading, fetchPostById, likePost } = usePosts();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (id) {
      fetchPostById(id);
    }
  }, [id, fetchPostById]);

  const handleLike = async () => {
    if (currentPost && isAuthenticated) {
      await likePost(currentPost.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentPost) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Post not found
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The post you're looking for doesn't exist or has been deleted.
        </p>
        <Link
          to="/posts"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Browse Posts
        </Link>
      </div>
    );
  }

  const categoryColors = {
    GUIDES: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    NEWS: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    FANART: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    GAMEPLAY: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    DISCUSSION: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    MEMES: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  };

  const isAuthor = user?.id === currentPost.authorId;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Post Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {currentPost.author.avatar ? (
              <img
                src={currentPost.author.avatar}
                alt={currentPost.author.username}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {currentPost.author.username}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {formatRelativeTime(currentPost.createdAt)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${categoryColors[currentPost.category]}`}>
              {currentPost.category}
            </span>
            {isAuthor && (
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Hero info */}
        {currentPost.hero && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              {currentPost.hero.avatar && (
                <img
                  src={currentPost.hero.avatar}
                  alt={currentPost.hero.name}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {currentPost.hero.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Hero Discussion
                </p>
              </div>
            </div>
          </div>
        )}

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {currentPost.title}
        </h1>

        {/* Tags */}
        {currentPost.tags && currentPost.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {currentPost.tags.map((tag) => (
              <span
                key={tag.tag.id}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
              >
                #{tag.tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Eye className="h-4 w-4" />
            <span>{currentPost.viewCount} views</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageCircle className="h-4 w-4" />
            <span>{currentPost._count.comments} comments</span>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
            {currentPost.content}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handleLike}
            disabled={!isAuthenticated}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Heart className="h-4 w-4" />
            <span>{currentPost._count.likes} likes</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <button className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Share
            </button>
            <button className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Comments ({currentPost._count.comments})
        </h2>
        
        {isAuthenticated ? (
          <div className="mb-6">
            <textarea
              placeholder="Write a comment..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
            <div className="flex justify-end mt-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Post Comment
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please log in to leave a comment
            </p>
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login
            </Link>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {currentPost.comments.map((comment) => (
            <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
              <div className="flex items-start space-x-3">
                {comment.author.avatar ? (
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.username}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {comment.author.username}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatRelativeTime(comment.createdAt)}
                    </p>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <button className="hover:text-red-500 dark:hover:text-red-400 transition-colors">
                      Like ({comment._count.likes})
                    </button>
                    <button className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;