import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useTemplates } from './TemplateContext';
import { toast } from 'react-hot-toast';

const FormBuilderContext = createContext();

export function useFormBuilder() {
  return useContext(FormBuilderContext);
}

// Initial state for new templates
const initialState = {
  id: null,
  title: '',
  description: '',
  is_public: false,
  questions: [],
  categories: [],
  loading: false,
  saving: false,
  errors: {},
  isDirty: false,
  currentStep: 'info',  // 'info', 'questions', 'settings', 'preview'
};

// Action types
const ACTIONS = {
  INITIALIZE: 'initialize',
  SET_TEMPLATE_INFO: 'set_template_info',
  ADD_QUESTION: 'add_question',
  UPDATE_QUESTION: 'update_question',
  REMOVE_QUESTION: 'remove_question',
  REORDER_QUESTIONS: 'reorder_questions',
  SET_CATEGORIES: 'set_categories',
  SET_LOADING: 'set_loading',
  SET_SAVING: 'set_saving',
  SET_ERROR: 'set_error',
  CLEAR_ERROR: 'clear_error',
  SET_STEP: 'set_step',
  RESET: 'reset',
};

function formBuilderReducer(state, action) {
  switch (action.type) {
    case ACTIONS.INITIALIZE:
      return {
        ...initialState,
        ...action.payload,
        isDirty: false,
      };
    
    case ACTIONS.SET_TEMPLATE_INFO:
      return {
        ...state,
        ...action.payload,
        isDirty: true,
      };
    
    case ACTIONS.ADD_QUESTION:
      return {
        ...state,
        questions: [
          ...state.questions,
          {
            id: uuidv4(),
            title: '',
            type: 'text',
            required: false,
            order: state.questions.length,
            ...action.payload
          }
        ],
        isDirty: true,
      };
    
    case ACTIONS.UPDATE_QUESTION:
      return {
        ...state,
        questions: state.questions.map(q => 
          q.id === action.payload.id ? { ...q, ...action.payload } : q
        ),
        isDirty: true,
      };
    
    case ACTIONS.REMOVE_QUESTION:
      return {
        ...state,
        questions: state.questions
          .filter(q => q.id !== action.payload)
          .map((q, idx) => ({ ...q, order: idx })),
        isDirty: true,
      };
    
    case ACTIONS.REORDER_QUESTIONS:
      return {
        ...state,
        questions: action.payload.map((q, idx) => ({ ...q, order: idx })),
        isDirty: true,
      };
    
    case ACTIONS.SET_CATEGORIES:
      return {
        ...state,
        categories: action.payload,
        isDirty: true,
      };
    
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    
    case ACTIONS.SET_SAVING:
      return {
        ...state,
        saving: action.payload,
      };
    
    case ACTIONS.SET_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.field]: action.payload.message,
        },
      };
    
    case ACTIONS.CLEAR_ERROR:
      const newErrors = { ...state.errors };
      delete newErrors[action.payload];
      return {
        ...state,
        errors: newErrors,
      };
    
    case ACTIONS.SET_STEP:
      return {
        ...state,
        currentStep: action.payload,
      };
    
    case ACTIONS.RESET:
      return initialState;
    
    default:
      return state;
  }
}

export function FormBuilderProvider({ children }) {
  const [state, dispatch] = useReducer(formBuilderReducer, initialState);
  const { getTemplateById, createTemplate, updateTemplate } = useTemplates();

  // Initialize form builder with existing template data
  const initializeTemplate = useCallback(async (templateId) => {
    if (!templateId) {
      dispatch({ type: ACTIONS.INITIALIZE, payload: initialState });
      return;
    }

    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    try {
      const template = await getTemplateById(templateId);
      
      if (!template) {
        throw new Error('Template not found');
      }
      
      // Format the template data for the form builder
      dispatch({ 
        type: ACTIONS.INITIALIZE, 
        payload: {
          id: template.id,
          title: template.title,
          description: template.description,
          is_public: template.is_public,
          questions: template.questions.sort((a, b) => a.order - b.order),
          categories: template.categories.map(c => c.id)
        }
      });
    } catch (error) {
      console.error('Error initializing template:', error);
      toast.error('Failed to load template');
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, [getTemplateById]);

  // Save the form template
  const saveTemplate = useCallback(async () => {
    const { id, title, description, is_public, questions, categories } = state;
    
    // Validate before saving
    let isValid = true;
    
    if (!title.trim()) {
      dispatch({ 
        type: ACTIONS.SET_ERROR, 
        payload: { field: 'title', message: 'Title is required' }
      });
      isValid = false;
    }
    
    if (questions.length === 0) {
      toast.error('You need at least one question');
      isValid = false;
    }
    
    if (!isValid) return false;
    
    dispatch({ type: ACTIONS.SET_SAVING, payload: true });
    
    try {
      const templateData = {
        title,
        description,
        is_public,
        questions: questions.map((q, idx) => ({ ...q, order: idx })),
        categories
      };
      
      if (id) {
        // Update existing template
        await updateTemplate(id, templateData);
        toast.success('Template updated successfully');
      } else {
        // Create new template
        await createTemplate(templateData);
        toast.success('Template created successfully');
      }
      
      return true;
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
      return false;
    } finally {
      dispatch({ type: ACTIONS.SET_SAVING, payload: false });
    }
  }, [state, createTemplate, updateTemplate]);

  // Update template info (title, description, etc.)
  const updateTemplateInfo = useCallback((info) => {
    dispatch({ type: ACTIONS.SET_TEMPLATE_INFO, payload: info });
  }, []);

  // Add a new question
  const addQuestion = useCallback((questionData = {}) => {
    dispatch({ type: ACTIONS.ADD_QUESTION, payload: questionData });
  }, []);

  // Update an existing question
  const updateQuestion = useCallback((questionData) => {
    dispatch({ type: ACTIONS.UPDATE_QUESTION, payload: questionData });
  }, []);

  // Remove a question
  const removeQuestion = useCallback((questionId) => {
    dispatch({ type: ACTIONS.REMOVE_QUESTION, payload: questionId });
  }, []);

  // Reorder questions (drag and drop)
  const reorderQuestions = useCallback((newOrder) => {
    dispatch({ type: ACTIONS.REORDER_QUESTIONS, payload: newOrder });
  }, []);

  // Update categories
  const updateCategories = useCallback((categories) => {
    dispatch({ type: ACTIONS.SET_CATEGORIES, payload: categories });
  }, []);

  // Set the current editing step
  const setStep = useCallback((step) => {
    dispatch({ type: ACTIONS.SET_STEP, payload: step });
  }, []);

  // Reset the form builder
  const resetBuilder = useCallback(() => {
    dispatch({ type: ACTIONS.RESET });
  }, []);

  const value = {
    ...state,
    initializeTemplate,
    saveTemplate,
    updateTemplateInfo,
    addQuestion,
    updateQuestion,
    removeQuestion,
    reorderQuestions,
    updateCategories,
    setStep,
    resetBuilder
  };

  return (
    <FormBuilderContext.Provider value={value}>
      {children}
    </FormBuilderContext.Provider>
  );
} 