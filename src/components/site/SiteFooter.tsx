import Link from "next/link";
import type { SocialLink } from "@/lib/database.types";
import { real } from "@/lib/utils";

export default function SiteFooter({
  name,
  note,
  links,
}: {
  name: string;
  note: string | null;
  links: SocialLink[];
}) {
  const usable = links.filter((link) => real(link.url));

  return (
    <footer className="mt-24 border-t border-rule">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-serif text-lg">{name}</p>
          {note && <p className="mt-1 text-xs text-muted">{note}</p>}
          <p className="mt-1 text-xs text-muted">© {new Date().getFullYear()}</p>
        </div>

        {usable.length > 0 && (
          <nav aria-label="Elsewhere">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {usable.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target={link.url.startsWith("mailto:") ? undefined : "_blank"}
                    rel="noreferrer"
                    className="text-sm text-muted transition-colors hover:text-accent"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      <div className="mx-auto max-w-5xl px-6 pb-8">
        <Link href="/login" className="text-[11px] text-muted/50 hover:text-muted">
          Owner sign-in
        </Link>
      </div>
    </footer>
  );
}
