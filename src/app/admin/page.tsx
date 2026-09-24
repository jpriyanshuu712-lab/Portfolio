import Link from "next/link";
import { getOverviewCounts } from "@/lib/admin-data";
import { getActiveResume, getProfile } from "@/lib/data";
import { real } from "@/lib/utils";

export default async function AdminOverview() {
  const [counts, profile, resume] = await Promise.all([getOverviewCounts(), getProfile(), getActiveResume()]);

  const totalDrafts = counts.reduce((sum, item) => sum + item.drafts, 0);
  const name = real(profile?.full_name) ?? "there";

  // Things worth nudging about, computed rather than hard-coded.
  const nudges: { text: string; href: string }[] = [];
  if (!resume) nudges.push({ text: "No resume is active yet — upload a PDF and the Download buttons switch on.", href: "/admin/resume" });
  if (!real(profile?.email)) nudges.push({ text: "Your contact email is still a placeholder.", href: "/admin/about" });
  if (!real(profile?.linkedin_url)) nudges.push({ text: "Your LinkedIn URL is still a placeholder.", href: "/admin/about" });
  if (totalDrafts > 0)
    nudges.push({
      text: `${totalDrafts} item${totalDrafts === 1 ? " is" : "s are"} still in draft and invisible to visitors.`,
      href: "/admin/projects",
    });

  return (
    <div>
      <p className="eyebrow">Overview</p>
      <h1 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl">Hello, {name.split(" ")[0]}.</h1>
      <p className="mt-3 max-w-reading text-sm leading-relaxed text-muted">
        Everything on the public site is a row in the database. Edit it here and the change is live the moment you
        save — no code, no deploy.
      </p>

      {nudges.length > 0 && (
        <section className="mt-8 rounded-xl border border-rule bg-white p-5" aria-labelledby="nudges-heading">
          <h2 id="nudges-heading" className="eyebrow mb-3">
            Worth doing next
          </h2>
          <ul className="space-y-2">
            {nudges.map((nudge) => (
              <li key={nudge.text} className="text-sm leading-relaxed">
                <Link href={nudge.href} className="link">
                  {nudge.text}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8" aria-labelledby="counts-heading">
        <h2 id="counts-heading" className="eyebrow mb-3">
          Your content
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {counts.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-xl border border-rule bg-white p-4 transition-colors hover:border-ink"
              >
                <span className="block font-serif text-2xl">{item.total}</span>
                <span className="mt-0.5 block text-xs text-muted">{item.label}</span>
                {item.drafts > 0 && <span className="mt-2 inline-block badge-draft">{item.drafts} draft</span>}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 rounded-xl border border-rule bg-white p-5" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="font-serif text-lg">
          How this works
        </h2>
        <ol className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
          <li>
            <strong className="text-ink">1.</strong> Pick a section on the left and click <em>Add</em>, or click a row
            to edit it.
          </li>
          <li>
            <strong className="text-ink">2.</strong> Fill in the form. Upload images and PDFs directly — they go to
            Supabase Storage and you get a preview before you save.
          </li>
          <li>
            <strong className="text-ink">3.</strong> Leave it as <em>Draft</em> while you work. Drafts are blocked at
            the database level, so visitors cannot see them even if they guess the URL.
          </li>
          <li>
            <strong className="text-ink">4.</strong> Set it to <em>Published</em> and it&rsquo;s on the live site
            immediately.
          </li>
        </ol>
      </section>
    </div>
  );
}
