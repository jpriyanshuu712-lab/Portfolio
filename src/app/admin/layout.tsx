import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { signOut } from "@/app/login/actions";
import Sidebar from "@/components/admin/Sidebar";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false, nocache: true },
};

/** Admin pages must never be cached or statically rendered. */
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Runs on every admin page render. The middleware already redirected
  // non-admins; this is the server-side backstop in case it ever doesn't.
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar email={admin.email} signOutAction={signOut} />
      <main id="main" className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
