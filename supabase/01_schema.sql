-- ===========================================================================
--  PORTFOLIO CMS — SCHEMA + ROW LEVEL SECURITY
--  Run this ONCE in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query).
--  Safe to re-run: everything is idempotent.
-- ===========================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- 0. Shared helpers
-- ---------------------------------------------------------------------------

-- Keeps updated_at honest without the application having to remember.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- The allow-list of accounts that may write. This is THE authorization
-- boundary: it lives in the database, not in the UI. Even a forged session or
-- a direct call to the REST API with a valid non-admin JWT cannot write.
create table if not exists public.admins (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  email       text,
  created_at  timestamptz not null default now()
);

alter table public.admins enable row level security;

-- SECURITY DEFINER so the check itself is not subject to RLS (which would
-- otherwise recurse). search_path is pinned to defeat search-path hijacking.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon;

-- An admin may read the admin list. Nobody can write it from the API at all:
-- there is deliberately no INSERT/UPDATE/DELETE policy, so the only way to
-- grant admin is through the SQL editor (see 03_create_admin.sql).
drop policy if exists "admins_select_self" on public.admins;
create policy "admins_select_self" on public.admins
  for select to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 1. Content tables
-- ---------------------------------------------------------------------------

-- Every content table shares the same shape: id / created_at / updated_at /
-- display_order / status. That uniformity is what lets one generic admin UI
-- and one generic set of server actions drive all thirteen sections.

do $$ begin
  create type public.content_status as enum ('draft', 'published');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.project_kind as enum ('general', 'finance', 'analytics');
exception when duplicate_object then null; end $$;

-- --- profiles (singleton: the "About" record) ------------------------------
create table if not exists public.profiles (
  id                uuid primary key default gen_random_uuid(),
  full_name         text not null default '',
  headline          text not null default '',
  intro             text not null default '',
  biography         text not null default '',
  avatar_url        text,
  location          text,
  email             text,
  linkedin_url      text,
  github_url        text,
  resume_url        text,
  writing_url       text,
  status            public.content_status not null default 'published',
  display_order     integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- --- experiences -----------------------------------------------------------
create table if not exists public.experiences (
  id            uuid primary key default gen_random_uuid(),
  company       text not null,
  job_title     text not null,
  location      text,
  start_date    date,
  end_date      date,
  is_current    boolean not null default false,
  description   text,
  bullets       text[] not null default '{}',
  skills        text[] not null default '{}',
  logo_url      text,
  status        public.content_status not null default 'published',
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- --- education -------------------------------------------------------------
create table if not exists public.education (
  id            uuid primary key default gen_random_uuid(),
  institution   text not null,
  degree        text not null,
  major         text,
  minor         text,
  start_year    integer,
  end_year      integer,
  grade         text,
  description   text,
  logo_url      text,
  status        public.content_status not null default 'published',
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- --- projects --------------------------------------------------------------
-- One table, discriminated by `kind`. Finance, Analytics and general projects
-- are the same shape, so they share storage, policies, actions and UI. Adding
-- a "case_studies" or "certifications" kind later is one enum value, no new
-- code path.
create table if not exists public.projects (
  id              uuid primary key default gen_random_uuid(),
  kind            public.project_kind not null default 'general',
  title           text not null,
  slug            text,
  category        text,
  short_description text,
  description     text,
  problem         text,
  solution        text,
  features        text[] not null default '{}',
  tools           text[] not null default '{}',
  skills          text[] not null default '{}',
  technology      text[] not null default '{}',
  role            text,
  thumbnail_url   text,
  images          text[] not null default '{}',
  github_url      text,
  demo_url        text,
  report_url      text,
  model_url       text,
  case_study_url  text,
  project_date    date,
  is_featured     boolean not null default false,
  status          public.content_status not null default 'draft',
  display_order   integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists projects_kind_status_idx
  on public.projects (kind, status, display_order);

-- --- writing ---------------------------------------------------------------
create table if not exists public.writing (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  slug             text unique,
  writing_type     text not null default 'article', -- book | poem | short_story | article | essay | sample
  description      text,
  body             text,
  cover_url        text,
  pdf_url          text,
  external_url     text,
  published_on     date,
  tags             text[] not null default '{}',
  is_featured      boolean not null default false,
  status           public.content_status not null default 'draft',
  display_order    integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- --- achievements ----------------------------------------------------------
create table if not exists public.achievements (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  organization   text,
  awarded_on     date,
  description    text,
  image_url      text,
  external_url   text,
  status         public.content_status not null default 'published',
  display_order  integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- --- skills ----------------------------------------------------------------
create table if not exists public.skill_categories (
  id            uuid primary key default gen_random_uuid(),
  name          text not null unique,
  description   text,
  status        public.content_status not null default 'published',
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.skills (
  id            uuid primary key default gen_random_uuid(),
  category_id   uuid references public.skill_categories (id) on delete cascade,
  name          text not null,
  level         text,
  status        public.content_status not null default 'published',
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists skills_category_idx on public.skills (category_id, display_order);

-- --- social links ----------------------------------------------------------
create table if not exists public.social_links (
  id            uuid primary key default gen_random_uuid(),
  label         text not null,
  url           text not null,
  icon          text,
  status        public.content_status not null default 'published',
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- --- resumes ---------------------------------------------------------------
create table if not exists public.resumes (
  id            uuid primary key default gen_random_uuid(),
  label         text not null default 'Resume',
  file_url      text not null,
  is_active     boolean not null default false,
  status        public.content_status not null default 'published',
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Exactly one active resume at a time. Flipping one on flips the rest off,
-- enforced by the database so the public site can never show two.
create unique index if not exists resumes_single_active_idx
  on public.resumes (is_active) where (is_active = true);

create or replace function public.deactivate_other_resumes()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.is_active then
    update public.resumes set is_active = false
      where id <> new.id and is_active = true;
  end if;
  return new;
end;
$$;

drop trigger if exists resumes_single_active on public.resumes;
create trigger resumes_single_active
  before insert or update of is_active on public.resumes
  for each row when (new.is_active) execute function public.deactivate_other_resumes();

-- --- site settings (singleton) ---------------------------------------------
create table if not exists public.site_settings (
  id                uuid primary key default gen_random_uuid(),
  site_title        text not null default 'Portfolio',
  site_description  text not null default '',
  og_image_url      text,
  favicon_url       text,
  canonical_url     text,
  contact_email     text,
  contact_note      text,
  footer_note       text,
  status            public.content_status not null default 'published',
  display_order     integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. updated_at triggers for every content table
-- ---------------------------------------------------------------------------

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','experiences','education','projects','writing','achievements',
    'skill_categories','skills','social_links','resumes','site_settings'
  ]
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
-- The rule for every content table, applied uniformly:
--
--   * anon + authenticated  -> SELECT, but only rows where status='published'
--   * admin                 -> SELECT / INSERT / UPDATE / DELETE, everything
--
-- Draft rows are therefore invisible to the public at the database level.
-- Filtering in the React code is a convenience, not the protection.
-- ---------------------------------------------------------------------------

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','experiences','education','projects','writing','achievements',
    'skill_categories','skills','social_links','resumes','site_settings'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists "public_read_published" on public.%I', t);
    execute format(
      'create policy "public_read_published" on public.%I
         for select to anon, authenticated
         using (status = ''published'')', t);

    execute format('drop policy if exists "admin_read_all" on public.%I', t);
    execute format(
      'create policy "admin_read_all" on public.%I
         for select to authenticated
         using (public.is_admin())', t);

    execute format('drop policy if exists "admin_insert" on public.%I', t);
    execute format(
      'create policy "admin_insert" on public.%I
         for insert to authenticated
         with check (public.is_admin())', t);

    execute format('drop policy if exists "admin_update" on public.%I', t);
    execute format(
      'create policy "admin_update" on public.%I
         for update to authenticated
         using (public.is_admin()) with check (public.is_admin())', t);

    execute format('drop policy if exists "admin_delete" on public.%I', t);
    execute format(
      'create policy "admin_delete" on public.%I
         for delete to authenticated
         using (public.is_admin())', t);
  end loop;
end $$;

-- Table-level grants. RLS decides which ROWS are visible; these grants decide
-- whether the role may address the table at all. Supabase normally sets these
-- by default, but stating them explicitly means this file works on any project.
grant usage on schema public to anon, authenticated;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','experiences','education','projects','writing','achievements',
    'skill_categories','skills','social_links','resumes','site_settings'
  ]
  loop
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

grant select on public.admins to authenticated;

-- ---------------------------------------------------------------------------
-- 4. STORAGE
-- ---------------------------------------------------------------------------
-- Public read (the images have to render for visitors), admin-only write.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars',      'avatars',      true, 5242880,  array['image/png','image/jpeg','image/webp','image/avif']),
  ('projects',     'projects',     true, 10485760, array['image/png','image/jpeg','image/webp','image/avif','image/gif']),
  ('logos',        'logos',        true, 2097152,  array['image/png','image/jpeg','image/webp','image/svg+xml']),
  ('writing',      'writing',      true, 20971520, array['image/png','image/jpeg','image/webp','application/pdf']),
  ('certificates', 'certificates', true, 20971520, array['image/png','image/jpeg','image/webp','application/pdf']),
  ('resumes',      'resumes',      true, 10485760, array['application/pdf']),
  ('documents',    'documents',    true, 26214400, array['application/pdf','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.presentationml.presentation'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "portfolio_public_read" on storage.objects;
create policy "portfolio_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id in ('avatars','projects','logos','writing','certificates','resumes','documents'));

drop policy if exists "portfolio_admin_insert" on storage.objects;
create policy "portfolio_admin_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('avatars','projects','logos','writing','certificates','resumes','documents')
    and public.is_admin()
  );

drop policy if exists "portfolio_admin_update" on storage.objects;
create policy "portfolio_admin_update" on storage.objects
  for update to authenticated
  using (
    bucket_id in ('avatars','projects','logos','writing','certificates','resumes','documents')
    and public.is_admin()
  );

drop policy if exists "portfolio_admin_delete" on storage.objects;
create policy "portfolio_admin_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('avatars','projects','logos','writing','certificates','resumes','documents')
    and public.is_admin()
  );

-- ===========================================================================
--  Done. Next: run 02_seed.sql, then 03_create_admin.sql.
-- ===========================================================================
