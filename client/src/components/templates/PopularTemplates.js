import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { templateService } from '../../services/templateService';
import TemplateCard from './TemplateCard';
import Spinner from '../common/Spinner';

const PopularTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        // Always use real API
        const data = await templateService.getPopularTemplates();
        
        setTemplates(data.templates || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching popular templates:', err);
        setError(t('templates.error.fetchPopular'));
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [t]);

  if (loading) return <Spinner />;
  
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{t('templates.popular')}</h2>
        <Link to="/templates" className="text-blue-600 hover:underline">
          {t('common.viewAll')}
        </Link>
      </div>
      
      {templates.length === 0 ? (
        <p>{t('templates.noTemplates')}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.slice(0, 3).map(template => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PopularTemplates; 