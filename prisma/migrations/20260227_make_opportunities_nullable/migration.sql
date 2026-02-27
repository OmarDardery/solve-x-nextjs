-- Make opportunities compatible with student-owned opportunities

BEGIN;

-- Add nullable student_id column if it doesn't exist
ALTER TABLE "opportunities"
  ADD COLUMN IF NOT EXISTS "student_id" BIGINT;

-- Allow professor_id to be nullable
-- Allow professor_id to be nullable (guarded)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'opportunities' AND column_name = 'professor_id' AND is_nullable = 'NO'
  ) THEN
    EXECUTE 'ALTER TABLE opportunities ALTER COLUMN professor_id DROP NOT NULL';
  END IF;
END$$;

-- Add foreign key for student_id (guarded)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conrelid = 'opportunities'::regclass AND contype = 'f' AND conname = 'fk_opportunities_student'
  ) THEN
    ALTER TABLE opportunities ADD CONSTRAINT fk_opportunities_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END$$;

COMMIT;
