import React, { useState, useEffect } from 'react';
import { Save, Wand2, Eye, Settings, ArrowLeft, MessageSquare, Users, FileText, Menu, X } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useProjectStore } from '../../store/projectStore';
import { useAuthStore } from '../../store/authStore';
import { generateContent } from '../../lib/gemini';
import { createArticle, updateArticle, canUserEditProject, getProjectArticles } from '../../lib/firebase';
import { useNotification } from '../../hooks/useNotification';
import SEOPanel from './SEOPanel';
import ContentBriefPanel from './ContentBriefPanel';
import CommentsPanel from './CommentsPanel';
import type { Article } from '../../lib/firebase';

const ArticleEditor: React.FC = () => {
  const { currentProject } = useProjectStore();
  const { userProfile, incrementUsage } = useAuthStore();
  const { showNotification } = useNotification();
  
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSEOPanel, setShowSEOPanel] = useState(false);
  const [showBriefPanel, setShowBriefPanel] = useState(false);
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showArticlesList, setShowArticlesList] = useState(false);
  const [currentArticleId, setCurrentArticleId] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [contentLength, setContentLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your article or use AI to generate content...',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] p-4 sm:p-6',
      },
    },
    editable: canEdit,
  });

  useEffect(() => {
    checkPermissions();
    loadArticles();
  }, [currentProject]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(canEdit);
    }
  }, [editor, canEdit]);

  const checkPermissions = async () => {
    if (currentProject) {
      const canEditProject = await canUserEditProject(currentProject.id);
      setCanEdit(canEditProject);
    }
  };

  const loadArticles = async () => {
    if (!currentProject) return;
    
    setLoadingArticles(true);
    try {
      const { data, error } = await getProjectArticles(currentProject.id);
      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      showNotification('Failed to load articles', 'error');
    } finally {
      setLoadingArticles(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!title.trim()) {
      showNotification('Please enter a title first', 'error');
      return;
    }

    if (!canEdit) {
      showNotification('You do not have permission to edit this project', 'error');
      return;
    }

    if (!userProfile) {
      showNotification('Please sign in to use AI features', 'error');
      return;
    }

    if (userProfile.usage_count >= userProfile.usage_limit) {
      showNotification('You have reached your AI generation limit. Please upgrade to continue.', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const lengthPrompt = contentLength === 'short' ? ' (400-600 words)' : 
                          contentLength === 'medium' ? ' (800-1200 words)' : 
                          ' (1500-2000 words)';
      
      const content = await generateContent(title + lengthPrompt, 'article');
      editor?.commands.setContent(content);
      
      // Increment usage count
      await incrementUsage();
      
      showNotification('Content generated successfully!', 'success');
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('rate limit')) {
          showNotification('Gemini API rate limit exceeded. Please wait a few minutes before trying again.', 'error');
        } else if (error.message.includes('API key')) {
          showNotification('Gemini API configuration error. Please check your settings.', 'error');
        } else {
          showNotification(error.message || 'Failed to generate content. Please try again.', 'error');
        }
      } else {
        showNotification('Failed to generate content. Please try again.', 'error');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !editor?.getHTML()) {
      showNotification('Please enter a title and content', 'error');
      return;
    }

    if (!currentProject) {
      showNotification('No project selected', 'error');
      return;
    }

    if (!canEdit) {
      showNotification('You do not have permission to edit this project', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const content = editor.getHTML();
      
      if (currentArticleId) {
        const { error } = await updateArticle(currentArticleId, {
          title: title.trim(),
          content,
        });
        
        if (error) {
          throw error;
        }
        showNotification('Article updated successfully!', 'success');
      } else {
        const { data, error } = await createArticle(currentProject.id, title.trim(), content);
        
        if (error) {
          throw error;
        }
        if (data) {
          setCurrentArticleId(data.id);
        }
        showNotification('Article saved successfully!', 'success');
      }
      
      // Reload articles list
      await loadArticles();
    } catch (error) {
      console.error('Save article error:', error);
      showNotification('Failed to save article. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadArticle = (article: Article) => {
    setTitle(article.title);
    setCurrentArticleId(article.id);
    editor?.commands.setContent(article.content);
    setShowArticlesList(false);
    showNotification(`Loaded article: ${article.title}`, 'success');
  };

  const handleNewArticle = () => {
    setTitle('');
    setCurrentArticleId(null);
    editor?.commands.clearContent();
    setShowArticlesList(false);
    showNotification('Started new article', 'success');
  };

  const handleBack = () => {
    window.location.hash = '#/dashboard';
  };

  const handleManageTeam = () => {
    if (currentProject) {
      window.location.hash = `#/team/${currentProject.id}`;
    }
  };

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">No Project Selected</h2>
          <p className="text-gray-600 mb-6">Please select a project to start editing</p>
          <button
            onClick={handleBack}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-900">
                  {currentProject.title}
                </h1>
                <p className="text-sm text-gray-600">
                  Article Editor {!canEdit && '(Read Only)'}
                </p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-base font-semibold text-gray-900 truncate max-w-[120px]">
                  {currentProject.title}
                </h1>
              </div>
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-3">
              <button
                onClick={() => setShowArticlesList(true)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Articles</span>
              </button>
              <button
                onClick={handleManageTeam}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <Users className="w-4 h-4" />
                <span>Team</span>
              </button>
              <button
                onClick={() => setShowCommentsPanel(true)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Comments</span>
              </button>
              <button
                onClick={() => setShowBriefPanel(true)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Brief</span>
              </button>
              <button
                onClick={() => setShowSEOPanel(true)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>SEO</span>
              </button>
              {canEdit && (
                <>
                  <button
                    onClick={handleGenerateContent}
                    disabled={isGenerating}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>{isGenerating ? 'Generating...' : 'AI Generate'}</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Save'}</span>
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden">
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Menu</h3>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <button
                onClick={() => {
                  setShowArticlesList(true);
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Articles</span>
              </button>
              <button
                onClick={() => {
                  handleManageTeam();
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>Team</span>
              </button>
              <button
                onClick={() => {
                  setShowCommentsPanel(true);
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Comments</span>
              </button>
              <button
                onClick={() => {
                  setShowBriefPanel(true);
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Brief</span>
              </button>
              <button
                onClick={() => {
                  setShowSEOPanel(true);
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>SEO</span>
              </button>
              {canEdit && (
                <>
                  <button
                    onClick={() => {
                      handleGenerateContent();
                      setShowMobileMenu(false);
                    }}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>{isGenerating ? 'Generating...' : 'AI Generate'}</span>
                  </button>
                  <button
                    onClick={() => {
                      handleSave();
                      setShowMobileMenu(false);
                    }}
                    disabled={isSaving}
                    className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Save'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Usage Indicator */}
        {userProfile && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
              <div>
                <h3 className="font-medium text-blue-900">AI Usage</h3>
                <p className="text-sm text-blue-700">
                  {userProfile.usage_count} of {userProfile.usage_limit} AI generations used this month
                </p>
              </div>
              <div className="w-full sm:w-32 bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((userProfile.usage_count / userProfile.usage_limit) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* AI Generation Settings */}
        {canEdit && (
          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="font-medium text-purple-900 mb-3">AI Content Settings</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <label className="text-sm font-medium text-purple-700">Content Length:</label>
              <div className="flex space-x-2">
                {[
                  { value: 'short', label: 'Short (400-600 words)' },
                  { value: 'medium', label: 'Medium (800-1200 words)' },
                  { value: 'long', label: 'Long (1500-2000 words)' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setContentLength(option.value as any)}
                    className={`px-3 py-2 text-xs sm:text-sm rounded-lg font-medium transition-colors ${
                      contentLength === option.value
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-purple-600 border border-purple-300 hover:bg-purple-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Title Input */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-4 sm:p-6">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your article title..."
              className="w-full text-2xl sm:text-3xl font-bold text-gray-900 placeholder-gray-400 border-none focus:outline-none focus:ring-0"
              disabled={!canEdit}
            />
          </div>
        </div>

        {/* Editor */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <EditorContent editor={editor} />
        </div>

        {!canEdit && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              You have read-only access to this project. Contact the project owner or admin to request edit permissions.
            </p>
          </div>
        )}
      </div>

      {/* Articles List Modal */}
      {showArticlesList && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Saved Articles</h2>
              <button
                onClick={() => setShowArticlesList(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="mb-4">
                <button
                  onClick={handleNewArticle}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-colors"
                >
                  + Start New Article
                </button>
              </div>
              
              {loadingArticles ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : articles.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No articles saved yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {articles.map((article) => (
                    <div
                      key={article.id}
                      onClick={() => handleLoadArticle(article)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-colors"
                    >
                      <h3 className="font-medium text-gray-900 mb-1">{article.title}</h3>
                      <p className="text-sm text-gray-600">
                        Last updated: {new Date(article.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SEO Panel */}
      <SEOPanel
        isOpen={showSEOPanel}
        onClose={() => setShowSEOPanel(false)}
        title={title}
        content={editor?.getHTML() || ''}
      />

      {/* Content Brief Panel */}
      <ContentBriefPanel
        isOpen={showBriefPanel}
        onClose={() => setShowBriefPanel(false)}
        title={title}
        onTitleChange={canEdit ? setTitle : () => {}}
        readOnly={!canEdit}
      />

      {/* Comments Panel */}
      {currentArticleId && (
        <CommentsPanel
          isOpen={showCommentsPanel}
          onClose={() => setShowCommentsPanel(false)}
          articleId={currentArticleId}
        />
      )}
    </div>
  );
};

export default ArticleEditor;