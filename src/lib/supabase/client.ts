"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/env";
import type { Database } from "@/lib/database.types";

/**
 * Browser client. Carries the anon key, which is safe to expose: every
 * statement it issues is still evaluated against Row Level Security in
 * Postgres. Used for sign-in and for direct-to-Storage uploads.
 */
export function createClient() {
  return createBrowserClient<Database>(getSupabaseUrl(), getSupabaseAnonKey());
}
