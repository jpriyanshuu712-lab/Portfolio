import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { getProfile, getResumeUrl, getSiteSettings, getSocialLinks } from "@/lib/data";
import { real } from "@/lib/utils";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [profile, settings, social, resumeUrl] = await Promise.all([
    getProfile(),
    getSiteSettings(),
    getSocialLinks(),
    getResumeUrl(),
  ]);

  const name = real(profile?.full_name) ?? real(settings?.site_title) ?? "Portfolio";

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <SiteHeader name={name} resumeUrl={resumeUrl} />

      <main id="main" className="mx-auto max-w-5xl px-6 py-14 sm:py-20">
        {children}
      </main>

      <SiteFooter name={name} note={real(settings?.footer_note)} links={social} />
    </>
  );
}
