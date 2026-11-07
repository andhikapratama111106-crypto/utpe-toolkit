import type { ReactNode } from "react";

/** Footnote block at the end of a section. Items are rendered as ¹ ² ³ … */
export function Footnotes({ items }: { items: ReactNode[] }) {
  const sup = "¹²³⁴⁵⁶⁷⁸⁹";
  return (
    <footer className="mt-12 border-t border-rule pt-3">
      <ol className="space-y-1 font-serif text-[11px] italic leading-relaxed text-ink-faint">
        {items.map((it, i) => (
          <li key={i}>
            <span aria-hidden="true">{sup[i] ?? i + 1} </span>
            {it}
          </li>
        ))}
      </ol>
    </footer>
  );
}
