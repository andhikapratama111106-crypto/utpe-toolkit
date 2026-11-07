import type { ReactNode } from "react";

type Props = { number: string; title: string; subtitle?: string; meta?: ReactNode; level?: 2 | 3 };

/** "§ 01.2" divider with a top rule, title and optional italic subtitle. */
export function SectionHeader({ number, title, subtitle, meta, level = 2 }: Props) {
  // Always an h2 so heading order stays valid (h1 -> h2); `level` only picks the visual size.
  const H = "h2";
  return (
    <header className="mb-8 border-t border-ink pt-3">
      <div className="flex items-baseline justify-between gap-4 font-mono text-[11px] uppercase tracking-widest text-ink-faint">
        <span>§ {number}</span>
        {meta && <span>{meta}</span>}
      </div>
      <H className={level === 2 ? "mt-3 font-serif text-[1.75rem] font-medium leading-tight" : "mt-3 font-serif text-2xl font-medium leading-tight"}>
        {title}
      </H>
      {subtitle && <p className="mt-1 font-serif text-base italic text-ink-medium">{subtitle}</p>}
    </header>
  );
}
