import Link from "next/link";
import { notFound } from "next/navigation";
import { getResource } from "@/lib/resources";
import { getRelationOptions, getSingleton, listRecords } from "@/lib/admin-data";
import ResourceForm from "@/components/admin/ResourceForm";
import ResourceList from "@/components/admin/ResourceList";
import Flash from "@/components/admin/Flash";

export default async function SectionPage({
  params,
  searchParams,
}: {
  params: { section: string };
  searchParams: { flash?: string; m?: string; saved?: string };
}) {
  const resource = getResource(params.section);
  if (!resource) notFound();

  const flashKind = searchParams.saved ? "ok" : searchParams.flash;
  const flashMessage = searchParams.saved ? "Saved. The public site is already showing it." : searchParams.m;

  // --- Singleton sections (About, Site settings) ---------------------------
  if (resource.singleton) {
    const [record, relationOptions] = await Promise.all([getSingleton(resource), getRelationOptions(resource)]);

    return (
      <div>
        <header className="mb-8">
          <p className="eyebrow">{resource.label}</p>
          <h1 className="mt-2 font-serif text-3xl tracking-tight">{resource.singular}</h1>
          <p className="mt-2 max-w-reading text-sm leading-relaxed text-muted">{resource.description}</p>
        </header>

        <Flash kind={flashKind} message={flashMessage} />

        <ResourceForm resource={resource} record={record} relationOptions={relationOptions} backHref="/admin" />
      </div>
    );
  }

  // --- List sections -------------------------------------------------------
  const rows = await listRecords(resource);

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{resource.label}</p>
          <h1 className="mt-2 font-serif text-3xl tracking-tight">{resource.label}</h1>
          <p className="mt-2 max-w-reading text-sm leading-relaxed text-muted">{resource.description}</p>
        </div>
        <Link href={`/admin/${resource.key}/new`} className="btn-primary shrink-0">
          + Add {resource.singular.toLowerCase()}
        </Link>
      </header>

      <Flash kind={flashKind} message={flashMessage} />

      <ResourceList resource={resource} rows={rows} />
    </div>
  );
}
