import React, { useState, useEffect } from 'react';
import { X, Search, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface SEOPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

interface SEOAnalysis {
  score: number;
  issues: string[];
  suggestions: string[];
  keywords: string[];
  readability: number;
  wordCount: number;
}

const SEOPanel: React.FC<SEOPanelProps> = ({ isOpen, onClose, title, content }) => {
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && (title || content)) {
      analyzeSEO();
    }
  }, [isOpen, title, content]);

  const analyzeSEO = async () => {
    setLoading(true);
    
    // Simulate SEO analysis
    setTimeout(() => {
      const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length;
      const titleLength = title.length;
      
      const issues: string[] = [];
      const suggestions: string[] = [];
      
      if (titleLength < 30) {
        issues.push('Title is too short (less than 30 characters)');
        suggestions.push('Consider expanding your title to 50-60 characters for better SEO');
      }
      
      if (titleLength > 60) {
        issues.push('Title is too long (more than 60 characters)');
        suggestions.push('Shorten your title to under 60 characters to avoid truncation in search results');
      }
      
      if (wordCount < 300) {
        issues.push('Content is too short (less than 300 words)');
        suggestions.push('Add more content to reach at least 300 words for better SEO performance');
      }
      
      if (!content.includes('<h2>') && !content.includes('<h3>')) {
        issues.push('No subheadings found');
        suggestions.push('Add H2 and H3 headings to improve content structure');
      }

      const score = Math.max(0, 100 - (issues.length * 15));
      const readability = Math.floor(Math.random() * 30) + 70; // Simulate readability score
      
      setAnalysis({
        score,
        issues,
        suggestions,
        keywords: ['AI content', 'SEO optimization', 'content marketing'],
        readability,
        wordCount,
      });
      
      setLoading(false);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
              <Search className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">SEO Analysis</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-3 text-gray-600">Analyzing SEO...</span>
            </div>
          ) : analysis ? (
            <div className="space-y-6">
              {/* SEO Score */}
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-2xl font-bold ${
                  analysis.score >= 80 ? 'bg-green-100 text-green-600' :
                  analysis.score >= 60 ? 'bg-yellow-100 text-yellow-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {analysis.score}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mt-2">SEO Score</h3>
                <p className="text-gray-600">
                  {analysis.score >= 80 ? 'Excellent' :
                   analysis.score >= 60 ? 'Good' : 'Needs Improvement'}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{analysis.wordCount}</div>
                  <div className="text-sm text-gray-600">Words</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{analysis.readability}</div>
                  <div className="text-sm text-gray-600">Readability</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{title.length}</div>
                  <div className="text-sm text-gray-600">Title Length</div>
                </div>
              </div>

              {/* Issues */}
              {analysis.issues.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                    Issues Found
                  </h4>
                  <div className="space-y-2">
                    {analysis.issues.map((issue, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-red-700 text-sm">{issue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {analysis.suggestions.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <TrendingUp className="w-5 h-5 text-blue-500 mr-2" />
                    Suggestions
                  </h4>
                  <div className="space-y-2">
                    {analysis.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-blue-700 text-sm">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Keywords */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Detected Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Content to Analyze</h3>
              <p className="text-gray-600">Add a title and content to get SEO insights</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SEOPanel;