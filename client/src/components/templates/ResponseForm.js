import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';

const ResponseForm = ({ template, onSubmit }) => {
  const { t } = useTranslation();
  const [answers, setAnswers] = useState({});
  const [sendCopy, setSendCopy] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post(`/templates/${template.id}/responses`, {
        answers,
        sendCopy
      });
      toast.success(t('templates.response.submitted'));
      onSubmit?.(response.data);
    } catch (error) {
      toast.error(t('templates.response.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {template.questions.map((question) => (
        <div key={question.id} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {question.title}
            {question.required && <span className="text-red-500">*</span>}
          </label>
          {question.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {question.description}
            </p>
          )}

          {(() => {
            switch (question.type) {
              case 'text':
                return (
                  <textarea
                    required={question.required}
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
                  />
                );
              case 'checkbox':
                return question.options?.map((option, i) => (
                  <label key={i} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={answers[question.id]?.includes(option) || false}
                      onChange={(e) => {
                        const current = answers[question.id] || [];
                        if (e.target.checked) {
                          handleAnswerChange(question.id, [...current, option]);
                        } else {
                          handleAnswerChange(
                            question.id,
                            current.filter(item => item !== option)
                          );
                        }
                      }}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">{option}</span>
                  </label>
                ));
              case 'radio':
                return question.options?.map((option, i) => (
                  <label key={i} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option}
                      checked={answers[question.id] === option}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      required={question.required}
                      className="border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">{option}</span>
                  </label>
                ));
              case 'select':
                return (
                  <select
                    required={question.required}
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">{t('templates.selectOption')}</option>
                    {question.options?.map((option, i) => (
                      <option key={i} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                );
              default:
                return (
                  <input
                    type={question.type === 'number' ? 'number' : 'text'}
                    required={question.required}
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
                  />
                );
            }
          })()}
        </div>
      ))}

      <div className="flex items-center">
        <input
          type="checkbox"
          id="sendCopy"
          checked={sendCopy}
          onChange={(e) => setSendCopy(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <label htmlFor="sendCopy" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
          {t('templates.response.sendCopy')}
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {loading ? t('common.submitting') : t('common.submit')}
        </button>
      </div>
    </form>
  );
};

export default ResponseForm; 