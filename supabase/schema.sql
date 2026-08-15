-- MeritView Database Schema
-- Run this in your Supabase SQL Editor

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  nic TEXT UNIQUE NOT NULL,
  iq_marks INTEGER NOT NULL CHECK (iq_marks >= 0 AND iq_marks <= 200),
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
