import type { Metadata } from "next";
import { getProjects } from "@/lib/data";
import { EmptyState, PageHeader } from "@/components/site/Primitives";
import ProjectCard from "@/components/site/ProjectCard";

export const metadata: Metadata = {
  title: "Finance",
  description: "Financial modelling, valuation, working capital and banking analysis.",
  alternates: { canonical: "/finance" },
};

export default async function FinancePage() {
  const projects = await getProjects("finance");

  return (
    <>
      <PageHeader
        eyebrow="Finance"
        title="Finance portfolio"
        lede="Modelling, valuation and statement analysis. Where a spreadsheet has to survive being questioned."
      />

      {projects.length === 0 ? (
        <EmptyState what="finance projects" />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </>
  );
}
