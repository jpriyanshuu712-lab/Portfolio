import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getWriting } from "@/lib/data";
import { EmptyState, PageHeader, TagList } from "@/components/site/Primitives";
import { formatYear, real, realList } from "@/lib/utils";

export const metadata: Metadata = {
  title: "The Writer's Room",
  description: "Books, essays, poems and short stories.",
  alternates: { canonical: "/writing" },
};

const TYPE_LABELS: Record<string, string> = {
  book: "Book",
  poem: "Poem",
  short_story: "Short story",
  article: "Article",
  essay: "Essay",
  sample: "Writing sample",
};

export default async function WritingPage() {
  const pieces = await getWriting();

  return (
    <>
      <PageHeader
        eyebrow="Writing"
        title="The Writer's Room"
        lede="I've been writing for years — a novel, essays, and whatever else insists on being written. It's where I learned to make a complicated thing land in one clear sentence."
      />

      {pieces.length === 0 ? (
        <EmptyState what="writing" />
      ) : (
        <ul className="grid gap-8 sm:grid-cols-2">
          {pieces.map((piece) => {
            const cover = real(piece.cover_url);
            const year = formatYear(piece.published_on);
            const hasPage = !!(real(piece.body) && real(piece.slug));

            const links: { href: string; label: string; external: boolean }[] = [];
            if (hasPage) links.push({ href: `/writing/${piece.slug}`, label: "Read", external: false });
            if (real(piece.external_url)) links.push({ href: piece.external_url!, label: "Read elsewhere", external: true });
            if (real(piece.pdf_url)) links.push({ href: piece.pdf_url!, label: "PDF", external: true });

            return (
              <li key={piece.id} className="flex flex-col overflow-hidden rounded-xl border border-rule bg-card">
                {cover && (
                  <div className="relative aspect-[3/2] w-full border-b border-rule bg-paper">
                    <Image src={cover} alt="" fill sizes="(max-width: 640px) 100vw, 400px" className="object-cover" loading="lazy" />
                  </div>
                )}

                <div className="flex flex-1 flex-col p-6">
                  <p className="eyebrow mb-3">
                    {[TYPE_LABELS[piece.writing_type] ?? piece.writing_type, year].filter(Boolean).join(" · ")}
                  </p>

                  <h2 className="font-serif text-2xl leading-snug tracking-tight">{piece.title}</h2>

                  {real(piece.description) && (
                    <p className="mt-3 text-sm leading-relaxed text-ink/70">{piece.description}</p>
                  )}

                  {realList(piece.tags).length > 0 && (
                    <div className="mt-4">
                      <TagList items={realList(piece.tags)} />
                    </div>
                  )}

                  {links.length > 0 && (
                    <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
                      {links.map((link) =>
                        link.external ? (
                          <li key={link.href}>
                            <a href={link.href} target="_blank" rel="noreferrer" className="link text-sm font-medium">
                              {link.label} ↗
                            </a>
                          </li>
                        ) : (
                          <li key={link.href}>
                            <Link href={link.href} className="link text-sm font-medium">
                              {link.label} →
                            </Link>
                          </li>
                        ),
                      )}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
