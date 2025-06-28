import React, { useState } from 'react';
import { Calendar, FileText, MoreVertical, Edit, Trash2, Users, Settings } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { useNotification } from '../../hooks/useNotification';
import type { Project } from '../../lib/supabase';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { setCurrentProject } = useProjectStore();
  const { showNotification } = useNotification();
  const [showMenu, setShowMenu] = useState(false);

  const handleOpenProject = () => {
    setCurrentProject(project);
    window.location.hash = `#/project/${project.id}`;
  };

  const handleManageTeam = () => {
    window.location.hash = `#/team/${project.id}`;
  };

  const handleEditProject = () => {
    // TODO: Implement edit project modal
    showNotification('Edit project feature coming soon!', 'info');
  };

  const handleDeleteProject = () => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      // TODO: Implement delete project
      showNotification('Delete project feature coming soon!', 'info');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 group relative">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
            {project.title}
          </h3>
          {project.description && (
            <p className="text-gray-600 text-sm line-clamp-2">
              {project.description}
            </p>
          )}
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[160px]">
              <button
                onClick={() => {
                  handleEditProject();
                  setShowMenu(false);
                }}
                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Project</span>
              </button>
              <button
                onClick={() => {
                  handleManageTeam();
                  setShowMenu(false);
                }}
                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>Manage Team</span>
              </button>
              <hr className="border-gray-200" />
              <button
                onClick={() => {
                  handleDeleteProject();
                  setShowMenu(false);
                }}
                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Project</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <FileText className="w-4 h-4" />
            <span>0 articles</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(project.created_at)}</span>
          </div>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={handleOpenProject}
          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-sm"
        >
          Open Project
        </button>
        <button 
          onClick={handleManageTeam}
          className="p-2 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
          title="Manage Team"
        >
          <Users className="w-4 h-4" />
        </button>
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default ProjectCard;