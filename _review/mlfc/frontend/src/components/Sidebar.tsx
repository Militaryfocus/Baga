import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Users, TrendingUp, Star, Settings } from 'lucide-react';
import { useUI } from '../hooks/useUI';
import { useHeroes } from '../hooks/useHeroes';
import { useEffect } from 'react';

const Sidebar = () => {
  const location = useLocation();
  const { sidebarOpen } = useUI();
  const { roles, fetchHeroRoles } = useHeroes();

  useEffect(() => {
    fetchHeroRoles();
  }, [fetchHeroRoles]);

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Posts', href: '/posts', icon: FileText },
    { name: 'Heroes', href: '/heroes', icon: Users },
    { name: 'Trending', href: '/trending', icon: TrendingUp },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => {/* Close sidebar */}}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Hero Roles */}
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Hero Roles
            </h3>
            <div className="space-y-1">
              {roles.map((role) => (
                <Link
                  key={role.role}
                  to={`/heroes?role=${role.role.toLowerCase()}`}
                  className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <span className="capitalize">{role.role}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {role.count}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;