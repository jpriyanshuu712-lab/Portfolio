/**
 * Hand-maintained database types.
 *
 * These mirror supabase/01_schema.sql. If you change the schema, change this
 * file too — or regenerate it properly with the Supabase CLI:
 *
 *   npx supabase gen types typescript --project-id <your-ref> > src/lib/database.types.ts
 */

export type ContentStatus = "draft" | "published";
export type ProjectKind = "general" | "finance" | "analytics";

/** Every content table carries these five columns. */
export interface BaseRow {
  id: string;
  created_at: string;
  updated_at: string;
  display_order: number;
  status: ContentStatus;
}

export interface Profile extends BaseRow {
  full_name: string;
  headline: string;
  intro: string;
  biography: string;
  avatar_url: string | null;
  location: string | null;
  email: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  resume_url: string | null;
  writing_url: string | null;
}

export interface Experience extends BaseRow {
  company: string;
  job_title: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  bullets: string[];
  skills: string[];
  logo_url: string | null;
}

export interface Education extends BaseRow {
  institution: string;
  degree: string;
  major: string | null;
  minor: string | null;
  start_year: number | null;
  end_year: number | null;
  grade: string | null;
  description: string | null;
  logo_url: string | null;
}

export interface Project extends BaseRow {
  kind: ProjectKind;
  title: string;
  slug: string | null;
  category: string | null;
  short_description: string | null;
  description: string | null;
  problem: string | null;
  solution: string | null;
  features: string[];
  tools: string[];
  skills: string[];
  technology: string[];
  role: string | null;
  thumbnail_url: string | null;
  images: string[];
  github_url: string | null;
  demo_url: string | null;
  report_url: string | null;
  model_url: string | null;
  case_study_url: string | null;
  project_date: string | null;
  is_featured: boolean;
}

export interface Writing extends BaseRow {
  title: string;
  slug: string | null;
  writing_type: string;
  description: string | null;
  body: string | null;
  cover_url: string | null;
  pdf_url: string | null;
  external_url: string | null;
  published_on: string | null;
  tags: string[];
  is_featured: boolean;
}

export interface Achievement extends BaseRow {
  title: string;
  organization: string | null;
  awarded_on: string | null;
  description: string | null;
  image_url: string | null;
  external_url: string | null;
}

export interface SkillCategory extends BaseRow {
  name: string;
  description: string | null;
}

export interface Skill extends BaseRow {
  category_id: string | null;
  name: string;
  level: string | null;
}

export interface SocialLink extends BaseRow {
  label: string;
  url: string;
  icon: string | null;
}

export interface Resume extends BaseRow {
  label: string;
  file_url: string;
  is_active: boolean;
}

export interface SiteSettings extends BaseRow {
  site_title: string;
  site_description: string;
  og_image_url: string | null;
  favicon_url: string | null;
  canonical_url: string | null;
  contact_email: string | null;
  contact_note: string | null;
  footer_note: string | null;
}

export interface AdminRow {
  user_id: string;
  email: string | null;
  created_at: string;
}

type TableDef<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      admins: TableDef<AdminRow>;
      profiles: TableDef<Profile>;
      experiences: TableDef<Experience>;
      education: TableDef<Education>;
      projects: TableDef<Project>;
      writing: TableDef<Writing>;
      achievements: TableDef<Achievement>;
      skill_categories: TableDef<SkillCategory>;
      skills: TableDef<Skill>;
      social_links: TableDef<SocialLink>;
      resumes: TableDef<Resume>;
      site_settings: TableDef<SiteSettings>;
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      content_status: ContentStatus;
      project_kind: ProjectKind;
    };
    CompositeTypes: Record<string, never>;
  };
}

/** The tables the generic admin CRUD layer is allowed to touch. */
export type ContentTable =
  | "profiles"
  | "experiences"
  | "education"
  | "projects"
  | "writing"
  | "achievements"
  | "skill_categories"
  | "skills"
  | "social_links"
  | "resumes"
  | "site_settings";
