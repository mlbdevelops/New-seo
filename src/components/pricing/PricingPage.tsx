import React from 'react';
import { Check, Star, Zap, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const PricingPage: React.FC = () => {
  const { user } = useAuthStore();

  const handleBack = () => {
    if (user) {
      window.location.hash = '#/dashboard';
    } else {
      window.location.hash = '#/';
    }
  };

  const plans = [
    {
      name: "Free",
      price: "0",
      period: "forever",
      description: "Perfect for getting started with AI content creation",
      features: [
        "5 AI-generated articles per month",
        "Basic SEO suggestions",
        "1 project workspace",
        "Standard templates",
        "Email support",
        "Basic content briefs"
      ],
      buttonText: "Current Plan",
      buttonStyle: "bg-gray-100 text-gray-700 cursor-not-allowed",
      popular: false,
      current: true
    },
    {
      name: "Pro",
      price: "29",
      period: "per month",
      description: "Advanced features for growing businesses and teams",
      features: [
        "Unlimited AI content generation",
        "Advanced SEO optimization with real-time scoring",
        "Unlimited projects & team collaboration",
        "Plagiarism detection & content verification",
        "Custom templates & brand voice training",
        "Real-time collaborative editing",
        "Advanced content briefs with competitor analysis",
        "Keyword research & trend analysis",
        "WordPress & CMS integrations",
        "Priority support & dedicated account manager",
        "API access for custom integrations",
        "Advanced analytics & performance tracking"
      ],
      buttonText: "Upgrade to Pro",
      buttonStyle: "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-xl",
      popular: true,
      current: false
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "Tailored solutions for large organizations",
      features: [
        "Everything in Pro",
        "Custom AI model training",
        "White-label solution",
        "Advanced security & compliance",
        "Dedicated infrastructure",
        "Custom integrations",
        "24/7 phone support",
        "Training & onboarding",
        "SLA guarantees"
      ],
      buttonText: "Contact Sales",
      buttonStyle: "bg-gray-900 text-white hover:bg-gray-800",
      popular: false,
      current: false
    }
  ];

  const features = [
    {
      category: "Content Creation",
      items: [
        { name: "AI Article Generation", free: "5/month", pro: "Unlimited", enterprise: "Unlimited" },
        { name: "Content Templates", free: "Basic", pro: "Premium + Custom", enterprise: "Unlimited Custom" },
        { name: "Brand Voice Training", free: "❌", pro: "✅", enterprise: "✅ Advanced" },
        { name: "Multi-language Support", free: "❌", pro: "✅", enterprise: "✅" }
      ]
    },
    {
      category: "SEO & Optimization",
      items: [
        { name: "SEO Suggestions", free: "Basic", pro: "Advanced", enterprise: "AI-Powered" },
        { name: "Keyword Research", free: "❌", pro: "✅", enterprise: "✅ Advanced" },
        { name: "Competitor Analysis", free: "❌", pro: "✅", enterprise: "✅ Deep Insights" },
        { name: "Real-time SEO Scoring", free: "❌", pro: "✅", enterprise: "✅" }
      ]
    },
    {
      category: "Collaboration",
      items: [
        { name: "Team Members", free: "1", pro: "Unlimited", enterprise: "Unlimited" },
        { name: "Real-time Editing", free: "❌", pro: "✅", enterprise: "✅" },
        { name: "Comments & Reviews", free: "❌", pro: "✅", enterprise: "✅ Advanced" },
        { name: "Approval Workflows", free: "❌", pro: "Basic", enterprise: "✅ Custom" }
      ]
    }
  ];

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
                <h1 className="text-lg font-semibold text-gray-900">Pricing Plans</h1>
                <p className="text-sm text-gray-600">Choose the perfect plan for your needs</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-200 mb-4">
            <Star className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Transparent Pricing</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Scale Your Content
            <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              With Confidence
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free and upgrade as you grow. All plans include our core AI writing features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative p-8 rounded-2xl border-2 transition-all duration-300 ${
                plan.popular 
                  ? 'border-purple-200 bg-white shadow-2xl scale-105' 
                  : 'border-gray-200 bg-white hover:border-purple-200 hover:shadow-xl'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium flex items-center">
                    <Zap className="w-4 h-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-5xl font-bold text-gray-900">${plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-gray-600 ml-2">/{plan.period}</span>}
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button
                disabled={plan.current}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:-translate-y-1 ${plan.buttonStyle}`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Feature Comparison</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Features</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">Free</th>
                  <th className="text-center py-4 px-6 font-semibold text-purple-600">Pro</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {features.map((category, categoryIndex) => (
                  <React.Fragment key={categoryIndex}>
                    <tr className="bg-gray-50">
                      <td colSpan={4} className="py-3 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wide">
                        {category.category}
                      </td>
                    </tr>
                    {category.items.map((item, itemIndex) => (
                      <tr key={itemIndex} className="border-b border-gray-100">
                        <td className="py-4 px-6 text-gray-700">{item.name}</td>
                        <td className="py-4 px-6 text-center text-gray-600">{item.free}</td>
                        <td className="py-4 px-6 text-center text-purple-600 font-medium">{item.pro}</td>
                        <td className="py-4 px-6 text-center text-gray-600">{item.enterprise}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h3>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                question: "Can I change plans anytime?",
                answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately."
              },
              {
                question: "What happens to my data if I cancel?",
                answer: "Your data remains accessible for 30 days after cancellation, giving you time to export if needed."
              },
              {
                question: "Do you offer refunds?",
                answer: "We offer a 14-day money-back guarantee for all paid plans, no questions asked."
              },
              {
                question: "Is there a setup fee?",
                answer: "No setup fees ever. You only pay the monthly subscription fee for your chosen plan."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Content Strategy?</h3>
            <p className="text-lg mb-6 opacity-90">Join thousands of content creators who trust SeoForge</p>
            <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Start Your Free Trial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;