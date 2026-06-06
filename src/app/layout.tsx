import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mindful Prep",
  description:
    "A local-first mental wellness tracker for Indian exam preparation students."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>): JSX.Element {
  return (
    <html lang="en-IN">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
