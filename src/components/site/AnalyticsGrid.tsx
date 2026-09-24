"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/lib/database.types";
import ProjectCard from "./ProjectCard";
import { cn } from "@/lib/utils";

/**
 * The filter list is derived from the data, not hard-coded — so a new category
 * typed into the admin appears here as a filter automatically.
 */
const SUGGESTED = ["Power BI", "Excel", "Python", "SQL", "Machine Learning", "Business Analytics"];

export default function AnalyticsGrid({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<string>("All");

  const filters = useMemo(() => {
    const found = new Set<string>();
    for (const project of projects) {
      if (project.category) found.add(project.category);
      for (const tool of project.tools) found.add(tool);
    }
    // Keep the suggested order for known categories, then anything else.
    const ordered = SUGGESTED.filter((s) => found.has(s));
    const extras = [...found].filter((f) => !SUGGESTED.includes(f)).sort();
    return ["All", ...ordered, ...extras];
  }, [projects]);

  const visible = useMemo(() => {
    if (active === "All") return projects;
    return projects.filter((project) => project.category === active || project.tools.includes(active));
  }, [projects, active]);

  return (
    <>
      {filters.length > 2 && (
        <div className="mb-10">
          <h2 className="sr-only">Filter projects</h2>
          <ul className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <li key={filter}>
                <button
                  type="button"
                  onClick={() => setActive(filter)}
                  aria-pressed={active === filter}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors",
                    active === filter
                      ? "border-ink bg-ink text-paper"
                      : "border-rule text-muted hover:border-ink hover:text-ink",
                  )}
                >
                  {filter}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2" aria-live="polite">
        {visible.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {visible.length === 0 && (
        <p className="rounded-xl border border-dashed border-rule px-6 py-12 text-center text-sm text-muted">
          Nothing under “{active}” yet.
        </p>
      )}
    </>
  );
}
