import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useHeroes } from '../hooks/useHeroes';
import LoadingSpinner from '../components/LoadingSpinner';
import { Star, Heart, MessageCircle, FileText, Users } from 'lucide-react';
import { cn } from '../utils/cn';

const HeroDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { currentHero, isLoading, fetchHeroBySlug } = useHeroes();

  useEffect(() => {
    if (slug) {
      fetchHeroBySlug(slug);
    }
  }, [slug, fetchHeroBySlug]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentHero) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Hero not found
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The hero you're looking for doesn't exist.
        </p>
        <Link
          to="/heroes"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Browse Heroes
        </Link>
      </div>
    );
  }

  const roleColors = {
    TANK: 'role-tank',
    FIGHTER: 'role-fighter',
    ASSASSIN: 'role-assassin',
    MAGE: 'role-mage',
    MARKSMAN: 'role-marksman',
    SUPPORT: 'role-support',
  };

  const difficultyStars = Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={cn(
        'h-4 w-4',
        i < currentHero.difficulty ? 'fill-current' : 'text-gray-300 dark:text-gray-600',
        `difficulty-${currentHero.difficulty}`
      )}
    />
  ));

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
          {currentHero.avatar && (
            <img
              src={currentHero.avatar}
              alt={currentHero.name}
              className="w-24 h-24 rounded-full border-4 border-white/20"
            />
          )}
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold mb-2">{currentHero.name}</h1>
            <div className="flex items-center justify-center md:justify-start space-x-4 mb-4">
              <span className={cn('px-3 py-1 text-sm font-medium rounded-full', roleColors[currentHero.role])}>
                {currentHero.role}
              </span>
              <div className="flex items-center space-x-1">
                <span className="text-sm">Difficulty:</span>
                <div className="flex">{difficultyStars}</div>
              </div>
            </div>
            <p className="text-lg text-blue-100 max-w-2xl">
              {currentHero.description}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{currentHero.health}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Health</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{currentHero.mana}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Mana</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{currentHero.physicalAttack}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Physical Attack</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{currentHero.magicPower}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Magic Power</div>
        </div>
      </div>

      {/* Abilities */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Abilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentHero.abilities.map((ability) => (
            <div key={ability.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{ability.name}</h3>
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                  {ability.type}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-3">{ability.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                {ability.cooldown && (
                  <span>Cooldown: {ability.cooldown}s</span>
                )}
                {ability.manaCost && (
                  <span>Mana: {ability.manaCost}</span>
                )}
                {ability.damage && (
                  <span>Damage: {ability.damage}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Posts */}
      {currentHero.posts && currentHero.posts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Posts</h2>
            <Link
              to={`/posts?heroId=${currentHero.id}`}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {currentHero.posts.map((post) => (
              <div key={post.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  {post.author.avatar ? (
                    <img
                      src={post.author.avatar}
                      alt={post.author.username}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {post.author.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{post.author.username}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{post.category}</p>
                  </div>
                </div>
                <Link
                  to={`/posts/${post.id}`}
                  className="block hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{post.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{post.content}</p>
                </Link>
                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Heart className="h-4 w-4" />
                    <span>{post._count.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{post._count.comments}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hero Builds */}
      {currentHero.builds && currentHero.builds.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Popular Builds</h2>
            <Link
              to={`/heroes/${currentHero.slug}/builds`}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentHero.builds.map((build) => (
              <div key={build.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{build.title}</h3>
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                    {build.type}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{build.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Heart className="h-4 w-4" />
                    <span>{build.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{build.author.username}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroDetailPage;