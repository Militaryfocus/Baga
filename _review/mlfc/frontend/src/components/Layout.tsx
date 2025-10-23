import { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useUI } from '../hooks/useUI';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { sidebarOpen } = useUI();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-64' : 'ml-0'
        }`}>
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;