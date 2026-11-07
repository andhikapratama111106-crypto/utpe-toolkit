import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = { n: number; caption: string; source: string; notes?: string; children: ReactNode; wide?: boolean };

/** <figure> with the three-line caption: Fig. N — description / Source / Notes. */
export function Figure({ n, caption, source, notes, children, wide }: Props) {
  return (
    <figure className={cn("my-8", wide ? "" : "mx-auto max-w-[960px]")}>
      <div className="overflow-x-auto border-y border-rule bg-paper py-4">
        <div className="min-w-[560px]">{children}</div>
      </div>
      <figcaption className="mt-3 space-y-0.5">
        <p className="font-sans text-xs italic text-ink">
          <span className="not-italic font-medium">Fig. {n}</span> — {caption}
        </p>
        <p className="font-sans text-[10px] leading-snug text-ink-faint">Source: {source}</p>
        {notes && <p className="font-sans text-[10px] leading-snug text-ink-faint">Notes: {notes}</p>}
      </figcaption>
    </figure>
  );
}
