import { AlertTriangle, FlaskConical, Info } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "note" | "important" | "method";
const styles: Record<Variant, string> = {
  note: "border-l-ink-faint border-y-0 border-r-0 bg-paper-alt",
  important: "border-l-crimson border-y-0 border-r-0 bg-crimson-bg",
  method: "border-l-ink border-y-0 border-r-0 border-dashed bg-transparent",
};
const icons = { note: Info, important: AlertTriangle, method: FlaskConical } as const;

export function Callout({ variant = "note", title, children, className }: { variant?: Variant; title?: string; children: ReactNode; className?: string }) {
  const Icon = icons[variant];
  return (
    <aside className={cn("my-6 border-l-[3px] px-5 py-4", styles[variant], variant === "method" && "border border-l-[3px] border-rule", className)} role={variant === "important" ? "alert" : "note"}>
      {title && (
        <p className="mb-1 flex items-center gap-2 font-sans text-xs font-medium uppercase tracking-[0.08em] text-ink">
          <Icon size={16} strokeWidth={1.5} aria-hidden="true" className={variant === "important" ? "text-crimson" : "text-ink-medium"} />
          {title}
        </p>
      )}
      <div className="font-serif text-sm leading-relaxed text-ink-medium">{children}</div>
    </aside>
  );
}
