import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getWritingBySlug } from "@/lib/data";
import { Prose, TagList } from "@/components/site/Primitives";
import { formatMonthYear, real, realList } from "@/lib/utils";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const piece = await getWritingBySlug(params.slug);
  if (!piece) return { title: "Not found", robots: { index: false, follow: false } };

  return {
    title: piece.title,
    description: real(piece.description) ?? undefined,
    alternates: { canonical: `/writing/${params.slug}` },
    openGraph: {
      title: piece.title,
      description: real(piece.description) ?? undefined,
      type: "article",
      images: real(piece.cover_url) ? [piece.cover_url!] : undefined,
    },
  };
}

export default async function WritingPiecePage({ params }: { params: { slug: string } }) {
  const piece = await getWritingBySlug(params.slug);
  if (!piece) notFound();

  const date = formatMonthYear(piece.published_on);

  return (
    <article className="mx-auto max-w-reading">
      <Link href="/writing" className="eyebrow mb-8 inline-block hover:text-ink">
        ← The Writer&rsquo;s Room
      </Link>

      <p className="eyebrow">{[piece.writing_type.replace(/_/g, " "), date].filter(Boolean).join(" · ")}</p>

      <h1 className="mt-3 font-serif text-4xl leading-[1.15] tracking-tight sm:text-5xl">{piece.title}</h1>

      {real(piece.description) && <p className="mt-5 text-lg leading-relaxed text-ink/70">{piece.description}</p>}

      <div className="mt-10 border-t border-rule pt-10">
        <Prose text={piece.body} />
      </div>

      {realList(piece.tags).length > 0 && (
        <div className="mt-10 border-t border-rule pt-6">
          <TagList items={realList(piece.tags)} label="Tags" />
        </div>
      )}

      {(real(piece.external_url) || real(piece.pdf_url)) && (
        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
          {real(piece.external_url) && (
            <li>
              <a href={piece.external_url!} target="_blank" rel="noreferrer" className="link text-sm font-medium">
                Read elsewhere ↗
              </a>
            </li>
          )}
          {real(piece.pdf_url) && (
            <li>
              <a href={piece.pdf_url!} target="_blank" rel="noreferrer" className="link text-sm font-medium">
                Download PDF ↗
              </a>
            </li>
          )}
        </ul>
      )}
    </article>
  );
}
