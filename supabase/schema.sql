-- MeritView Database Schema
-- Run this in your Supabase SQL Editor

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  nic TEXT UNIQUE NOT NULL,
  iq_marks INTEGER NOT NULL CHECK (iq_marks >= 0 AND iq_marks <= 100),
  province TEXT NOT NULL DEFAULT '',
  district TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (students submitting marks)
CREATE POLICY "Anyone can insert students"
  ON students FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can read students (for public leaderboard)
CREATE POLICY "Anyone can read students"
  ON students FOR SELECT
  USING (true);

-- Policy: Only service role can delete (admin)
-- Deletions are done via service role key (bypasses RLS)

-- Create an index on iq_marks for fast ranking queries
CREATE INDEX IF NOT EXISTS idx_students_iq_marks ON students(iq_marks DESC);

-- Create an index on nic for fast uniqueness checks
CREATE INDEX IF NOT EXISTS idx_students_nic ON students(nic);

-- Useful view for ranked results
CREATE OR REPLACE VIEW student_rankings AS
SELECT
  id,
  name,
  iq_marks,
  RANK() OVER (ORDER BY iq_marks DESC) as rank,
  created_at
FROM students
ORDER BY iq_marks DESC;

-- =============================================
-- App Settings table (feature flags)
-- =============================================
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT 'true',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings (marks entry ON, results viewing ON)
INSERT INTO app_settings (key, value)
VALUES
  ('marks_entry_enabled', 'true'),
  ('results_viewing_enabled', 'true')
ON CONFLICT (key) DO NOTHING;

-- Policy: Public can read settings (needed for feature checks)
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings"
  ON app_settings FOR SELECT
  USING (true);

-- Service role (admin) handles writes via supabaseAdmin client (bypasses RLS)

