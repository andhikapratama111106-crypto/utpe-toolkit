"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";

type Props<V extends string> = { options: { value: V; label: string }[]; value: V; onChange: (v: V) => void; "aria-label": string };

/** Segmented control (radio group). Arrow keys / Home / End move the selection. */
export function Toggle<V extends string>({ options, value, onChange, "aria-label": label }: Props<V>) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (to: number) => {
    const i = (to + options.length) % options.length;
    onChange(options[i].value);
    ref.current?.querySelectorAll<HTMLElement>('[role="radio"]')[i]?.focus();
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = options.findIndex((o) => o.value === value);
    if (e.key === "ArrowRight" || e.key === "ArrowDown") move(i + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") move(i - 1);
    else if (e.key === "Home") move(0);
    else if (e.key === "End") move(options.length - 1);
    else return;
    e.preventDefault();
  };
  return (
    <div ref={ref} role="radiogroup" aria-label={label} onKeyDown={onKeyDown} className="inline-flex border border-rule">
      {options.map((o, i) => {
        const on = o.value === value;
        return (
          <button key={o.value} type="button" role="radio" aria-checked={on} tabIndex={on ? 0 : -1} onClick={() => onChange(o.value)}
            className={cn("px-4 py-2 font-mono text-xs uppercase tracking-wide transition-colors duration-150", i < options.length - 1 && "border-r border-rule", on ? "bg-ink text-paper" : "bg-paper text-ink-medium hover:bg-paper-alt")}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
