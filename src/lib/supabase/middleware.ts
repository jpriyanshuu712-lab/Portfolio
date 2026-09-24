import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseAnonKey, getSupabaseUrl, hasSupabaseEnv } from "@/lib/env";

/**
 * Refreshes the Supabase session on every request and guards /admin.
 *
 * This is the FIRST of two gates. It stops unauthenticated people from ever
 * rendering the dashboard. It is not the security boundary on its own — the
 * real one is Row Level Security in Postgres (see supabase/01_schema.sql),
 * which is what stops a signed-in non-admin from writing anything even if they
 * somehow reached the UI.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // No credentials configured yet: fail closed on /admin rather than open.
  if (!hasSupabaseEnv()) {
    if (request.nextUrl.pathname.startsWith("/admin")) {
      const url = new URL("/login", request.url);
      url.searchParams.set("error", "not-configured");
      return NextResponse.redirect(url);
    }
    return response;
  }

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getUser() revalidates the JWT against Supabase Auth. Do not swap this for
  // getSession(), which trusts the cookie without verifying it.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Signed in, but is this account on the admin allow-list? The query runs
    // under the user's own JWT, so RLS only returns a row for the user itself.
    const { data: adminRow } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!adminRow) {
      const deniedUrl = new URL("/login", request.url);
      deniedUrl.searchParams.set("error", "not-admin");
      return NextResponse.redirect(deniedUrl);
    }
  }

  // Already signed in as admin? Skip the login screen.
  if (pathname === "/login" && user) {
    const { data: adminRow } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (adminRow) return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}
