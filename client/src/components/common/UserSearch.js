import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Combobox } from '@headlessui/react';
import userService from '../../services/userService';

const UserSearch = ({ onSelect, selectedUsers, placeholder }) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const searchUsers = async () => {
      if (query.length < 2) return;
      try {
        const results = await userService.searchUsers(query);
        setUsers(results.filter(user => !selectedUsers.includes(user.id)));
      } catch (error) {
        console.error('Failed to search users:', error);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [query, selectedUsers]);

  return (
    <Combobox onChange={onSelect}>
      <div className="relative">
        <Combobox.Input
          className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder || t('common.searchUsers')}
        />
        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {users.map((user) => (
            <Combobox.Option
              key={user.id}
              value={user}
              className={({ active }) =>
                `relative cursor-default select-none py-2 pl-3 pr-9 ${
                  active ? 'bg-primary-600 text-white' : 'text-gray-900 dark:text-white'
                }`
              }
            >
              <div className="flex items-center">
                <span className="font-medium">{user.name}</span>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  {user.email}
                </span>
              </div>
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </div>
    </Combobox>
  );
};

export default UserSearch; 