-- Migration 004: Add Portfolio System
-- Allows students to create a public portfolio showcasing their best projects

-- Create portfolio_items table
CREATE TABLE IF NOT EXISTS portfolio_items (
  id VARCHAR PRIMARY KEY,
  student_id VARCHAR NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  submission_id VARCHAR NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, submission_id)
);

-- Add portfolio fields to students table
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS portfolio_slug VARCHAR UNIQUE,
ADD COLUMN IF NOT EXISTS portfolio_visible BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS portfolio_bio TEXT;

-- Create index for faster portfolio queries
CREATE INDEX IF NOT EXISTS idx_portfolio_items_student ON portfolio_items(student_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_submission ON portfolio_items(submission_id);
CREATE INDEX IF NOT EXISTS idx_students_portfolio_slug ON students(portfolio_slug);
