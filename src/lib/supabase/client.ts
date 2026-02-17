import { createClient } from "@supabase/supabase-js";

function getEnv(name: string, value: unknown): string {
  if (typeof value === "string" && value.length > 0) return value;
  if (import.meta.env.DEV) {
    throw new Error(
      `Missing environment variable "${name}". Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.`,
    );
  }
  return "";
}

const supabaseUrl = getEnv("VITE_SUPABASE_URL", import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = getEnv("VITE_SUPABASE_ANON_KEY", import.meta.env.VITE_SUPABASE_ANON_KEY);

// Supabase throws "supabaseUrl is required" when url is empty — use placeholder in production when env is missing.
const url = supabaseUrl || "https://placeholder.supabase.co";
const key = supabaseAnonKey || "placeholder-anon-key";

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

