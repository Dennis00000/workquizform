import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import Button from '../components/common/Button';
import { 
  UserIcon, 
  PencilIcon, 
  CheckIcon, 
  XMarkIcon, 
  KeyIcon, 
  TrashIcon 
} from '@heroicons/react/24/outline';

const ProfilePage = () => {
  const { t } = useTranslation();
  const { user, updateUserProfile, resetPassword, deleteAccount } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.displayName || '',
        email: user.email || ''
      });
    }
  }, [user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    updateUserProfile(formData)
      .then(() => {
        setIsEditing(false);
        toast.success(t('profile.updateSuccess', 'Profile updated successfully'));
      })
      .catch(error => {
        toast.error(error.message);
      });
  };
  
  const handlePasswordReset = () => {
    resetPassword(user.email)
      .then(() => {
        toast.success(t('profile.passwordResetSent', 'Password reset email sent'));
      })
      .catch(error => {
        toast.error(error.message);
      });
  };
  
  const handleDeleteAccount = () => {
    if (window.confirm(t('profile.deleteConfirm', 'Are you sure you want to delete your account? This action cannot be undone.'))) {
      deleteAccount()
        .then(() => {
          toast.success(t('profile.deleteSuccess', 'Account deleted successfully'));
        })
        .catch(error => {
          toast.error(error.message);
        });
    }
  };
  
  if (!user) {
    return <div className="text-center py-10">{t('common.loading', 'Loading...')}</div>;
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {t('profile.title', 'Your Profile')}
      </h1>
      
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
            <UserIcon className="h-5 w-5 mr-2" />
            {t('profile.personalInfo', 'Personal Information')}
          </h2>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              icon={<PencilIcon className="h-5 w-5" />}
              variant="primary"
              size="sm"
              ariaLabel={t('profile.edit', 'Edit profile')}
            >
              {t('profile.edit', 'Edit profile')}
            </Button>
          )}
        </div>
        
        {isEditing ? (
          <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('profile.name', 'Full name')}
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder={t('profile.namePlaceholder', 'Enter your full name')}
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('profile.email', 'Email address')}
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder={t('profile.emailPlaceholder', 'Enter your email address')}
                />
              </div>
            </div>
            
            <div className="mt-6 flex space-x-3">
              <Button
                type="submit"
                variant="primary"
                icon={<CheckIcon className="h-5 w-5" />}
                ariaLabel={t('common.save', 'Save changes')}
              >
                {t('common.save', 'Save changes')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                icon={<XMarkIcon className="h-5 w-5" />}
                ariaLabel={t('common.cancel', 'Cancel')}
              >
                {t('common.cancel', 'Cancel')}
              </Button>
            </div>
          </form>
        ) : (
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('profile.name', 'Full name')}
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {user.displayName || t('profile.notProvided', 'Not provided')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('profile.email', 'Email address')}
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {user.email}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
      
      <div className="mt-8 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            {t('profile.accountSettings', 'Account Settings')}
          </h2>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('profile.passwordSection', 'Password')}
              </h3>
              <div className="mt-2">
                <Button
                  onClick={handlePasswordReset}
                  variant="outline"
                  icon={<KeyIcon className="h-5 w-5" />}
                  ariaLabel={t('profile.resetPassword', 'Reset password')}
                >
                  {t('profile.resetPassword', 'Reset password')}
                </Button>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('profile.dangerZone', 'Danger Zone')}
              </h3>
              <div className="mt-2">
                <Button
                  onClick={handleDeleteAccount}
                  variant="danger"
                  icon={<TrashIcon className="h-5 w-5" />}
                  ariaLabel={t('profile.deleteAccount', 'Delete account')}
                >
                  {t('profile.deleteAccount', 'Delete account')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 