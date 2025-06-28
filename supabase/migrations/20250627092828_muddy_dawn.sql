/*
  # Complete SeoForge Database Schema

  1. New Tables
    - `users` - User profiles and subscription info
    - `projects` - Content projects
    - `articles` - Article content
    - `team_members` - Project team members
    - `project_invitations` - Team invitations
    - `article_comments` - Article comments and feedback
    - `activity_logs` - Project activity tracking

  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies for team-based access control
    - Secure user data and project isolation

  3. Functions
    - Auto-create team member entries
    - Activity logging
    - User profile management
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for profiles
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  subscription_tier text NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  usage_count integer DEFAULT 0,
  usage_limit integer DEFAULT 10,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  seo_score integer,
  keywords text[],
  meta_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Team Members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  invited_by uuid REFERENCES users(id),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, project_id)
);

-- Project Invitations table
CREATE TABLE IF NOT EXISTS project_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  invited_by uuid REFERENCES users(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Article Comments table
CREATE TABLE IF NOT EXISTS article_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid REFERENCES articles(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  position jsonb,
  resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activity Logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view projects they are team members of"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT project_id FROM team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can create projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND auth.uid() = owner_id);

CREATE POLICY "Project owners can update projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT project_id FROM team_members 
      WHERE user_id = auth.uid() 
      AND role = 'owner' 
      AND status = 'active'
    )
  );

-- Articles policies
CREATE POLICY "Team members can view project articles"
  ON articles
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Team members with edit rights can create articles"
  ON articles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT project_id FROM team_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin', 'editor') 
      AND status = 'active'
    )
  );

CREATE POLICY "Team members with edit rights can update articles"
  ON articles
  FOR UPDATE
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM team_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin', 'editor') 
      AND status = 'active'
    )
  );

-- Team Members policies
CREATE POLICY "Users can view team members of their projects"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Project owners and admins can manage team members"
  ON team_members
  FOR ALL
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM team_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin') 
      AND status = 'active'
    )
  );

-- Project Invitations policies
CREATE POLICY "Users can view invitations for their projects"
  ON project_invitations
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM team_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin') 
      AND status = 'active'
    )
  );

CREATE POLICY "Project owners and admins can manage invitations"
  ON project_invitations
  FOR ALL
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM team_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin') 
      AND status = 'active'
    )
  );

-- Article Comments policies
CREATE POLICY "Team members can view comments on project articles"
  ON article_comments
  FOR SELECT
  TO authenticated
  USING (
    article_id IN (
      SELECT a.id FROM articles a
      JOIN team_members tm ON a.project_id = tm.project_id
      WHERE tm.user_id = auth.uid() AND tm.status = 'active'
    )
  );

CREATE POLICY "Team members can create comments on project articles"
  ON article_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    article_id IN (
      SELECT a.id FROM articles a
      JOIN team_members tm ON a.project_id = tm.project_id
      WHERE tm.user_id = auth.uid() AND tm.status = 'active'
    )
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can update their own comments"
  ON article_comments
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
  ON article_comments
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Activity Logs policies
CREATE POLICY "Team members can view project activity"
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Authenticated users can create activity logs"
  ON activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to automatically create team member entry for project owner
CREATE OR REPLACE FUNCTION create_project_owner_membership()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO team_members (user_id, project_id, role, status)
  VALUES (NEW.owner_id, NEW.id, 'owner', 'active');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create owner membership
DROP TRIGGER IF EXISTS create_project_owner_membership_trigger ON projects;
CREATE TRIGGER create_project_owner_membership_trigger
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION create_project_owner_membership();

-- Function to log activities
CREATE OR REPLACE FUNCTION log_activity(
  p_project_id uuid,
  p_action text,
  p_resource_type text,
  p_resource_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS void AS $$
BEGIN
  INSERT INTO activity_logs (project_id, user_id, action, resource_type, resource_id, metadata)
  VALUES (p_project_id, auth.uid(), p_action, p_resource_type, p_resource_id, p_metadata);
EXCEPTION
  WHEN OTHERS THEN
    -- Silently ignore errors to prevent breaking main operations
    NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_article_comments_updated_at BEFORE UPDATE ON article_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();