"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { deleteRecord, duplicateRecord, reorderRecords, setActiveResume, togglePublish } from "@/app/admin/actions";
import type { ResourceDef } from "@/lib/resources";
import { cn, formatMonthYear } from "@/lib/utils";

type Row = Record<string, unknown>;

interface Props {
  resource: ResourceDef;
  rows: Row[];
}

function cellText(row: Row, name: string, kind: string | undefined): string {
  const value = row[name];
  if (value === null || value === undefined || value === "") return "—";
  if (kind === "date") return formatMonthYear(String(value)) ?? "—";
  if (kind === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ") || "—";
  return String(value);
}

export default function ResourceList({ resource, rows }: Props) {
  // Local copy so drag-and-drop feels instant; the server call follows.
  const [items, setItems] = useState<Row[]>(rows);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);
  const [orderMessage, setOrderMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => setItems(rows), [rows]);

  function persistOrder(next: Row[]) {
    setItems(next);
    startTransition(async () => {
      const result = await reorderRecords(next.map((r) => String(r.id)), resource.key);
      setOrderMessage(result.message);
      window.setTimeout(() => setOrderMessage(null), 2500);
    });
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    persistOrder(next);
  }

  function onDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const next = [...items];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    setDragIndex(null);
    persistOrder(next);
  }

  const title = (row: Row): string =>
    String(row.title ?? row.company ?? row.institution ?? row.name ?? row.label ?? "this item");

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-rule bg-white/50 px-6 py-14 text-center">
        <p className="font-serif text-lg">Nothing here yet.</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          Add your first {resource.singular.toLowerCase()} and it will appear on the public site as soon as you publish it.
        </p>
        <Link href={`/admin/${resource.key}/new`} className="btn-primary mt-6">
          + Add {resource.singular.toLowerCase()}
        </Link>
      </div>
    );
  }

  return (
    <>
      {resource.orderable && (
        <p className="mb-3 text-xs text-muted" aria-live="polite">
          {orderMessage ?? (isPending ? "Saving order…" : "Drag a row to reorder, or use the ↑ ↓ buttons.")}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-rule bg-white">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">{resource.label}</caption>
          <thead className="border-b border-rule bg-paper/60">
            <tr>
              {resource.orderable && <th scope="col" className="w-10 px-2 py-3" />}
              {resource.listColumns.map((column) => (
                <th
                  key={column.name}
                  scope="col"
                  className={cn("px-4 py-3 font-medium text-muted", column.secondary && "hidden md:table-cell")}
                >
                  {column.label}
                </th>
              ))}
              <th scope="col" className="px-4 py-3 text-right font-medium text-muted">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {items.map((row, index) => {
              const id = String(row.id);
              const status = String(row.status ?? "");
              return (
                <tr
                  key={id}
                  draggable={resource.orderable}
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(event) => {
                    if (resource.orderable) event.preventDefault();
                  }}
                  onDrop={() => onDrop(index)}
                  className={cn(
                    "border-b border-rule/70 last:border-0",
                    dragIndex === index && "opacity-40",
                    resource.orderable && "cursor-grab active:cursor-grabbing",
                  )}
                >
                  {resource.orderable && (
                    <td className="px-2 py-3 align-middle">
                      <div className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => move(index, -1)}
                          disabled={index === 0}
                          className="px-1 text-xs text-muted hover:text-ink disabled:opacity-25"
                          aria-label={`Move ${title(row)} up`}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => move(index, 1)}
                          disabled={index === items.length - 1}
                          className="px-1 text-xs text-muted hover:text-ink disabled:opacity-25"
                          aria-label={`Move ${title(row)} down`}
                        >
                          ↓
                        </button>
                      </div>
                    </td>
                  )}

                  {resource.listColumns.map((column) => (
                    <td
                      key={column.name}
                      className={cn("px-4 py-3 align-middle", column.secondary && "hidden md:table-cell")}
                    >
                      {column.kind === "status" ? (
                        <span className={status === "published" ? "badge-published" : "badge-draft"}>{status}</span>
                      ) : column.name === (resource.listColumns[0]?.name ?? "") ? (
                        <Link href={`/admin/${resource.key}/${id}`} className="font-medium text-ink hover:text-accent">
                          {cellText(row, column.name, column.kind)}
                        </Link>
                      ) : (
                        <span className="text-muted">{cellText(row, column.name, column.kind)}</span>
                      )}
                    </td>
                  ))}

                  <td className="px-4 py-3 align-middle">
                    <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
                      <Link href={`/admin/${resource.key}/${id}`} className="text-xs font-medium hover:text-accent">
                        Edit
                      </Link>

                      <form action={duplicateRecord}>
                        <input type="hidden" name="__resource" value={resource.key} />
                        <input type="hidden" name="__id" value={id} />
                        <button type="submit" className="text-xs text-muted hover:text-ink">
                          Duplicate
                        </button>
                      </form>

                      {resource.publishable && (
                        <form action={togglePublish}>
                          <input type="hidden" name="__resource" value={resource.key} />
                          <input type="hidden" name="__id" value={id} />
                          <input type="hidden" name="__status" value={status === "published" ? "draft" : "published"} />
                          <button type="submit" className="text-xs text-muted hover:text-ink">
                            {status === "published" ? "Unpublish" : "Publish"}
                          </button>
                        </form>
                      )}

                      {resource.table === "resumes" && row.is_active !== true && (
                        <form action={setActiveResume}>
                          <input type="hidden" name="__id" value={id} />
                          <button type="submit" className="text-xs font-medium text-ink hover:text-accent">
                            Set active
                          </button>
                        </form>
                      )}

                      <button type="button" onClick={() => setPendingDelete(row)} className="text-xs text-accent hover:underline">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Confirmation. Deliberately requires a second, deliberate click. */}
      {pendingDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6"
          onClick={(event) => {
            if (event.target === event.currentTarget) setPendingDelete(null);
          }}
        >
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 id="confirm-title" className="font-serif text-xl">
              Delete {title(pendingDelete)}?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              This removes it from the database permanently. If you only want it off the public site, unpublish it
              instead.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="btn-secondary" onClick={() => setPendingDelete(null)} autoFocus>
                Keep it
              </button>
              <form action={deleteRecord}>
                <input type="hidden" name="__resource" value={resource.key} />
                <input type="hidden" name="__id" value={String(pendingDelete.id)} />
                <button type="submit" className="btn-danger">
                  Delete permanently
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
