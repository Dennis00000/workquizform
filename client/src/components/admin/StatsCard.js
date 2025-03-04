import React from 'react';
import PropTypes from 'prop-types';
import { 
  UserGroupIcon, 
  DocumentIcon, 
  DocumentTextIcon, 
  ChartBarIcon,
  UserIcon,
  CogIcon,
  ClockIcon
} from '@heroicons/react/outline';

/**
 * StatsCard Component
 * Displays a statistic with title, value, and change indicator
 */
const StatsCard = ({ title, value, icon, change, color }) => {
  // Icon mapping
  const iconMap = {
    users: UserGroupIcon,
    user: UserIcon,
    template: DocumentIcon,
    form: DocumentTextIcon,
    activity: ChartBarIcon,
    settings: CogIcon,
    time: ClockIcon
  };
  
  // Color mapping for backgrounds
  const colorMap = {
    blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200',
    green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-200',
    red: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200',
    yellow: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-200',
    purple: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-200',
    indigo: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-200',
    gray: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200'
  };
  
  // Get the icon component
  const IconComponent = iconMap[icon] || DocumentIcon;
  
  // Format the value for display
  const formattedValue = typeof value === 'number' && value > 999 
    ? `${(value / 1000).toFixed(1)}k` 
    : value;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colorMap[color] || colorMap.gray}`}>
          <IconComponent className="h-6 w-6" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              {title}
            </dt>
            <dd>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {formattedValue}
              </div>
            </dd>
          </dl>
        </div>
      </div>
      
      {change !== undefined && (
        <div className="mt-4">
          <div className={`flex items-center text-sm ${
            change >= 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            <span className="font-medium">
              {change >= 0 ? '+' : ''}{change}%
            </span>
            <span className="ml-2">from previous period</span>
          </div>
        </div>
      )}
    </div>
  );
};

StatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  icon: PropTypes.string,
  change: PropTypes.number,
  color: PropTypes.oneOf(['blue', 'green', 'red', 'yellow', 'purple', 'indigo', 'gray'])
};

StatsCard.defaultProps = {
  icon: 'document',
  color: 'blue'
};

export default StatsCard; 