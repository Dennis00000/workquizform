import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { updateUserProfile, updatePassword, deleteAccount } from '../../store/authSlice';
import { useAuth } from '../../contexts/AuthContext';
import { performanceMonitor } from '../../utils/performance';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import Avatar from '../common/Avatar';

/**
 * User Profile Component
 * Allows users to view and edit their profile information,
 * change password, and delete their account
 */
const UserProfile = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { isLoading, error } = useSelector(state => state.auth);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    bio: ''
  });
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  
  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || ''
      });
    }
  }, [user]);
  
  // Handle profile form changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle password form changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle avatar file selection
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Save profile changes
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    const perfKey = performanceMonitor.startInteraction('save_profile');
    
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('name', profileForm.name);
      formData.append('bio', profileForm.bio);
      
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      
      await dispatch(updateUserProfile(formData)).unwrap();
      
      setIsEditing(false);
      setAvatarFile(null);
      toast.success(t('profile.updateSuccess'));
      performanceMonitor.endInteraction(perfKey, true);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t('profile.updateError'));
      performanceMonitor.endInteraction(perfKey, false);
    }
  };
  
  // Update password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(t('auth.passwordsMustMatch'));
      return;
    }
    
    const perfKey = performanceMonitor.startInteraction('update_password');
    
    try {
      await dispatch(updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })).unwrap();
      
      setIsChangingPassword(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast.success(t('profile.passwordUpdateSuccess'));
      performanceMonitor.endInteraction(perfKey, true);
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(t('profile.passwordUpdateError'));
      performanceMonitor.endInteraction(perfKey, false);
    }
  };
  
  // Delete account
  const handleDeleteAccount = async () => {
    const perfKey = performanceMonitor.startInteraction('delete_account');
    
    try {
      await dispatch(deleteAccount()).unwrap();
      toast.success(t('profile.deleteSuccess'));
      performanceMonitor.endInteraction(perfKey, true);
      // Redirect will happen automatically due to auth state change
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(t('profile.deleteError'));
      setShowDeleteModal(false);
      performanceMonitor.endInteraction(perfKey, false);
    }
  };
  
  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold mb-6">{t('profile.title')}</h1>
      
      {/* Profile Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{t('profile.personalInfo')}</h2>
          {!isEditing && (
            <Button 
              variant="secondary" 
              onClick={() => setIsEditing(true)}
            >
              {t('common.edit')}
            </Button>
          )}
        </div>
        
        {isEditing ? (
          <form onSubmit={handleSaveProfile}>
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="flex flex-col items-center">
                <div className="relative mb-2">
                  <Avatar 
                    src={avatarPreview || user.avatar_url} 
                    alt={user.name} 
                    size="xl" 
                  />
                  <label 
                    htmlFor="avatar-upload" 
                    className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full cursor-pointer hover:bg-blue-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    <input 
                      id="avatar-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleAvatarChange} 
                    />
                  </label>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t('profile.changeAvatar')}
                </span>
              </div>
              
              <div className="flex-1">
                <div className="mb-4">
                  <label htmlFor="name" className="form-label">
                    {t('profile.nameLabel')}
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="email" className="form-label">
                    {t('profile.emailLabel')}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={profileForm.email}
                    disabled
                    className="form-input bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {t('profile.emailChangeNotice')}
                  </p>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="bio" className="form-label">
                    {t('profile.bioLabel')}
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows="3"
                    value={profileForm.bio}
                    onChange={handleProfileChange}
                    className="form-input"
                  ></textarea>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => {
                  setIsEditing(false);
                  setAvatarFile(null);
                  setAvatarPreview(null);
                  setProfileForm({
                    name: user.name || '',
                    email: user.email || '',
                    bio: user.bio || ''
                  });
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                isLoading={isLoading}
              >
                {isLoading ? t('common.saving') : t('common.save')}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center">
              <Avatar 
                src={user.avatar_url} 
                alt={user.name} 
                size="xl" 
              />
            </div>
            
            <div className="flex-1">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('profile.nameLabel')}
                </h3>
                <p className="mt-1">{user.name}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('profile.emailLabel')}
                </h3>
                <p className="mt-1">{user.email}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('profile.bioLabel')}
                </h3>
                <p className="mt-1">{user.bio || t('profile.noBio')}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Password Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{t('profile.changePassword')}</h2>
          {!isChangingPassword && (
            <Button 
              variant="secondary" 
              onClick={() => setIsChangingPassword(true)}
            >
              {t('profile.changePassword')}
            </Button>
          )}
        </div>
        
        {isChangingPassword && (
          <form onSubmit={handleUpdatePassword}>
            <div className="mb-4">
              <label htmlFor="currentPassword" className="form-label">
                {t('profile.currentPasswordLabel')}
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                required
                className="form-input"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="newPassword" className="form-label">
                {t('profile.newPasswordLabel')}
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                required
                className="form-input"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="form-label">
                {t('profile.confirmPasswordLabel')}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                required
                className="form-input"
              />
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                isLoading={isLoading}
              >
                {isLoading ? t('common.saving') : t('common.save')}
              </Button>
            </div>
          </form>
        )}
      </div>
      
      {/* Delete Account */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-red-200 dark:border-red-900">
        <h2 className="text-xl font-semibold mb-4 text-red-600 dark:text-red-400">
          {t('profile.deleteAccount')}
        </h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          {t('profile.deleteWarning')}
        </p>
        <Button 
          variant="danger" 
          onClick={() => setShowDeleteModal(true)}
        >
          {t('profile.deleteAccount')}
        </Button>
      </div>
      
      {/* Delete Account Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t('profile.deleteAccount')}
      >
        <div className="p-6">
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            {t('profile.deleteConfirm')}
          </p>
          <div className="flex justify-end gap-3">
            <Button 
              variant="secondary" 
              onClick={() => setShowDeleteModal(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDeleteAccount}
              isLoading={isLoading}
            >
              {isLoading ? t('common.loading') : t('common.delete')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserProfile; 