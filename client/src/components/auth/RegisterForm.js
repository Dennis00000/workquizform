import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../common/Input';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { UserPlusIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const RegisterForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError(t('auth.validation.allFields', 'Please fill in all fields'));
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.validation.passwordMatch', 'Passwords do not match'));
      return;
    }
    
    if (formData.password.length < 6) {
      setError(t('auth.validation.passwordLength', 'Password must be at least 6 characters'));
      return;
    }
    
    try {
      await register(formData.email, formData.password, formData.name);
      navigate('/login');
    } catch (error) {
      // Error is already handled in the auth context with toast
      console.error('Registration error:', error);
    }
  };
  
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
          {t('auth.register.title', 'Create your account')}
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white dark:bg-gray-800 px-6 py-12 shadow sm:rounded-lg sm:px-12">
          {error && (
            <Alert 
              type="error"
              message={error}
              className="mb-6"
            />
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label={t('common.name', 'Full name')}
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder={t('auth.register.namePlaceholder', 'Enter your full name')}
            />
            
            <Input
              label={t('common.email', 'Email address')}
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder={t('auth.register.emailPlaceholder', 'Enter your email')}
            />
            
            <Input
              label={t('common.password', 'Password')}
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder={t('auth.register.passwordPlaceholder', 'Create a password (min. 6 characters)')}
            />
            
            <Input
              label={t('auth.register.confirmPassword', 'Confirm password')}
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder={t('auth.register.confirmPasswordPlaceholder', 'Confirm your password')}
            />
            
            <div>
              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={loading}
                icon={<UserPlusIcon className="h-5 w-5" />}
                ariaLabel={t('auth.register.action', 'Create account')}
              >
                {t('auth.register.action', 'Create account')}
              </Button>
            </div>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm font-medium leading-6">
                <span className="bg-white dark:bg-gray-800 px-6 text-gray-900 dark:text-gray-300">
                  {t('auth.register.or', 'Or')}
                </span>
              </div>
            </div>
            
            <div className="mt-6">
              <Button
                variant="outline"
                fullWidth
                to="/login"
                icon={<ArrowLeftIcon className="h-5 w-5" />}
                ariaLabel={t('auth.login.action', 'Sign in')}
              >
                {t('auth.login.action', 'Sign in')}
              </Button>
            </div>
          </div>
        </div>
        
        <p className="mt-10 text-center text-sm text-gray-500">
          {t('auth.register.haveAccount', 'Already have an account?')}{' '}
          <Link to="/login" className="font-semibold leading-6 text-primary-600 hover:text-primary-500">
            {t('auth.login.action', 'Sign in')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm; 