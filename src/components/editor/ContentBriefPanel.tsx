import React, { useState } from 'react';
import { X, FileText, Wand2, Target, Users, Lightbulb } from 'lucide-react';
import { generateContent } from '../../lib/gemini';
import { useNotification } from '../../hooks/useNotification';

interface ContentBriefPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onTitleChange: (title: string) => void;
  readOnly?: boolean;
}

interface ContentBrief {
  outline: string[];
  targetAudience: string;
  keyPoints: string[];
  tone: string;
  wordCount: string;
}

const ContentBriefPanel: React.FC<ContentBriefPanelProps> = ({
  isOpen,
  onClose,
  title,
  onTitleChange,
  readOnly = false,
}) => {
  const [brief, setBrief] = useState<ContentBrief | null>(null);
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const { showNotification } = useNotification();

  const generateBrief = async () => {
    if (!topic.trim()) {
      showNotification('Please enter a topic first', 'error');
      return;
    }

    if (readOnly) {
      showNotification('You do not have permission to generate content for this project', 'error');
      return;
    }

    setLoading(true);
    try {
      const briefContent = await generateContent(topic, 'brief');
      
      // Parse the generated brief (in a real app, you'd structure the AI response better)
      const mockBrief: ContentBrief = {
        outline: [
          'Introduction to the topic',
          'Main benefits and features',
          'Best practices and tips',
          'Common challenges and solutions',
          'Conclusion and next steps'
        ],
        targetAudience: 'Business professionals and content creators',
        keyPoints: [
          'Highlight the main value proposition',
          'Include relevant statistics and data',
          'Provide actionable insights',
          'Address common pain points'
        ],
        tone: 'Professional yet approachable',
        wordCount: '800-1200 words'
      };

      setBrief(mockBrief);
      if (!title && !readOnly) {
        onTitleChange(`The Complete Guide to ${topic}`);
      }
      showNotification('Content brief generated successfully!', 'success');
    } catch (error) {
      showNotification('Failed to generate content brief', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Content Brief Generator</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Topic Input */}
          {!readOnly && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What topic would you like to write about?
              </label>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., AI content marketing strategies"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <button
                  onClick={generateBrief}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>{loading ? 'Generating...' : 'Generate'}</span>
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              <span className="ml-3 text-gray-600">Generating content brief...</span>
            </div>
          ) : brief ? (
            <div className="space-y-6">
              {/* Target Audience */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Users className="w-5 h-5 text-blue-500 mr-2" />
                  Target Audience
                </h4>
                <p className="text-gray-700 bg-blue-50 p-4 rounded-lg">{brief.targetAudience}</p>
              </div>

              {/* Content Outline */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Target className="w-5 h-5 text-green-500 mr-2" />
                  Content Outline
                </h4>
                <div className="space-y-2">
                  {brief.outline.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white text-sm font-medium rounded-full flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-green-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Points */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
                  Key Points to Cover
                </h4>
                <div className="space-y-2">
                  {brief.keyPoints.map((point, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-yellow-700">{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Writing Guidelines */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h5 className="font-semibold text-purple-900 mb-2">Tone</h5>
                  <p className="text-purple-700">{brief.tone}</p>
                </div>
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <h5 className="font-semibold text-indigo-900 mb-2">Word Count</h5>
                  <p className="text-indigo-700">{brief.wordCount}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {readOnly ? 'Content Brief' : 'Generate Your Content Brief'}
              </h3>
              <p className="text-gray-600">
                {readOnly 
                  ? 'Content brief will appear here when generated'
                  : 'Enter a topic above to get a detailed content brief with outline, key points, and writing guidelines.'
                }
              </p>
            </div>
          )}

          {readOnly && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                You have read-only access to this project. Content brief generation is disabled.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentBriefPanel;