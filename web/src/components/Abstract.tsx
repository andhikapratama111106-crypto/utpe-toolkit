import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Abstract({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <blockquote className={cn("border-l-2 border-crimson pl-6", className)}>
      <p className="mb-1 font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-ink-faint">Abstract</p>
      <p className="font-serif text-[1.0625rem] italic leading-[1.7] text-ink-medium">{children}</p>
    </blockquote>
  );
}
