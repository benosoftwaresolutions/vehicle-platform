-- Track whether the 12h/1h appointment reminder emails have been sent,
-- so the reminders cron doesn't send duplicates on every run.
ALTER TABLE "Booking"
  ADD COLUMN IF NOT EXISTS "reminder12hSentAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "reminder1hSentAt"  TIMESTAMP(3);
