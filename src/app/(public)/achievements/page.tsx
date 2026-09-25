import type { Metadata } from "next";
import Image from "next/image";
import { getAchievements } from "@/lib/data";
import { EmptyState, PageHeader } from "@/components/site/Primitives";
import { formatMonthYear, real } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Achievements",
  alternates: { canonical: "/achievements" },
};

export default async function AchievementsPage() {
  const achievements = await getAchievements();

  return (
    <>
      <PageHeader eyebrow="Achievements" title="Recognition" lede="Scholarships and awards." />

      {achievements.length === 0 ? (
        <EmptyState what="achievements" />
      ) : (
        <ol className="divide-y divide-rule border-y border-rule">
          {achievements.map((item) => {
            const date = formatMonthYear(item.awarded_on);
            const image = real(item.image_url);

            return (
              <li key={item.id} className="grid gap-5 py-10 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-10">
                <div className="sm:pt-1">{date && <p className="font-mono text-xs text-muted">{date}</p>}</div>

                <div className="max-w-reading">
                  <h2 className="font-serif text-2xl tracking-tight">{item.title}</h2>
                  {real(item.organization) && <p className="mt-1 text-sm text-accent">{real(item.organization)}</p>}
                  {real(item.description) && (
                    <p className="mt-3 text-[15px] leading-relaxed text-ink/80">{real(item.description)}</p>
                  )}

                  {image && (
                    <div className="relative mt-5 aspect-[4/3] w-full max-w-sm overflow-hidden rounded-lg border border-rule bg-white">
                      <Image
                        src={image}
                        alt={`Certificate for ${item.title}`}
                        fill
                        sizes="(max-width: 640px) 100vw, 384px"
                        className="object-contain"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {real(item.external_url) && (
                    <p className="mt-4">
                      <a href={item.external_url!} target="_blank" rel="noreferrer" className="link text-sm font-medium">
                        More detail ↗
                      </a>
                    </p>
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
