import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { PlusIcon, TrashIcon, GripVerticalIcon } from '@heroicons/react/24/outline';

const QUESTION_TYPES = [
  { id: 'text', name: 'Text' },
  { id: 'paragraph', name: 'Paragraph' },
  { id: 'multiple_choice', name: 'Multiple Choice' },
  { id: 'checkbox', name: 'Checkbox' },
  { id: 'dropdown', name: 'Dropdown' },
  { id: 'scale', name: 'Scale' },
  { id: 'date', name: 'Date' },
  { id: 'time', name: 'Time' }
];

const QuestionBuilder = ({ questions, onChange }) => {
  const { t } = useTranslation();
  const [activeQuestion, setActiveQuestion] = useState(null);
  
  const addQuestion = () => {
    const newQuestion = {
      id: `question_${Date.now()}`,
      text: '',
      type: 'text',
      required: false,
      options: []
    };
    
    onChange([...questions, newQuestion]);
    setActiveQuestion(newQuestion.id);
  };
  
  const updateQuestion = (id, updates) => {
    const updatedQuestions = questions.map(q => 
      q.id === id ? { ...q, ...updates } : q
    );
    onChange(updatedQuestions);
  };
  
  const removeQuestion = (id) => {
    const updatedQuestions = questions.filter(q => q.id !== id);
    onChange(updatedQuestions);
    if (activeQuestion === id) {
      setActiveQuestion(null);
    }
  };
  
  const addOption = (questionId) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;
    
    const newOption = {
      id: `option_${Date.now()}`,
      text: ''
    };
    
    updateQuestion(questionId, {
      options: [...(question.options || []), newOption]
    });
  };
  
  const updateOption = (questionId, optionId, text) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;
    
    const updatedOptions = question.options.map(opt => 
      opt.id === optionId ? { ...opt, text } : opt
    );
    
    updateQuestion(questionId, { options: updatedOptions });
  };
  
  const removeOption = (questionId, optionId) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;
    
    const updatedOptions = question.options.filter(opt => opt.id !== optionId);
    updateQuestion(questionId, { options: updatedOptions });
  };
  
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    onChange(items);
  };
  
  return (
    <div className="space-y-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="questions">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {questions.map((question, index) => (
                <Draggable key={question.id} draggableId={question.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`border ${activeQuestion === question.id ? 'border-primary-500' : 'border-gray-300 dark:border-gray-700'} rounded-md p-4 bg-white dark:bg-gray-800`}
                    >
                      <div className="flex items-start">
                        <div
                          {...provided.dragHandleProps}
                          className="mr-2 mt-1 cursor-move text-gray-400"
                        >
                          <GripVerticalIcon className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('questions.question')} {index + 1}
                              </span>
                              <select
                                value={question.type}
                                onChange={(e) => updateQuestion(question.id, { type: e.target.value })}
                                className="text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                              >
                                {QUESTION_TYPES.map(type => (
                                  <option key={type.id} value={type.id}>
                                    {t(`questions.types.${type.id}`)}
                                  </option>
                                ))}
                              </select>
                              <div className="flex items-center">
                                <input
                                  id={`required-${question.id}`}
                                  type="checkbox"
                                  checked={question.required}
                                  onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-700 rounded"
                                />
                                <label htmlFor={`required-${question.id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                  {t('questions.required')}
                                </label>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeQuestion(question.id)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                          
                          <input
                            type="text"
                            value={question.text}
                            onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                            placeholder={t('questions.textPlaceholder')}
                            className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          />
                          
                          {['multiple_choice', 'checkbox', 'dropdown'].includes(question.type) && (
                            <div className="mt-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {t('questions.options')}
                                </label>
                                <button
                                  type="button"
                                  onClick={() => addOption(question.id)}
                                  className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                                >
                                  <PlusIcon className="h-4 w-4 mr-1" />
                                  {t('questions.addOption')}
                                </button>
                              </div>
                              
                              <div className="space-y-2">
                                {(question.options || []).map((option, optIndex) => (
                                  <div key={option.id} className="flex items-center">
                                    <div className="mr-2 text-gray-400">
                                      {question.type === 'multiple_choice' && (
                                        <div className="h-4 w-4 rounded-full border border-gray-300 dark:border-gray-600" />
                                      )}
                                      {question.type === 'checkbox' && (
                                        <div className="h-4 w-4 rounded border border-gray-300 dark:border-gray-600" />
                                      )}
                                      {question.type === 'dropdown' && (
                                        <span className="text-sm">{optIndex + 1}.</span>
                                      )}
                                    </div>
                                    <input
                                      type="text"
                                      value={option.text}
                                      onChange={(e) => updateOption(question.id, option.id, e.target.value)}
                                      placeholder={t('questions.optionPlaceholder')}
                                      className="flex-1 block border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeOption(question.id, option.id)}
                                      className="ml-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
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
      
      <div className="flex justify-center">
        <button
          type="button"
          onClick={addQuestion}
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          {t('questions.addQuestion')}
        </button>
      </div>
    </div>
  );
};

export default QuestionBuilder; 