// account-service/config/supabase.js

import { createClient } from "@supabase/supabase-js";
import config from "./index.js";

// ─── Public Client ────────────────────────────────────────────────────────────
// Uses the anon key — respects Row Level Security (RLS) policies.
// Use for any operation where RLS should apply.
export const supabase = createClient(
  config.supabaseUrl,
  config.supabaseAnonKey,
);

// ─── Admin Client ─────────────────────────────────────────────────────────────
// Uses the service-role key — bypasses RLS entirely.
// ONLY ever used server-side. NEVER expose this key to the frontend or logs.
export const supabaseAdmin = createClient(
  config.supabaseUrl,
  config.supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false, // server is stateless — no need to refresh tokens
      persistSession: false, // server-side — never persist sessions to storage
    },
  },
);
