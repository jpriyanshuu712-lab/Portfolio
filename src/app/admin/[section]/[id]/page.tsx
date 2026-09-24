import Link from "next/link";
import { notFound } from "next/navigation";
import { getResource } from "@/lib/resources";
import { getRecord, getRelationOptions } from "@/lib/admin-data";
import ResourceForm from "@/components/admin/ResourceForm";

export default async function EditRecordPage({ params }: { params: { section: string; id: string } }) {
  const resource = getResource(params.section);
  if (!resource || resource.singleton) notFound();

  const [record, relationOptions] = await Promise.all([
    getRecord(resource, params.id),
    getRelationOptions(resource),
  ]);

  if (!record) notFound();

  const heading = String(record.title ?? record.company ?? record.institution ?? record.name ?? record.label ?? "Edit");
  const status = String(record.status ?? "");

  return (
    <div>
      <Link href={`/admin/${resource.key}`} className="eyebrow mb-6 inline-block hover:text-ink">
        ← {resource.label}
      </Link>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-3xl tracking-tight">{heading}</h1>
        {resource.publishable && (
          <span className={status === "published" ? "badge-published" : "badge-draft"}>{status}</span>
        )}
      </div>

      <ResourceForm
        resource={resource}
        record={record}
        relationOptions={relationOptions}
        backHref={`/admin/${resource.key}`}
      />
    </div>
  );
}
