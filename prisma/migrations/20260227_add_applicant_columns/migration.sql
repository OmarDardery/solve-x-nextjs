BEGIN;

-- Create enum type if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'applicant_type') THEN
    CREATE TYPE applicant_type AS ENUM ('STUDENT','PROFESSOR');
  END IF;
END$$;

-- Add nullable student owner on opportunities
ALTER TABLE IF EXISTS opportunities ADD COLUMN IF NOT EXISTS student_id bigint;

-- Add nullable professor applicant and applicant_type on applications
ALTER TABLE IF EXISTS applications ADD COLUMN IF NOT EXISTS professor_id bigint;
ALTER TABLE IF EXISTS applications ADD COLUMN IF NOT EXISTS applicant_type applicant_type NOT NULL DEFAULT 'STUDENT';

-- Add foreign key for opportunities.student_id -> students.id (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_opportunities_student'
  ) THEN
    ALTER TABLE opportunities ADD CONSTRAINT fk_opportunities_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
  END IF;
END$$;

-- Add foreign key for applications.professor_id -> professors.id (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_applications_professor_applicant'
  ) THEN
    ALTER TABLE applications ADD CONSTRAINT fk_applications_professor_applicant FOREIGN KEY (professor_id) REFERENCES professors(id) ON DELETE CASCADE;
  END IF;
END$$;

COMMIT;
