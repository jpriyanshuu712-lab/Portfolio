import type { Metadata } from "next";
import { getProfile, getResumeUrl, getSiteSettings, getSocialLinks } from "@/lib/data";
import { PageHeader, Prose } from "@/components/site/Primitives";
import { real } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const [profile, settings, social, resumeUrl] = await Promise.all([
    getProfile(),
    getSiteSettings(),
    getSocialLinks(),
    getResumeUrl(),
  ]);

  const email = real(settings?.contact_email) ?? real(profile?.email);
  const usableLinks = social.filter((link) => real(link.url));

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Get in touch"
        lede="Open to Finance and Analytics roles, and always happy to talk about a good book."
      />

      <div className="max-w-reading">
        <Prose text={settings?.contact_note} />

        {email ? (
          <p className="mt-8">
            <a href={`mailto:${email}`} className="font-serif text-2xl tracking-tight text-ink hover:text-accent sm:text-3xl">
              {email}
            </a>
          </p>
        ) : (
          <p className="mt-8 text-sm text-muted">
            Contact details haven&rsquo;t been added yet.
          </p>
        )}

        {usableLinks.length > 0 && (
          <section className="mt-12" aria-labelledby="elsewhere-heading">
            <h2 id="elsewhere-heading" className="eyebrow border-t border-rule pt-5">
              Elsewhere
            </h2>
            <ul className="mt-5 space-y-2.5">
              {usableLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target={link.url.startsWith("mailto:") ? undefined : "_blank"}
                    rel="noreferrer"
                    className="link text-[15px]"
                  >
                    {link.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {resumeUrl && (
          <p className="mt-12">
            <a href={resumeUrl} target="_blank" rel="noreferrer" className="btn-primary">
              Download resume
            </a>
          </p>
        )}
      </div>
    </>
  );
}
