/**
 * One-time script to backfill cover_blurhash for existing cases.
 *
 * Usage:
 *   npx tsx scripts/generate-blurhashes.ts
 *
 * Requires:
 *   - Node 18+ (for global fetch)
 *   - npx tsx (TypeScript runner)
 *   - sharp (project dependency)
 *   - dotenv (optional; use npm install dotenv --save-dev if needed)
 *   - VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local
 *
 * Run after the migration 20260227_add_cover_blurhash.sql is applied.
 */

import { createClient } from "@supabase/supabase-js";
import { encode } from "blurhash";
import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load env vars from .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const ENCODE_W = 32;
const ENCODE_H = 32;
const COMPONENTS_X = 4;
const COMPONENTS_Y = 3;

async function generateBlurhashFromUrl(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const { data, info } = await sharp(buffer)
    .resize(ENCODE_W, ENCODE_H, { fit: "fill" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  // blurhash.encode expects Uint8ClampedArray RGBA
  const pixels = new Uint8ClampedArray(data);
  return encode(pixels, info.width, info.height, COMPONENTS_X, COMPONENTS_Y);
}

async function main() {
  console.log("Fetching cases with cover images...");

  const { data: cases, error } = await supabase
    .from("cases")
    .select("id,title,cover_image_url,cover_blurhash")
    .not("cover_image_url", "is", null);

  if (error) {
    console.error("Error fetching cases:", error.message);
    process.exit(1);
  }

  const toProcess = (cases ?? []).filter((c) => !c.cover_blurhash && c.cover_image_url);
  console.log(`Found ${toProcess.length} cases without blurhash (of ${cases?.length ?? 0} total with cover images).`);

  let success = 0;
  let failed = 0;

  for (const c of toProcess) {
    try {
      // Ensure public URL
      let url = c.cover_image_url!;
      if (!url.includes("/storage/v1/object/public/")) {
        url = url.replace(
          "/storage/v1/object/case-covers/",
          "/storage/v1/object/public/case-covers/",
        );
      }

      const hash = await generateBlurhashFromUrl(url);

      const { error: updateErr } = await supabase
        .from("cases")
        .update({ cover_blurhash: hash })
        .eq("id", c.id);

      if (updateErr) {
        console.error(`  ✗ ${c.title} (${c.id}): ${updateErr.message}`);
        failed++;
      } else {
        console.log(`  ✓ ${c.title} → ${hash.substring(0, 20)}...`);
        success++;
      }
    } catch (err: any) {
      console.error(`  ✗ ${c.title} (${c.id}): ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone! ${success} updated, ${failed} failed.`);
}

main();
