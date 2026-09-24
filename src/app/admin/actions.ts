"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getResource } from "@/lib/resources";
import { parseResourceForm } from "@/lib/form";
import type { ActionState } from "@/lib/action-state";

/**
 * The generic CRUD layer names tables and columns at runtime, so it uses an
 * untyped handle. Security is unaffected: every statement still runs under
 * your own JWT and is judged by Row Level Security in Postgres.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db(): any {
  return createClient();
}

/**
 * One set of mutations for every section.
 *
 * Each of these does three things in the same order, every time:
 *   1. re-check the admin session on the server (never trust the caller)
 *   2. validate against the resource's declared fields
 *   3. write through the user's own JWT, so RLS gets the final say
 *
 * Then it revalidates the public routes, which is what makes an edit in the
 * dashboard show up on the live site immediately.
 */

/** Public pages are server-rendered, so they need an explicit cache bust. */
function revalidatePublic() {
  for (const path of [
    "/",
    "/about",
    "/experience",
    "/finance",
    "/analytics",
    "/projects",
    "/writing",
    "/achievements",
    "/contact",
    "/sitemap.xml",
  ]) {
    revalidatePath(path);
  }
  revalidatePath("/writing/[slug]", "page");
  revalidatePath("/admin", "layout");
}

function fail(message: string, errors?: Record<string, string>): ActionState {
  return { status: "error", message, errors };
}

// ---------------------------------------------------------------------------
// Save (insert or update)
// ---------------------------------------------------------------------------

export async function saveRecord(_prev: ActionState, form: FormData): Promise<ActionState> {
  const admin = await checkAdmin();
  if (!admin) return fail("You are not signed in as the site owner.");

  const resourceKey = String(form.get("__resource") ?? "");
  const id = String(form.get("__id") ?? "").trim();
  const resource = getResource(resourceKey);
  if (!resource) return fail("Unknown section.");

  const parsed = parseResourceForm(resource, form);
  if (!parsed.ok) {
    return fail("Please fix the highlighted fields.", parsed.errors);
  }

  const supabase = db();

  if (id) {
    const { error } = await supabase
      .from(resource.table)
      .update(parsed.payload)
      .eq("id", id);
    if (error) return fail(friendly(error.message));
  } else {
    // New rows go to the end of the list.
    let nextOrder = 0;
    if (resource.orderable) {
      let q = supabase.from(resource.table).select("display_order").order("display_order", { ascending: false }).limit(1);
      if (resource.filter) q = q.eq(resource.filter.column, resource.filter.value);
      const { data } = await q;
      nextOrder = (data?.[0]?.display_order ?? 0) + 1;
    }
    const { error } = await supabase
      .from(resource.table)
      .insert({ ...parsed.payload, display_order: nextOrder });
    if (error) return fail(friendly(error.message));
  }

  revalidatePublic();

  if (resource.singleton) {
    return { status: "success", message: "Saved. The public site is already showing it." };
  }

  redirect(`/admin/${resource.key}?saved=1`);
}

// ---------------------------------------------------------------------------
// Row actions
//
// These take FormData only, so each row can be a plain <form action={fn}>.
// They report back through a ?flash= query parameter, which means they work
// even with JavaScript disabled — and that the outcome survives the redirect.
// ---------------------------------------------------------------------------

function flashBack(resourceKey: string, kind: "ok" | "err", message: string): never {
  redirect(`/admin/${resourceKey}?flash=${kind}&m=${encodeURIComponent(message)}`);
}

export async function deleteRecord(form: FormData): Promise<void> {
  const resourceKey = String(form.get("__resource") ?? "");
  const admin = await checkAdmin();
  if (!admin) flashBack(resourceKey, "err", "You are not signed in as the site owner.");

  const resource = getResource(resourceKey);
  const id = String(form.get("__id") ?? "").trim();
  if (!resource || !id) flashBack(resourceKey, "err", "Nothing to delete.");

  const supabase = db();
  const { error } = await supabase.from(resource.table).delete().eq("id", id);
  if (error) flashBack(resourceKey, "err", friendly(error.message));

  revalidatePublic();
  flashBack(resourceKey, "ok", "Deleted.");
}

export async function togglePublish(form: FormData): Promise<void> {
  const resourceKey = String(form.get("__resource") ?? "");
  const admin = await checkAdmin();
  if (!admin) flashBack(resourceKey, "err", "You are not signed in as the site owner.");

  const resource = getResource(resourceKey);
  const id = String(form.get("__id") ?? "").trim();
  const next = String(form.get("__status") ?? "");
  if (!resource || !id) flashBack(resourceKey, "err", "Nothing to update.");
  if (next !== "draft" && next !== "published") flashBack(resourceKey, "err", "Invalid status.");

  const supabase = db();
  const { error } = await supabase
    .from(resource.table)
    .update({ status: next })
    .eq("id", id);
  if (error) flashBack(resourceKey, "err", friendly(error.message));

  revalidatePublic();
  flashBack(
    resourceKey,
    "ok",
    next === "published" ? "Published — it's live now." : "Moved back to draft. It's off the public site.",
  );
}

export async function setActiveResume(form: FormData): Promise<void> {
  const admin = await checkAdmin();
  if (!admin) flashBack("resume", "err", "You are not signed in as the site owner.");

  const id = String(form.get("__id") ?? "").trim();
  if (!id) flashBack("resume", "err", "Nothing to activate.");

  const supabase = db();
  // A database trigger clears the others, so this single write is enough and
  // there is no window where two resumes are active.
  const { error } = await supabase.from("resumes").update({ is_active: true }).eq("id", id);
  if (error) flashBack("resume", "err", friendly(error.message));

  revalidatePublic();
  flashBack("resume", "ok", "That's now the resume every Download button serves.");
}

export async function duplicateRecord(form: FormData): Promise<void> {
  const resourceKey = String(form.get("__resource") ?? "");
  const admin = await checkAdmin();
  if (!admin) flashBack(resourceKey, "err", "You are not signed in as the site owner.");

  const resource = getResource(resourceKey);
  const id = String(form.get("__id") ?? "").trim();
  if (!resource || !id) flashBack(resourceKey, "err", "Nothing to duplicate.");

  const supabase = db();
  const { data: original, error: readError } = await supabase
    .from(resource.table)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (readError || !original) flashBack(resourceKey, "err", "Could not read the original.");

  const copy: Record<string, unknown> = { ...(original as Record<string, unknown>) };
  delete copy.id;
  delete copy.created_at;
  delete copy.updated_at;
  copy.status = "draft"; // a copy is never accidentally live
  if (typeof copy.title === "string") copy.title = `${copy.title} (copy)`;
  if (typeof copy.label === "string") copy.label = `${copy.label} (copy)`;
  if (typeof copy.company === "string") copy.company = `${copy.company} (copy)`;
  if (typeof copy.name === "string") copy.name = `${copy.name} (copy)`;
  if ("slug" in copy && typeof copy.slug === "string") copy.slug = `${copy.slug}-copy-${Date.now().toString(36)}`;
  if ("is_active" in copy) copy.is_active = false;
  if (typeof copy.display_order === "number") copy.display_order = copy.display_order + 1;

  const { error } = await supabase.from(resource.table).insert(copy);
  if (error) flashBack(resourceKey, "err", friendly(error.message));

  revalidatePublic();
  flashBack(resourceKey, "ok", "Duplicated as a draft.");
}

// ---------------------------------------------------------------------------
// Reorder (drag and drop)
// ---------------------------------------------------------------------------

export async function reorderRecords(ids: string[], resourceKey: string): Promise<ActionState> {
  const admin = await checkAdmin();
  if (!admin) return fail("You are not signed in as the site owner.");

  const resource = getResource(resourceKey);
  if (!resource || !resource.orderable) return fail("This section cannot be reordered.");
  if (!Array.isArray(ids) || ids.length === 0) return fail("Nothing to reorder.");
  if (ids.length > 500) return fail("Too many items.");

  const supabase = db();

  // Sequential updates keep this simple and correct. These lists are short
  // (tens of rows), so a batch upsert would be premature.
  for (let index = 0; index < ids.length; index += 1) {
    const { error } = await supabase
      .from(resource.table)
      .update({ display_order: index })
      .eq("id", ids[index]);
    if (error) return fail(friendly(error.message));
  }

  revalidatePublic();
  return { status: "success", message: "Order saved." };
}

// ---------------------------------------------------------------------------

function friendly(message: string): string {
  if (/row-level security|permission denied/i.test(message)) {
    return "The database refused that write. Your account is signed in but is not on the admin list — run supabase/03_create_admin.sql.";
  }
  if (/duplicate key/i.test(message)) {
    return "Something with that name or slug already exists. Try a different one.";
  }
  if (/violates foreign key/i.test(message)) {
    return "That references something which no longer exists. Pick a different category.";
  }
  return message;
}
