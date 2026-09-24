/**
 * Server-rendered result banner. The row actions redirect back with
 * ?flash=ok|err&m=…, so the outcome of a delete or a publish survives the
 * navigation and is announced to screen readers.
 */
export default function Flash({ kind, message }: { kind?: string; message?: string }) {
  if (!kind || !message) return null;
  const ok = kind === "ok";

  return (
    <p
      role="status"
      className={
        ok
          ? "mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
          : "mb-6 rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-accent"
      }
    >
      {message}
    </p>
  );
}
