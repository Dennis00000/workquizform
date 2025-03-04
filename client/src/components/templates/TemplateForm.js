import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useNavigate, Link } from 'react-router-dom';
import { useTemplates } from '../../hooks/useTemplates';
import PreviewModal from './PreviewModal';
import { Combobox } from '@headlessui/react';
import UserSearch from '../common/UserSearch';
import { uploadImage } from '../../lib/supabase';
import MDEditor from '@uiw/react-md-editor';
import { toast } from 'react-hot-toast';
import QuestionList from './QuestionList';
import TagInput from './TagInput';
import { validateForm } from '../../utils/validation';
import { useDispatch } from 'react-redux';
import { createTemplate } from '../../store/templateSlice';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../../lib/supabase';
import { api } from '../../services/api';
import { TagInput as CommonTagInput } from '../common/TagInput';
import { UserSelect } from '../common/UserSelect';
import { templateService } from '../../services/templateService';
import QuestionBuilder from './QuestionBuilder';

const TOPIC_OPTIONS = [
  { value: 'Education', label: 'Education' },
  { value: 'Quiz', label: 'Quiz' },
  { value: 'Other', label: 'Other' }
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const TemplateForm = ({ initialData = null }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { createTemplate: templateService } = useTemplates();
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [tagQuery, setTagQuery] = useState('');
  const [availableTags, setAvailableTags] = useState([]);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    topic: initialData?.topic || 'Education',
    image: null,
    imageUrl: initialData?.imageUrl || '',
    is_public: initialData?.is_public ?? true,
    allowedUsers: initialData?.allowedUsers || [],
    questions: initialData?.questions || [],
    tags: initialData?.tags || [],
  });

  const [newTag, setNewTag] = useState('');
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    description: '',
    type: 'string',
    showInTable: true,
    options: [],
    validation: {}
  });

  const [newOption, setNewOption] = useState('');

  const questionTypes = [
    { value: 'string', icon: '✍️' },
    { value: 'text', icon: '📝' },
    { value: 'number', icon: '🔢' },
    { value: 'checkbox', icon: '☑️' },
    { value: 'radio', icon: '⭕' },
    { value: 'select', icon: '📋' },
    { value: 'date', icon: '📅' },
    { value: 'email', icon: '📧' },
    { value: 'phone', icon: '📱' },
    { value: 'url', icon: '🔗' }
  ];

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tags = await templateService.getTags();
        setAvailableTags(tags);
      } catch (error) {
        console.error('Failed to fetch tags:', error);
      }
    };
    fetchTags();
  }, []);

  const filteredTags = tagQuery === ''
    ? availableTags
    : availableTags.filter((tag) =>
        tag.toLowerCase().includes(tagQuery.toLowerCase())
      );

  const handleAddTag = (tag) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
    setTagQuery('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTagsChange = (tags) => {
    setFormData(prev => ({ ...prev, tags }));
  };

  const handleQuestionsChange = (questions) => {
    setFormData(prev => ({ ...prev, questions }));
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error(t('templates.imageTooLarge'));
      return;
    }

    try {
      setLoading(true);
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('template-images')
        .upload(fileName, file);

      if (error) throw error;

      const { publicURL } = supabase.storage
        .from('template-images')
        .getPublicUrl(data.path);

      setFormData(prev => ({ ...prev, imageUrl: publicURL }));
    } catch (error) {
      toast.error(t('templates.imageUploadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'image/*',
    maxFiles: 1
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      if (initialData) {
        await templateService.updateTemplate(initialData.id, formData);
        toast.success(t('templates.updateSuccess'));
      } else {
        await templateService.createTemplate(formData);
        toast.success(t('templates.createSuccess'));
      }
      
      navigate('/templates');
    } catch (error) {
      console.error('Template form error:', error);
      toast.error(error.response?.data?.message || t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const addQuestion = () => {
    const questionErrors = validateForm(newQuestion, {
      title: { required: true, minLength: 3 },
      description: { required: true, minLength: 10 },
      type: { required: true },
      options: { minLength: 2 }
    });

    if (Object.keys(questionErrors).length > 0) {
      setErrors({ newQuestion: questionErrors });
      return;
    }

    if (formData.questions.length >= 16) {
      setErrors({ questions: t('templates.form.validation.maxQuestions') });
      return;
    }

    setFormData({
      ...formData,
      questions: [...formData.questions, { ...newQuestion, id: Date.now() }],
    });
    setNewQuestion({
      title: '',
      description: '',
      type: 'string',
      showInTable: true,
      options: [],
      validation: {}
    });
    setErrors({});
  };

  const addTag = (e) => {
    e.preventDefault();
    const tag = newTag.trim();
    if (!tag) return;

    if (formData.tags.includes(tag)) {
      setErrors({ tag: t('templates.form.validation.duplicateTag') });
      return;
    }

    setFormData({
      ...formData,
      tags: [...formData.tags, tag],
    });
    setNewTag('');
    setErrors({});
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const questions = Array.from(formData.questions);
    const [reorderedQuestion] = questions.splice(result.source.index, 1);
    questions.splice(result.destination.index, 0, reorderedQuestion);

    setFormData({
      ...formData,
      questions,
    });
  };

  const handleAddOption = (e) => {
    e.preventDefault();
    const option = newOption.trim();
    
    if (!option) return;
    
    if (newQuestion.options.includes(option)) {
      setErrors({ option: t('templates.form.options.duplicateOption') });
      return;
    }
    
    if (newQuestion.options.length >= 10) {
      setErrors({ option: t('templates.form.options.maxOptions') });
      return;
    }
    
    setNewQuestion(prev => ({
      ...prev,
      options: [...prev.options, option]
    }));
    setNewOption('');
    setErrors({});
  };

  const removeOption = (optionToRemove) => {
    setNewQuestion(prev => ({
      ...prev,
      options: prev.options.filter(option => option !== optionToRemove)
    }));
  };

  const handleAddUser = (user) => {
    if (!formData.allowedUsers.find(u => u.id === user.id)) {
      setFormData(prev => ({
        ...prev,
        allowedUsers: [...prev.allowedUsers, user]
      }));
    }
  };

  const handleRemoveUser = (userId) => {
    setFormData(prev => ({
      ...prev,
      allowedUsers: prev.allowedUsers.filter(user => user.id !== userId)
    }));
  };

  const handleQuestionsReorder = (reorderedQuestions) => {
    setFormData(prev => ({
      ...prev,
      questions: reorderedQuestions
    }));
  };

  const handleQuestionDelete = (questionId) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">
        {initialData ? t('templates.edit') : t('templates.create')}
      </h1>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label={t('templates.title')}
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <Input
          label={t('templates.description')}
          name="description"
          type="textarea"
          value={formData.description}
          onChange={handleChange}
          required
        />

        <Select
          label={t('templates.topic')}
          name="topic"
          value={formData.topic}
          onChange={handleChange}
          options={TOPIC_OPTIONS}
        />

        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="is_public"
              checked={formData.is_public}
              onChange={handleChange}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span>{t('templates.makePublic')}</span>
          </label>
          <p className="text-sm text-gray-500">
            {t('templates.publicDescription')}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('templates.image')}
          </label>
          <div
            {...getRootProps()}
            className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
              isDragActive ? 'border-primary-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            <div className="space-y-1 text-center">
              <input {...getInputProps()} />
              {formData.imageUrl ? (
                <img
                  src={formData.imageUrl}
                  alt="Template"
                  className="mx-auto h-32 w-auto"
                />
              ) : (
                <div className="text-gray-600 dark:text-gray-400">
                  {isDragActive ? t('templates.dropImage') : t('templates.dragImage')}
                </div>
              )}
            </div>
          </div>
        </div>

        <TagInput
          label={t('templates.tags')}
          tags={formData.tags}
          onChange={handleTagsChange}
        />

        <QuestionBuilder
          questions={formData.questions}
          onChange={handleQuestionsChange}
        />

        {!formData.is_public && (
          <UserSelect
            value={formData.allowedUsers}
            onChange={users => setFormData(prev => ({ ...prev, allowedUsers: users }))}
          />
        )}

        <div className="flex justify-end space-x-4">
          <Link
            to="/templates"
            className="inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {t('common.cancel')}
          </Link>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
          >
            {isSubmitting ? t('common.saving') : (initialData ? t('common.update') : t('common.create'))}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TemplateForm; 