import type { ReactNode } from "react";
import { layout } from "@/lib/design-system";
import { cn } from "@/lib/cn";

/** Page section: vertical rhythm + container. `reading` narrows to the 680px text column. */
export function Section({ id, children, alt, className }: { id?: string; children: ReactNode; alt?: boolean; className?: string }) {
  return (
    <section id={id} className={cn(layout.section, alt && "bg-paper-alt", id && "scroll-mt-20")}>
      <div className={cn(layout.container, className)}>{children}</div>
    </section>
  );
}
