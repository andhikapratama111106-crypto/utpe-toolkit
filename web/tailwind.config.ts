import type { Config } from "tailwindcss";
import { colorNames, kebab } from "./src/lib/design-system";

const colors = Object.fromEntries(
  colorNames.map((n) => [kebab(n), `rgb(var(--c-${n}) / <alpha-value>)`]),
);

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    // Sharp corners only (2px max).
    borderRadius: { none: "0", sm: "2px", DEFAULT: "2px" },
    extend: {
      colors,
      fontFamily: {
        serif: ["var(--font-serif)", "Newsreader", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "IBM Plex Mono", "ui-monospace", "monospace"],
      },
      boxShadow: { subtle: "0 1px 2px rgba(26, 26, 26, 0.04)" },
    },
  },
  plugins: [],
};
export default config;
