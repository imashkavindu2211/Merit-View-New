-- MeritView — Province & District Migration
-- Run this in your Supabase SQL Editor

-- 1. Add province and district columns
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS province TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS district TEXT NOT NULL DEFAULT '';

-- 2. Add indexes for fast filtering
CREATE INDEX IF NOT EXISTS idx_students_province ON students(province);
CREATE INDEX IF NOT EXISTS idx_students_district ON students(district);

-- 3. Update the iq_marks constraint to match the new max of 100
--    First clamp any existing rows that exceed 100 (entered under the old 200 limit)
UPDATE students SET iq_marks = 100 WHERE iq_marks > 100;

ALTER TABLE students DROP CONSTRAINT IF EXISTS students_iq_marks_check;
ALTER TABLE students ADD CONSTRAINT students_iq_marks_check CHECK (iq_marks >= 0 AND iq_marks <= 100);

-- 4. Update the student_rankings view to include province and district
--    Must DROP first — CREATE OR REPLACE cannot add new columns mid-position
DROP VIEW IF EXISTS student_rankings;

CREATE VIEW student_rankings AS
SELECT
  id,
  name,
  province,
  district,
  iq_marks,
  RANK() OVER (ORDER BY iq_marks DESC) as rank,
  created_at
FROM students
ORDER BY iq_marks DESC;
