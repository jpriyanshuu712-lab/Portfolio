import type { Metadata } from "next";
import Image from "next/image";
import { getExperiences } from "@/lib/data";
import { EmptyState, PageHeader, TagList } from "@/components/site/Primitives";
import { formatDateRange, real, realList } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Experience",
  alternates: { canonical: "/experience" },
};

export default async function ExperiencePage() {
  const experiences = await getExperiences();

  return (
    <>
      <PageHeader
        eyebrow="Experience"
        title="Where I've worked"
        lede="Accounting, claims operations, and sales & marketing — the ledger side and the customer side."
      />

      {experiences.length === 0 ? (
        <EmptyState what="experience" />
      ) : (
        <ol className="divide-y divide-rule border-y border-rule">
          {experiences.map((item) => {
            const range = formatDateRange(item.start_date, item.end_date, item.is_current);
            const bullets = realList(item.bullets);
            const skills = realList(item.skills);
            const logo = real(item.logo_url);

            return (
              <li key={item.id} className="grid gap-4 py-10 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-10">
                <div className="sm:pt-1">
                  {range && <p className="font-mono text-xs text-muted">{range}</p>}
                  {real(item.location) && <p className="mt-1 text-xs text-muted">{item.location}</p>}
                </div>

                <div className="max-w-reading">
                  <div className="flex items-center gap-3">
                    {logo && (
                      <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded border border-rule bg-white">
                        <Image src={logo} alt="" fill sizes="32px" className="object-contain p-1" loading="lazy" />
                      </span>
                    )}
                    <h2 className="font-serif text-2xl tracking-tight">{item.company}</h2>
                  </div>

                  <p className="mt-1.5 text-sm text-accent">{item.job_title}</p>

                  {real(item.description) && (
                    <p className="mt-3 text-sm leading-relaxed text-ink/70">{item.description}</p>
                  )}

                  {bullets.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {bullets.map((bullet) => (
                        <li key={bullet} className="relative pl-5 text-[15px] leading-relaxed text-ink/85">
                          <span aria-hidden className="absolute left-0 top-[0.6em] h-1 w-1 rounded-full bg-accent" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}

                  {skills.length > 0 && (
                    <div className="mt-5">
                      <TagList items={skills} label={`Skills used at ${item.company}`} />
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
}
