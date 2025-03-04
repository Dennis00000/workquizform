import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Logo from './Logo';
import LanguageSwitcher from './LanguageSwitcher';
import Button from './Button';
import { 
  UserIcon, 
  ArrowRightOnRectangleIcon, 
  UserPlusIcon,
  Bars3Icon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

const Navbar = ({ toggleSidebar }) => {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };
  
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {/* Only show sidebar toggle on pages with MainLayout */}
            {window.location.pathname !== '/' && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden"
                aria-label={t('common.toggleSidebar', 'Toggle sidebar')}
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            )}
            
            {/* Logo and site name */}
            <Link to="/" className="flex items-center">
              <Logo className="h-8 w-8 mr-2" />
              <span className="text-lg font-semibold text-gray-900 dark:text-white">QuizForm</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={theme === 'dark' ? t('common.lightMode', 'Light Mode') : t('common.darkMode', 'Dark Mode')}
            >
              {theme === 'dark' ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>
            
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 p-2 rounded-md text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <span className="hidden md:block font-medium">{user?.name || t('common.user', 'User')}</span>
                  <UserIcon className="h-5 w-5" />
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-300 dark:border-gray-700">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      {t('common.profile', 'Profile')}
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setUserMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {t('common.logout', 'Logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  as={Link}
                  to="/login"
                  variant="text"
                  icon={<ArrowRightOnRectangleIcon className="h-5 w-5" />}
                  ariaLabel={t('common.login', 'Login')}
                >
                  {t('common.login', 'Login')}
                </Button>
                <Button
                  as={Link}
                  to="/register"
                  variant="primary"
                  icon={<UserPlusIcon className="h-5 w-5" />}
                  ariaLabel={t('common.register', 'Register')}
                >
                  {t('common.register', 'Register')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar; 