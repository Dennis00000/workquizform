import React, { useState } from 'react';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';
import { templateService } from '../../services/templateService';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const LikeButton = ({ template, onLike }) => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const [isLiked, setIsLiked] = useState(template.liked_by_user);
  const [likesCount, setLikesCount] = useState(template.likes_count || 0);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error(t('auth.loginRequired'));
      return;
    }

    setIsLoading(true);
    try {
      const result = await templateService.toggleLike(template.id);
      setIsLiked(result.liked);
      setLikesCount(result.likes_count);
      
      if (onLike) {
        onLike(result.liked, result.likes_count);
      }
    } catch (error) {
      toast.error(t('templates.likeError'));
      console.error('Error toggling like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`flex items-center space-x-1 ${
        isLiked 
          ? 'text-red-500 hover:text-red-600' 
          : 'text-gray-500 hover:text-red-500'
      } transition-colors duration-200 disabled:opacity-50`}
      aria-label={isLiked ? t('templates.unlike') : t('templates.like')}
    >
      {isLiked ? (
        <HeartSolid className="h-5 w-5" />
      ) : (
        <HeartOutline className="h-5 w-5" />
      )}
      <span>{likesCount}</span>
    </button>
  );
};

export default LikeButton; 