/**
 * UTPE Toolkit design tokens ("paper + ink"). Single source of truth:
 * tailwind.config.ts reads `color`/`colorDark`, and layout.tsx injects `themeCss`
 * as CSS variables, so no colour is defined anywhere else.
 */

/** Light theme (default). */
export const color = {
  paper: "#FDFCF7", // warm white, like journal paper
  paperAlt: "#F7F5EE", // alternate section
  paperDeep: "#EDEAE0", // callout, equation
  ink: "#1A1A1A", // primary text
  inkMedium: "#4A4A4A", // secondary text
  // shortcut: brief asked #8A8A8A (3.3:1 on paper); darkened to #636363 (>= 4.5:1 on paper, paper-alt, paper-deep and crimson-bg).
  inkFaint: "#636363", // captions, footnotes
  inkGhost: "#C4C1B8", // disabled, dividers
  rule: "#D8D4C7", // 1px border
  ruleStrong: "#1A1A1A", // 2px emphasis
  crimson: "#C12026", // UTPE red, used sparingly
  crimsonBg: "#F5E8E8",
  pos: "#2D5C36",
  neg: "#8B2429",
  warn: "#8B6F1E",
  info: "#2C4A6B",
  // chart series reference the tokens above
  series: { primary: "#1A1A1A", secondary: "#C12026", tertiary: "#8A8A8A" },
} as const;

/** Dark theme via [data-theme="dark"]. */
export const colorDark: Record<Exclude<keyof typeof color, "series">, string> = {
  paper: "#0F0F0D",
  paperAlt: "#171715",
  paperDeep: "#1F1E1B",
  ink: "#F5F2E8",
  inkMedium: "#C9C6BA",
  inkFaint: "#9C998E",
  inkGhost: "#4A4842",
  rule: "#2A2825",
  ruleStrong: "#F5F2E8",
  crimson: "#E5484D",
  crimsonBg: "#2A1517",
  pos: "#6FBF7F",
  neg: "#E5787D",
  warn: "#D4B25A",
  info: "#7FA3CC",
};

const hexToChannels = (hex: string) =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(" ");

const toVars = (c: Record<string, string>) =>
  Object.entries(c)
    .map(([k, v]) => `--c-${k}:${hexToChannels(v)};`)
    .join("");

const { series: _series, ...lightColors } = color;
void _series;

/** CSS custom properties for both themes (rgb channels, so Tailwind /opacity works). */
export const themeCss =
  `:root{${toVars(lightColors)}color-scheme:light}` +
  `[data-theme="dark"]{${toVars(colorDark)}color-scheme:dark}`;

/** Names usable as Tailwind colours (bg-paper, text-ink-faint, border-rule ...). */
export const colorNames = Object.keys(lightColors) as (keyof typeof lightColors)[];

export const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());

/** Type scale as class strings. Serif = reading, sans = UI, mono = data. */
export const type = {
  h1: "font-serif text-[2rem] leading-[1.15] font-medium tracking-[-0.02em] md:text-[2.5rem]",
  h2: "font-serif text-[1.625rem] leading-[1.2] font-medium tracking-[-0.01em] md:text-[2rem]",
  h3: "font-serif text-2xl leading-[1.3] font-medium",
  h4: "font-serif text-xl leading-[1.4] font-medium",
  body: "font-serif text-[0.9375rem] leading-[1.7] md:text-base",
  bodyLg: "font-serif text-[1.0625rem] leading-[1.7] md:text-[1.125rem]",
  bodySm: "font-serif text-sm leading-[1.6]",
  label: "font-sans text-xs leading-[1.4] font-medium uppercase tracking-[0.08em]",
  ui: "font-sans text-sm leading-normal",
  uiSm: "font-sans text-[0.8125rem] leading-normal",
  number: "font-mono text-[2rem] leading-[1.1] font-medium tracking-[-0.02em] tabular-nums md:text-[2.5rem]",
  numberSm: "font-mono text-xl leading-[1.3] font-medium tabular-nums",
  data: "font-mono text-sm leading-normal tabular-nums",
  code: "font-mono text-[0.8125rem] leading-normal",
  caption: "font-serif text-[0.8125rem] leading-normal italic text-ink-faint",
  footnote: "font-serif text-xs leading-normal text-ink-faint",
} as const;

/** 4px baseline grid. */
export const space = {
  1: "4px", 2: "8px", 3: "12px", 4: "16px", 5: "20px", 6: "24px", 8: "32px",
  10: "40px", 12: "48px", 16: "64px", 20: "80px", 24: "96px", 32: "128px",
} as const;

export const layout = {
  container: "mx-auto w-full max-w-[1200px] px-6 md:px-8 lg:px-12",
  reading: "mx-auto max-w-[680px]",
  wide: "mx-auto max-w-[960px]",
  section: "py-12 md:py-16 lg:py-20",
  grid12: "grid grid-cols-12 gap-4 md:gap-6",
} as const;

/** Sharp corners: scientific, not consumer. */
export const border = {
  radius: { none: "0", sm: "2px" },
  thin: "border border-rule",
  thick: "border-2 border-ink",
  accent: "border-b-2 border-crimson",
} as const;

export const shadow = { subtle: "0 1px 2px rgba(26, 26, 26, 0.04)" } as const;

/** Measured motion. No springs, no overshoot. */
export const motion = {
  fast: { duration: 0.15, ease: [0.4, 0, 0.2, 1] },
  base: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
  reveal: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
  chartDrawSeconds: 0.8,
} as const;
