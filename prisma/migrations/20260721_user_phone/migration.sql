-- Contact number for account holders. Nullable so existing users are unaffected;
-- new signups are required to provide one at onboarding.
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "phone" TEXT;
