import { Link } from 'react-router-dom';
import { Star, Users, FileText } from 'lucide-react';
import { Hero } from '../types';
import { cn } from '../utils/cn';

interface HeroCardProps {
  hero: Hero;
  className?: string;
}

const HeroCard = ({ hero, className }: HeroCardProps) => {
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
        'h-3 w-3',
        i < hero.difficulty ? 'fill-current' : 'text-gray-300 dark:text-gray-600',
        `difficulty-${hero.difficulty}`
      )}
    />
  ));

  return (
    <Link
      to={`/heroes/${hero.slug}`}
      className={cn(
        'group bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-200 hover:scale-105',
        className
      )}
    >
      <div className="relative">
        {hero.banner ? (
          <img
            src={hero.banner}
            alt={hero.name}
            className="w-full h-32 object-cover"
          />
        ) : (
          <div className="w-full h-32 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
            {hero.avatar ? (
              <img
                src={hero.avatar}
                alt={hero.name}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                  {hero.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
        )}
        
        {/* Role badge */}
        <div className="absolute top-2 left-2">
          <span className={cn('px-2 py-1 text-xs font-medium rounded-full', roleColors[hero.role])}>
            {hero.role}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {hero.name}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {hero.description}
        </p>

        {/* Difficulty */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">Difficulty:</span>
            <div className="flex">{difficultyStars}</div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <FileText className="h-3 w-3" />
            <span>{hero._count.posts} posts</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-3 w-3" />
            <span>{hero._count.builds} builds</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default HeroCard;