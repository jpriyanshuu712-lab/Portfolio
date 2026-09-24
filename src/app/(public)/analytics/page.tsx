import type { Metadata } from "next";
import { getProjects } from "@/lib/data";
import { EmptyState, PageHeader } from "@/components/site/Primitives";
import AnalyticsGrid from "@/components/site/AnalyticsGrid";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Power BI dashboards, Python models, SQL and exploratory analysis.",
  alternates: { canonical: "/analytics" },
};

export default async function AnalyticsPage() {
  const projects = await getProjects("analytics");

  return (
    <>
      <PageHeader
        eyebrow="Analytics"
        title="Analytics portfolio"
        lede="Dashboards and models. Filter by the tool if you're looking for something specific."
      />

      {projects.length === 0 ? <EmptyState what="analytics projects" /> : <AnalyticsGrid projects={projects} />}
    </>
  );
}
