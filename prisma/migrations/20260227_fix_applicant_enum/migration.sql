-- Ensure database has the enum type expected by Prisma (ApplicantType)

BEGIN;

-- Create "ApplicantType" enum if it does not exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ApplicantType') THEN
    CREATE TYPE "ApplicantType" AS ENUM ('STUDENT','PROFESSOR');
  END IF;
END$$;

-- If applications.applicant_type exists and is a different enum type, convert it to "ApplicantType"
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'applicant_type'
  ) THEN
    -- Attempt to alter column to the new enum type using text cast
    BEGIN
      ALTER TABLE applications ALTER COLUMN applicant_type TYPE "ApplicantType" USING applicant_type::text::"ApplicantType";
    EXCEPTION WHEN others THEN
      -- ignore if conversion fails; column may already be correct type
      RAISE NOTICE 'Could not alter applications.applicant_type to ApplicantType: %', SQLERRM;
    END;
  END IF;
END$$;

COMMIT;
