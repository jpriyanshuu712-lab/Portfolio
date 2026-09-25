import type { Metadata } from "next";
import Image from "next/image";
import { getEducation, getProfile, getSkillGroups } from "@/lib/data";
import { PageHeader, Prose, TagList } from "@/components/site/Primitives";
import { real } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const [profile, education, skillGroups] = await Promise.all([getProfile(), getEducation(), getSkillGroups()]);

  const name = real(profile?.full_name) ?? "About";
  const avatar = real(profile?.avatar_url);
  const location = real(profile?.location);

  return (
    <>
      <PageHeader eyebrow="About" title={name} lede={real(profile?.headline)} />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-16">
        <div className="max-w-reading">
          <Prose text={profile?.biography} />
        </div>

        <aside className="lg:pt-1">
          {avatar && (
            <div className="relative mb-6 aspect-square w-40 overflow-hidden rounded-xl border border-rule lg:w-full">
              <Image src={avatar} alt={name} fill sizes="240px" className="object-cover" />
            </div>
          )}
          {location && (
            <>
              <p className="eyebrow">Based in</p>
              <p className="mt-1 text-sm text-ink/80">{location}</p>
            </>
          )}
        </aside>
      </div>

      {education.length > 0 && (
        <section className="mt-20" aria-labelledby="education-heading">
          <h2 id="education-heading" className="eyebrow border-t border-rule pt-5">
            Education
          </h2>
          <ul className="mt-8 divide-y divide-rule border-y border-rule">
            {education.map((item) => {
              const years = [item.start_year, item.end_year].filter(Boolean).join(" – ");
              const detail = [real(item.major) && `Major: ${real(item.major)}`, real(item.minor) && `Minor: ${real(item.minor)}`]
                .filter(Boolean)
                .join(" · ");
              return (
                <li key={item.id} className="grid gap-1 py-6 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-6">
                  <div>
                    <h3 className="font-serif text-lg tracking-tight">{item.institution}</h3>
                    <p className="mt-0.5 text-sm text-muted">{item.degree}</p>
                    {detail && <p className="mt-1 text-sm text-muted">{detail}</p>}
                    {real(item.grade) && <p className="mt-1 font-mono text-xs text-muted">{real(item.grade)}</p>}
                    {real(item.description) && (
                      <p className="mt-2 max-w-reading text-sm leading-relaxed text-ink/70">{real(item.description)}</p>
                    )}
                  </div>
                  {years && <p className="font-mono text-xs text-muted sm:text-right">{years}</p>}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {skillGroups.length > 0 && (
        <section className="mt-20" aria-labelledby="skills-heading">
          <h2 id="skills-heading" className="eyebrow border-t border-rule pt-5">
            Skills
          </h2>
          <dl className="mt-8 grid gap-8 sm:grid-cols-2">
            {skillGroups.map((group) => (
              <div key={group.id}>
                <dt className="font-serif text-lg tracking-tight">{group.name}</dt>
                <dd className="mt-3">
                  <TagList items={group.skills.map((s) => s.name)} label={`${group.name} skills`} />
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </>
  );
}
