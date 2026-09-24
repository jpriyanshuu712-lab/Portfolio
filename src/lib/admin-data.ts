import { createClient } from "@/lib/supabase/server";
import type { ResourceDef } from "@/lib/resources";
import type { RelationOption } from "@/components/admin/ResourceForm";

/**
 * Admin-side reads. These run under your session, so RLS returns drafts too —
 * which is exactly the difference between this file and src/lib/data.ts.
 *
 * The generic CRUD layer addresses tables and columns by name at runtime, so
 * it steps outside the generated column types on purpose. That loses a little
 * compile-time help here; it does not loosen security by one inch, because
 * every statement is still executed under your JWT against Row Level Security.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db(): any {
  return createClient();
}

type Row = Record<string, unknown>;

export async function listRecords(resource: ResourceDef): Promise<Row[]> {
  let query = db().from(resource.table).select("*");
  if (resource.filter) query = query.eq(resource.filter.column, resource.filter.value);

  const { data, error } = await query.order(resource.orderable ? "display_order" : "created_at", {
    ascending: !!resource.orderable,
  });

  if (error) throw new Error(error.message);
  return (data as Row[]) ?? [];
}

export async function getRecord(resource: ResourceDef, id: string): Promise<Row | null> {
  const { data } = await db().from(resource.table).select("*").eq("id", id).maybeSingle();
  return (data as Row) ?? null;
}

/** For singleton resources (About, Settings): the one row, or null. */
export async function getSingleton(resource: ResourceDef): Promise<Row | null> {
  const { data } = await db()
    .from(resource.table)
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return (data as Row) ?? null;
}

/** Options for any `relation` field the resource declares. */
export async function getRelationOptions(resource: ResourceDef): Promise<Record<string, RelationOption[]>> {
  const relationFields = resource.fields.filter((f) => f.kind === "relation" && f.relationTable);
  if (relationFields.length === 0) return {};

  const result: Record<string, RelationOption[]> = {};

  for (const field of relationFields) {
    const labelColumn = field.relationLabel ?? "name";
    const { data } = await db()
      .from(field.relationTable as string)
      .select(`id, ${labelColumn}`)
      .order("display_order", { ascending: true });

    result[field.name] = ((data as Row[]) ?? []).map((row) => ({
      value: String(row.id),
      label: String(row[labelColumn] ?? row.id),
    }));
  }

  return result;
}

export interface OverviewCount {
  label: string;
  href: string;
  total: number;
  drafts: number;
}

/** Counts for the overview screen. */
export async function getOverviewCounts(): Promise<OverviewCount[]> {
  const specs: { label: string; href: string; table: string; filter?: [string, string] }[] = [
    { label: "Experience", href: "/admin/experience", table: "experiences" },
    { label: "Education", href: "/admin/education", table: "education" },
    { label: "Projects", href: "/admin/projects", table: "projects", filter: ["kind", "general"] },
    { label: "Finance", href: "/admin/finance", table: "projects", filter: ["kind", "finance"] },
    { label: "Analytics", href: "/admin/analytics", table: "projects", filter: ["kind", "analytics"] },
    { label: "Writing", href: "/admin/writing", table: "writing" },
    { label: "Achievements", href: "/admin/achievements", table: "achievements" },
    { label: "Skills", href: "/admin/skills", table: "skills" },
  ];

  const client = db();

  return Promise.all(
    specs.map(async (spec) => {
      let total = client.from(spec.table).select("id", { count: "exact", head: true });
      let drafts = client.from(spec.table).select("id", { count: "exact", head: true }).eq("status", "draft");
      if (spec.filter) {
        total = total.eq(spec.filter[0], spec.filter[1]);
        drafts = drafts.eq(spec.filter[0], spec.filter[1]);
      }
      const [totalResult, draftResult] = await Promise.all([total, drafts]);
      return {
        label: spec.label,
        href: spec.href,
        total: (totalResult.count as number | null) ?? 0,
        drafts: (draftResult.count as number | null) ?? 0,
      };
    }),
  );
}
