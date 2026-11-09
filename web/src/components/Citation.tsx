import { REFERENCES } from "@/content/references";

/** Superscript [n] with a hover/focus tooltip; links to the reference list on Home (#ref-n). */
export function Citation({ n }: { n: number }) {
  const ref = REFERENCES.find((r) => r.n === n);
  return (
    <sup className="group relative">
      <a href={`/#ref-${n}`} aria-label={`Reference ${n}: ${ref?.text ?? ""}`} className="cursor-pointer font-mono text-[10px] text-crimson no-underline hover:underline">
        [{n}]
      </a>
      {ref && (
        <span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 hidden w-72 -translate-x-1/2 border border-rule bg-paper p-3 text-left font-serif text-xs italic leading-snug text-ink-medium shadow-subtle group-focus-within:block group-hover:block">
          {ref.text}
        </span>
      )}
    </sup>
  );
}
