/*
  # Collaboration System Schema

  1. New Tables
    - `team_members`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `project_id` (uuid, references projects)
      - `role` (text: owner, admin, editor, viewer)
      - `invited_by` (uuid, references users)
      - `status` (text: pending, active, inactive)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `project_invitations`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `email` (text)
      - `role` (text)
      - `invited_by` (uuid, references users)
      - `token` (text, unique)
      - `expires_at` (timestamp)
      - `accepted_at` (timestamp)
      - `created_at` (timestamp)
    
    - `article_comments`
      - `id` (uuid, primary key)
      - `article_id` (uuid, references articles)
      - `user_id` (uuid, references users)
      - `content` (text)
      - `position` (jsonb) -- for positioning comments
      - `resolved` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `activity_logs`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `user_id` (uuid, references users)
      - `action` (text)
      - `resource_type` (text)
      - `resource_id` (uuid)
      - `metadata` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for team-based access control
*/

-- Team Members Table
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

-- Project Invitations Table
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

-- Article Comments Table
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

-- Activity Logs Table
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

-- Enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Team Members Policies
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

-- Project Invitations Policies
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

-- Article Comments Policies
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

-- Activity Logs Policies
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

-- Update Projects table to support collaboration
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE projects ADD COLUMN owner_id uuid REFERENCES users(id);
    -- Set existing projects' owner_id to user_id
    UPDATE projects SET owner_id = user_id WHERE owner_id IS NULL;
    ALTER TABLE projects ALTER COLUMN owner_id SET NOT NULL;
  END IF;
END $$;

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
END;
$$ LANGUAGE plpgsql;

-- Update existing projects to have owner memberships
INSERT INTO team_members (user_id, project_id, role, status)
SELECT user_id, id, 'owner', 'active'
FROM projects
WHERE id NOT IN (SELECT project_id FROM team_members WHERE role = 'owner')
ON CONFLICT (user_id, project_id) DO NOTHING;