"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, HeartPulse } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SanctuaryFrameProps = {
  children: React.ReactNode;
  eyebrow?: string;
  title: string;
  description: string;
  streak?: number;
};

const links = [
  { label: "Today", href: "/" },
  { label: "History", href: "/history" },
  { label: "Resources", href: "/resources" }
] as const;

export const SanctuaryFrame = ({
  children,
  eyebrow,
  title,
  description,
  streak
}: SanctuaryFrameProps): JSX.Element => {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#fbf0ef] px-3 py-4 text-[#2b2426] sm:px-6 sm:py-8">
      <section className="mindful-hero-panel relative mx-auto min-h-[calc(100vh-2rem)] w-full max-w-[1480px] overflow-hidden rounded-[28px] border border-white/60 bg-[#d7c8ca] px-5 py-5 shadow-[0_30px_120px_rgba(108,73,86,0.16)] sm:min-h-[calc(100vh-4rem)] sm:rounded-[34px] sm:px-9 sm:py-8">
        <div className="mindful-ornament mindful-ornament-left" aria-hidden="true" />
        <div className="mindful-ornament mindful-ornament-right" aria-hidden="true" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_47%_12%,rgba(202,133,190,0.28),transparent_22%),radial-gradient(circle_at_65%_35%,rgba(239,111,93,0.2),transparent_24%),linear-gradient(120deg,rgba(219,197,198,0.92),rgba(241,234,235,0.78)_55%,rgba(205,192,198,0.86))]" />
        <div className="relative z-10">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b2426]">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/65 bg-white/35 text-[#5f4548]">
                <HeartPulse aria-hidden="true" className="h-6 w-6" />
              </span>
              <span>
                <span className="block text-base font-bold leading-tight">Mindful Prep</span>
                <span className="block text-sm text-[#6d5d61]">Exam wellness journey</span>
              </span>
            </Link>
            <nav aria-label="Primary navigation" className="rounded-full border border-white/50 bg-white/24 p-1 shadow-inner shadow-white/20 backdrop-blur-xl">
              <ul className="flex items-center gap-1">
                {links.map((link) => {
                  const active = pathname === link.href;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          "inline-flex h-10 items-center rounded-full px-4 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b2426] sm:px-6",
                          active
                            ? "bg-white text-[#4e3339] shadow-sm"
                            : "text-[#645359] hover:bg-white/35"
                        )}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            {typeof streak === "number" ? (
              <Badge tone="success" className="hidden h-11 rounded-full border-white/60 bg-white/75 px-4 text-sm text-[#5a3d42] shadow-sm lg:inline-flex">
                <CalendarCheck aria-hidden="true" className="h-4 w-4" />
                {streak} day streak
              </Badge>
            ) : null}
          </header>

          <section className="mt-8 max-w-4xl">
            {eyebrow ? (
              <p className="text-sm font-bold uppercase text-[#c95d3e]">{eyebrow}</p>
            ) : null}
            <h1 className="mt-2 font-serif text-[clamp(2.8rem,7vw,6.5rem)] font-bold leading-[0.95] text-[#2b2426]">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#5f5356] sm:text-lg">
              {description}
            </p>
          </section>

          <div className="mt-7">{children}</div>
        </div>
      </section>
    </div>
  );
};
