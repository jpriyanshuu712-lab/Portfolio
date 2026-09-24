import Link from "next/link";
import { notFound } from "next/navigation";
import { getResource } from "@/lib/resources";
import { getRelationOptions } from "@/lib/admin-data";
import ResourceForm from "@/components/admin/ResourceForm";

export default async function NewRecordPage({ params }: { params: { section: string } }) {
  const resource = getResource(params.section);
  if (!resource || resource.singleton) notFound();

  const relationOptions = await getRelationOptions(resource);

  return (
    <div>
      <Link href={`/admin/${resource.key}`} className="eyebrow mb-6 inline-block hover:text-ink">
        ← {resource.label}
      </Link>

      <h1 className="font-serif text-3xl tracking-tight">New {resource.singular.toLowerCase()}</h1>
      <p className="mb-8 mt-2 max-w-reading text-sm leading-relaxed text-muted">
        Save it as a draft while you work on it. Nothing reaches the public site until the status is Published.
      </p>

      <ResourceForm
        resource={resource}
        record={null}
        relationOptions={relationOptions}
        backHref={`/admin/${resource.key}`}
      />
    </div>
  );
}
