import Link from "next/link";
import Image from "next/image";
import {
  getAchievements,
  getExperiences,
  getFeaturedProjects,
  getProfile,
  getResumeUrl,
  getSiteSettings,
  getSocialLinks,
  getWriting,
} from "@/lib/data";
import { formatDateRange, real, realList } from "@/lib/utils";
import { HomeSection, Prose, TagList } from "@/components/site/Primitives";
import ProjectCard from "@/components/site/ProjectCard";

export default async function HomePage() {
  const [profile, settings, experiences, finance, analytics, projects, writing, achievements, social, resumeUrl] =
    await Promise.all([
      getProfile(),
      getSiteSettings(),
      getExperiences(),
      getFeaturedProjects("finance", 2),
      getFeaturedProjects("analytics", 2),
      getFeaturedProjects("general", 2),
      getWriting(),
      getAchievements(),
      getSocialLinks(),
      getResumeUrl(),
    ]);

  const name = real(profile?.full_name) ?? "Portfolio";
  const headline = real(profile?.headline);
  const intro = real(profile?.intro);
  const avatar = real(profile?.avatar_url);
  const linkedin = social.find((s) => s.icon === "linkedin" && real(s.url))?.url ?? real(profile?.linkedin_url);
  const featuredWriting = (writing.filter((w) => w.is_featured).length ? writing.filter((w) => w.is_featured) : writing).slice(0, 2);

  // Structured data, built from the database like everything else. This is
  // what lets Google show a person card rather than just a blue link.
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle: headline ?? undefined,
    description: intro ?? undefined,
    image: avatar ?? undefined,
    email: real(profile?.email) ? `mailto:${profile?.email}` : undefined,
    address: real(profile?.location) ? { "@type": "PostalAddress", addressLocality: profile?.location } : undefined,
    sameAs: social.map((s) => s.url).filter((url) => real(url) && !url.startsWith("mailto:")),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Serialised from our own database values, not from user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />

      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="flex flex-col-reverse gap-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-reading">
          <h1 className="font-serif text-[2.6rem] leading-[1.05] tracking-tight sm:text-6xl">{name}</h1>

          {headline && (
            <p className="mt-4 font-mono text-[13px] uppercase tracking-[0.16em] text-accent">{headline}</p>
          )}

          {intro && <p className="mt-7 text-lg leading-[1.7] text-ink/75">{intro}</p>}

          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/projects" className="btn-primary">
              View my work
            </Link>
            {resumeUrl && (
              <a href={resumeUrl} target="_blank" rel="noreferrer" className="btn-secondary">
                Download resume
              </a>
            )}
            {linkedin && (
              <a href={linkedin} target="_blank" rel="noreferrer" className="btn-ghost">
                LinkedIn ↗
              </a>
            )}
          </div>
        </div>

        {avatar && (
          <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full border border-rule sm:h-40 sm:w-40">
            <Image src={avatar} alt={`${name}`} fill sizes="160px" className="object-cover" priority />
          </div>
        )}
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Selected experience                                               */}
      {/* ---------------------------------------------------------------- */}
      {experiences.length > 0 && (
        <HomeSection title="Selected experience" href="/experience" linkLabel="Full history">
          <ul className="divide-y divide-rule border-y border-rule">
            {experiences.slice(0, 3).map((item) => {
              const range = formatDateRange(item.start_date, item.end_date, item.is_current);
              return (
                <li key={item.id} className="grid gap-1 py-5 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-6">
                  <div>
                    <h3 className="font-serif text-lg tracking-tight">{item.company}</h3>
                    <p className="mt-0.5 text-sm text-muted">{item.job_title}</p>
                  </div>
                  {range && <p className="font-mono text-xs text-muted sm:text-right">{range}</p>}
                </li>
              );
            })}
          </ul>
        </HomeSection>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Finance                                                           */}
      {/* ---------------------------------------------------------------- */}
      {finance.length > 0 && (
        <HomeSection title="Finance" href="/finance">
          <div className="grid gap-6 sm:grid-cols-2">
            {finance.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </HomeSection>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Analytics                                                         */}
      {/* ---------------------------------------------------------------- */}
      {analytics.length > 0 && (
        <HomeSection title="Analytics" href="/analytics">
          <div className="grid gap-6 sm:grid-cols-2">
            {analytics.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </HomeSection>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Things I've built                                                 */}
      {/* ---------------------------------------------------------------- */}
      {projects.length > 0 && (
        <HomeSection title="Things I've built" href="/projects">
          <div className="grid gap-6 sm:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </HomeSection>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Writing                                                           */}
      {/* ---------------------------------------------------------------- */}
      {featuredWriting.length > 0 && (
        <HomeSection title="The Writer's Room" href="/writing" linkLabel="Read more">
          <ul className="grid gap-6 sm:grid-cols-2">
            {featuredWriting.map((piece) => (
              <li key={piece.id} className="rounded-xl border border-rule bg-card p-6">
                <p className="eyebrow mb-3">{piece.writing_type.replace(/_/g, " ")}</p>
                <h3 className="font-serif text-xl leading-snug tracking-tight">{piece.title}</h3>
                {real(piece.description) && (
                  <p className="mt-2.5 text-sm leading-relaxed text-ink/70">{real(piece.description)}</p>
                )}
                {realList(piece.tags).length > 0 && (
                  <div className="mt-4">
                    <TagList items={realList(piece.tags)} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </HomeSection>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Achievements                                                      */}
      {/* ---------------------------------------------------------------- */}
      {achievements.length > 0 && (
        <HomeSection title="Achievements" href="/achievements">
          <ul className="divide-y divide-rule border-y border-rule">
            {achievements.slice(0, 3).map((item) => (
              <li key={item.id} className="py-5">
                <h3 className="font-serif text-lg tracking-tight">{item.title}</h3>
                {real(item.organization) && <p className="mt-0.5 text-sm text-muted">{real(item.organization)}</p>}
              </li>
            ))}
          </ul>
        </HomeSection>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Contact                                                           */}
      {/* ---------------------------------------------------------------- */}
      <HomeSection title="Contact">
        <div className="max-w-reading">
          <p className="font-serif text-2xl leading-snug tracking-tight sm:text-3xl">
            Open to Finance and Analytics roles, and always happy to talk about a good book.
          </p>
          <Prose text={settings?.contact_note} className="mt-5" />
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/contact" className="btn-primary">
              Get in touch
            </Link>
            {resumeUrl && (
              <a href={resumeUrl} target="_blank" rel="noreferrer" className="btn-secondary">
                Download resume
              </a>
            )}
          </div>
        </div>
      </HomeSection>
    </>
  );
}
