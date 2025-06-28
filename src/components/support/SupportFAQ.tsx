import React, { useState } from 'react';
import { ArrowLeft, Search, MessageCircle, Book, Mail, Phone, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const SupportFAQ: React.FC = () => {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const handleBack = () => {
    if (user) {
      window.location.hash = '#/dashboard';
    } else {
      window.location.hash = '#/';
    }
  };

  const categories = [
    { id: 'getting-started', name: 'Getting Started', icon: Book },
    { id: 'ai-features', name: 'AI Features', icon: MessageCircle },
    { id: 'billing', name: 'Billing & Plans', icon: Mail },
    { id: 'collaboration', name: 'Team Collaboration', icon: MessageCircle },
    { id: 'integrations', name: 'Integrations', icon: Book },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: Search }
  ];

  const faqs = {
    'getting-started': [
      {
        id: 'gs1',
        question: 'How do I create my first project?',
        answer: 'To create your first project, go to your dashboard and click the "New Project" button. Enter a project name and description, then click "Create Project". You can then start adding articles and content to your project.'
      },
      {
        id: 'gs2',
        question: 'What is the difference between Free and Pro plans?',
        answer: 'The Free plan includes 5 AI-generated articles per month, basic SEO suggestions, and 1 project workspace. The Pro plan offers unlimited AI content generation, advanced SEO optimization, unlimited projects, team collaboration, and priority support.'
      },
      {
        id: 'gs3',
        question: 'How do I invite team members?',
        answer: 'Go to the Team Collaboration page from your dashboard, click "Invite Member", enter their email address, select their role (Editor or Viewer), and click "Send Invite". They will receive an email invitation to join your team.'
      }
    ],
    'ai-features': [
      {
        id: 'ai1',
        question: 'How does the AI content generation work?',
        answer: 'Our AI uses advanced language models to generate high-quality content based on your prompts. Simply enter a title or topic, and the AI will create comprehensive, SEO-optimized content tailored to your needs.'
      },
      {
        id: 'ai2',
        question: 'Can I customize the AI writing style?',
        answer: 'Yes! Pro users can train the AI to match their brand voice by providing examples of their preferred writing style. The AI will then generate content that maintains consistency with your brand tone and style.'
      },
      {
        id: 'ai3',
        question: 'What languages does the AI support?',
        answer: 'Currently, our AI supports content generation in English, Spanish, French, German, Italian, Portuguese, and Dutch. We are continuously adding support for more languages.'
      }
    ],
    'billing': [
      {
        id: 'b1',
        question: 'How does billing work?',
        answer: 'Billing is monthly and automatic. You will be charged on the same date each month. You can view your billing history and update payment methods in your Account Settings.'
      },
      {
        id: 'b2',
        question: 'Can I cancel my subscription anytime?',
        answer: 'Yes, you can cancel your subscription at any time from your Account Settings. Your subscription will remain active until the end of your current billing period.'
      },
      {
        id: 'b3',
        question: 'Do you offer refunds?',
        answer: 'We offer a 14-day money-back guarantee for all paid plans. If you are not satisfied within the first 14 days, contact our support team for a full refund.'
      }
    ],
    'collaboration': [
      {
        id: 'c1',
        question: 'How many team members can I invite?',
        answer: 'Free plans are limited to 1 user. Pro plans support unlimited team members. Each team member can have different roles and permissions based on their responsibilities.'
      },
      {
        id: 'c2',
        question: 'What are the different user roles?',
        answer: 'Owner: Full access to all features and settings. Admin: Can manage team members and projects. Editor: Can create and edit content. Viewer: Can view and comment on content only.'
      },
      {
        id: 'c3',
        question: 'Can multiple people edit the same article?',
        answer: 'Yes! Pro users have access to real-time collaborative editing. Multiple team members can work on the same article simultaneously, with changes synced in real-time.'
      }
    ],
    'integrations': [
      {
        id: 'i1',
        question: 'What platforms can I export content to?',
        answer: 'You can export content to WordPress, Google Docs, Medium, and other popular platforms. Pro users also have access to API integrations for custom workflows.'
      },
      {
        id: 'i2',
        question: 'Do you have a WordPress plugin?',
        answer: 'Yes! Our WordPress plugin allows you to publish content directly from SeoForge to your WordPress site, maintaining all formatting and SEO optimizations.'
      },
      {
        id: 'i3',
        question: 'Can I integrate with my CMS?',
        answer: 'Pro and Enterprise users can access our API to integrate with any CMS or content management system. Contact our support team for integration assistance.'
      }
    ],
    'troubleshooting': [
      {
        id: 't1',
        question: 'Why is my AI generation not working?',
        answer: 'Check if you have remaining AI credits in your plan. Free users get 5 generations per month. If you have credits remaining, try refreshing the page or contact support.'
      },
      {
        id: 't2',
        question: 'My content is not saving properly',
        answer: 'Ensure you have a stable internet connection and try saving again. If the problem persists, check if you have sufficient storage space in your plan or contact support.'
      },
      {
        id: 't3',
        question: 'I cannot access my team projects',
        answer: 'Verify that you have the correct permissions for the project. Contact your team owner or admin to check your role and permissions.'
      }
    ]
  };

  const filteredFAQs = faqs[activeCategory as keyof typeof faqs]?.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

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
                <h1 className="text-lg font-semibold text-gray-900">Help & Support</h1>
                <p className="text-sm text-gray-600">Find answers and get help</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How can we help you?</h2>
          <p className="text-lg text-gray-600 mb-8">Search our knowledge base or browse categories below</p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help articles..."
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              <nav className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeCategory === category.id
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{category.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Contact Support */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Need More Help?</h3>
              <div className="space-y-3">
                <a
                  href="mailto:support@seoforge.com"
                  className="flex items-center space-x-3 text-gray-600 hover:text-purple-600 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">Email Support</span>
                </a>
                <a
                  href="#"
                  className="flex items-center space-x-3 text-gray-600 hover:text-purple-600 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">Live Chat</span>
                </a>
                <a
                  href="tel:+1-555-0123"
                  className="flex items-center space-x-3 text-gray-600 hover:text-purple-600 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">Phone Support</span>
                </a>
              </div>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  {categories.find(c => c.id === activeCategory)?.name} ({filteredFAQs.length})
                </h3>
              </div>
              
              <div className="p-6">
                {filteredFAQs.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No articles found</h4>
                    <p className="text-gray-600">Try adjusting your search terms or browse other categories</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredFAQs.map((faq) => (
                      <div key={faq.id} className="border border-gray-200 rounded-lg">
                        <button
                          onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-medium text-gray-900">{faq.question}</span>
                          {expandedFAQ === faq.id ? (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-500" />
                          )}
                        </button>
                        {expandedFAQ === faq.id && (
                          <div className="px-4 pb-4">
                            <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Popular Articles */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Popular Articles</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Getting Started with AI Content Generation',
                description: 'Learn how to create your first AI-generated article',
                category: 'Getting Started'
              },
              {
                title: 'Optimizing Content for SEO',
                description: 'Best practices for SEO optimization in SeoForge',
                category: 'AI Features'
              },
              {
                title: 'Setting Up Team Collaboration',
                description: 'How to invite and manage team members',
                category: 'Collaboration'
              }
            ].map((article, index) => (
              <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="mb-3">
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                    {article.category}
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{article.title}</h4>
                <p className="text-gray-600 text-sm">{article.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportFAQ;