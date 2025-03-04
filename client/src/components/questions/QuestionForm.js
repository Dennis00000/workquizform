import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { questionService } from '../../services/questionService';

const QuestionForm = ({ templateId, onSubmit, initialValues = {} }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const validationSchema = Yup.object({
    title: Yup.string().required(t('validation.required')),
    content: Yup.string().required(t('validation.required')),
  });

  const formik = useFormik({
    initialValues: {
      title: initialValues.title || '',
      content: initialValues.content || '',
      ...initialValues
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const data = await questionService.submitQuestion({
          ...values,
          templateId
        });
        toast.success(t('questions.submitSuccess'));
        if (onSubmit) onSubmit(data);
        formik.resetForm();
      } catch (error) {
        console.error('Error submitting question:', error);
        toast.error(t('questions.submitError'));
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('questions.title')}
        </label>
        <input
          id="title"
          name="title"
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          {...formik.getFieldProps('title')}
        />
        {formik.touched.title && formik.errors.title && (
          <p className="mt-1 text-sm text-red-600">{formik.errors.title}</p>
        )}
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('questions.content')}
        </label>
        <textarea
          id="content"
          name="content"
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          {...formik.getFieldProps('content')}
        />
        {formik.touched.content && formik.errors.content && (
          <p className="mt-1 text-sm text-red-600">{formik.errors.content}</p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {loading ? t('common.submitting') : t('questions.submit')}
        </button>
      </div>
    </form>
  );
};

export default QuestionForm; 