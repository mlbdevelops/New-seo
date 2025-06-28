import React from 'react';
import { Check, Star, Zap } from 'lucide-react';

interface PricingProps {
  onAuthClick?: (mode: 'signin' | 'signup') => void;
}

const Pricing: React.FC<PricingProps> = ({ onAuthClick }) => {
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
        "Email support"
      ],
      buttonText: "Start Free",
      buttonStyle: "bg-gray-100 text-gray-700 hover:bg-gray-200",
      popular: false
    },
    {
      name: "Pro",
      price: "29",
      period: "per month",
      description: "Advanced features for growing businesses and teams",
      features: [
        "Unlimited AI content generation",
        "Advanced SEO optimization",
        "Unlimited projects & team members",
        "Plagiarism detection",
        "Custom templates & brand voice",
        "Real-time collaboration",
        "Priority support",
        "API access"
      ],
      buttonText: "Start Free Trial",
      buttonStyle: "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-xl",
      popular: true
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-200 mb-4">
            <Star className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Simple Pricing</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your
            <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Perfect Plan
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free and scale as you grow. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
                  <span className="text-gray-600 ml-2">/{plan.period}</span>
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
                onClick={() => onAuthClick?.('signup')}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:-translate-y-1 ${plan.buttonStyle}`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">All plans include a 14-day free trial. No credit card required.</p>
          <div className="flex justify-center items-center space-x-8 text-sm text-gray-500">
            <span>✓ Cancel anytime</span>
            <span>✓ 24/7 support</span>
            <span>✓ 99.9% uptime</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;