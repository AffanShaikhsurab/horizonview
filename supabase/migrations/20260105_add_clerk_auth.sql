-- Migration: Add user_id columns and RLS policies for Clerk authentication
-- Run this in your Supabase SQL Editor

-- ============================================
-- STEP 1: Add user_id columns
-- ============================================

-- Add user_id to missions table
ALTER TABLE missions ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Add user_id to projects table  
ALTER TABLE projects ADD COLUMN IF NOT EXISTS user_id TEXT;

-- ============================================
-- STEP 2: Create helper function for RLS
-- ============================================

-- Function to get the Clerk user ID from the JWT claims
CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS TEXT AS $$
  SELECT NULLIF(
    current_setting('request.jwt.claims', true)::json->>'sub',
    ''
  )::text;
$$ LANGUAGE SQL STABLE;

-- ============================================
-- STEP 3: Enable Row Level Security
-- ============================================

ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: Create RLS Policies for Missions
-- ============================================

-- Drop existing policies if they exist (for re-running)
DROP POLICY IF EXISTS "Users can view own missions" ON missions;
DROP POLICY IF EXISTS "Users can insert own missions" ON missions;
DROP POLICY IF EXISTS "Users can update own missions" ON missions;
DROP POLICY IF EXISTS "Users can delete own missions" ON missions;

-- Create new policies
CREATE POLICY "Users can view own missions" 
  ON missions FOR SELECT 
  USING (user_id = requesting_user_id());

CREATE POLICY "Users can insert own missions" 
  ON missions FOR INSERT 
  WITH CHECK (user_id = requesting_user_id());

CREATE POLICY "Users can update own missions" 
  ON missions FOR UPDATE 
  USING (user_id = requesting_user_id());

CREATE POLICY "Users can delete own missions" 
  ON missions FOR DELETE 
  USING (user_id = requesting_user_id());

-- ============================================
-- STEP 5: Create RLS Policies for Projects
-- ============================================

-- Drop existing policies if they exist (for re-running)
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

-- Create new policies
CREATE POLICY "Users can view own projects" 
  ON projects FOR SELECT 
  USING (user_id = requesting_user_id());

CREATE POLICY "Users can insert own projects" 
  ON projects FOR INSERT 
  WITH CHECK (user_id = requesting_user_id());

CREATE POLICY "Users can update own projects" 
  ON projects FOR UPDATE 
  USING (user_id = requesting_user_id());

CREATE POLICY "Users can delete own projects" 
  ON projects FOR DELETE 
  USING (user_id = requesting_user_id());

-- ============================================
-- VERIFICATION: Check policies were created
-- ============================================
-- SELECT * FROM pg_policies WHERE tablename IN ('missions', 'projects');
