import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Eye, Calendar } from 'lucide-react';
import { Post } from '../types';
import { formatRelativeTime } from '../utils/format';
import { cn } from '../utils/cn';

interface PostCardProps {
  post: Post;
  className?: string;
}

const PostCard = ({ post, className }: PostCardProps) => {
  const categoryColors = {
    GUIDES: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    NEWS: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    FANART: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    GAMEPLAY: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    DISCUSSION: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    MEMES: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  };

  return (
    <article className={cn('bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow', className)}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {post.author.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.username}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {post.author.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {post.author.username}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {formatRelativeTime(post.createdAt)}
              </p>
            </div>
          </div>
          
          <span className={cn('px-2 py-1 text-xs font-medium rounded-full', categoryColors[post.category])}>
            {post.category}
          </span>
        </div>

        {/* Hero info */}
        {post.hero && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              {post.hero.avatar && (
                <img
                  src={post.hero.avatar}
                  alt={post.hero.name}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {post.hero.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Hero Discussion
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <Link to={`/posts/${post.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {post.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
            {post.content}
          </p>
        </Link>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.tag.id}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
              >
                #{tag.tag.name}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                +{post.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
              <Heart className="h-4 w-4" />
              <span className="text-sm">{post._count.likes}</span>
            </button>
            <Link
              to={`/posts/${post.id}`}
              className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">{post._count.comments}</span>
            </Link>
            <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
              <Eye className="h-4 w-4" />
              <span className="text-sm">{post.viewCount}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PostCard;