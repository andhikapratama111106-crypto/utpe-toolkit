import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type Column<T> = { key: string; header: string; align?: "left" | "right"; mono?: boolean; render?: (row: T) => ReactNode };

type Props<T> = {
  n: number;
  caption: string;
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  source?: string;
  highlight?: (row: T) => boolean;
  /** Names the first-column cell as a row header (th scope=row). Default true. */
  rowHeader?: boolean;
  /** Background of the section the table sits in, so the sticky first column stays opaque. */
  surface?: "paper" | "alt";
};

/** Academic table: 2px ink rule under the header, hairlines between rows, mono numbers. */
export function DataTable<T>({ n, caption, columns, rows, rowKey, source, highlight, rowHeader = true, surface = "paper" }: Props<T>) {
  return (
    <div className="my-8">
      <p className="mb-2 font-sans text-xs text-ink-medium">
        <span className="font-medium text-ink">Table {n}</span> — {caption}
      </p>
      <div className="overflow-x-auto">
        <table className={cn("w-full border-collapse text-left", surface === "alt" ? "bg-paper-alt" : "bg-paper")}>
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-inherit">
            <tr className="border-b-2 border-ink bg-inherit">
              {columns.map((c, i) => (
                <th key={c.key} scope="col" className={cn("whitespace-nowrap px-4 py-2 font-sans text-[11px] font-medium uppercase tracking-wider text-ink", c.align === "right" && "text-right", i === 0 && "sticky left-0 bg-inherit pl-0")}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-inherit">
            {rows.map((row) => (
              <tr key={rowKey(row)} className={cn("border-b border-rule bg-inherit hover:bg-paper-deep", highlight?.(row) && "bg-crimson-bg hover:bg-crimson-bg")}>
                {columns.map((c, i) => {
                  const content = c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? "");
                  const cls = cn("px-4 py-3 align-top", c.align === "right" && "text-right", c.mono || c.align === "right" ? "font-mono text-sm tabular-nums" : "font-serif text-sm", i === 0 && "sticky left-0 bg-inherit pl-0");
                  return i === 0 && rowHeader ? (
                    <th key={c.key} scope="row" className={cn(cls, "font-medium")}>{content}</th>
                  ) : (
                    <td key={c.key} className={cls}>{content}</td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {source && <p className="mt-2 font-sans text-[10px] text-ink-faint">Source: {source}</p>}
    </div>
  );
}
