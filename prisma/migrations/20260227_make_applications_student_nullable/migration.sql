BEGIN;

-- Make applications.student_id nullable if it's currently NOT NULL
DO $$
BEGIN
  IF EXISTS(
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'student_id' AND is_nullable = 'NO'
  ) THEN
    EXECUTE 'ALTER TABLE applications ALTER COLUMN student_id DROP NOT NULL';
  END IF;
END$$;

COMMIT;
