-- Migration: Add performance indexes for Analytics queries
-- This migration adds database indexes to improve performance of Analytics Dashboard queries

-- Index for portfolio queries by student ID
CREATE INDEX IF NOT EXISTS idx_portfolio_items_student_id ON portfolio_items(student_id);

-- Index for portfolio queries by submission ID
CREATE INDEX IF NOT EXISTS idx_portfolio_items_submission_id ON portfolio_items(submission_id);

-- Index for portfolio public lookup by slug
CREATE INDEX IF NOT EXISTS idx_students_portfolio_slug ON students(portfolio_slug) WHERE portfolio_slug IS NOT NULL;

-- Composite index for attendance queries by class and status
CREATE INDEX IF NOT EXISTS idx_attendance_class_status ON attendance(class_id, status);

-- Index for attendance queries by student
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);

-- Index for submission queries by student
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON submissions(student_id);

-- Index for submission queries by project
CREATE INDEX IF NOT EXISTS idx_submissions_project_id ON submissions(project_id);

-- Index for student-class relationship queries
CREATE INDEX IF NOT EXISTS idx_student_classes_class_id ON student_classes(class_id);
CREATE INDEX IF NOT EXISTS idx_student_classes_student_id ON student_classes(student_id);

-- Index for project competency queries
CREATE INDEX IF NOT EXISTS idx_project_competencies_competency_id ON project_competencies(competency_id);

-- Index for team member queries
CREATE INDEX IF NOT EXISTS idx_team_members_student_id ON team_members(student_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);

-- Comment on indexes
COMMENT ON INDEX idx_portfolio_items_student_id IS 'Speeds up portfolio item lookup by student';
COMMENT ON INDEX idx_attendance_class_status IS 'Optimizes attendance rate calculations per class';
COMMENT ON INDEX idx_submissions_student_id IS 'Improves student submission history queries';
COMMENT ON INDEX idx_student_classes_class_id IS 'Accelerates class roster queries';
COMMENT ON INDEX idx_project_competencies_competency_id IS 'Optimizes BNCC competency usage analytics';
