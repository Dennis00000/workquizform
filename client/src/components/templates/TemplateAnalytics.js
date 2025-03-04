import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const TemplateAnalytics = ({ responses, template }) => {
  const { t } = useTranslation();

  const getQuestionAnalytics = (question) => {
    const data = responses.map(r => r[question.id]);
    
    switch (question.type) {
      case 'radio':
      case 'select':
        return getChoiceAnalytics(data, question.options);
      case 'checkbox':
        return {
          type: 'pie',
          data: [
            { name: 'Yes', value: data.filter(Boolean).length },
            { name: 'No', value: data.filter(v => !v).length }
          ]
        };
      case 'number':
        return getNumberAnalytics(data);
      default:
        return getTextAnalytics(data);
    }
  };

  const getChoiceAnalytics = (data, options) => {
    const counts = options.map(option => ({
      name: option,
      value: data.filter(v => v === option).length
    }));
    return { type: 'bar', data: counts };
  };

  const getNumberAnalytics = (data) => {
    const numbers = data.map(Number).filter(n => !isNaN(n));
    return {
      type: 'stats',
      data: {
        average: numbers.reduce((a, b) => a + b, 0) / numbers.length,
        min: Math.min(...numbers),
        max: Math.max(...numbers),
        count: numbers.length
      }
    };
  };

  const getTextAnalytics = (data) => {
    const validResponses = data.filter(Boolean);
    return {
      type: 'stats',
      data: {
        count: validResponses.length,
        averageLength: Math.round(
          validResponses.reduce((acc, text) => acc + text.length, 0) / validResponses.length
        )
      }
    };
  };

  const renderChart = (analytics, question) => {
    switch (analytics.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {analytics.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'stats':
        return (
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(analytics.data).map(([key, value]) => (
              <div key={key} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t(`templates.analytics.stats.${key}`)}
                </div>
                <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('templates.analytics.overview')}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {t('templates.analytics.totalResponses')}
              </div>
              <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {responses.length}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {t('templates.analytics.completionRate')}
              </div>
              <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {Math.round((responses.length / template.views) * 100)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {template.questions.map(question => {
        const analytics = getQuestionAnalytics(question);
        return (
          <div key={question.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {question.title}
            </h3>
            {renderChart(analytics, question)}
          </div>
        );
      })}
    </div>
  );
};

export default TemplateAnalytics; 