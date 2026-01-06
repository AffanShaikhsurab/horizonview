-- Horizon OS Database Schema
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- Create enum types
CREATE TYPE project_status AS ENUM ('Active', 'Concept', 'Maintenance', 'Archived');
CREATE TYPE project_type AS ENUM ('Tool', 'Platform', 'Research', 'AI Agent', 'Analytics', 'Experiment', 'Other');

-- Missions table
CREATE TABLE missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  statement TEXT NOT NULL,
  color VARCHAR(50) NOT NULL DEFAULT '#3b82f6',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  status project_status NOT NULL DEFAULT 'Concept',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  type project_type NOT NULL DEFAULT 'Tool',
  description TEXT,
  github_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_projects_mission_id ON projects(mission_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_missions_order ON missions(order_index);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating updated_at
CREATE TRIGGER update_missions_updated_at
  BEFORE UPDATE ON missions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (adjust as needed for your auth setup)
CREATE POLICY "Allow public read access on missions"
  ON missions FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on missions"
  ON missions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update on missions"
  ON missions FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete on missions"
  ON missions FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access on projects"
  ON projects FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on projects"
  ON projects FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update on projects"
  ON projects FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete on projects"
  ON projects FOR DELETE
  USING (true);

-- Insert sample data (matching the original HTML prototype)
INSERT INTO missions (title, statement, color, order_index) VALUES
  ('Education', 'Improve Student Learning', '#3b82f6', 0),
  ('Fight Akrasia', 'Solve Procrastination', '#ef4444', 1),
  ('Startup', 'Build Scalable Infra', '#a855f7', 2),
  ('Career', 'Guide Graduates', '#10b981', 3);

-- Get the mission IDs to use for projects
DO $$
DECLARE
  edu_id UUID;
  akrasia_id UUID;
  startup_id UUID;
  career_id UUID;
BEGIN
  SELECT id INTO edu_id FROM missions WHERE title = 'Education';
  SELECT id INTO akrasia_id FROM missions WHERE title = 'Fight Akrasia';
  SELECT id INTO startup_id FROM missions WHERE title = 'Startup';
  SELECT id INTO career_id FROM missions WHERE title = 'Career';

  -- Insert sample projects
  INSERT INTO projects (mission_id, title, status, progress, type) VALUES
    (edu_id, 'CS Blueprint', 'Maintenance', 90, 'Tool'),
    (edu_id, 'GitReady.cv', 'Active', 70, 'Analytics'),
    (edu_id, 'SSE Assessment', 'Active', 40, 'Platform'),
    (akrasia_id, 'Akrasia Core', 'Concept', 10, 'Research'),
    (startup_id, 'Sama.dev', 'Active', 60, 'Platform'),
    (startup_id, 'Lean Start', 'Maintenance', 100, 'Tool'),
    (career_id, 'Career Advisor', 'Concept', 0, 'AI Agent');
END $$;
