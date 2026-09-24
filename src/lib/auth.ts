import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AdminSession {
  userId: string;
  email: string | null;
}

/**
 * Gate for every admin page and every mutating server action.
 *
 * This is the second of three gates:
 *   1. middleware  — stops unauthenticated requests reaching /admin at all
 *   2. this call   — re-checks on the server for every page and every action,
 *                    so a mutation can never be invoked without it
 *   3. RLS         — the real boundary, enforced in Postgres
 *
 * Belt and braces is deliberate. Gate 3 alone would be enough for security;
 * gates 1 and 2 exist so failures are a clean redirect rather than a
 * confusing database error.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: adminRow } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRow) redirect("/login?error=not-admin");

  return { userId: user.id, email: user.email ?? null };
}

/** Non-redirecting variant, for server actions that return a result object. */
export async function checkAdmin(): Promise<AdminSession | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: adminRow } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRow) return null;
  return { userId: user.id, email: user.email ?? null };
}
