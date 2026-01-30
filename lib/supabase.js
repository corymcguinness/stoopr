import { createClient } from "@supabase/supabase-js";

export function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
  }

  // sanity: Cloudflare misconfig shouldn’t crash silently
  if (!/^https?:\/\//.test(url)) {
    throw new Error("SUPABASE_URL must start with http(s)://");
  }

  return createClient(url, anon, {
    auth: { persistSession: false },
  });
}
