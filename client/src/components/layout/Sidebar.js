import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  HomeIcon,
  DocumentPlusIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const { t } = useTranslation();
  const { user } = useSelector(state => state.auth);
  const isAdmin = user?.role === 'admin';

  const navigation = [
    { name: 'home', path: '/', icon: HomeIcon },
    { name: 'myTemplates', path: '/templates', icon: DocumentTextIcon },
    { name: 'createTemplate', path: '/templates/new', icon: DocumentPlusIcon },
    { name: 'responses', path: '/responses', icon: ChartBarIcon },
    ...(isAdmin ? [
      { name: 'users', path: '/admin/users', icon: UserGroupIcon },
      { name: 'settings', path: '/admin/settings', icon: Cog6ToothIcon }
    ] : [])
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-sm min-h-screen">
      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-100'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                }`
              }
            >
              <item.icon className="mr-3 h-5 w-5" />
              {t(`navigation.${item.name}`)}
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar; 