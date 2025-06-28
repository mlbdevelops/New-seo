import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: string;
  email: string;
  full_name?: string;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  usage_count: number;
  usage_limit: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  owner_id: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  project_id: string;
  title: string;
  content: string;
  seo_score?: number;
  keywords?: string[];
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  user_id: string;
  project_id: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  invited_by?: string;
  status: 'pending' | 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

export interface ProjectInvitation {
  id: string;
  project_id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  invited_by: string;
  token: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
}

export interface ArticleComment {
  id: string;
  article_id: string;
  user_id: string;
  content: string;
  position?: any;
  resolved: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

export interface ActivityLog {
  id: string;
  project_id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  metadata: any;
  created_at: string;
  user?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

// Auth helpers
export const signUp = async (email: string, password: string, fullName?: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    return { data, error };
  } catch (error) {
    console.error('Signup error:', error);
    return { data: null, error };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  } catch (error) {
    console.error('Signin error:', error);
    return { data: null, error };
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

// Database operations
export const createProject = async (title: string, description?: string) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          user_id: user.id,
          owner_id: user.id,
          title,
          description,
        },
      ])
      .select()
      .single();

    if (data && !error) {
      // Log activity
      try {
        await supabase.rpc('log_activity', {
          p_project_id: data.id,
          p_action: 'created',
          p_resource_type: 'project',
          p_resource_id: data.id,
          p_metadata: { title }
        });
      } catch (logError) {
        console.warn('Failed to log activity:', logError);
      }
    }

    return { data, error };
  } catch (error) {
    console.error('Create project error:', error);
    return { data: null, error };
  }
};

export const getUserProjects = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        team_members!inner(role, status)
      `)
      .eq('team_members.user_id', user.id)
      .eq('team_members.status', 'active')
      .order('created_at', { ascending: false });

    return { data: data || [], error };
  } catch (error) {
    console.error('Get user projects error:', error);
    return { data: [], error };
  }
};

export const createArticle = async (projectId: string, title: string, content: string) => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .insert([
        {
          project_id: projectId,
          title,
          content,
        },
      ])
      .select()
      .single();

    if (data && !error) {
      try {
        await supabase.rpc('log_activity', {
          p_project_id: projectId,
          p_action: 'created',
          p_resource_type: 'article',
          p_resource_id: data.id,
          p_metadata: { title }
        });
      } catch (logError) {
        console.warn('Failed to log activity:', logError);
      }
    }

    return { data, error };
  } catch (error) {
    console.error('Create article error:', error);
    return { data: null, error };
  }
};

export const getProjectArticles = async (projectId: string) => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    return { data: data || [], error };
  } catch (error) {
    console.error('Get project articles error:', error);
    return { data: [], error };
  }
};

export const updateArticle = async (articleId: string, updates: Partial<Article>) => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .update(updates)
      .eq('id', articleId)
      .select()
      .single();

    if (data && !error) {
      try {
        await supabase.rpc('log_activity', {
          p_project_id: data.project_id,
          p_action: 'updated',
          p_resource_type: 'article',
          p_resource_id: data.id,
          p_metadata: { title: data.title }
        });
      } catch (logError) {
        console.warn('Failed to log activity:', logError);
      }
    }

    return { data, error };
  } catch (error) {
    console.error('Update article error:', error);
    return { data: null, error };
  }
};

export const getUserProfile = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id);

    if (error) {
      console.error('Get user profile error:', error);
      return { data: null, error };
    }

    // Return the first user if found, otherwise null
    return { data: data && data.length > 0 ? data[0] : null, error: null };
  } catch (error) {
    console.error('Get user profile error:', error);
    return { data: null, error };
  }
};

export const updateUserProfile = async (updates: Partial<User>) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('Update user profile error:', error);
    return { data: null, error };
  }
};

// Team collaboration functions
export const getProjectTeamMembers = async (projectId: string) => {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        *,
        user:users(id, email, full_name)
      `)
      .eq('project_id', projectId)
      .eq('status', 'active')
      .order('created_at', { ascending: true });

    return { data: data || [], error };
  } catch (error) {
    console.error('Get team members error:', error);
    return { data: [], error };
  }
};

export const inviteTeamMember = async (projectId: string, email: string, role: 'admin' | 'editor' | 'viewer') => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Check if user is already a team member
    const { data: existingMember } = await supabase
      .from('team_members')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .single();

    if (existingMember) {
      return { error: { message: 'User is already a team member' } };
    }

    // Check if there's already a pending invitation
    const { data: existingInvitation } = await supabase
      .from('project_invitations')
      .select('id')
      .eq('project_id', projectId)
      .eq('email', email)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (existingInvitation) {
      return { error: { message: 'Invitation already sent to this email' } };
    }

    const { data, error } = await supabase
      .from('project_invitations')
      .insert([
        {
          project_id: projectId,
          email,
          role,
          invited_by: user.id,
        },
      ])
      .select()
      .single();

    if (data && !error) {
      try {
        await supabase.rpc('log_activity', {
          p_project_id: projectId,
          p_action: 'invited',
          p_resource_type: 'team_member',
          p_metadata: { email, role }
        });
      } catch (logError) {
        console.warn('Failed to log activity:', logError);
      }
    }

    return { data, error };
  } catch (error) {
    console.error('Invite team member error:', error);
    return { data: null, error };
  }
};

export const removeTeamMember = async (projectId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .update({ status: 'inactive' })
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .select()
      .single();

    if (data && !error) {
      try {
        await supabase.rpc('log_activity', {
          p_project_id: projectId,
          p_action: 'removed',
          p_resource_type: 'team_member',
          p_resource_id: userId
        });
      } catch (logError) {
        console.warn('Failed to log activity:', logError);
      }
    }

    return { data, error };
  } catch (error) {
    console.error('Remove team member error:', error);
    return { data: null, error };
  }
};

export const updateTeamMemberRole = async (projectId: string, userId: string, role: 'admin' | 'editor' | 'viewer') => {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .update({ role })
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .select()
      .single();

    if (data && !error) {
      try {
        await supabase.rpc('log_activity', {
          p_project_id: projectId,
          p_action: 'role_updated',
          p_resource_type: 'team_member',
          p_resource_id: userId,
          p_metadata: { new_role: role }
        });
      } catch (logError) {
        console.warn('Failed to log activity:', logError);
      }
    }

    return { data, error };
  } catch (error) {
    console.error('Update team member role error:', error);
    return { data: null, error };
  }
};

export const getProjectInvitations = async (projectId: string) => {
  try {
    const { data, error } = await supabase
      .from('project_invitations')
      .select('*')
      .eq('project_id', projectId)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    return { data: data || [], error };
  } catch (error) {
    console.error('Get project invitations error:', error);
    return { data: [], error };
  }
};

export const cancelInvitation = async (invitationId: string) => {
  try {
    const { data, error } = await supabase
      .from('project_invitations')
      .delete()
      .eq('id', invitationId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('Cancel invitation error:', error);
    return { data: null, error };
  }
};

export const acceptInvitation = async (token: string) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Get invitation details
    const { data: invitation, error: inviteError } = await supabase
      .from('project_invitations')
      .select('*')
      .eq('token', token)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (inviteError || !invitation) {
      return { error: { message: 'Invalid or expired invitation' } };
    }

    // Check if user email matches invitation email
    if (user.email !== invitation.email) {
      return { error: { message: 'Invitation email does not match your account' } };
    }

    // Create team member
    const { data: teamMember, error: memberError } = await supabase
      .from('team_members')
      .insert([
        {
          user_id: user.id,
          project_id: invitation.project_id,
          role: invitation.role,
          invited_by: invitation.invited_by,
          status: 'active',
        },
      ])
      .select()
      .single();

    if (memberError) {
      return { error: memberError };
    }

    // Mark invitation as accepted
    const { error: updateError } = await supabase
      .from('project_invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invitation.id);

    if (updateError) {
      return { error: updateError };
    }

    // Log activity
    try {
      await supabase.rpc('log_activity', {
        p_project_id: invitation.project_id,
        p_action: 'joined',
        p_resource_type: 'team_member',
        p_resource_id: user.id,
        p_metadata: { role: invitation.role }
      });
    } catch (logError) {
      console.warn('Failed to log activity:', logError);
    }

    return { data: teamMember, error: null };
  } catch (error) {
    console.error('Accept invitation error:', error);
    return { data: null, error };
  }
};

// Comments functions
export const getArticleComments = async (articleId: string) => {
  try {
    const { data, error } = await supabase
      .from('article_comments')
      .select(`
        *,
        user:users(id, email, full_name)
      `)
      .eq('article_id', articleId)
      .order('created_at', { ascending: true });

    return { data: data || [], error };
  } catch (error) {
    console.error('Get article comments error:', error);
    return { data: [], error };
  }
};

export const createComment = async (articleId: string, content: string, position?: any) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('article_comments')
      .insert([
        {
          article_id: articleId,
          user_id: user.id,
          content,
          position,
        },
      ])
      .select(`
        *,
        user:users(id, email, full_name)
      `)
      .single();

    return { data, error };
  } catch (error) {
    console.error('Create comment error:', error);
    return { data: null, error };
  }
};

export const updateComment = async (commentId: string, content: string) => {
  try {
    const { data, error } = await supabase
      .from('article_comments')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', commentId)
      .select(`
        *,
        user:users(id, email, full_name)
      `)
      .single();

    return { data, error };
  } catch (error) {
    console.error('Update comment error:', error);
    return { data: null, error };
  }
};

export const resolveComment = async (commentId: string, resolved: boolean = true) => {
  try {
    const { data, error } = await supabase
      .from('article_comments')
      .update({ resolved })
      .eq('id', commentId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('Resolve comment error:', error);
    return { data: null, error };
  }
};

export const deleteComment = async (commentId: string) => {
  try {
    const { data, error } = await supabase
      .from('article_comments')
      .delete()
      .eq('id', commentId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('Delete comment error:', error);
    return { data: null, error };
  }
};

// Activity functions
export const getProjectActivity = async (projectId: string, limit: number = 50) => {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        user:users(id, email, full_name)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data: data || [], error };
  } catch (error) {
    console.error('Get project activity error:', error);
    return { data: [], error };
  }
};

// Check user permissions
export const getUserProjectRole = async (projectId: string) => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('team_members')
      .select('role')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error('Get user project role error:', error);
      return null;
    }
    
    return data?.role || null;
  } catch (error) {
    console.error('Get user project role error:', error);
    return null;
  }
};

export const canUserEditProject = async (projectId: string) => {
  const role = await getUserProjectRole(projectId);
  return role && ['owner', 'admin', 'editor'].includes(role);
};

export const canUserManageTeam = async (projectId: string) => {
  const role = await getUserProjectRole(projectId);
  return role && ['owner', 'admin'].includes(role);
};

// Increment usage count for AI features
export const incrementUsageCount = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('users')
      .update({ 
        usage_count: supabase.sql`usage_count + 1`
      })
      .eq('id', user.id)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('Increment usage count error:', error);
    return { data: null, error };
  }
};