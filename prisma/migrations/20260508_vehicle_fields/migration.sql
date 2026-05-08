-- Add vehicle tracking fields
ALTER TABLE "Vehicle"
  ADD COLUMN IF NOT EXISTS "colour"          TEXT,
  ADD COLUMN IF NOT EXISTS "fuelType"        TEXT,
  ADD COLUMN IF NOT EXISTS "motExpiry"       TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "lastServiceDate" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "nextServiceDue"  TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "currentMileage"  INTEGER,
  ADD COLUMN IF NOT EXISTS "notes"           TEXT;
