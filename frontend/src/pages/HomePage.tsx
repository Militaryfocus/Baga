import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Users, Star, ArrowRight } from 'lucide-react';
import { usePosts } from '../hooks/usePosts';
import { useHeroes } from '../hooks/useHeroes';
import PostCard from '../components/PostCard';
import HeroCard from '../components/HeroCard';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage = () => {
  const { trendingPosts, fetchTrendingPosts, isLoading: postsLoading } = usePosts();
  const { popularHeroes, fetchPopularHeroes, isLoading: heroesLoading } = useHeroes();

  useEffect(() => {
    fetchTrendingPosts(6);
    fetchPopularHeroes(6);
  }, [fetchTrendingPosts, fetchPopularHeroes]);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Mobile Legends Fan Community
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Connect with players, share strategies, and discover the best heroes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/posts"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Explore Posts
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              to="/heroes"
              className="inline-flex items-center px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
            >
              Browse Heroes
              <Users className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Posts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">1,234</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Community Members</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">5,678</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Heroes Available</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">120+</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Posts */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Trending Posts
          </h2>
          <Link
            to="/posts"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            View all
          </Link>
        </div>

        {postsLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      {/* Popular Heroes */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Popular Heroes
          </h2>
          <Link
            to="/heroes"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            View all
          </Link>
        </div>

        {heroesLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularHeroes.map((hero) => (
              <HeroCard key={hero.id} hero={hero} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;