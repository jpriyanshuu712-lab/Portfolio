/**
 * Environment access, in one place, with a readable failure.
 *
 * Only NEXT_PUBLIC_* values are used anywhere in this project. The Supabase
 * service-role key is deliberately never read, so it can never be bundled.
 */

function required(name: string, value: string | undefined): string {
  if (!value || value.trim() === "") {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env.local and fill it in. ` +
        `On Vercel, add it under Project Settings -> Environment Variables.`,
    );
  }
  return value;
}

export function getSupabaseUrl(): string {
  return required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function getSupabaseAnonKey(): string {
  return required("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * True once both Supabase variables are present. The data layer checks this
 * and returns empty results rather than throwing, so `next build` succeeds on
 * a fresh clone before you've filled in .env.local.
 */
export function hasSupabaseEnv(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  );
}

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}
