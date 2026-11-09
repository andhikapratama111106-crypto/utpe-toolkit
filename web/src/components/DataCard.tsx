import type { ReactNode } from "react";

type Props = { eyebrow: string; value: string; label: string; secondary?: string; delta?: ReactNode; footnote?: string };

/** KPI card: eyebrow, big mono number, label, rule, secondary value, delta, footnote. */
export function DataCard({ eyebrow, value, label, secondary, delta, footnote }: Props) {
  return (
    <article className="flex h-full flex-col border border-rule bg-paper p-6 transition-colors duration-150 hover:border-ink">
      <p className="font-mono text-[11px] uppercase tracking-widest text-crimson">{eyebrow}</p>
      <p className="mt-4 break-words font-mono text-[2rem] font-medium leading-[1.1] tracking-[-0.02em] tabular-nums">{value}</p>
      <p className="mt-2 font-sans text-xs font-medium uppercase tracking-[0.08em] text-ink-medium">{label}</p>
      <hr className="my-4 border-rule" />
      {secondary && <p className="font-mono text-[13px] tabular-nums text-ink-medium">{secondary}</p>}
      {delta && <div className="mt-2">{delta}</div>}
      {footnote && <p className="mt-auto pt-4 font-serif text-[11px] italic text-ink-faint">{footnote}</p>}
    </article>
  );
}
