import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import type {
  Achievement,
  Education,
  Experience,
  Profile,
  Project,
  ProjectKind,
  Resume,
  SiteSettings,
  Skill,
  SkillCategory,
  SocialLink,
  Writing,
} from "@/lib/database.types";

/**
 * Read layer for the public website.
 *
 * Note what is NOT here: any content. Every string on the public site comes
 * out of these queries. Editing the site means editing rows, never files.
 *
 * These run as `anon` (or as you, if you happen to be signed in). Either way
 * RLS decides what comes back — drafts simply are not in the result set.
 */

function empty<T>(): T[] {
  return [];
}

async function query<T>(fn: (db: ReturnType<typeof createClient>) => Promise<T>, fallback: T): Promise<T> {
  if (!hasSupabaseEnv()) return fallback;
  try {
    return await fn(createClient());
  } catch {
    // A missing table or an unreachable database should degrade the page,
    // not crash the whole site.
    return fallback;
  }
}

export async function getProfile(): Promise<Profile | null> {
  return query(async (db) => {
    const { data } = await db.from("profiles").select("*").eq("status", "published").limit(1).maybeSingle();
    return (data as Profile) ?? null;
  }, null);
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return query(async (db) => {
    const { data } = await db.from("site_settings").select("*").limit(1).maybeSingle();
    return (data as SiteSettings) ?? null;
  }, null);
}

export async function getExperiences(): Promise<Experience[]> {
  return query(async (db) => {
    const { data } = await db
      .from("experiences")
      .select("*")
      .eq("status", "published")
      .order("display_order", { ascending: true });
    return (data as Experience[]) ?? [];
  }, empty<Experience>());
}

export async function getEducation(): Promise<Education[]> {
  return query(async (db) => {
    const { data } = await db
      .from("education")
      .select("*")
      .eq("status", "published")
      .order("display_order", { ascending: true });
    return (data as Education[]) ?? [];
  }, empty<Education>());
}

export async function getProjects(kind: ProjectKind): Promise<Project[]> {
  return query(async (db) => {
    const { data } = await db
      .from("projects")
      .select("*")
      .eq("kind", kind)
      .eq("status", "published")
      .order("display_order", { ascending: true });
    return (data as Project[]) ?? [];
  }, empty<Project>());
}

export async function getFeaturedProjects(kind: ProjectKind, limit = 3): Promise<Project[]> {
  const all = await getProjects(kind);
  const featured = all.filter((p) => p.is_featured);
  return (featured.length ? featured : all).slice(0, limit);
}

export async function getProjectBySlug(kind: ProjectKind, slug: string): Promise<Project | null> {
  return query(async (db) => {
    const { data } = await db
      .from("projects")
      .select("*")
      .eq("kind", kind)
      .eq("status", "published")
      .eq("slug", slug)
      .maybeSingle();
    return (data as Project) ?? null;
  }, null);
}

export async function getWriting(): Promise<Writing[]> {
  return query(async (db) => {
    const { data } = await db
      .from("writing")
      .select("*")
      .eq("status", "published")
      .order("display_order", { ascending: true });
    return (data as Writing[]) ?? [];
  }, empty<Writing>());
}

export async function getWritingBySlug(slug: string): Promise<Writing | null> {
  return query(async (db) => {
    const { data } = await db
      .from("writing")
      .select("*")
      .eq("status", "published")
      .eq("slug", slug)
      .maybeSingle();
    return (data as Writing) ?? null;
  }, null);
}

export async function getAchievements(): Promise<Achievement[]> {
  return query(async (db) => {
    const { data } = await db
      .from("achievements")
      .select("*")
      .eq("status", "published")
      .order("display_order", { ascending: true });
    return (data as Achievement[]) ?? [];
  }, empty<Achievement>());
}

export interface SkillGroup extends SkillCategory {
  skills: Skill[];
}

export async function getSkillGroups(): Promise<SkillGroup[]> {
  return query(async (db) => {
    const [{ data: categories }, { data: skills }] = await Promise.all([
      db.from("skill_categories").select("*").eq("status", "published").order("display_order", { ascending: true }),
      db.from("skills").select("*").eq("status", "published").order("display_order", { ascending: true }),
    ]);

    const byCategory = new Map<string, Skill[]>();
    for (const skill of (skills as Skill[]) ?? []) {
      if (!skill.category_id) continue;
      const list = byCategory.get(skill.category_id) ?? [];
      list.push(skill);
      byCategory.set(skill.category_id, list);
    }

    return ((categories as SkillCategory[]) ?? [])
      .map((category) => ({ ...category, skills: byCategory.get(category.id) ?? [] }))
      .filter((group) => group.skills.length > 0);
  }, empty<SkillGroup>());
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  return query(async (db) => {
    const { data } = await db
      .from("social_links")
      .select("*")
      .eq("status", "published")
      .order("display_order", { ascending: true });
    return (data as SocialLink[]) ?? [];
  }, empty<SocialLink>());
}

export async function getActiveResume(): Promise<Resume | null> {
  return query(async (db) => {
    const { data } = await db
      .from("resumes")
      .select("*")
      .eq("is_active", true)
      .eq("status", "published")
      .limit(1)
      .maybeSingle();
    return (data as Resume) ?? null;
  }, null);
}

/**
 * The single source of truth for "where does Download Resume point?".
 * Active uploaded resume first; the profile's manual override second; and if
 * neither exists, null — and every Download button hides itself rather than
 * serving a dead link.
 */
export async function getResumeUrl(): Promise<string | null> {
  const [resume, profile] = await Promise.all([getActiveResume(), getProfile()]);
  if (resume?.file_url) return resume.file_url;
  const override = profile?.resume_url?.trim();
  if (override && !override.toUpperCase().startsWith("TODO")) return override;
  return null;
}
