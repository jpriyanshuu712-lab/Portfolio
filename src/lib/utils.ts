import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "March 2025". Returns null for null, so callers can decide what to render. */
export function formatMonthYear(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
}

export function formatYear(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return String(date.getUTCFullYear());
}

/** "March 2025 — June 2025", "March 2025 — Present", or null if no dates. */
export function formatDateRange(
  start: string | null,
  end: string | null,
  isCurrent: boolean,
): string | null {
  const from = formatMonthYear(start);
  const to = isCurrent ? "Present" : formatMonthYear(end);
  if (!from && !to) return null;
  if (!from) return to;
  if (!to) return from;
  return `${from} — ${to}`;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Splits a textarea of one-per-line values into a clean string array. */
export function linesToArray(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function arrayToLines(value: string[] | null | undefined): string {
  return (value ?? []).join("\n");
}

/** Splits a comma-separated input into a clean string array. */
export function commasToArray(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function arrayToCommas(value: string[] | null | undefined): string {
  return (value ?? []).join(", ");
}

/**
 * Seed content ships with "TODO: ..." placeholders so nothing is invented.
 * The public site treats those as absent rather than printing them at
 * recruiters, while the admin shows them plainly so they're easy to find.
 */
export function isPlaceholder(value: string | null | undefined): boolean {
  return !!value && value.trim().toUpperCase().startsWith("TODO");
}

/** Returns the value, or null if it is blank or a seed placeholder. */
export function real(value: string | null | undefined): string | null {
  if (!value) return null;
  const withoutNote = value.split(/\bTODO\b:?/)[0].trim();
  if (!withoutNote) return null;
  return withoutNote;
}

/** Filters an array down to values that aren't blank or placeholders. */
export function realList(values: string[] | null | undefined): string[] {
  return (values ?? []).filter((v) => !!real(v));
}

/** Strips trailing "TODO: ..." paragraphs from long-form prose. */
export function stripTodoParagraphs(value: string | null | undefined): string | null {
  if (!value) return null;
  const kept = value
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p && !isPlaceholder(p));
  return kept.length ? kept.join("\n\n") : null;
}
