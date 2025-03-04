import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { useWebSocket } from '../../hooks/useWebSocket';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';

const Comments = ({ templateId }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const ws = useWebSocket();
  const commentListRef = useRef(null);

  useEffect(() => {
    fetchComments();
    
    if (ws) {
      ws.addEventListener('message', handleWebSocketMessage);
      return () => ws.removeEventListener('message', handleWebSocketMessage);
    }
  }, [templateId, ws]);

  const handleWebSocketMessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'comment' && data.templateId === templateId) {
      setComments(prev => [data.comment, ...prev]);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await api.get(`/templates/${templateId}/comments`);
      setComments(response.data);
    } catch (error) {
      toast.error(t('comments.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await api.post(`/templates/${templateId}/comments`, {
        content: newComment
      });
      setNewComment('');
      // The new comment will be added through WebSocket
    } catch (error) {
      toast.error(t('comments.submitError'));
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await api.delete(`/templates/${templateId}/comments/${commentId}`);
      toast.success(t('templates.comments.deleted'));
    } catch (error) {
      toast.error(t('templates.comments.error.delete'));
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
        {t('comments.title')} ({comments.length})
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={t('comments.placeholder')}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
          rows={3}
        />
        <button
          type="submit"
          disabled={!newComment.trim()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {t('comments.submit')}
        </button>
      </form>

      <div ref={commentListRef} className="space-y-4">
        {loading ? (
          <div className="text-center py-4">
            {t('common.loading')}
          </div>
        ) : comments.length > 0 ? (
          comments.map(comment => (
            <div
              key={comment.id}
              className="bg-white dark:bg-gray-800 shadow rounded-lg p-4"
            >
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  <img
                    className="h-10 w-10 rounded-full"
                    src={comment.user.avatar || '/default-avatar.png'}
                    alt=""
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {comment.user.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {comment.content}
                  </p>
                  {(user.id === comment.user_id || user.role === 'admin') && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                      {t('common.delete')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">
            {t('comments.noComments')}
          </p>
        )}
      </div>
    </div>
  );
};

export default Comments; 