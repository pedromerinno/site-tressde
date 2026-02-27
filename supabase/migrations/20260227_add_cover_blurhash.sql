-- Add blurhash placeholder column to cases
--
-- After applying this migration (or if pushing from CLI):
-- 1. Migration: supabase link (choose project) then npm run supabase:db-push
-- 2. Backfill: npx tsx scripts/generate-blurhashes.ts
--    (requires dotenv if using .env.local; uses sharp, no canvas)
ALTER TABLE cases ADD COLUMN IF NOT EXISTS cover_blurhash TEXT;
