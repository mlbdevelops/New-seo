import React, { useState } from 'react';
import { ArrowLeft, FileText, Wand2, Target, Users, Lightbulb, Download, Save } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { generateContent } from '../../lib/openai';
import { useNotification } from '../../hooks/useNotification';

interface ContentBrief {
  title: string;
  targetAudience: string;
  keyPoints: string[];
  outline: string[];
  tone: string;
  wordCount: string;
  keywords: string[];
  seoTips: string[];
}

const ContentBriefGenerator: React.FC = () => {
  const { userProfile, incrementUsage } = useAuthStore();
  const { showNotification } = useNotification();
  
  const [topic, setTopic] = useState('');
  const [industry, setIndustry] = useState('');
  const [contentType, setContentType] = useState('blog-post');
  const [brief, setBrief] = useState<ContentBrief | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleBack = () => {
    window.location.hash = '#/dashboard';
  };

  const generateBrief = async () => {
    if (!topic.trim()) {
      showNotification('Please enter a topic first', 'error');
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
      const briefPrompt = `${topic} in ${industry || 'general'} industry for ${contentType}`;
      const briefContent = await generateContent(briefPrompt, 'brief');
      
      // Parse the AI response and create a structured brief
      const mockBrief: ContentBrief = {
        title: `The Complete Guide to ${topic}`,
        targetAudience: 'Business professionals and decision makers',
        keyPoints: [
          'Define the problem and its impact',
          'Present the solution with clear benefits',
          'Provide actionable implementation steps',
          'Include relevant case studies and examples',
          'Address common objections and concerns'
        ],
        outline: [
          'Introduction and Problem Statement',
          'Understanding the Current Landscape',
          'Key Benefits and Opportunities',
          'Implementation Strategy',
          'Best Practices and Tips',
          'Common Pitfalls to Avoid',
          'Case Studies and Success Stories',
          'Future Trends and Considerations',
          'Conclusion and Next Steps'
        ],
        tone: 'Professional yet approachable, authoritative but not intimidating',
        wordCount: contentType === 'blog-post' ? '1200-1800 words' : 
                   contentType === 'article' ? '800-1200 words' : 
                   '500-800 words',
        keywords: [topic.toLowerCase(), `${topic} guide`, `${topic} tips`, `${topic} strategy`],
        seoTips: [
          'Include target keyword in title and first paragraph',
          'Use H2 and H3 headings with related keywords',
          'Add internal and external links',
          'Include relevant images with alt text',
          'Write compelling meta description'
        ]
      };

      setBrief(mockBrief);
      
      // Increment usage count
      await incrementUsage();
      
      showNotification('Content brief generated successfully!', 'success');
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('rate limit')) {
          showNotification('OpenAI API rate limit exceeded. Please wait a few minutes before trying again.', 'error');
        } else if (error.message.includes('API key')) {
          showNotification('OpenAI API configuration error. Please check your settings.', 'error');
        } else {
          showNotification(error.message || 'Failed to generate content brief', 'error');
        }
      } else {
        showNotification('Failed to generate content brief', 'error');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!brief) return;
    
    setIsSaving(true);
    // In a real app, you'd save to database
    setTimeout(() => {
      setIsSaving(false);
      showNotification('Content brief saved successfully!', 'success');
    }, 1000);
  };

  const handleExport = () => {
    if (!brief) return;
    
    const briefText = `
CONTENT BRIEF: ${brief.title}

TARGET AUDIENCE:
${brief.targetAudience}

CONTENT OUTLINE:
${brief.outline.map((item, index) => `${index + 1}. ${item}`).join('\n')}

KEY POINTS TO COVER:
${brief.keyPoints.map(point => `• ${point}`).join('\n')}

TONE & STYLE:
${brief.tone}

WORD COUNT:
${brief.wordCount}

TARGET KEYWORDS:
${brief.keywords.join(', ')}

SEO RECOMMENDATIONS:
${brief.seoTips.map(tip => `• ${tip}`).join('\n')}
    `;

    const blob = new Blob([briefText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${brief.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_brief.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Content Brief Generator</h1>
                <p className="text-sm text-gray-600">Create detailed content briefs with AI</p>
              </div>
            </div>
            
            {brief && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleExport}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Usage Indicator */}
        {userProfile && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-blue-900">AI Usage</h3>
                <p className="text-sm text-blue-700">
                  {userProfile.usage_count} of {userProfile.usage_limit} AI generations used this month
                </p>
              </div>
              <div className="w-32 bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((userProfile.usage_count / userProfile.usage_limit) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Input Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Generate Content Brief</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., AI content marketing strategies"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry (Optional)
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g., SaaS, E-commerce, Healthcare"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Type
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="blog-post">Blog Post</option>
                <option value="article">Article</option>
                <option value="guide">Guide</option>
                <option value="whitepaper">Whitepaper</option>
                <option value="case-study">Case Study</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={generateBrief}
                disabled={isGenerating || !userProfile || userProfile.usage_count >= userProfile.usage_limit}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Wand2 className="w-4 h-4" />
                <span>{isGenerating ? 'Generating...' : 'Generate Brief'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Generated Brief */}
        {isGenerating ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">Generating your content brief...</span>
            </div>
          </div>
        ) : brief ? (
          <div className="space-y-6">
            {/* Title */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{brief.title}</h3>
              <p className="text-gray-600">Content Type: {contentType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
            </div>

            {/* Target Audience */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Users className="w-5 h-5 text-blue-500 mr-2" />
                Target Audience
              </h4>
              <p className="text-gray-700 bg-blue-50 p-4 rounded-lg">{brief.targetAudience}</p>
            </div>

            {/* Content Outline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h5 className="font-semibold text-purple-900 mb-2">Tone & Style</h5>
                <p className="text-purple-700">{brief.tone}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h5 className="font-semibold text-indigo-900 mb-2">Word Count</h5>
                <p className="text-indigo-700">{brief.wordCount}</p>
              </div>
            </div>

            {/* SEO Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">SEO Optimization</h4>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Target Keywords</h5>
                  <div className="flex flex-wrap gap-2">
                    {brief.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">SEO Tips</h5>
                  <ul className="space-y-1">
                    {brief.seoTips.map((tip, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Generate Your Content Brief</h3>
              <p className="text-gray-600">Enter a topic above to get a detailed content brief with outline, key points, and SEO guidelines.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentBriefGenerator;