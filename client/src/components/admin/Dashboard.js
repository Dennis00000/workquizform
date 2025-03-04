import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { performanceMonitor } from '../../utils/performance';
import adminService from '../../services/adminService';
import StatsCard from './StatsCard';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Spinner from '../common/Spinner';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Admin Dashboard Component
 * Displays system statistics and charts for administrators
 */
const Dashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [activityData, setActivityData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week'); // week, month, year
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      const perfKey = performanceMonitor.startPageLoad('AdminDashboard');
      
      try {
        setIsLoading(true);
        
        // Fetch system statistics
        const statsData = await adminService.getSystemStats();
        setStats(statsData);
        
        // Fetch activity data for charts
        const activityResponse = await adminService.getActivityData(timeRange);
        setActivityData(activityResponse);
        
        performanceMonitor.endPageLoad(perfKey, true);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error(t('admin.fetchError'));
        performanceMonitor.endPageLoad(perfKey, false);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [timeRange, t]);
  
  // Handle time range change
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };
  
  // Prepare chart data for user activity
  const userActivityChartData = {
    labels: activityData?.userActivity?.labels || [],
    datasets: [
      {
        label: t('admin.activeUsers'),
        data: activityData?.userActivity?.data || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3,
      },
    ],
  };
  
  // Prepare chart data for submissions
  const submissionsChartData = {
    labels: activityData?.submissions?.labels || [],
    datasets: [
      {
        label: t('admin.submissions'),
        data: activityData?.submissions?.data || [],
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderRadius: 4,
      },
    ],
  };
  
  // Chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: t('admin.userActivityChart'),
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: t('admin.submissionsChart'),
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('admin.dashboard')}</h1>
        
        {/* Time range selector */}
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 rounded-md ${
              timeRange === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
            }`}
            onClick={() => handleTimeRangeChange('week')}
          >
            {t('admin.week')}
          </button>
          <button
            className={`px-3 py-1 rounded-md ${
              timeRange === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
            }`}
            onClick={() => handleTimeRangeChange('month')}
          >
            {t('admin.month')}
          </button>
          <button
            className={`px-3 py-1 rounded-md ${
              timeRange === 'year'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
            }`}
            onClick={() => handleTimeRangeChange('year')}
          >
            {t('admin.year')}
          </button>
        </div>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t('admin.totalUsers')}
          value={stats?.users || 0}
          icon="users"
          change={stats?.userChange || 0}
          color="blue"
        />
        <StatsCard
          title={t('admin.totalTemplates')}
          value={stats?.templates || 0}
          icon="template"
          change={stats?.templateChange || 0}
          color="indigo"
        />
        <StatsCard
          title={t('admin.totalSubmissions')}
          value={stats?.submissions || 0}
          icon="form"
          change={stats?.submissionChange || 0}
          color="green"
        />
        <StatsCard
          title={t('admin.activeUsers')}
          value={stats?.activeUsers || 0}
          icon="activity"
          change={stats?.activeUserChange || 0}
          color="purple"
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-80">
          <Line data={userActivityChartData} options={lineChartOptions} />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-80">
          <Bar data={submissionsChartData} options={barChartOptions} />
        </div>
      </div>
      
      {/* Recent activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h2 className="text-xl font-semibold mb-4">{t('admin.recentActivity')}</h2>
        {activityData?.recentActivity?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.user')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.action')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.resource')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.timestamp')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {activityData.recentActivity.map((activity) => (
                  <tr key={activity.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {activity.user?.name || 'Anonymous'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {activity.action}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {activity.resource}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(activity.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">{t('admin.noRecentActivity')}</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 