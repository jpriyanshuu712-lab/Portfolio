"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Navigation for the dashboard. Grouped the way you actually think about the
 * site rather than the way the database is shaped.
 */
const GROUPS: { heading: string | null; items: { href: string; label: string }[] }[] = [
  {
    heading: null,
    items: [{ href: "/admin", label: "Overview" }],
  },
  {
    heading: "Profile",
    items: [
      { href: "/admin/about", label: "About" },
      { href: "/admin/experience", label: "Experience" },
      { href: "/admin/education", label: "Education" },
    ],
  },
  {
    heading: "Work",
    items: [
      { href: "/admin/projects", label: "Projects" },
      { href: "/admin/finance", label: "Finance" },
      { href: "/admin/analytics", label: "Analytics" },
    ],
  },
  {
    heading: "Beyond work",
    items: [
      { href: "/admin/writing", label: "Writing" },
      { href: "/admin/achievements", label: "Achievements" },
    ],
  },
  {
    heading: "Setup",
    items: [
      { href: "/admin/skill-categories", label: "Skill categories" },
      { href: "/admin/skills", label: "Skills" },
      { href: "/admin/resume", label: "Resume" },
      { href: "/admin/social", label: "Social links" },
      { href: "/admin/settings", label: "Site settings" },
    ],
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar({ email, signOutAction }: { email: string | null; signOutAction: () => Promise<void> }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav aria-label="Dashboard sections" className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
        {GROUPS.map((group) => (
          <div key={group.heading ?? "root"}>
            {group.heading && <p className="eyebrow mb-2 px-3">{group.heading}</p>}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "block rounded-lg px-3 py-2 text-sm transition-colors",
                        active ? "bg-ink text-paper" : "text-ink/75 hover:bg-ink/5 hover:text-ink",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-rule px-4 py-4">
        <Link href="/" target="_blank" className="block rounded-lg px-3 py-2 text-sm text-ink/75 hover:bg-ink/5 hover:text-ink">
          View public site ↗
        </Link>
        <p className="truncate px-3 pt-3 text-xs text-muted" title={email ?? undefined}>
          {email ?? "Signed in"}
        </p>
        <form action={signOutAction}>
          <button type="submit" className="mt-1 px-3 text-xs font-medium text-accent hover:underline">
            Sign out
          </button>
        </form>
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-rule bg-paper px-4 py-3 lg:hidden">
        <Link href="/admin" className="font-serif text-lg">
          Dashboard
        </Link>
        <button
          type="button"
          className="btn-secondary btn-sm"
          aria-expanded={open}
          aria-controls="admin-mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <div id="admin-mobile-nav" className="border-b border-rule bg-paper lg:hidden">
          {nav}
        </div>
      )}

      {/* Desktop rail */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-rule bg-paper lg:block">
        <div className="px-7 pt-7">
          <Link href="/admin" className="font-serif text-xl tracking-tight">
            Dashboard
          </Link>
        </div>
        {nav}
      </aside>
    </>
  );
}
