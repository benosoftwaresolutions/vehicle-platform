-- Let drivers opt out of MOT/service reminder emails (unsubscribe link).
-- Defaults to true so existing users keep getting reminders until they opt out.
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "reminderEmails" BOOLEAN NOT NULL DEFAULT true;
