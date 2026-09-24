import type { Metadata } from "next";
import { getProjects } from "@/lib/data";
import { EmptyState, PageHeader, Prose, TagList } from "@/components/site/Primitives";
import { real, realList } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Projects",
  description: "Products, prototypes and concepts.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const projects = await getProjects("general");

  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="Things I've built"
        lede="Products and prototypes — the problem first, then how I went at it."
      />

      {projects.length === 0 ? (
        <EmptyState what="projects" />
      ) : (
        <ol className="divide-y divide-rule border-y border-rule">
          {projects.map((project) => {
            const features = realList(project.features);
            const tech = realList(project.technology.length ? project.technology : project.tools);

            const links: { href: string; label: string }[] = [];
            if (real(project.demo_url)) links.push({ href: project.demo_url!, label: "Live demo" });
            if (real(project.github_url)) links.push({ href: project.github_url!, label: "GitHub" });
            if (real(project.case_study_url)) links.push({ href: project.case_study_url!, label: "Case study" });

            return (
              <li key={project.id} className="py-12">
                <div className="max-w-reading">
                  {real(project.category) && <p className="eyebrow">{project.category}</p>}
                  <h2 className="mt-2 font-serif text-3xl tracking-tight">{project.title}</h2>
                  {real(project.short_description) && (
                    <p className="mt-3 text-lg leading-relaxed text-ink/70">{project.short_description}</p>
                  )}

                  {real(project.problem) && (
                    <div className="mt-7">
                      <h3 className="eyebrow mb-2">Problem</h3>
                      <Prose text={project.problem} />
                    </div>
                  )}

                  {real(project.solution) && (
                    <div className="mt-6">
                      <h3 className="eyebrow mb-2">Solution</h3>
                      <Prose text={project.solution} />
                    </div>
                  )}

                  {features.length > 0 && (
                    <div className="mt-6">
                      <h3 className="eyebrow mb-2">Features</h3>
                      <ul className="space-y-1.5">
                        {features.map((feature) => (
                          <li key={feature} className="relative pl-5 text-[15px] leading-relaxed text-ink/85">
                            <span aria-hidden className="absolute left-0 top-[0.6em] h-1 w-1 rounded-full bg-accent" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {real(project.role) && (
                    <p className="mt-6 text-sm text-muted">
                      <span className="text-ink">My role:</span> {project.role}
                    </p>
                  )}

                  {tech.length > 0 && (
                    <div className="mt-5">
                      <TagList items={tech} label={`Technology used in ${project.title}`} />
                    </div>
                  )}

                  {links.length > 0 && (
                    <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
                      {links.map((link) => (
                        <li key={link.href}>
                          <a href={link.href} target="_blank" rel="noreferrer" className="link text-sm font-medium">
                            {link.label} ↗
                          </a>
                        </li>
                      ))}
                    </ul>
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
