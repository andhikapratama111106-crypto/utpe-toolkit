import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

type Shared = { variant?: "primary" | "ghost" | "link"; className?: string };
type AsLink = Shared & Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "className"> & { href: string };
type AsButton = Shared & Omit<ComponentPropsWithoutRef<"button">, "className"> & { href?: undefined };

const variants = {
  primary: "border border-ink bg-ink px-5 py-2.5 text-paper hover:bg-transparent hover:text-ink",
  ghost: "border border-rule bg-transparent px-5 py-2.5 text-ink hover:border-ink",
  link: "border-b border-crimson text-ink hover:border-ink hover:text-crimson",
} as const;

/** Square, flat button. Link when `href` is set, otherwise <button>. */
export function Button(props: AsLink | AsButton) {
  const { variant = "primary", className, ...rest } = props;
  const classes = cn("inline-flex items-center justify-center gap-2 font-mono text-[13px] uppercase tracking-wide transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40", variants[variant], className);
  if (rest.href !== undefined) return <Link className={classes} {...(rest as Omit<AsLink, keyof Shared>)} />;
  return <button type="button" className={classes} {...(rest as Omit<AsButton, keyof Shared>)} />;
}
