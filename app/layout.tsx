import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "A Tiny Date Question",
  description: "Create a private, playful date invitation and receive the answer by email.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
