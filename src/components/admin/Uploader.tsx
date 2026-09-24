"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Uploads go straight from the browser to Supabase Storage using your own
 * session. The storage policies in 01_schema.sql require public.is_admin()
 * for INSERT, so a visitor with a valid anon key still cannot write a byte.
 *
 * The bucket also enforces its own MIME allow-list and size cap server-side.
 * The checks below are the courteous version of the same rules — they give a
 * useful message instead of a 400.
 */

function extensionFor(fileName: string): string {
  const match = /\.([a-z0-9]+)$/i.exec(fileName);
  return match ? match[1].toLowerCase() : "bin";
}

function safeObjectName(fileName: string): string {
  const ext = extensionFor(fileName);
  const stem = fileName
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "file";
  const unique = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  return `${stem}-${unique}.${ext}`;
}

async function uploadOne(
  file: File,
  bucket: string,
  maxMb: number,
  accept: string | undefined,
): Promise<{ url: string } | { error: string }> {
  const maxBytes = maxMb * 1024 * 1024;
  if (file.size > maxBytes) {
    return { error: `That file is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit here is ${maxMb} MB.` };
  }

  if (accept) {
    const patterns = accept.split(",").map((p) => p.trim().toLowerCase()).filter(Boolean);
    const ext = `.${extensionFor(file.name)}`;
    const type = file.type.toLowerCase();
    const allowed = patterns.some((p) => (p.startsWith(".") ? p === ext : p === type || (p.endsWith("/*") && type.startsWith(p.slice(0, -1)))));
    if (!allowed) {
      return { error: `That file type isn't allowed here. Accepted: ${accept}` };
    }
  }

  const supabase = createClient();
  const objectName = safeObjectName(file.name);

  const { error } = await supabase.storage.from(bucket).upload(objectName, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type || undefined,
  });

  if (error) {
    if (/row-level security|not authorized|Unauthorized/i.test(error.message)) {
      return { error: "Storage refused the upload — your account isn't on the admin list. Run supabase/03_create_admin.sql." };
    }
    if (/mime type|not supported/i.test(error.message)) {
      return { error: `The ${bucket} bucket doesn't accept that file type.` };
    }
    return { error: error.message };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(objectName);
  return { url: data.publicUrl };
}

// ---------------------------------------------------------------------------
// Single file / image
// ---------------------------------------------------------------------------

interface UploadFieldProps {
  name: string;
  label: string;
  bucket: string;
  accept?: string;
  maxMb?: number;
  isImage?: boolean;
  defaultValue?: string | null;
  help?: string;
  required?: boolean;
  error?: string;
}

export function UploadField({
  name,
  label,
  bucket,
  accept,
  maxMb = 10,
  isImage = false,
  defaultValue,
  help,
  required,
  error,
}: UploadFieldProps) {
  const [url, setUrl] = useState<string>(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const resolvedAccept = accept ?? (isImage ? "image/png,image/jpeg,image/webp,image/avif" : undefined);
  const showPreview = isImage && url && /^https?:\/\//.test(url);

  async function handleFile(file: File) {
    setBusy(true);
    setMessage(null);
    const result = await uploadOne(file, bucket, maxMb, resolvedAccept);
    setBusy(false);
    if ("error" in result) {
      setMessage(result.error);
      return;
    }
    setUrl(result.url);
    setMessage("Uploaded. Remember to save the form.");
  }

  return (
    <div>
      <label className="field-label" htmlFor={`${name}-file`}>
        {label}
        {required && <span className="ml-1 text-accent">*</span>}
      </label>

      {/* The saved value is the URL, not the file — this is what the form posts. */}
      <input type="hidden" name={name} value={url} />

      <div className="flex flex-wrap items-start gap-4">
        {showPreview && (
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-rule bg-white">
            {/* Unoptimized: the preview is transient and already sized. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <input
            ref={inputRef}
            id={`${name}-file`}
            type="file"
            accept={resolvedAccept}
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleFile(file);
            }}
            className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2
                       file:text-sm file:text-paper hover:file:bg-accent disabled:opacity-50"
          />

          {busy && <p className="field-help">Uploading…</p>}

          {url && !busy && (
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <a href={url} target="_blank" rel="noreferrer" className="link truncate text-xs text-muted">
                {url.split("/").pop()}
              </a>
              <button
                type="button"
                className="text-xs font-medium text-accent hover:underline"
                onClick={() => {
                  setUrl("");
                  setMessage(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
              >
                Remove
              </button>
            </div>
          )}

          {message && <p className="field-help">{message}</p>}
          {help && <p className="field-help">{help}</p>}
          {error && <p className="field-error">{error}</p>}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gallery (many images)
// ---------------------------------------------------------------------------

interface GalleryFieldProps {
  name: string;
  label: string;
  bucket: string;
  maxMb?: number;
  defaultValue?: string[];
  help?: string;
}

export function GalleryField({ name, label, bucket, maxMb = 10, defaultValue, help }: GalleryFieldProps) {
  const [urls, setUrls] = useState<string[]>(defaultValue ?? []);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleFiles(files: FileList) {
    setBusy(true);
    setMessage(null);
    const added: string[] = [];
    const failures: string[] = [];

    for (const file of Array.from(files)) {
      const result = await uploadOne(file, bucket, maxMb, "image/png,image/jpeg,image/webp,image/avif,image/gif");
      if ("error" in result) failures.push(`${file.name}: ${result.error}`);
      else added.push(result.url);
    }

    setUrls((current) => [...current, ...added]);
    setBusy(false);
    setMessage(
      failures.length
        ? failures.join(" ")
        : `Added ${added.length} image${added.length === 1 ? "" : "s"}. Remember to save the form.`,
    );
  }

  function move(index: number, direction: -1 | 1) {
    setUrls((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div>
      <label className="field-label" htmlFor={`${name}-files`}>
        {label}
      </label>

      {urls.map((url) => (
        <input key={url} type="hidden" name={name} value={url} />
      ))}

      {urls.length > 0 && (
        <ul className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {urls.map((url, index) => (
            <li key={url} className="overflow-hidden rounded-lg border border-rule bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-24 w-full object-cover" />
              <div className="flex items-center justify-between px-2 py-1.5">
                <div className="flex gap-1">
                  <button type="button" onClick={() => move(index, -1)} className="btn-ghost btn-sm px-1.5" aria-label="Move left">
                    ←
                  </button>
                  <button type="button" onClick={() => move(index, 1)} className="btn-ghost btn-sm px-1.5" aria-label="Move right">
                    →
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setUrls((current) => current.filter((u) => u !== url))}
                  className="text-xs font-medium text-accent hover:underline"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <input
        id={`${name}-files`}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
        disabled={busy}
        onChange={(event) => {
          if (event.target.files?.length) void handleFiles(event.target.files);
          event.target.value = "";
        }}
        className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2
                   file:text-sm file:text-paper hover:file:bg-accent disabled:opacity-50"
      />

      {busy && <p className="field-help">Uploading…</p>}
      {message && <p className="field-help">{message}</p>}
      {help && <p className="field-help">{help}</p>}
    </div>
  );
}
