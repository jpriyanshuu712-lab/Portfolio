import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

const NOTICES: Record<string, string> = {
  "not-admin": "You're signed in, but that account isn't the site owner. Admin access is granted in SQL only.",
  "not-configured":
    "Supabase isn't configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local and restart.",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
}) {
  const notice = searchParams.error ? NOTICES[searchParams.error] : undefined;
  const next = searchParams.next?.startsWith("/admin") ? searchParams.next : "/admin";

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="eyebrow mb-10 inline-block hover:text-ink">
          ← Back to the site
        </Link>

        <h1 className="font-serif text-3xl tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          This is the owner&rsquo;s entrance. There is no public registration — the only account that exists is the one
          you created in Supabase.
        </p>

        {notice && (
          <p role="status" className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {notice}
          </p>
        )}

        <LoginForm next={next} />
      </div>
    </main>
  );
}
