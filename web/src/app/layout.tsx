import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Shell } from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "UTPE Toolkit", template: "%s · UTPE Toolkit" },
  description: "Analisis bisnis alat berat UTPE: TCO, sensitivity, proyeksi, game theory, validasi.",
};

// Tema tersimpan dibaca sebelum render supaya tidak berkedip; default dark.
const themeInit = `try{document.documentElement.dataset.theme=localStorage.getItem("utpe-theme")||"dark"}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
