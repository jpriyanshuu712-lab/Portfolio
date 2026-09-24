"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { saveRecord } from "@/app/admin/actions";
import { IDLE } from "@/lib/action-state";
import type { FieldDef, ResourceDef } from "@/lib/resources";
import { arrayToCommas, arrayToLines } from "@/lib/utils";
import { GalleryField, UploadField } from "./Uploader";

export interface RelationOption {
  value: string;
  label: string;
}

interface Props {
  resource: ResourceDef;
  record: Record<string, unknown> | null;
  relationOptions: Record<string, RelationOption[]>;
  /** Where "Cancel" goes back to. */
  backHref: string;
}

function SaveButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Saving…" : isNew ? "Create" : "Save changes"}
    </button>
  );
}

function stringValue(record: Record<string, unknown> | null, field: FieldDef): string {
  const raw = record?.[field.name];
  if (raw === null || raw === undefined) return "";
  if (Array.isArray(raw)) {
    return field.kind === "tags" ? arrayToCommas(raw as string[]) : arrayToLines(raw as string[]);
  }
  return String(raw);
}

export default function ResourceForm({ resource, record, relationOptions, backHref }: Props) {
  const [state, formAction] = useFormState(saveRecord, IDLE);
  const isNew = !record?.id;
  const errors = state.errors ?? {};

  function renderField(field: FieldDef) {
    const id = `field-${field.name}`;
    const error = errors[field.name];
    const describedBy = [field.help ? `${id}-help` : null, error ? `${id}-error` : null].filter(Boolean).join(" ");
    const value = stringValue(record, field);

    // Upload widgets manage their own label and hidden input.
    if (field.kind === "image" || field.kind === "file") {
      return (
        <UploadField
          name={field.name}
          label={field.label}
          bucket={field.bucket ?? "documents"}
          accept={field.accept}
          maxMb={field.maxMb ?? 10}
          isImage={field.kind === "image"}
          defaultValue={value}
          help={field.help}
          required={field.required}
          error={error}
        />
      );
    }

    if (field.kind === "gallery") {
      return (
        <GalleryField
          name={field.name}
          label={field.label}
          bucket={field.bucket ?? "projects"}
          maxMb={field.maxMb ?? 10}
          defaultValue={(record?.[field.name] as string[]) ?? []}
          help={field.help}
        />
      );
    }

    if (field.kind === "boolean") {
      const checked = record?.[field.name] === true;
      return (
        <div className="flex items-start gap-3 rounded-lg border border-rule bg-white px-4 py-3">
          <input
            id={id}
            name={field.name}
            type="checkbox"
            defaultChecked={checked}
            className="mt-0.5 h-4 w-4 rounded border-rule text-ink focus:ring-ink"
            aria-describedby={describedBy || undefined}
          />
          <div>
            <label htmlFor={id} className="text-sm font-medium text-ink">
              {field.label}
            </label>
            {field.help && (
              <p id={`${id}-help`} className="field-help mt-0.5">
                {field.help}
              </p>
            )}
          </div>
        </div>
      );
    }

    const label = (
      <label htmlFor={id} className="field-label">
        {field.label}
        {field.required && <span className="ml-1 text-accent">*</span>}
      </label>
    );

    const tail = (
      <>
        {field.help && (
          <p id={`${id}-help`} className="field-help">
            {field.help}
          </p>
        )}
        {error && (
          <p id={`${id}-error`} className="field-error" role="alert">
            {error}
          </p>
        )}
      </>
    );

    if (field.kind === "select") {
      return (
        <div>
          {label}
          <select
            id={id}
            name={field.name}
            defaultValue={value || field.options?.[0]?.value}
            className="input"
            aria-describedby={describedBy || undefined}
          >
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {tail}
        </div>
      );
    }

    if (field.kind === "relation") {
      const options = relationOptions[field.name] ?? [];
      return (
        <div>
          {label}
          <select id={id} name={field.name} defaultValue={value} className="input" aria-describedby={describedBy || undefined}>
            <option value="">— none —</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {options.length === 0 && <p className="field-help">Nothing to pick yet — create a category first.</p>}
          {tail}
        </div>
      );
    }

    if (field.kind === "textarea" || field.kind === "prose" || field.kind === "lines") {
      return (
        <div>
          {label}
          <textarea
            id={id}
            name={field.name}
            defaultValue={value}
            rows={field.kind === "prose" ? 12 : field.kind === "lines" ? 6 : 3}
            placeholder={field.placeholder}
            className="input resize-y font-[inherit] leading-relaxed"
            aria-describedby={describedBy || undefined}
            aria-invalid={error ? true : undefined}
          />
          {tail}
        </div>
      );
    }

    const inputType =
      field.kind === "date" ? "date" : field.kind === "email" ? "email" : field.kind === "url" ? "url" : field.kind === "number" || field.kind === "year" ? "number" : "text";

    return (
      <div>
        {label}
        <input
          id={id}
          name={field.name}
          type={inputType}
          defaultValue={value}
          placeholder={field.placeholder}
          className="input"
          aria-describedby={describedBy || undefined}
          aria-invalid={error ? true : undefined}
          {...(field.kind === "year" ? { min: 1900, max: 2100, step: 1 } : {})}
          {...(field.kind === "url" ? { inputMode: "url" as const } : {})}
        />
        {tail}
      </div>
    );
  }

  return (
    <form action={formAction} noValidate>
      <input type="hidden" name="__resource" value={resource.key} />
      {record?.id ? <input type="hidden" name="__id" value={String(record.id)} /> : null}

      {state.status === "error" && (
        <p role="alert" className="mb-6 rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-accent">
          {state.message}
        </p>
      )}
      {state.status === "success" && (
        <p role="status" className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {state.message}
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {resource.fields.map((field) => (
          <div key={field.name} className={field.half ? "sm:col-span-1" : "sm:col-span-2"}>
            {renderField(field)}
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 mt-8 flex flex-wrap items-center gap-3 border-t border-rule bg-paper py-4">
        <SaveButton isNew={isNew} />
        <Link href={backHref} className="btn-secondary">
          Cancel
        </Link>
        {resource.previewPath && (
          <Link href={resource.previewPath} target="_blank" className="btn-ghost">
            Preview public page ↗
          </Link>
        )}
      </div>
    </form>
  );
}
