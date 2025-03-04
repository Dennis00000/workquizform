import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { EyeIcon, TrashIcon } from '@heroicons/react/24/outline';

const ResponseManagement = () => {
  const { t } = useTranslation();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResponses();
  }, []);

  const fetchResponses = async () => {
    try {
      const response = await api.get('/admin/responses');
      setResponses(response.data);
    } catch (error) {
      toast.error(t('admin.fetchResponsesError'));
    } finally {
      setLoading(false);
    }
  };

  const deleteResponse = async (id) => {
    if (window.confirm(t('admin.confirmDeleteResponse'))) {
      try {
        await api.delete(`/admin/responses/${id}`);
        fetchResponses();
        toast.success(t('admin.responseDeleted'));
      } catch (error) {
        toast.error(t('admin.deleteResponseError'));
      }
    }
  };

  if (loading) {
    return <div className="text-center py-4">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t('admin.responseManagement')}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('admin.template')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('admin.respondent')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('admin.submittedAt')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('admin.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
            {responses.map(response => (
              <tr key={response.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  <Link
                    to={`/templates/${response.template.id}`}
                    className="hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    {response.template.title}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {response.user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {new Date(response.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                  <Link
                    to={`/responses/${response.id}`}
                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    <EyeIcon className="h-5 w-5 inline" />
                  </Link>
                  <button
                    onClick={() => deleteResponse(response.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <TrashIcon className="h-5 w-5 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResponseManagement; 