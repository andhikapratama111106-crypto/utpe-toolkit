"use client";

import { useId } from "react";

type Props = { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; display: string; minLabel: string; maxLabel: string; valueText: string };

/** Range input: 1px track, crimson fill, 12px ink thumb (styles in globals.css `.utpe-slider`). */
export function Slider({ label, value, min, max, step = 0.01, onChange, display, minLabel, maxLabel, valueText }: Props) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="font-sans text-xs font-medium uppercase tracking-[0.08em]">{label}</label>
        <output htmlFor={id} className="font-mono text-[13px] tabular-nums">{display}</output>
      </div>
      <input
        id={id}
        type="range"
        className="utpe-slider mt-3 w-full"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={valueText}
        style={{ ["--fill" as string]: `${pct}%` }}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="mt-1 flex justify-between font-mono text-[11px] text-ink-faint">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}
