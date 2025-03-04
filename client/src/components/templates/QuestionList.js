import React from 'react';
import { useTranslation } from 'react-i18next';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  PlusIcon,
  XMarkIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { EyeIcon, EyeSlashIcon, TrashIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../config/supabase';

const QuestionList = ({ questions, templateId, onQuestionsChange, isEditable = false }) => {
  const { t } = useTranslation();

  // eslint-disable-next-line no-unused-vars
  const handleDelete = async (questionId) => {
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId)
        .eq('template_id', templateId);

      if (error) throw error;

      // Update local state
      onQuestionsChange(questions.filter(q => q.id !== questionId));
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  const handleReorder = async (dragIndex, dropIndex) => {
    try {
      const newQuestions = [...questions];
      const [movedQuestion] = newQuestions.splice(dragIndex, 1);
      newQuestions.splice(dropIndex, 0, movedQuestion);

      // Update order_index for all affected questions
      const updates = newQuestions.map((question, index) => ({
        id: question.id,
        order_index: index
      }));

      const { error } = await supabase
        .from('questions')
        .upsert(updates, { onConflict: ['id'] });

      if (error) throw error;

      // Update local state
      onQuestionsChange(newQuestions);
    } catch (error) {
      console.error('Error reordering questions:', error);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    handleReorder(result.source.index, result.destination.index);
  };

  const handleToggleVisibility = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].showInTable = !updatedQuestions[index].showInTable;
    onQuestionsChange(updatedQuestions);
  };

  const handleRemoveQuestion = (index) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    onQuestionsChange(updatedQuestions);
  };

  const addQuestion = () => {
    onQuestionsChange([
      ...questions,
      {
        id: Date.now(),
        title: '',
        description: '',
        type: 'string',
        required: true,
        showInTable: true,
        options: []
      }
    ]);
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value
    };
    onQuestionsChange(newQuestions);
  };

  const addOption = (questionIndex, option) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex] = {
      ...newQuestions[questionIndex],
      options: [...(newQuestions[questionIndex].options || []), option]
    };
    onQuestionsChange(newQuestions);
  };

  const removeOption = (questionIndex, optionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex] = {
      ...newQuestions[questionIndex],
      options: newQuestions[questionIndex].options.filter((_, i) => i !== optionIndex)
    };
    onQuestionsChange(newQuestions);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {t('templates.questions')}
        </h3>
        <button
          type="button"
          onClick={addQuestion}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="-ml-0.5 mr-2 h-4 w-4" />
          {t('templates.addQuestion')}
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="questions">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {questions.map((question, index) => (
                <Draggable
                  key={question.id}
                  draggableId={question.id.toString()}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="bg-white dark:bg-gray-800 shadow rounded-lg p-4"
                    >
                      <div className="flex items-start space-x-4">
                        <div
                          className="flex items-center"
                        >
                          <Bars3Icon className="h-5 w-5 text-gray-400" />
                        </div>

                        <div className="flex-1 space-y-4">
                          <input
                            type="text"
                            value={question.title}
                            onChange={(e) => updateQuestion(index, 'title', e.target.value)}
                            placeholder={t('templates.questionTitle')}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
                          />

                          <input
                            type="text"
                            value={question.description}
                            onChange={(e) => updateQuestion(index, 'description', e.target.value)}
                            placeholder={t('templates.questionDescription')}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
                          />

                          <select
                            value={question.type}
                            onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
                          >
                            <option value="string">{t('templates.questionTypes.string')}</option>
                            <option value="text">{t('templates.questionTypes.text')}</option>
                            <option value="number">{t('templates.questionTypes.number')}</option>
                            <option value="checkbox">{t('templates.questionTypes.checkbox')}</option>
                            <option value="radio">{t('templates.questionTypes.radio')}</option>
                            <option value="select">{t('templates.questionTypes.select')}</option>
                          </select>

                          {['checkbox', 'radio', 'select'].includes(question.type) && (
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  placeholder={t('templates.addOption')}
                                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.target.value.trim()) {
                                      addOption(index, e.target.value.trim());
                                      e.target.value = '';
                                    }
                                  }}
                                />
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {question.options?.map((option, optionIndex) => (
                                  <span
                                    key={optionIndex}
                                    className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 py-0.5 pl-2.5 pr-1 text-sm"
                                  >
                                    {option}
                                    <button
                                      type="button"
                                      onClick={() => removeOption(index, optionIndex)}
                                      className="ml-0.5 inline-flex h-4 w-4 rounded-full"
                                    >
                                      <XMarkIcon className="h-4 w-4" />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => handleToggleVisibility(index)}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            {question.showInTable ? (
                              <EyeIcon className="h-5 w-5" />
                            ) : (
                              <EyeSlashIcon className="h-5 w-5" />
                            )}
                          </button>
                          {isEditable && (
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(index)}
                              className="text-red-400 hover:text-red-500"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default QuestionList; 