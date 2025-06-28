import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Plus, Mail, Crown, Shield, Edit, Trash2, MessageSquare, Clock, UserX, MoreVertical, Check, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNotification } from '../../hooks/useNotification';
import { 
  getProjectTeamMembers, 
  inviteTeamMember, 
  removeTeamMember, 
  updateTeamMemberRole,
  getProjectInvitations,
  cancelInvitation,
  getProjectActivity,
  getUserProjectRole,
  canUserManageTeam
} from '../../lib/supabase';
import type { TeamMember, ProjectInvitation, ActivityLog } from '../../lib/supabase';

const TeamCollaboration: React.FC = () => {
  const { user, userProfile } = useAuthStore();
  const { showNotification } = useNotification();
  
  const [activeTab, setActiveTab] = useState<'members' | 'invitations' | 'activity'>('members');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
  const [isInviting, setIsInviting] = useState(false);
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [canManageTeam, setCanManageTeam] = useState(false);

  // Get current project from URL hash
  const getCurrentProjectId = () => {
    const hash = window.location.hash;
    const match = hash.match(/#\/team\/(.+)/);
    return match ? match[1] : null;
  };

  const projectId = getCurrentProjectId();

  useEffect(() => {
    if (projectId) {
      loadData();
      checkPermissions();
    }
  }, [projectId]);

  const loadData = async () => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      const [membersResult, invitationsResult, activityResult] = await Promise.all([
        getProjectTeamMembers(projectId),
        getProjectInvitations(projectId),
        getProjectActivity(projectId, 20)
      ]);

      if (membersResult.data) setTeamMembers(membersResult.data);
      if (invitationsResult.data) setInvitations(invitationsResult.data);
      if (activityResult.data) setActivities(activityResult.data);
    } catch (error) {
      showNotification('Failed to load team data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkPermissions = async () => {
    if (!projectId) return;
    
    const role = await getUserProjectRole(projectId);
    const canManage = await canUserManageTeam(projectId);
    
    setUserRole(role);
    setCanManageTeam(canManage);
  };

  const handleBack = () => {
    window.location.hash = '#/dashboard';
  };

  const handleInvite = async () => {
    if (!projectId || !inviteEmail.trim()) {
      showNotification('Please enter an email address', 'error');
      return;
    }

    if (!canManageTeam) {
      showNotification('You do not have permission to invite team members', 'error');
      return;
    }

    setIsInviting(true);
    try {
      const { error } = await inviteTeamMember(projectId, inviteEmail.trim(), inviteRole);
      
      if (error) {
        showNotification(error.message || 'Failed to send invitation', 'error');
      } else {
        showNotification(`Invitation sent to ${inviteEmail}`, 'success');
        setInviteEmail('');
        setShowInviteModal(false);
        loadData(); // Refresh data
      }
    } catch (error) {
      showNotification('Failed to send invitation', 'error');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!projectId || !canManageTeam) {
      showNotification('You do not have permission to remove team members', 'error');
      return;
    }

    if (confirm(`Are you sure you want to remove ${memberName} from the team?`)) {
      try {
        const { error } = await removeTeamMember(projectId, memberId);
        
        if (error) {
          showNotification('Failed to remove team member', 'error');
        } else {
          showNotification(`${memberName} has been removed from the team`, 'success');
          loadData(); // Refresh data
        }
      } catch (error) {
        showNotification('Failed to remove team member', 'error');
      }
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: 'admin' | 'editor' | 'viewer', memberName: string) => {
    if (!projectId || !canManageTeam) {
      showNotification('You do not have permission to update roles', 'error');
      return;
    }

    try {
      const { error } = await updateTeamMemberRole(projectId, memberId, newRole);
      
      if (error) {
        showNotification('Failed to update role', 'error');
      } else {
        showNotification(`${memberName}'s role updated to ${newRole}`, 'success');
        loadData(); // Refresh data
      }
    } catch (error) {
      showNotification('Failed to update role', 'error');
    }
  };

  const handleCancelInvitation = async (invitationId: string, email: string) => {
    if (!canManageTeam) {
      showNotification('You do not have permission to cancel invitations', 'error');
      return;
    }

    try {
      const { error } = await cancelInvitation(invitationId);
      
      if (error) {
        showNotification('Failed to cancel invitation', 'error');
      } else {
        showNotification(`Invitation to ${email} has been cancelled`, 'success');
        loadData(); // Refresh data
      }
    } catch (error) {
      showNotification('Failed to cancel invitation', 'error');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'editor':
        return <Edit className="w-4 h-4 text-green-500" />;
      default:
        return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'editor':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatActivityAction = (activity: ActivityLog) => {
    const userName = activity.user?.full_name || activity.user?.email || 'Someone';
    
    switch (activity.action) {
      case 'created':
        return `${userName} created ${activity.resource_type} "${activity.metadata?.title || ''}"`;
      case 'updated':
        return `${userName} updated ${activity.resource_type} "${activity.metadata?.title || ''}"`;
      case 'invited':
        return `${userName} invited ${activity.metadata?.email} as ${activity.metadata?.role}`;
      case 'joined':
        return `${userName} joined the team as ${activity.metadata?.role}`;
      case 'removed':
        return `${userName} removed a team member`;
      case 'role_updated':
        return `${userName} updated a team member's role to ${activity.metadata?.new_role}`;
      default:
        return `${userName} performed ${activity.action} on ${activity.resource_type}`;
    }
  };

  if (!projectId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Project Selected</h2>
          <p className="text-gray-600 mb-6">Please select a project to manage team collaboration</p>
          <button
            onClick={handleBack}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

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
                <h1 className="text-lg font-semibold text-gray-900">Team Collaboration</h1>
                <p className="text-sm text-gray-600">Manage your team and project access</p>
              </div>
            </div>
            
            {canManageTeam && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Invite Member</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'members', label: 'Team Members', icon: Users, count: teamMembers.length },
                { id: 'invitations', label: 'Pending Invitations', icon: Mail, count: invitations.length },
                { id: 'activity', label: 'Recent Activity', icon: Clock }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        activeTab === tab.id ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <>
                {/* Team Members Tab */}
                {activeTab === 'members' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">Team Members ({teamMembers.length})</h3>
                    </div>
                    
                    {teamMembers.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h4>
                        <p className="text-gray-600">Invite team members to start collaborating</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {teamMembers.map((member) => (
                          <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                                {(member.user?.full_name || member.user?.email || 'U')[0].toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium text-gray-900">
                                    {member.user?.full_name || member.user?.email}
                                  </h4>
                                  {getRoleIcon(member.role)}
                                  {member.user_id === user?.id && (
                                    <span className="text-xs text-purple-600 font-medium">(You)</span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">{member.user?.email}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                                {member.role}
                              </span>
                              
                              {canManageTeam && member.role !== 'owner' && member.user_id !== user?.id && (
                                <div className="flex items-center space-x-2">
                                  <select
                                    value={member.role}
                                    onChange={(e) => handleUpdateRole(member.user_id, e.target.value as any, member.user?.full_name || member.user?.email || 'User')}
                                    className="text-xs border border-gray-300 rounded px-2 py-1"
                                  >
                                    <option value="admin">Admin</option>
                                    <option value="editor">Editor</option>
                                    <option value="viewer">Viewer</option>
                                  </select>
                                  <button
                                    onClick={() => handleRemoveMember(member.user_id, member.user?.full_name || member.user?.email || 'User')}
                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                  >
                                    <UserX className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Pending Invitations Tab */}
                {activeTab === 'invitations' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Pending Invitations ({invitations.length})</h3>
                    
                    {invitations.length === 0 ? (
                      <div className="text-center py-12">
                        <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No pending invitations</h4>
                        <p className="text-gray-600">All invitations have been accepted or expired</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {invitations.map((invitation) => (
                          <div key={invitation.id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div>
                              <h4 className="font-medium text-gray-900">{invitation.email}</h4>
                              <p className="text-sm text-gray-600">
                                Invited as {invitation.role} • Expires {new Date(invitation.expires_at).toLocaleDateString()}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(invitation.role)}`}>
                                {invitation.role}
                              </span>
                              {canManageTeam && (
                                <button
                                  onClick={() => handleCancelInvitation(invitation.id, invitation.email)}
                                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Recent Activity Tab */}
                {activeTab === 'activity' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                    
                    {activities.length === 0 ? (
                      <div className="text-center py-12">
                        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h4>
                        <p className="text-gray-600">Team activity will appear here</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {activities.map((activity) => (
                          <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Clock className="w-4 h-4 text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900">
                                {formatActivityAction(activity)}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(activity.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Invite Team Member</h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'admin' | 'editor' | 'viewer')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="admin">Admin - Can manage team and edit content</option>
                  <option value="editor">Editor - Can create and edit content</option>
                  <option value="viewer">Viewer - Can view and comment only</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvite}
                  disabled={isInviting}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isInviting ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamCollaboration;