import { ArrowDown, ArrowUp } from "lucide-react";
import { signedPct } from "@/lib/format";
import { cn } from "@/lib/cn";

/** Signed percentage change. `goodWhen` says which direction is favourable (cost: "down"). */
export function Delta({ value, digits = 0, goodWhen = "up", suffix }: { value: number; digits?: number; goodWhen?: "up" | "down"; suffix?: string }) {
  const up = value >= 0;
  const good = up === (goodWhen === "up");
  const Arrow = up ? ArrowUp : ArrowDown;
  return (
    <span className={cn("inline-flex items-center gap-1 font-mono text-xs tabular-nums", good ? "text-pos" : "text-neg")}>
      {signedPct(value, digits)}
      <Arrow size={12} strokeWidth={1.5} aria-hidden="true" />
      <span className="sr-only">{up ? "increase" : "decrease"}</span>
      {suffix && <span className="text-ink-faint">{suffix}</span>}
    </span>
  );
}
