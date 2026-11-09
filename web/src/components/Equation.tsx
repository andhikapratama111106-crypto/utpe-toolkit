export function Equation({ n, children, label }: { n: number; children: string; label: string }) {
  return (
    <div className="my-6 bg-paper-deep px-4 py-6 md:px-8">
      <div className="flex items-center justify-between gap-4">
        <div role="math" aria-label={label} className="min-w-0 flex-1 overflow-x-auto text-center font-mono text-[13px] md:text-[15px]">
          {children}
        </div>
        <span className="font-mono text-xs text-ink-faint">({n})</span>
      </div>
    </div>
  );
}
