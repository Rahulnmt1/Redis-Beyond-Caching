import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Redis — Beyond Caching for Banking",
  description:
    "An interactive ecosystem of Redis Enterprise capabilities beyond caching, with banking-specific use cases and demos.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
