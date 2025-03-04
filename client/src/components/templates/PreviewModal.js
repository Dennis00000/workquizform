import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import MDEditor from '@uiw/react-md-editor';

const PreviewModal = ({ isOpen, onClose, template }) => {
  const { t } = useTranslation();

  if (!template) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full mx-auto shadow-xl">
          <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
            <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white">
              {t('templates.preview')}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {template.title}
              </h2>
              {template.imageUrl && (
                <img
                  src={template.imageUrl}
                  alt={template.title}
                  className="mt-4 rounded-lg max-h-48 object-cover"
                />
              )}
              <div className="mt-4 prose dark:prose-invert max-w-none">
                <MDEditor.Markdown source={template.description} />
              </div>
            </div>

            <div className="space-y-8">
              {template.questions.map((question, index) => (
                <div key={question.id} className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {index + 1}. {question.title}
                  </h3>
                  {question.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {question.description}
                    </p>
                  )}

                  <div className="mt-2">
                    {(() => {
                      switch (question.type) {
                        case 'text':
                          return (
                            <textarea
                              disabled
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
                              rows={3}
                              placeholder={t('templates.preview')}
                            />
                          );
                        case 'checkbox':
                          return (
                            <div className="space-y-2">
                              {question.options?.map((option, i) => (
                                <label key={i} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    disabled
                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                  />
                                  <span className="text-gray-700 dark:text-gray-300">
                                    {option}
                                  </span>
                                </label>
                              ))}
                            </div>
                          );
                        case 'radio':
                          return (
                            <div className="space-y-2">
                              {question.options?.map((option, i) => (
                                <label key={i} className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    disabled
                                    name={`question-${question.id}`}
                                    className="border-gray-300 text-primary-600 focus:ring-primary-500"
                                  />
                                  <span className="text-gray-700 dark:text-gray-300">
                                    {option}
                                  </span>
                                </label>
                              ))}
                            </div>
                          );
                        case 'select':
                          return (
                            <select
                              disabled
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
                              disabled
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
                              placeholder={t('templates.preview')}
                            />
                          );
                      }
                    })()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 p-4 border-t dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default PreviewModal; 