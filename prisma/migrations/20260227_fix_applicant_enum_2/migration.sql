-- Ensure applications.applicant_type uses the "ApplicantType" enum used by Prisma

BEGIN;

-- Create the target enum type if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ApplicantType') THEN
    CREATE TYPE "ApplicantType" AS ENUM ('STUDENT','PROFESSOR');
  END IF;
END$$;

-- If the column exists and is not of type ApplicantType, alter it
DO $$
DECLARE
  current_udt text;
BEGIN
  SELECT udt_name INTO current_udt
  FROM information_schema.columns
  WHERE table_name = 'applications' AND column_name = 'applicant_type';

  IF current_udt IS NOT NULL AND current_udt <> 'ApplicantType' THEN
    -- Try to alter the column to use the quoted ApplicantType enum
    BEGIN
      EXECUTE 'ALTER TABLE applications ALTER COLUMN applicant_type TYPE "ApplicantType" USING (applicant_type::text::"ApplicantType")';
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'Could not alter applications.applicant_type to "ApplicantType": %', SQLERRM;
    END;
  END IF;
END$$;

COMMIT;
