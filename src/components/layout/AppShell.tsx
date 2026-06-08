"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardCheck, HeartPulse, LifeBuoy, LineChart } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const navIcons = {
  "/": ClipboardCheck,
  "/history": LineChart,
  "/resources": LifeBuoy
} as const;

type AppShellProps = {
  children: React.ReactNode;
};

export const AppShell = ({ children }: AppShellProps): JSX.Element => {
  const pathname = usePathname();

  if (pathname === "/" || pathname === "/history" || pathname === "/resources") {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to main content
        </a>
        <main id="main-content">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      <header className="border-b bg-card">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <HeartPulse aria-hidden="true" className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-lg font-bold">Mindful Prep</span>
              <span className="block text-xs text-muted-foreground">
                Exam wellness tracker
              </span>
            </span>
          </Link>
          <nav aria-label="Primary navigation">
            <ul className="flex flex-wrap gap-2">
              {NAV_ITEMS.map((item) => {
                const Icon = navIcons[item.href];
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      <Icon aria-hidden="true" className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </header>
      <main id="main-content" className="mx-auto w-full max-w-6xl px-4 py-6">
        {children}
      </main>
      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        Not a medical diagnosis. If you are in immediate danger, contact emergency services.
      </footer>
    </div>
  );
};
