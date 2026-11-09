import { layout, type } from "@/lib/design-system";
import { Abstract } from "./Abstract";

type Props = { eyebrow: string; title: string; abstract: string; metadata: string };

/** Left-aligned title block: eyebrow, h1, abstract, metadata row. One h1 per page. */
export function PageHeader({ eyebrow, title, abstract, metadata }: Props) {
  return (
    <section className="border-b border-rule py-12 md:py-20">
      <div className={layout.container}>
        <div className={layout.reading + " !mx-0"}>
          <p className="font-mono text-[11px] uppercase tracking-widest text-crimson">{eyebrow}</p>
          <h1 className={type.h1 + " mt-4"}>{title}</h1>
          <Abstract className="mt-6">{abstract}</Abstract>
          <p className="mt-6 font-mono text-[11px] text-ink-faint">{metadata}</p>
        </div>
      </div>
    </section>
  );
}
