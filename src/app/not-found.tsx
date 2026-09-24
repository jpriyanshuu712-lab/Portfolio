import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-reading flex-col justify-center px-6 py-20">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 font-serif text-4xl tracking-tight">That page doesn&rsquo;t exist.</h1>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">
        It may have been unpublished, or the link may be wrong.
      </p>
      <p className="mt-8">
        <Link href="/" className="btn-primary">
          Back to the homepage
        </Link>
      </p>
    </main>
  );
}
