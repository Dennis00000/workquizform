import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab } from '@headlessui/react';
import UserManagement from '../components/admin/UserManagement';
import TemplateManagement from '../components/admin/TemplateManagement';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const AdminPage = () => {
  const { t } = useTranslation();
  const [categories] = useState([
    'users',
    'templates',
  ]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        {t('admin.dashboard')}
      </h1>
      
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
          {categories.map((category) => (
            <Tab
              key={category}
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white/60 ring-offset-2 ring-offset-primary-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-400 shadow'
                    : 'text-gray-700 dark:text-gray-400 hover:bg-white/[0.12] hover:text-primary-600'
                )
              }
            >
              {t(`admin.${category}`)}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-2">
          <Tab.Panel
            className={classNames(
              'rounded-xl bg-white dark:bg-gray-800 p-3',
              'ring-white/60 ring-offset-2 ring-offset-primary-400 focus:outline-none focus:ring-2'
            )}
          >
            <UserManagement />
          </Tab.Panel>
          <Tab.Panel
            className={classNames(
              'rounded-xl bg-white dark:bg-gray-800 p-3',
              'ring-white/60 ring-offset-2 ring-offset-primary-400 focus:outline-none focus:ring-2'
            )}
          >
            <TemplateManagement />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default AdminPage; 