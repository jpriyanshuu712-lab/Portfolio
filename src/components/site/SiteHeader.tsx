"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/experience", label: "Experience" },
  { href: "/finance", label: "Finance" },
  { href: "/analytics", label: "Analytics" },
  { href: "/projects", label: "Projects" },
  { href: "/writing", label: "Writing" },
  { href: "/achievements", label: "Achievements" },
  { href: "/contact", label: "Contact" },
];

export default function SiteHeader({ name, resumeUrl }: { name: string; resumeUrl: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/85 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="font-serif text-base tracking-tight hover:text-accent">
          {name}
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-6">
            {LINKS.slice(1).map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "text-sm transition-colors hover:text-accent",
                      active ? "text-ink" : "text-muted",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          {resumeUrl && (
            <a href={resumeUrl} target="_blank" rel="noreferrer" className="btn-primary btn-sm hidden sm:inline-flex">
              Download Resume
            </a>
          )}
          <button
            type="button"
            className="btn-secondary btn-sm lg:hidden"
            aria-expanded={open}
            aria-controls="site-mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {open && (
        <nav id="site-mobile-nav" aria-label="Primary, mobile" className="border-t border-rule bg-paper lg:hidden">
          <ul className="mx-auto max-w-5xl px-6 py-3">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="block py-2.5 text-sm text-ink/80 hover:text-accent">
                  {link.label}
                </Link>
              </li>
            ))}
            {resumeUrl && (
              <li className="pt-3">
                <a href={resumeUrl} target="_blank" rel="noreferrer" className="btn-primary btn-sm">
                  Download Resume
                </a>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
