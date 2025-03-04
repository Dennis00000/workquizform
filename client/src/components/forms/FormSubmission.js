import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import Spinner from '../common/Spinner';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';

/**
 * Form submission component that renders a dynamic form based on template questions
 */
const FormSubmission = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    templates: { useTemplate },
    submissions: { useCreateSubmission }
  } = useApi();
  
  // Monitor component performance
  const performance = usePerformanceMonitor('FormSubmission');
  
  // Get template data
  const { data: template, isLoading, error } = useTemplate(id);
  
  // Local state for form values
  const [formValues, setFormValues] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  // Form mutation hook
  const createSubmission = useCreateSubmission({
    onSuccess: () => {
      navigate('/submissions/success');
    }
  }).mutateAsync;
  
  if (isLoading) return <Spinner />;
  if (error) return <div className="text-red-500">Error loading form: {error.message}</div>;
  if (!template) return <div>Template not found</div>;
  
  const handleInputChange = (questionId, value) => {
    performance.measureOperation(() => {
      setFormValues(prev => ({
        ...prev,
        [questionId]: value
      }));
    }, `update-${questionId}`);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredQuestions = template.questions.filter(q => q.required);
    const missingFields = requiredQuestions.filter(q => !formValues[q.id] && formValues[q.id] !== 0);
    
    if (missingFields.length > 0) {
      // Show error for each missing field
      missingFields.forEach(field => {
        const fieldEl = document.getElementById(`question-${field.id}`);
        if (fieldEl) fieldEl.classList.add('border-red-500');
      });
      
      toast.error('Please fill in all required fields');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Prepare submission data
      const submissionData = {
        template_id: template.id,
        values: formValues
      };
      
      await createSubmission(submissionData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Render different question types
  const renderQuestion = (question) => {
    const { id, type, text, options, required } = question;
    
    switch (type) {
      case 'text':
        return (
          <div className="mb-4" id={`question-${id}`}>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              {text} {required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formValues[id] || ''}
              onChange={(e) => handleInputChange(id, e.target.value)}
            />
          </div>
        );
        
      case 'number':
        return (
          <div className="mb-4" id={`question-${id}`}>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              {text} {required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="number"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formValues[id] || ''}
              onChange={(e) => handleInputChange(id, e.target.value ? Number(e.target.value) : '')}
            />
          </div>
        );
        
      case 'select':
        return (
          <div className="mb-4" id={`question-${id}`}>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              {text} {required && <span className="text-red-500">*</span>}
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formValues[id] || ''}
              onChange={(e) => handleInputChange(id, e.target.value)}
            >
              <option value="">Select an option</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );
        
      case 'radio':
        return (
          <div className="mb-4" id={`question-${id}`}>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              {text} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="mt-2">
              {options.map((option) => (
                <div key={option.value} className="flex items-center mb-1">
                  <input
                    type="radio"
                    id={`${id}-${option.value}`}
                    name={id}
                    value={option.value}
                    checked={formValues[id] === option.value}
                    onChange={() => handleInputChange(id, option.value)}
                    className="mr-2"
                  />
                  <label htmlFor={`${id}-${option.value}`}>{option.label}</label>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'checkbox':
        return (
          <div className="mb-4" id={`question-${id}`}>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              {text} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="mt-2">
              {options.map((option) => (
                <div key={option.value} className="flex items-center mb-1">
                  <input
                    type="checkbox"
                    id={`${id}-${option.value}`}
                    value={option.value}
                    checked={
                      Array.isArray(formValues[id]) && formValues[id].includes(option.value)
                    }
                    onChange={(e) => {
                      const currentValues = Array.isArray(formValues[id]) ? [...formValues[id]] : [];
                      
                      if (e.target.checked) {
                        handleInputChange(id, [...currentValues, option.value]);
                      } else {
                        handleInputChange(
                          id,
                          currentValues.filter((v) => v !== option.value)
                        );
                      }
                    }}
                    className="mr-2"
                  />
                  <label htmlFor={`${id}-${option.value}`}>{option.label}</label>
                </div>
              ))}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">{template.title}</h1>
      {template.description && (
        <p className="mb-6 text-gray-600">{template.description}</p>
      )}
      
      <form onSubmit={handleSubmit}>
        {template.questions.map((question) => (
          <div key={question.id} className="mb-6">
            {renderQuestion(question)}
          </div>
        ))}
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mr-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {submitting ? <Spinner small /> : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormSubmission; 