# Personal portfolio + lightweight CMS

A portfolio site where **none of the content lives in the code**. Every
sentence, project, bullet point and image on the public site is a row in a
Postgres database that you edit from a private dashboard at `/admin`.

- **Public site** — anyone can read it
- **`/admin`** — only you, protected by real server-side auth and Postgres
  Row Level Security
- **No signup page** — the only account that exists is the one you create
  yourself in the Supabase dashboard

Built with Next.js (App Router) + TypeScript + Tailwind CSS + Supabase.

---

## Contents

1. [Install](#1-install)
2. [Configure Supabase](#2-configure-supabase)
3. [Run the database SQL](#3-run-the-database-sql)
4. [Create your admin account](#4-create-your-admin-account)
5. [Environment variables](#5-environment-variables)
6. [Run locally](#6-run-locally)
7. [Deploy to Vercel](#7-deploy-to-vercel)
8. [Connect your domain](#8-connect-your-domain)
9. [Using the dashboard](#9-using-the-dashboard)
10. [Uploading files](#10-uploading-files)
11. [How the security works](#how-the-security-actually-works)
12. [Adding a new section later](#adding-a-whole-new-section-later)
13. [Troubleshooting](#troubleshooting)

---

## 1. Install

You need **Node.js 18.17 or newer**. Check with `node -v`.

```bash
npm install
```

That's the whole install step. It takes a couple of minutes the first time.

---

## 2. Configure Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account.
2. Click **New project**. Give it a name, choose a region close to you
   (Mumbai / Singapore if you're in India), and set a database password.
   Save that password somewhere — you won't need it often, but you will
   need it eventually.
3. Wait about two minutes for the project to finish provisioning.

That's it for now. Don't change any settings.

---

## 3. Run the database SQL

In your Supabase project, open **SQL Editor** in the left sidebar, then click
**New query**. Run these three files **in order**, one at a time — paste the
contents of each into the editor and press **Run**.

| Order | File | What it does |
|-------|------|--------------|
| 1 | `supabase/01_schema.sql` | Creates every table, all the Row Level Security policies, and the storage buckets |
| 2 | `supabase/02_seed.sql` | Fills the database with your starting content |
| 3 | `supabase/03_create_admin.sql` | Makes your account the admin (do step 4 first) |

All three are safe to re-run. `01` is idempotent; `02` clears and re-inserts
the seed content, so **don't re-run it after you've started editing**, or you
will overwrite your own work.

### A note on the seed content

`02_seed.sql` contains the real information you gave me: Accenture, Genpact,
INME, Great Lakes, University of Lucknow, the Aditya Birla scholarship, the
four finance projects, the four analytics projects, Spotly, Finnlyy, Devil's
Witness, and *Love Across the Stars*.

Anything I didn't have is a **`TODO:` placeholder** rather than an invention —
no made-up grades, dates, URLs or statistics. Search the file for `TODO` to
see the full list. The public site automatically hides any field still
containing a `TODO:` placeholder, so nothing embarrassing shows to a recruiter
while you're filling them in.

---

## 4. Create your admin account

**In the Supabase dashboard:**

1. Go to **Authentication → Users**
2. Click **Add user → Create new user**
3. Enter your email and a strong password
4. **Tick "Auto Confirm User"** — otherwise you can't sign in until you
   confirm by email
5. Click **Create user**

**Then, in the SQL Editor:**

Open `supabase/03_create_admin.sql`, change the email on the line marked
`<<< CHANGE THIS` to the email you just used, and run it. It should print one
row back. That row is your admin grant.

There is no other way to become an admin. The `admins` table has no INSERT
policy at all, so nothing reachable from the website — no form, no API call,
no crafted request — can add a row to it. Only the SQL editor can.

---

## 5. Environment variables

Copy the example file:

```bash
cp .env.example .env.local
```

Then fill in two values from **Supabase → Project Settings → API**:

| Variable | Where to find it |
|----------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | "Project URL" |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the "anon / public" key |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` locally; your real domain in production |

> **The `anon` key is meant to be public.** It's in the browser bundle by
> design. It grants nothing on its own — every request it makes is still
> filtered by Row Level Security in Postgres.
>
> **The `service_role` key is the opposite.** It bypasses RLS entirely. This
> project never uses it, and you should never put it in any variable starting
> with `NEXT_PUBLIC_`, because those are shipped to every visitor's browser.

---

## 6. Run locally

```bash
npm run dev
```

- Public site → <http://localhost:3000>
- Dashboard → <http://localhost:3000/admin> (redirects you to sign in)

Sign in with the email and password from step 4.

---

## 7. Deploy to Vercel

1. Push this project to a new **GitHub** repository:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```

   `.gitignore` already excludes `.env.local`, so your keys don't get pushed.

2. Go to [vercel.com](https://vercel.com), sign in with GitHub, click
   **Add New → Project**, and import the repository.

3. Before you click Deploy, open **Environment Variables** and add all three
   from step 5. Set `NEXT_PUBLIC_SITE_URL` to your Vercel URL for now
   (e.g. `https://your-repo.vercel.app`).

4. Click **Deploy**.

Every push to `main` redeploys automatically from then on. Note that you only
need to deploy when the *code* changes — content edits go live instantly
without any deployment at all.

---

## 8. Connect your domain

1. Buy a domain (Namecheap, GoDaddy, Cloudflare — any registrar).
2. In Vercel: **Project → Settings → Domains → Add**, and enter it.
3. Vercel shows you the DNS records to add. Add them at your registrar.
   Propagation usually takes minutes, occasionally a few hours.
4. Update `NEXT_PUBLIC_SITE_URL` in Vercel to your real domain and redeploy.
5. In the dashboard, go to **Site settings** and set **Canonical URL** to the
   same domain. That's what the sitemap and the SEO tags use.

---

## 9. Using the dashboard

Sign in at `/admin`. The left sidebar holds every section.

**Adding something:**

> Projects → **+ Add project** → fill in the form → upload an image →
> **Create** → it appears in the list as a Draft → click **Publish** → it's
> on the live site.

**Editing something:**

> Experience → click **Accenture** → change a bullet point → **Save changes**
> → refresh the public site, it's already there.

**Every section supports:**

| Action | How |
|--------|-----|
| Add | the **+ Add** button, top right |
| Edit | click the row's title |
| Delete | the **Delete** link — asks for confirmation first |
| Duplicate | the **Duplicate** link — the copy is always a draft |
| Publish / unpublish | the **Publish** / **Unpublish** link |
| Reorder | drag a row, or use the **↑ ↓** buttons (saves immediately) |
| Preview | the **Preview public page** link on any edit form |

**Draft vs Published.** A draft is invisible to visitors — not hidden by the
UI, but *blocked by the database*. Even someone who knew the exact URL and
had a valid API key would get nothing back. Use drafts freely while you're
preparing something.

### Which section holds what

| Section | What it feeds |
|---------|---------------|
| About | The homepage hero and the whole About page |
| Experience | `/experience` and the homepage summary |
| Education | The Education block on `/about` |
| Projects | `/projects` — "Things I've built" |
| Finance | `/finance` |
| Analytics | `/analytics` — the **Category** field drives the public filter buttons |
| Writing | `/writing` — The Writer's Room. A piece with text in **Content** gets its own page |
| Achievements | `/achievements` |
| Skill categories → Skills | The Skills block on `/about`. Create a category first, then add skills to it |
| Resume | The **Download Resume** buttons everywhere |
| Social links | Footer and Contact page |
| Site settings | SEO title, description, social share image, contact details |

---

## 10. Uploading files

Every image and file field has an upload button built in. Pick a file, it
uploads to Supabase Storage, you get a preview, then you save the form.

| Field | Bucket | Limit |
|-------|--------|-------|
| Profile photograph | `avatars` | 5 MB, images |
| Project thumbnails and gallery | `projects` | 10 MB, images |
| Company / institution logos | `logos` | 2 MB, images + SVG |
| Writing covers and PDFs | `writing` | 20 MB |
| Certificates | `certificates` | 20 MB |
| Resume | `resumes` | 10 MB, **PDF only** |
| Reports and Excel models | `documents` | 25 MB |

The size and file-type rules are enforced twice: once in the browser so you
get a clear message, and again by the storage bucket itself so they can't be
bypassed.

**Replacing your resume:** Resume → **+ Add resume** → upload the new PDF →
tick **Set as the active resume** → Create. Every Download button across the
site now serves the new file. The old one stays in the list as history. Only
one resume can be active at a time — the database enforces that, so you can't
accidentally end up with two.

---

## How the security actually works

This is worth understanding, because it's the part that would matter if it
were wrong.

There are **three** gates, and they're independent:

**1. Middleware** (`src/middleware.ts`). Any request to `/admin/*` without a
valid session is redirected to `/login`. A valid session that isn't on the
admin list is also turned away. This runs before any page renders.

**2. Server-side re-check** (`src/lib/auth.ts`). Every admin page and every
mutating action calls `requireAdmin()` / `checkAdmin()` again on the server.
The client is never trusted, and nothing about the UI state can influence it.

**3. Row Level Security in Postgres** (`supabase/01_schema.sql`). This is the
real boundary, and the only one that would still hold if the other two were
removed. Every content table has exactly these policies:

- `anon` and `authenticated` may `SELECT` rows **where `status = 'published'`**
- writes of any kind require `public.is_admin()` — a `SECURITY DEFINER`
  function that checks whether `auth.uid()` appears in the `admins` table

So: a visitor who extracts the anon key from the page source and calls the
Supabase REST API directly gets back exactly what the website already shows
them — published rows, nothing more. They cannot read a draft. They cannot
write anything. The same policies apply to Storage, so they cannot upload a
file either.

Two further details worth noting:

- The session is verified with `getUser()`, which revalidates the JWT against
  Supabase Auth, rather than `getSession()`, which trusts the cookie.
- The `service_role` key — the one that bypasses RLS — is never read anywhere
  in this codebase, so it cannot leak into the browser bundle.

**What's still on you:** use a strong, unique password for the admin account,
and turn on MFA for your Supabase dashboard account. The database is only as
protected as the credentials that guard it.

---

## Adding a whole new section later

The thirteen admin sections are generated from one file:
`src/lib/resources.ts`. There is exactly one form component, one list
component and one set of server actions behind all of them.

To add, say, Certifications:

1. Copy a table block in `01_schema.sql`, rename it, and add it to the two
   `foreach t in array [...]` loops (the triggers loop and the RLS loop).
   Run it.
2. Add the row type to `src/lib/database.types.ts`.
3. Add one entry to `RESOURCES` in `src/lib/resources.ts`.
4. Add one line to `GROUPS` in `src/components/admin/Sidebar.tsx`.

You get add, edit, delete, duplicate, reorder, publish/unpublish and file
uploads for free. Then write the public page that reads it.

Testimonials, Case studies, Publications, Awards, Speaking and Video projects
all fit this shape. A blog is the same shape plus a detail route — the
Writing section is already a working example of that pattern.

---

## Project structure

```
src/
  app/
    (public)/          the public website — one folder per route
    admin/             the dashboard
      [section]/       every admin section, generated from resources.ts
      actions.ts       all mutations, in one file
    login/             sign-in only. There is no signup route.
  components/
    admin/             ResourceForm, ResourceList, Uploader, Sidebar
    site/              header, footer, cards, typography primitives
  lib/
    resources.ts       ← the content model. Start here.
    database.types.ts  row types, mirroring the SQL
    data.ts            public reads
    admin-data.ts      admin reads (these see drafts)
    auth.ts            requireAdmin / checkAdmin
    form.ts            FormData → validated payload
    supabase/          browser, server and middleware clients
supabase/
  01_schema.sql        tables, RLS, storage
  02_seed.sql          starting content
  03_create_admin.sql  grant yourself admin
```

---

## Troubleshooting

**"new row violates row-level security policy"**
Your account is signed in but isn't on the admin list. Run
`supabase/03_create_admin.sql` with your exact email. Check the spelling
against `select id, email from auth.users;`.

**Sign-in says the details didn't work, but they're right**
The user probably wasn't auto-confirmed. In Supabase → Authentication →
Users, check for a confirmation timestamp; if it's missing, delete the user
and recreate it with **Auto Confirm User** ticked.

**Images don't load**
`next.config.mjs` allows images only from your Supabase host, read from
`NEXT_PUBLIC_SUPABASE_URL` at build time. If you changed that variable, you
need to redeploy — the value is baked in at build.

**Edits don't show on the public site**
Every mutation calls `revalidatePath` for the public routes, so this should
be immediate. Hard-refresh first (Cmd/Ctrl + Shift + R). If it's still stale,
check the item's status is Published rather than Draft.

**`Missing environment variable ...`**
`.env.local` is absent or incomplete locally, or the variables weren't added
in Vercel. Restart `npm run dev` after editing `.env.local` — Next.js only
reads it at startup.

**A `TODO:` placeholder is showing on the public site**
It shouldn't — the site filters those out. If one slips through, it's in a
field the filter doesn't cover; just edit it in the dashboard.
