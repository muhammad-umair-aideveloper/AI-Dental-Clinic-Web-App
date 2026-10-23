-- ============================================================================
-- NOTE: APPLY THIS MIGRATION IN THE SUPABASE SQL EDITOR BEFORE RUNNING NEW CODE.
-- ============================================================================

-- Step 1: Duplicate Audit Query
-- If this query returns ANY rows, DO NOT proceed with index creation.
-- Resolve duplicates manually with the clinic owner.
SELECT date, time, COUNT(*) AS count
FROM appointments
WHERE status = 'confirmed'
GROUP BY date, time
HAVING COUNT(*) > 1;

-- Step 2: Additive column `reminder_sent`
-- Initial default TRUE sets all existing historical rows to TRUE (no UPDATE needed).
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS reminder_sent boolean NOT NULL DEFAULT true;

-- Then change the default to FALSE so all new appointments default to FALSE.
ALTER TABLE appointments 
ALTER COLUMN reminder_sent SET DEFAULT false;

-- Step 3: Additive column `source` with CHECK constraint
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'form';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_appointments_source'
  ) THEN
    ALTER TABLE appointments 
    ADD CONSTRAINT chk_appointments_source 
    CHECK (source IN ('form', 'chatbot'));
  END IF;
END $$;

-- Step 4: Partial Unique Index on active confirmed bookings
CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_date_time_confirmed
ON appointments (date, time)
WHERE status = 'confirmed';
