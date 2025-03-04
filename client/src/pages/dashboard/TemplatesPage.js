import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { templateService } from '../../services/templateService';
import { handleApiError } from '../../utils/errorHandler';

const TemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await templateService.getTemplates();
        setTemplates(response.data);
      } catch (error) {
        handleApiError(error, 'Failed to load templates');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  return (
    <DashboardLayout title="My Templates">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">My Templates</h1>
        <Link
          to="/dashboard/templates/create"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Create New Template
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading templates...</div>
      ) : templates.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">You don't have any templates yet.</p>
          <Link
            to="/dashboard/templates/create"
            className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Create Your First Template
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {template.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                  {template.description || 'No description'}
                </p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {new Date(template.created_at).toLocaleDateString()}
                  </span>
                  <Link
                    to={`/dashboard/templates/${template.id}`}
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default TemplatesPage; 