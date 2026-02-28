/**
 * Gera blurhash para slots de mídia (vídeo) do Studio reveal que têm poster mas não blurhash.
 * O vídeo hero da home usa esses slots — sem blurhash mostrava poster estático.
 *
 * Uso:
 *   npx tsx scripts/generate-studio-reveal-blurhashes.ts
 *
 * Requer: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY em .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { encode } from "blurhash";
import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

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

type MediaSlot = {
  type: "media";
  media_type: "image" | "video";
  url: string;
  mux_playback_id?: string;
  poster_url?: string;
  blurhash?: string;
  title?: string;
};

function isMediaVideoSlot(s: unknown): s is MediaSlot {
  return (
    typeof s === "object" &&
    s !== null &&
    (s as any).type === "media" &&
    (s as any).media_type === "video"
  );
}

function getPosterUrl(slot: MediaSlot): string | null {
  if (slot.poster_url?.trim()) return slot.poster_url.trim();
  if (slot.mux_playback_id?.trim()) {
    return `https://image.mux.com/${slot.mux_playback_id}/thumbnail.jpg?width=960&fit_mode=smartcrop&time=0`;
  }
  return null;
}

function toPublicUrl(url: string): string {
  let u = url.trim();
  if (u.startsWith("http")) {
    if (u.includes("/storage/v1/object/") && !u.includes("/public/")) {
      u = u.replace("/storage/v1/object/", "/storage/v1/object/public/");
    }
    return u;
  }
  if (u.startsWith("/")) {
    return `${SUPABASE_URL!.replace(/\/$/, "")}${u}`;
  }
  return `${SUPABASE_URL}/storage/v1/object/public/case-covers/${u}`;
}

async function generateBlurhashFromUrl(url: string): Promise<string> {
  const fullUrl = toPublicUrl(url);
  let res: Response;
  try {
    res = await fetch(fullUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BlurhashGenerator/1.0)" },
      signal: AbortSignal.timeout(15000),
    });
  } catch (e: any) {
    throw new Error(`Fetch: ${e?.cause?.code ?? e?.message ?? "unknown"}`);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const { data, info } = await sharp(buffer)
    .resize(ENCODE_W, ENCODE_H, { fit: "fill" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const pixels = new Uint8ClampedArray(data);
  return encode(pixels, info.width, info.height, COMPONENTS_X, COMPONENTS_Y);
}

async function main() {
  console.log("Fetching companies with studio_reveal_slots...");

  const { data: companies, error } = await supabase
    .from("companies")
    .select("id,studio_reveal_slots");

  if (error) {
    console.error("Error fetching companies:", error.message);
    process.exit(1);
  }

  let totalUpdated = 0;
  let totalFailed = 0;

  for (const company of companies ?? []) {
    const slots = company.studio_reveal_slots as unknown[] | null;
    if (!Array.isArray(slots) || slots.length !== 3) continue;

    let modified = false;
    const newSlots = [...slots];

    for (let i = 0; i < 3; i++) {
      const slot = slots[i];
      if (!isMediaVideoSlot(slot)) continue;
      if (slot.blurhash) continue;

      const posterUrl = getPosterUrl(slot);
      if (!posterUrl) continue;

      try {
        const hash = await generateBlurhashFromUrl(posterUrl);
        (newSlots[i] as MediaSlot).blurhash = hash;
        modified = true;
        const label = slot.title?.trim() || `Slot ${i + 1}`;
        console.log(`  ✓ ${label} → ${hash.substring(0, 20)}...`);
        totalUpdated++;
      } catch (err: any) {
        console.error(`  ✗ Slot ${i + 1} (${posterUrl?.slice(0, 60)}...): ${err.message}`);
        totalFailed++;
      }
    }

    if (modified) {
      const { error: updateErr } = await supabase
        .from("companies")
        .update({ studio_reveal_slots: newSlots })
        .eq("id", company.id);

      if (updateErr) {
        console.error(`  ✗ Erro ao salvar company ${company.id}: ${updateErr.message}`);
        totalFailed++;
      }
    }
  }

  console.log(`\nDone! ${totalUpdated} slots updated, ${totalFailed} failed.`);
}

main();
