import Link from "next/link";
import { stripTodoParagraphs } from "@/lib/utils";

/** Page header used on every inner page, so they share a rhythm. */
export function PageHeader({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: string;
  lede?: string | null;
}) {
  return (
    <header className="mb-14 max-w-reading">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-3 font-serif text-4xl leading-[1.1] tracking-tight sm:text-5xl">{title}</h1>
      {lede && <p className="mt-5 text-lg leading-relaxed text-ink/70">{lede}</p>}
    </header>
  );
}

/** A homepage section with a rule and a "see all" link. */
export function HomeSection({
  title,
  href,
  linkLabel,
  children,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  children: React.ReactNode;
}) {
  const headingId = `section-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`;

  return (
    <section className="mt-20" aria-labelledby={headingId}>
      <div className="mb-8 flex items-baseline justify-between gap-4 border-t border-rule pt-5">
        <h2 id={headingId} className="eyebrow">
          {title}
        </h2>
        {href && (
          <Link href={href} className="text-sm text-muted transition-colors hover:text-accent">
            {linkLabel ?? "See all"} →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

/** Renders blank-line-separated text as paragraphs, dropping TODO stubs. */
export function Prose({ text, className }: { text: string | null | undefined; className?: string }) {
  const cleaned = stripTodoParagraphs(text);
  if (!cleaned) return null;

  return (
    <div className={`prose-editorial ${className ?? ""}`}>
      {cleaned.split(/\n{2,}/).map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  );
}

/** Small monospace chips for skills, tools and tags. */
export function TagList({ items, label }: { items: string[]; label?: string }) {
  if (items.length === 0) return null;
  return (
    <ul aria-label={label} className="flex flex-wrap gap-x-2 gap-y-1.5">
      {items.map((item) => (
        <li key={item} className="rounded-full border border-rule px-2.5 py-0.5 font-mono text-[11px] text-muted">
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Shown when a section has no published rows yet. */
export function EmptyState({ what }: { what: string }) {
  return (
    <p className="rounded-xl border border-dashed border-rule px-6 py-12 text-center text-sm text-muted">
      No {what} published yet.
    </p>
  );
}
