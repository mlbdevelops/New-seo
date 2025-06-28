import React, { useEffect, useState } from 'react';
import { Plus, FileText, Users, TrendingUp, Settings, LogOut, Wand2, MessageSquare, CreditCard } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useProjectStore } from '../../store/projectStore';
import ProjectCard from './ProjectCard';
import StatsCard from './StatsCard';
import CreateProjectModal from './CreateProjectModal';
import { useNotification } from '../../hooks/useNotification';

const Dashboard: React.FC = () => {
  const { user, userProfile, signOut } = useAuthStore();
  const { projects, fetchProjects, loading } = useProjectStore();
  const { showNotification } = useNotification();
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSignOut = async () => {
    await signOut();
    showNotification('Signed out successfully', 'success');
  };

  const handleNavigation = (path: string) => {
    window.location.hash = `#/${path}`;
  };

  const stats = [
    {
      title: 'Total Projects',
      value: projects.length.toString(),
      icon: FileText,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Articles Created',
      value: '24', // This would come from actual data
      icon: FileText,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'AI Credits Used',
      value: `${userProfile?.usage_count || 0}/${userProfile?.usage_limit || 5}`,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Team Members',
      value: '1', // This would come from actual data
      icon: Users,
      color: 'from-orange-500 to-red-500',
    },
  ];

  const quickActions = [
    {
      title: 'AI Content Generator',
      description: 'Create new articles with AI',
      icon: Wand2,
      color: 'from-purple-500 to-pink-500',
      action: () => setShowCreateModal(true)
    },
    {
      title: 'Content Brief Generator',
      description: 'Generate detailed content briefs',
      icon: FileText,
      color: 'from-blue-500 to-cyan-500',
      action: () => handleNavigation('brief-generator')
    },
    {
      title: 'Team Collaboration',
      description: 'Manage team and projects',
      icon: Users,
      color: 'from-green-500 to-emerald-500',
      action: () => handleNavigation('team')
    },
    {
      title: 'Upgrade Plan',
      description: 'Unlock premium features',
      icon: CreditCard,
      color: 'from-orange-500 to-red-500',
      action: () => handleNavigation('pricing')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                SeoForge
              </h1>
              <div className="hidden sm:block">
                <span className="text-gray-600">Welcome back, {userProfile?.full_name || user?.email}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-purple-100 px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-purple-700">
                  {userProfile?.subscription_tier === 'pro' ? 'Pro' : 'Free'}
                </span>
              </div>
              <button 
                onClick={() => handleNavigation('settings')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            <p className="text-gray-600 mt-1">Get started with these popular features</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={action.action}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 text-left group"
                  >
                    <div className={`inline-flex p-2 rounded-lg bg-gradient-to-r ${action.color} mb-3`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Your Projects</h2>
                <p className="text-gray-600 mt-1">Manage your content projects and articles</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Project</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-6">Create your first project to start generating AI-powered content</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Create Your First Project
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};

export default Dashboard;