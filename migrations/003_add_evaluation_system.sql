-- Migration 003: Add evaluation system with teams and grade-based rubrics
-- This migration adds:
-- 1. Teams (groups of students)
-- 2. Team members
-- 3. Evaluations (for teams or individual students)
-- 4. Evaluation scores (grades per rubric criteria)
-- 5. Grade fields for rubric criteria

-- Add grade system fields to rubric_criteria
ALTER TABLE rubric_criteria 
ADD COLUMN IF NOT EXISTS use_grade_system BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS max_grade DECIMAL(5,2) DEFAULT 10.00,
ADD COLUMN IF NOT EXISTS level1_grade DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS level2_grade DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS level3_grade DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS level4_grade DECIMAL(5,2);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id VARCHAR PRIMARY KEY,
  project_id VARCHAR NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id VARCHAR PRIMARY KEY,
  team_id VARCHAR NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  student_id VARCHAR NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  role TEXT,
  joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, student_id)
);

-- Evaluations table
CREATE TABLE IF NOT EXISTS evaluations (
  id VARCHAR PRIMARY KEY,
  project_id VARCHAR NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  teacher_id VARCHAR NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  team_id VARCHAR REFERENCES teams(id) ON DELETE CASCADE,
  student_id VARCHAR REFERENCES students(id) ON DELETE CASCADE,
  final_grade DECIMAL(5,2) NOT NULL,
  feedback TEXT,
  evaluated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (
    (team_id IS NOT NULL AND student_id IS NULL) OR 
    (team_id IS NULL AND student_id IS NOT NULL)
  )
);

-- Evaluation scores table
CREATE TABLE IF NOT EXISTS evaluation_scores (
  id VARCHAR PRIMARY KEY,
  evaluation_id VARCHAR NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  criteria_id VARCHAR NOT NULL REFERENCES rubric_criteria(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 4),
  grade DECIMAL(5,2) NOT NULL
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teams_project ON teams(project_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_student ON team_members(student_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_project ON evaluations(project_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_team ON evaluations(team_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_student ON evaluations(student_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_scores_evaluation ON evaluation_scores(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_scores_criteria ON evaluation_scores(criteria_id);
