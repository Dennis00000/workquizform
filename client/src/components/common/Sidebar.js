import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  PlusIcon, 
  InboxStackIcon, 
  UserIcon, 
  Cog6ToothIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Logo from './Logo';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // Define sidebar navigation items
  const navItems = [
    {
      to: '/dashboard',
      icon: <HomeIcon className="h-5 w-5" />,
      label: t('sidebar.dashboard', 'Dashboard'),
      exact: true
    },
    {
      to: '/templates',
      icon: <DocumentTextIcon className="h-5 w-5" />,
      label: t('sidebar.templates', 'Templates')
    },
    {
      to: '/templates/create',
      icon: <PlusIcon className="h-5 w-5" />,
      label: t('sidebar.createTemplate', 'Create Template')
    },
    {
      to: '/submissions',
      icon: <InboxStackIcon className="h-5 w-5" />,
      label: t('sidebar.submissions', 'Submissions')
    },
    {
      to: '/profile',
      icon: <UserIcon className="h-5 w-5" />,
      label: t('sidebar.profile', 'Profile')
    }
  ];
  
  // Only show admin link if user has admin role
  if (user && user.role === 'admin') {
    navItems.push({
      to: '/admin',
      icon: <Cog6ToothIcon className="h-5 w-5" />,
      label: t('sidebar.admin', 'Admin')
    });
  }
  
  return (
    <aside 
      className={`bg-white dark:bg-gray-800 w-64 shadow-md transition-all duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } fixed inset-y-0 z-30 lg:relative lg:translate-x-0`}
    >
      <div className="h-full flex flex-col">
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-300 dark:border-gray-700">
          <div className="flex items-center">
            <Logo className="h-8 w-8" />
          </div>
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden"
            aria-label={t('common.closeSidebar', 'Close sidebar')}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-2 px-2">
            {navItems.map((item, index) => (
              <li key={index}>
                <NavLink
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) => 
                    `flex items-center px-4 py-2 text-gray-800 dark:text-gray-300 rounded-lg ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200 font-medium' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar; 