import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { templateService } from '../../services/templateService';

const UseTemplate = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [formData, setFormData] = useState({});
  const [sendCopy, setSendCopy] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await templateService.submitResponse(id, {
        ...formData,
        sendEmailCopy: sendCopy ? email : null
      });
      toast.success(t('templates.use.submitted'));
      // Reset form or redirect
    } catch (error) {
      toast.error(t('templates.use.error.submitFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ... existing form fields ... */}

      <div className="space-y-2">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="sendCopy"
            checked={sendCopy}
            onChange={(e) => setSendCopy(e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="sendCopy" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
            {t('templates.use.emailCopy')}
          </label>
        </div>

        {sendCopy && (
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('templates.use.emailPlaceholder')}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
      >
        {isSubmitting ? t('templates.use.submitting') : t('templates.use.submit')}
      </button>
    </form>
  );
};

export default UseTemplate; 