import React from 'react';
import { 
  PenTool, 
  Search, 
  Users, 
  BarChart3, 
  Shield, 
  Zap,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: PenTool,
      title: "AI Content Generation",
      description: "Create high-quality, engaging content in seconds with our advanced AI writing assistant.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Search,
      title: "Real-time SEO Optimization",
      description: "Get instant SEO suggestions and optimization tips as you write to boost your rankings.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work together seamlessly with real-time editing, comments, and approval workflows.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Track content performance with detailed analytics and actionable insights.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Shield,
      title: "Plagiarism Detection",
      description: "Ensure originality with built-in plagiarism checking and content verification.",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: TrendingUp,
      title: "Keyword Research",
      description: "Discover trending keywords and optimize your content strategy with data-driven insights.",
      color: "from-teal-500 to-green-500"
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-purple-100 px-4 py-2 rounded-full mb-4">
            <Zap className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Powerful Features</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Create
            <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Amazing Content
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive suite of AI-powered tools helps you create, optimize, and manage content that drives results.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="group relative p-8 bg-white rounded-2xl border border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all duration-300"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-6`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-6">
                  <button className="text-purple-600 font-medium hover:text-purple-700 transition-colors flex items-center group">
                    Learn more
                    <CheckCircle className="ml-2 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;