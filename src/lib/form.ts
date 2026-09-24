import { z } from "zod";
import type { FieldDef, ResourceDef } from "@/lib/resources";
import { commasToArray, linesToArray, slugify } from "@/lib/utils";

/**
 * Turns a submitted FormData into a typed, validated database payload, using
 * the resource's own field definitions as the schema. Every value that reaches
 * Postgres passes through here.
 */

const urlish = z
  .string()
  .trim()
  .max(2000)
  .refine(
    (v: string) => v === "" || /^(https?:\/\/|mailto:|\/)/i.test(v) || v.toUpperCase().startsWith("TODO"),
    { message: "Must start with https://, mailto: or /" },
  );

function coerce(field: FieldDef, form: FormData): unknown {
  const raw = form.get(field.name);
  const value = typeof raw === "string" ? raw : "";

  switch (field.kind) {
    case "boolean":
      // An unchecked checkbox submits nothing at all.
      return form.get(field.name) === "on" || value === "true";

    case "lines":
      return linesToArray(value);

    case "tags":
      return commasToArray(value);

    case "gallery":
      // The gallery widget submits one hidden input per URL.
      return form.getAll(field.name).filter((v): v is string => typeof v === "string" && v.trim() !== "");

    case "number":
    case "year": {
      const trimmed = value.trim();
      if (trimmed === "") return null;
      const n = Number(trimmed);
      return Number.isFinite(n) ? n : null;
    }

    case "date":
      return value.trim() === "" ? null : value.trim();

    case "relation":
      return value.trim() === "" ? null : value.trim();

    case "image":
    case "file":
    case "url":
      return value.trim() === "" ? null : value.trim();

    default: {
      const trimmed = value.trim();
      return trimmed === "" ? null : trimmed;
    }
  }
}

function validator(field: FieldDef): z.ZodTypeAny {
  switch (field.kind) {
    case "boolean":
      return z.boolean();
    case "lines":
    case "tags":
    case "gallery":
      return z.array(z.string().max(2000)).max(100);
    case "number":
    case "year":
      return z.number().int().min(-100000).max(100000).nullable();
    case "date":
      return z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date")
        .nullable();
    case "email":
      return z
        .string()
        .max(200)
        .refine((v: string) => v.includes("@") || v.toUpperCase().startsWith("TODO"), "Must be an email address")
        .nullable();
    case "url":
    case "image":
    case "file":
      return urlish.nullable();
    case "relation":
      return z.string().uuid().nullable();
    case "select":
      return z.string().max(100).nullable();
    case "prose":
      return z.string().max(100000).nullable();
    case "textarea":
      return z.string().max(10000).nullable();
    default:
      return z.string().max(2000).nullable();
  }
}

export interface ParseResult {
  ok: boolean;
  payload: Record<string, unknown>;
  errors: Record<string, string>;
}

export function parseResourceForm(resource: ResourceDef, form: FormData): ParseResult {
  const payload: Record<string, unknown> = {};
  const errors: Record<string, string> = {};

  for (const field of resource.fields) {
    const value = coerce(field, form);

    if (field.required) {
      const empty =
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0);
      if (empty && field.kind !== "boolean") {
        errors[field.name] = `${field.label} is required.`;
        continue;
      }
    }

    // Nullable validators still have to accept null for optional fields.
    const schema = validator(field);
    const result = schema.safeParse(value);
    if (!result.success) {
      errors[field.name] = result.error.issues[0]?.message ?? `${field.label} is not valid.`;
      continue;
    }
    payload[field.name] = result.data;
  }

  // Auto-slug anything sluggable that was left blank.
  if (
    resource.fields.some((f) => f.name === "slug") &&
    !payload.slug &&
    typeof payload.title === "string"
  ) {
    payload.slug = slugify(payload.title);
  }

  // Resource defaults (e.g. projects.kind) are applied server-side, never
  // taken from the form, so the filter can't be subverted by a crafted POST.
  if (resource.defaults) Object.assign(payload, resource.defaults);

  return { ok: Object.keys(errors).length === 0, payload, errors };
}
