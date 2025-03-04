import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { analyticsService } from '../services/analyticsService';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// Register Chart.js components
Chart.register(...registerables);

const AnalyticsPage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({
    userGrowth: [],
    templatesByTopic: {},
    popularTemplates: [],
    activityByDay: {}
  });
  const [timeRange, setTimeRange] = useState('month');
  
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await analyticsService.getAnalytics(timeRange);
        setAnalytics(data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [timeRange]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 p-4 rounded-md">
        <p className="text-red-700 dark:text-red-200">{error}</p>
      </div>
    );
  }
  
  // Prepare chart data
  const userGrowthData = {
    labels: analytics.userGrowth.map(item => item.date),
    datasets: [
      {
        label: t('analytics.newUsers'),
        data: analytics.userGrowth.map(item => item.count),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };
  
  const templatesByTopicData = {
    labels: Object.keys(analytics.templatesByTopic),
    datasets: [
      {
        label: t('analytics.templatesByTopic'),
        data: Object.values(analytics.templatesByTopic),
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  const activityByDayData = {
    labels: Object.keys(analytics.activityByDay),
    datasets: [
      {
        label: t('analytics.activityByDay'),
        data: Object.values(analytics.activityByDay),
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      }
    ]
  };
  
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {t('analytics.title')}
        </h1>
        
        <div className="mt-4 mb-8">
          <div className="flex space-x-4">
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                timeRange === 'week' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600'
              }`}
              onClick={() => setTimeRange('week')}
            >
              {t('analytics.week')}
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                timeRange === 'month' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600'
              }`}
              onClick={() => setTimeRange('month')}
            >
              {t('analytics.month')}
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                timeRange === 'year' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600'
              }`}
              onClick={() => setTimeRange('year')}
            >
              {t('analytics.year')}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                {t('analytics.userGrowth')}
              </h2>
              <div className="mt-4 h-64">
                <Line data={userGrowthData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                {t('analytics.templatesByTopic')}
              </h2>
              <div className="mt-4 h-64">
                <Pie data={templatesByTopicData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                {t('analytics.activityByDay')}
              </h2>
              <div className="mt-4 h-64">
                <Bar data={activityByDayData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                {t('analytics.popularTemplates')}
              </h2>
              <div className="mt-4">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {analytics.popularTemplates.map((template, index) => (
                    <li key={template.id} className="py-4">
                      <div className="flex items-center">
                        <span className="text-gray-500 dark:text-gray-400 w-8 text-center">
                          {index + 1}
                        </span>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {template.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t('analytics.views')}: {template.views} | {t('analytics.likes')}: {template.likes}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage; 