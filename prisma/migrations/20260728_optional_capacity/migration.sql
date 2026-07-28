-- Capacity is now optional: NULL means no per-slot booking limit
-- (the garage accepts or declines each request manually).
ALTER TABLE "GarageAvailability" ALTER COLUMN "capacity" DROP NOT NULL;
