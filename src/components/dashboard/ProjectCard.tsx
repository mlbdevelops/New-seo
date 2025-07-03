import React, { useState } from 'react';
import { Calendar, FileText, MoreVertical, Edit, Trash2, Users, Settings } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { useNotification } from '../../hooks/useNotification';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { Project } from '../../lib/firebase';

interface ProjectCardProps {
  project: Project;
  onProjectDeleted?: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onProjectDeleted }) => {
  const { setCurrentProject } = useProjectStore();
  const { showNotification } = useNotification();
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone and will delete all articles and team data.')) {
      return;
    }

    setIsDeleting(true);
    try {
      // Delete the project document
      await deleteDoc(doc(db, 'projects', project.id));
      
      showNotification('Project deleted successfully', 'success');
      
      // Call the callback to refresh the projects list
      if (onProjectDeleted) {
        onProjectDeleted();
      }
    } catch (error) {
      console.error('Delete project error:', error);
      showNotification('Failed to delete project. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
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
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 group relative">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors truncate">
            {project.title}
          </h3>
          {project.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {project.description}
            </p>
          )}
        </div>
        <div className="relative ml-2 flex-shrink-0">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isDeleting}
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
                onClick={handleDeleteProject}
                disabled={isDeleting}
                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Deleting...' : 'Delete Project'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm text-gray-500 mb-4 space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <FileText className="w-4 h-4" />
            <span>0 articles</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">{formatDate(project.created_at)}</span>
            <span className="sm:hidden">{new Date(project.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        <button
          onClick={handleOpenProject}
          disabled={isDeleting}
          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Open Project
        </button>
        <button 
          onClick={handleManageTeam}
          disabled={isDeleting}
          className="sm:w-auto w-full p-2 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          title="Manage Team"
        >
          <Users className="w-4 h-4" />
          <span className="ml-2 sm:hidden">Manage Team</span>
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