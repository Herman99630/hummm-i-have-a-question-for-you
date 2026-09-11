import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Date With Me?",
  description: "A tiny, playful invitation for one very special date.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
