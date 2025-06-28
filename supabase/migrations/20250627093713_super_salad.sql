 LEVEL SECURITY;
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

CREATE POLICY "Project owners can delete projects"
  ON projects
  FOR DELETE
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

CREATE POLICY "Team members with edit rights can delete articles"
  ON articles
  FOR DELETE
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
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the signup
    RAISE WARNING 'Failed to create user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
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
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the project creation
    RAISE WARNING 'Failed to create owner membership: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create owner membership
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
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at 
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at 
  BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_article_comments_updated_at 
  BEFORE UPDATE ON article_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_articles_project_id ON articles(project_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_project_id ON team_members(project_id);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);
CREATE INDEX IF NOT EXISTS idx_project_invitations_email ON project_invitations(email);
CREATE INDEX IF NOT EXISTS idx_project_invitations_token ON project_invitations(token);
CREATE INDEX IF NOT EXISTS idx_project_invitations_expires_at ON project_invitations(expires_at);
CREATE INDEX IF NOT EXISTS idx_article_comments_article_id ON article_comments(article_id);
CREATE INDEX IF NOT EXISTS idx_article_comments_user_id ON article_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_project_id ON activity_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- Insert some sample data for testing (optional - remove if not needed)
-- This will only work if you have existing auth users

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'SeoForge database setup completed successfully!';
  RAISE NOTICE 'Tables created: users, projects, articles, team_members, project_invitations, article_comments, activity_logs';
  RAISE NOTICE 'All RLS policies, triggers, and functions have been set up.';
  RAISE NOTICE 'Your application should now be fully functional.';
END $$;