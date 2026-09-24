import Image from "next/image";
import type { Project } from "@/lib/database.types";
import { formatYear, real, realList } from "@/lib/utils";
import { TagList } from "./Primitives";

/**
 * One card shape for Finance, Analytics and general projects. The differences
 * between them are which links exist, so the card just renders whichever of
 * them are filled in.
 */
export default function ProjectCard({ project }: { project: Project }) {
  const short = real(project.short_description);
  const category = real(project.category);
  const year = formatYear(project.project_date);
  const tools = realList(project.tools.length ? project.tools : project.technology);
  const thumbnail = real(project.thumbnail_url);

  const links: { href: string; label: string }[] = [];
  if (real(project.demo_url)) links.push({ href: project.demo_url!, label: "Live demo" });
  if (real(project.github_url)) links.push({ href: project.github_url!, label: "GitHub" });
  if (real(project.report_url)) links.push({ href: project.report_url!, label: "Report (PDF)" });
  if (real(project.model_url)) links.push({ href: project.model_url!, label: "Excel model" });
  if (real(project.case_study_url)) links.push({ href: project.case_study_url!, label: "Case study" });

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-rule bg-card transition-colors hover:border-ink/25">
      {thumbnail && (
        <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-rule bg-paper">
          <Image
            src={thumbnail}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 480px"
            className="object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-6">
        {(category || year) && (
          <p className="eyebrow mb-3">
            {[category, year].filter(Boolean).join(" · ")}
          </p>
        )}

        <h3 className="font-serif text-xl leading-snug tracking-tight">{project.title}</h3>

        {short && <p className="mt-2.5 text-sm leading-relaxed text-ink/70">{short}</p>}

        {tools.length > 0 && (
          <div className="mt-4">
            <TagList items={tools} label={`Tools used in ${project.title}`} />
          </div>
        )}

        {links.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 pt-1">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-ink underline decoration-rule underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
                >
                  {link.label} ↗
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
