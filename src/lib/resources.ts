import type { ContentTable, ProjectKind } from "@/lib/database.types";

/**
 * THE CONTENT MODEL, DECLARED ONCE.
 *
 * Every admin section — its form, its list table, its validation, its
 * ordering behaviour — is generated from the definitions in this file. There
 * is exactly one form component, one list component and one set of server
 * actions behind all thirteen sections.
 *
 * To add a whole new section later (Certifications, Testimonials, Speaking):
 *   1. add the table + RLS policies in SQL (copy the block in 01_schema.sql)
 *   2. add its Row type to database.types.ts
 *   3. add one entry to RESOURCES below
 *   4. add one line to the sidebar in src/components/admin/Sidebar.tsx
 * No new pages, no new actions, no new forms.
 */

export type FieldKind =
  | "text"
  | "textarea" // short multi-line
  | "prose" // long-form, tall editor
  | "url"
  | "email"
  | "date"
  | "year"
  | "number"
  | "boolean"
  | "select"
  | "lines" // textarea -> string[], one per line
  | "tags" // comma-separated -> string[]
  | "image" // single file upload, image preview
  | "file" // single file upload, PDF/doc
  | "gallery" // multiple image URLs -> string[]
  | "relation"; // foreign key picker

export interface FieldDef {
  name: string;
  label: string;
  kind: FieldKind;
  help?: string;
  placeholder?: string;
  required?: boolean;
  /** Layout hint: half-width on desktop. */
  half?: boolean;
  options?: { value: string; label: string }[];
  /** For image/file/gallery. */
  bucket?: string;
  accept?: string;
  maxMb?: number;
  /** For relation. */
  relationTable?: ContentTable;
  relationLabel?: string;
}

export interface ListColumnDef {
  name: string;
  label: string;
  kind?: "text" | "date" | "boolean" | "tags" | "status";
  /** Hide below md to keep mobile tables readable. */
  secondary?: boolean;
}

export interface ResourceDef {
  /** URL segment under /admin. */
  key: string;
  table: ContentTable;
  label: string;
  singular: string;
  description: string;
  /** A single-row record (About, Settings): edited in place, never listed. */
  singleton?: boolean;
  orderable?: boolean;
  publishable?: boolean;
  /** Restricts the resource to a subset of a shared table (projects.kind). */
  filter?: { column: string; value: string };
  /** Applied on insert, so the filter stays true. */
  defaults?: Record<string, unknown>;
  listColumns: ListColumnDef[];
  fields: FieldDef[];
  /** Public route to preview a saved draft, if the section has one. */
  previewPath?: string;
}

const STATUS_FIELD: FieldDef = {
  name: "status",
  label: "Status",
  kind: "select",
  half: true,
  options: [
    { value: "draft", label: "Draft — hidden from the public site" },
    { value: "published", label: "Published — visible to everyone" },
  ],
  help: "Drafts are blocked at the database level, not just hidden in the UI.",
};

/** The shared field set for anything stored in the `projects` table. */
function projectFields(kind: ProjectKind): FieldDef[] {
  const common: FieldDef[] = [
    { name: "title", label: "Title", kind: "text", required: true },
    {
      name: "slug",
      label: "Slug",
      kind: "text",
      half: true,
      help: "Used in the URL. Leave blank and it will be generated from the title.",
    },
    {
      name: "category",
      label: "Category",
      kind: "text",
      half: true,
      placeholder: kind === "finance" ? "Valuation" : kind === "analytics" ? "Power BI" : "Product",
      help:
        kind === "analytics"
          ? "This is what the public Analytics filters use. Power BI, Excel, Python, SQL, Machine Learning, Business Analytics."
          : "Shown on the card and used for grouping.",
    },
    {
      name: "short_description",
      label: "Short description",
      kind: "textarea",
      help: "One or two sentences. This is the card text.",
    },
  ];

  const body: FieldDef[] =
    kind === "general"
      ? [
          { name: "problem", label: "Problem", kind: "prose", help: "What problem does this solve, and for whom?" },
          { name: "solution", label: "Solution", kind: "prose" },
          { name: "features", label: "Features", kind: "lines", help: "One feature per line." },
          { name: "role", label: "My role", kind: "text" },
          { name: "technology", label: "Technology", kind: "tags", help: "Comma-separated." },
        ]
      : [
          { name: "description", label: "Full description", kind: "prose" },
          { name: "tools", label: "Tools used", kind: "tags", help: "Comma-separated. e.g. Excel, Power BI, Python" },
          { name: "skills", label: "Skills demonstrated", kind: "tags", help: "Comma-separated." },
        ];

  const media: FieldDef[] = [
    { name: "thumbnail_url", label: "Thumbnail", kind: "image", bucket: "projects", maxMb: 10 },
    { name: "images", label: "Gallery", kind: "gallery", bucket: "projects", maxMb: 10, help: "Screenshots, charts, dashboard captures." },
  ];

  const links: FieldDef[] = [
    { name: "github_url", label: "GitHub URL", kind: "url", half: true },
    { name: "demo_url", label: "Live demo URL", kind: "url", half: true },
  ];

  if (kind === "finance") {
    links.push(
      { name: "report_url", label: "PDF / report", kind: "file", bucket: "documents", accept: "application/pdf", maxMb: 25 },
      {
        name: "model_url",
        label: "Excel model",
        kind: "file",
        bucket: "documents",
        accept: ".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel",
        maxMb: 25,
      },
    );
  } else if (kind === "analytics") {
    links.push({ name: "report_url", label: "PDF / report", kind: "file", bucket: "documents", accept: "application/pdf", maxMb: 25 });
  } else {
    links.push({ name: "case_study_url", label: "Case study PDF", kind: "file", bucket: "documents", accept: "application/pdf", maxMb: 25 });
  }

  const tail: FieldDef[] = [
    { name: "project_date", label: "Date", kind: "date", half: true },
    { name: "is_featured", label: "Featured", kind: "boolean", half: true, help: "Featured items surface on the homepage." },
    STATUS_FIELD,
  ];

  return [...common, ...body, ...media, ...links, ...tail];
}

const PROJECT_LIST_COLUMNS: ListColumnDef[] = [
  { name: "title", label: "Title" },
  { name: "category", label: "Category", secondary: true },
  { name: "is_featured", label: "Featured", kind: "boolean", secondary: true },
  { name: "status", label: "Status", kind: "status" },
];

export const RESOURCES: ResourceDef[] = [
  // --- About (singleton) ---------------------------------------------------
  {
    key: "about",
    table: "profiles",
    label: "About",
    singular: "Profile",
    description: "Your name, headline and biography. This drives the homepage hero and the About page.",
    singleton: true,
    previewPath: "/about",
    listColumns: [],
    fields: [
      { name: "full_name", label: "Name", kind: "text", required: true, half: true },
      { name: "location", label: "Location", kind: "text", half: true },
      {
        name: "headline",
        label: "Professional headline",
        kind: "text",
        placeholder: "PGDM | Finance & Analytics | Writer",
        help: "One line, under the name. This is the first thing a recruiter reads.",
      },
      { name: "intro", label: "Short introduction", kind: "textarea", help: "Two or three sentences for the homepage hero." },
      { name: "biography", label: "Longer biography", kind: "prose", help: "Blank lines separate paragraphs. Shown on the About page." },
      { name: "avatar_url", label: "Profile photograph", kind: "image", bucket: "avatars", maxMb: 5 },
      { name: "email", label: "Email", kind: "email", half: true },
      { name: "linkedin_url", label: "LinkedIn URL", kind: "url", half: true },
      { name: "github_url", label: "GitHub URL", kind: "url", half: true },
      { name: "writing_url", label: "Writing / portfolio URL", kind: "url", half: true },
      {
        name: "resume_url",
        label: "Resume URL (override)",
        kind: "url",
        help: "Leave blank. The Resume section is the normal way to manage this — it only acts as a fallback if no resume is marked active.",
      },
    ],
  },

  // --- Experience ----------------------------------------------------------
  {
    key: "experience",
    table: "experiences",
    label: "Experience",
    singular: "Experience",
    description: "Roles, in the order you want them shown. Drag to reorder.",
    orderable: true,
    publishable: true,
    previewPath: "/experience",
    listColumns: [
      { name: "company", label: "Company" },
      { name: "job_title", label: "Title", secondary: true },
      { name: "status", label: "Status", kind: "status" },
    ],
    fields: [
      { name: "company", label: "Company", kind: "text", required: true, half: true },
      { name: "job_title", label: "Job title", kind: "text", required: true, half: true },
      { name: "location", label: "Location", kind: "text", half: true },
      { name: "logo_url", label: "Company logo", kind: "image", bucket: "logos", maxMb: 2, half: true },
      { name: "start_date", label: "Start date", kind: "date", half: true },
      { name: "end_date", label: "End date", kind: "date", half: true, help: "Leave blank if this is your current role." },
      { name: "is_current", label: "I currently work here", kind: "boolean" },
      { name: "description", label: "Description", kind: "textarea", help: "One line of context about the role." },
      { name: "bullets", label: "Bullet points", kind: "lines", help: "One per line. These are what recruiters actually read — lead each with a verb and a number where you have one." },
      { name: "skills", label: "Skills", kind: "tags", help: "Comma-separated." },
      STATUS_FIELD,
    ],
  },

  // --- Education -----------------------------------------------------------
  {
    key: "education",
    table: "education",
    label: "Education",
    singular: "Education entry",
    description: "Degrees and institutions.",
    orderable: true,
    publishable: true,
    previewPath: "/about",
    listColumns: [
      { name: "institution", label: "Institution" },
      { name: "degree", label: "Degree", secondary: true },
      { name: "status", label: "Status", kind: "status" },
    ],
    fields: [
      { name: "institution", label: "Institution", kind: "text", required: true },
      { name: "degree", label: "Degree", kind: "text", required: true, half: true },
      { name: "grade", label: "Grade / GPA", kind: "text", half: true },
      { name: "major", label: "Major", kind: "text", half: true },
      { name: "minor", label: "Minor", kind: "text", half: true },
      { name: "start_year", label: "Start year", kind: "year", half: true },
      { name: "end_year", label: "End year", kind: "year", half: true },
      { name: "description", label: "Description", kind: "textarea" },
      { name: "logo_url", label: "Logo", kind: "image", bucket: "logos", maxMb: 2 },
      STATUS_FIELD,
    ],
  },

  // --- Projects (three views onto one table) -------------------------------
  {
    key: "projects",
    table: "projects",
    label: "Projects",
    singular: "Project",
    description: "Things I've built. Products, prototypes and concepts.",
    orderable: true,
    publishable: true,
    filter: { column: "kind", value: "general" },
    defaults: { kind: "general" },
    previewPath: "/projects",
    listColumns: PROJECT_LIST_COLUMNS,
    fields: projectFields("general"),
  },
  {
    key: "finance",
    table: "projects",
    label: "Finance",
    singular: "Finance project",
    description: "Modelling, valuation and financial analysis work.",
    orderable: true,
    publishable: true,
    filter: { column: "kind", value: "finance" },
    defaults: { kind: "finance" },
    previewPath: "/finance",
    listColumns: PROJECT_LIST_COLUMNS,
    fields: projectFields("finance"),
  },
  {
    key: "analytics",
    table: "projects",
    label: "Analytics",
    singular: "Analytics project",
    description: "Dashboards, models and data work. The Category field drives the public filters.",
    orderable: true,
    publishable: true,
    filter: { column: "kind", value: "analytics" },
    defaults: { kind: "analytics" },
    previewPath: "/analytics",
    listColumns: PROJECT_LIST_COLUMNS,
    fields: projectFields("analytics"),
  },

  // --- Writing -------------------------------------------------------------
  {
    key: "writing",
    table: "writing",
    label: "Writing",
    singular: "Piece",
    description: "The Writer's Room. Books, essays, poems, short stories and articles.",
    orderable: true,
    publishable: true,
    previewPath: "/writing",
    listColumns: [
      { name: "title", label: "Title" },
      { name: "writing_type", label: "Type", secondary: true },
      { name: "is_featured", label: "Featured", kind: "boolean", secondary: true },
      { name: "status", label: "Status", kind: "status" },
    ],
    fields: [
      { name: "title", label: "Title", kind: "text", required: true },
      {
        name: "slug",
        label: "Slug",
        kind: "text",
        half: true,
        help: "Used in the URL. Leave blank and it will be generated from the title.",
      },
      {
        name: "writing_type",
        label: "Type",
        kind: "select",
        half: true,
        options: [
          { value: "book", label: "Book" },
          { value: "poem", label: "Poem" },
          { value: "short_story", label: "Short story" },
          { value: "article", label: "Article" },
          { value: "essay", label: "Essay" },
          { value: "sample", label: "Writing sample" },
        ],
      },
      { name: "published_on", label: "Publication date", kind: "date", half: true },
      { name: "description", label: "Description", kind: "textarea", help: "A synopsis or a standfirst. Shown on the card." },
      {
        name: "body",
        label: "Content",
        kind: "prose",
        help: "Optional. Paste the full text here and it gets its own page on the site. Blank lines separate paragraphs.",
      },
      { name: "cover_url", label: "Cover image", kind: "image", bucket: "writing", maxMb: 20 },
      { name: "pdf_url", label: "PDF", kind: "file", bucket: "writing", accept: "application/pdf", maxMb: 20 },
      { name: "external_url", label: "External URL", kind: "url", help: "Amazon, Medium, Substack — wherever it lives." },
      { name: "tags", label: "Tags", kind: "tags", help: "Comma-separated." },
      { name: "is_featured", label: "Featured", kind: "boolean", half: true },
      STATUS_FIELD,
    ],
  },

  // --- Achievements --------------------------------------------------------
  {
    key: "achievements",
    table: "achievements",
    label: "Achievements",
    singular: "Achievement",
    description: "Scholarships, awards and recognition.",
    orderable: true,
    publishable: true,
    previewPath: "/achievements",
    listColumns: [
      { name: "title", label: "Title" },
      { name: "organization", label: "Organization", secondary: true },
      { name: "status", label: "Status", kind: "status" },
    ],
    fields: [
      { name: "title", label: "Title", kind: "text", required: true },
      { name: "organization", label: "Organization", kind: "text", half: true },
      { name: "awarded_on", label: "Date", kind: "date", half: true },
      { name: "description", label: "Description", kind: "textarea" },
      { name: "image_url", label: "Image / certificate", kind: "image", bucket: "certificates", maxMb: 20 },
      { name: "external_url", label: "External link", kind: "url" },
      STATUS_FIELD,
    ],
  },

  // --- Skills --------------------------------------------------------------
  {
    key: "skill-categories",
    table: "skill_categories",
    label: "Skill categories",
    singular: "Category",
    description: "Finance, Analytics, Business, Technology, Creative.",
    orderable: true,
    publishable: true,
    listColumns: [
      { name: "name", label: "Name" },
      { name: "status", label: "Status", kind: "status" },
    ],
    fields: [
      { name: "name", label: "Name", kind: "text", required: true },
      { name: "description", label: "Description", kind: "textarea" },
      STATUS_FIELD,
    ],
  },
  {
    key: "skills",
    table: "skills",
    label: "Skills",
    singular: "Skill",
    description: "Individual skills, grouped under a category.",
    orderable: true,
    publishable: true,
    previewPath: "/about",
    listColumns: [
      { name: "name", label: "Skill" },
      { name: "level", label: "Level", secondary: true },
      { name: "status", label: "Status", kind: "status" },
    ],
    fields: [
      { name: "name", label: "Skill", kind: "text", required: true, half: true },
      {
        name: "category_id",
        label: "Category",
        kind: "relation",
        half: true,
        relationTable: "skill_categories",
        relationLabel: "name",
        required: true,
      },
      { name: "level", label: "Level", kind: "text", half: true, help: "Optional. e.g. Advanced, Working knowledge." },
      STATUS_FIELD,
    ],
  },

  // --- Resume --------------------------------------------------------------
  {
    key: "resume",
    table: "resumes",
    label: "Resume",
    singular: "Resume",
    description:
      "Upload a PDF and mark it active. The public Download Resume buttons always serve the active one — no code change when you get a new version.",
    orderable: false,
    publishable: false,
    listColumns: [
      { name: "label", label: "Label" },
      { name: "is_active", label: "Active", kind: "boolean" },
      { name: "created_at", label: "Uploaded", kind: "date", secondary: true },
    ],
    fields: [
      { name: "label", label: "Label", kind: "text", required: true, placeholder: "Resume — March 2026", help: "For your own reference." },
      {
        name: "file_url",
        label: "Resume PDF",
        kind: "file",
        bucket: "resumes",
        accept: "application/pdf",
        maxMb: 10,
        required: true,
      },
      { name: "is_active", label: "Set as the active resume", kind: "boolean", help: "Turning this on turns it off everywhere else, automatically." },
    ],
  },

  // --- Social links --------------------------------------------------------
  {
    key: "social",
    table: "social_links",
    label: "Social links",
    singular: "Link",
    description: "Shown in the footer and on the contact section.",
    orderable: true,
    publishable: true,
    listColumns: [
      { name: "label", label: "Label" },
      { name: "url", label: "URL", secondary: true },
      { name: "status", label: "Status", kind: "status" },
    ],
    fields: [
      { name: "label", label: "Label", kind: "text", required: true, half: true },
      {
        name: "icon",
        label: "Icon",
        kind: "select",
        half: true,
        options: [
          { value: "linkedin", label: "LinkedIn" },
          { value: "github", label: "GitHub" },
          { value: "email", label: "Email" },
          { value: "book", label: "Writing" },
          { value: "link", label: "Generic link" },
        ],
      },
      { name: "url", label: "URL", kind: "url", required: true, help: "Full URL, including https:// — or mailto: for email." },
      STATUS_FIELD,
    ],
  },

  // --- Site settings (singleton) -------------------------------------------
  {
    key: "settings",
    table: "site_settings",
    label: "Site settings",
    singular: "Settings",
    description: "SEO metadata and contact details for the site as a whole.",
    singleton: true,
    listColumns: [],
    fields: [
      { name: "site_title", label: "Site title", kind: "text", required: true, help: "Appears in the browser tab and in Google results." },
      { name: "site_description", label: "Site description", kind: "textarea", help: "Around 155 characters. This is the grey text under your name in search results." },
      { name: "canonical_url", label: "Canonical URL", kind: "url", help: "Your live domain, e.g. https://priyanshujaiswal.com" },
      { name: "og_image_url", label: "Social share image", kind: "image", bucket: "avatars", maxMb: 5, help: "1200×630 works best. Shown when your link is pasted into LinkedIn or WhatsApp." },
      { name: "favicon_url", label: "Favicon", kind: "image", bucket: "avatars", maxMb: 2 },
      { name: "contact_email", label: "Contact email", kind: "email", half: true },
      { name: "contact_note", label: "Contact note", kind: "textarea" },
      { name: "footer_note", label: "Footer note", kind: "text" },
    ],
  },
];

export function getResource(key: string): ResourceDef | undefined {
  return RESOURCES.find((r) => r.key === key);
}

export const RESOURCE_KEYS = RESOURCES.map((r) => r.key);
