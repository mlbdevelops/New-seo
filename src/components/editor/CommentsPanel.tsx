import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Send, Check, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNotification } from '../../hooks/useNotification';
import { 
  getArticleComments, 
  createComment, 
  updateComment, 
  resolveComment, 
  deleteComment 
} from '../../lib/firebase';
import type { ArticleComment } from '../../lib/firebase';

interface CommentsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  articleId: string;
}

const CommentsPanel: React.FC<CommentsPanelProps> = ({ isOpen, onClose, articleId }) => {
  const { user } = useAuthStore();
  const { showNotification } = useNotification();
  
  const [comments, setComments] = useState<ArticleComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    if (isOpen && articleId) {
      loadComments();
    }
  }, [isOpen, articleId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const { data, error } = await getArticleComments(articleId);
      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      showNotification('Failed to load comments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const { data, error } = await createComment(articleId, newComment.trim());
      if (error) throw error;
      
      if (data) {
        setComments(prev => [...prev, data]);
        setNewComment('');
        showNotification('Comment added successfully', 'success');
      }
    } catch (error) {
      showNotification('Failed to add comment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      const { data, error } = await updateComment(commentId, editContent.trim());
      if (error) throw error;
      
      if (data) {
        setComments(prev => prev.map(comment => 
          comment.id === commentId ? data : comment
        ));
        setEditingComment(null);
        setEditContent('');
        showNotification('Comment updated successfully', 'success');
      }
    } catch (error) {
      showNotification('Failed to update comment', 'error');
    }
  };

  const handleResolveComment = async (commentId: string, resolved: boolean) => {
    try {
      const { error } = await resolveComment(commentId, resolved);
      if (error) throw error;
      
      setComments(prev => prev.map(comment => 
        comment.id === commentId ? { ...comment, resolved } : comment
      ));
      showNotification(`Comment ${resolved ? 'resolved' : 'reopened'}`, 'success');
    } catch (error) {
      showNotification('Failed to update comment status', 'error');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const { error } = await deleteComment(commentId);
      if (error) throw error;
      
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      showNotification('Comment deleted successfully', 'success');
    } catch (error) {
      showNotification('Failed to delete comment', 'error');
    }
  };

  const startEditing = (comment: ArticleComment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Comments ({comments.length})</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col h-[calc(90vh-120px)]">
          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading comments...</span>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
                <p className="text-gray-600">Start a conversation about this article</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div 
                    key={comment.id} 
                    className={`p-4 rounded-lg border ${
                      comment.resolved 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {(comment.user?.full_name || comment.user?.email || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">
                            {comment.user?.full_name || comment.user?.email}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">
                            {formatDate(comment.created_at)}
                          </span>
                          {comment.resolved && (
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                              Resolved
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {comment.user_id === user?.id && (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => startEditing(comment)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {editingComment === comment.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={3}
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditComment(comment.id)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-700 mb-3">{comment.content}</p>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleResolveComment(comment.id, !comment.resolved)}
                            className={`flex items-center space-x-1 px-3 py-1 rounded text-sm transition-colors ${
                              comment.resolved
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                            <span>{comment.resolved ? 'Reopen' : 'Resolve'}</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* New Comment Form */}
          <div className="border-t border-gray-200 p-6">
            <form onSubmit={handleSubmitComment} className="space-y-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Posting...' : 'Post Comment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsPanel;