"use client";

import { Clock3, ExternalLink, LifeBuoy, Moon, Wind } from "lucide-react";
import { SanctuaryFrame } from "@/components/layout/SanctuaryFrame";
import { WELLNESS_RESOURCES } from "@/lib/constants";

const sourceLinks = [
  {
    href: "https://icallhelpline.org/faqs/",
    label: "iCALL contact details"
  },
  {
    href: "https://www.vandrevalafoundation.com/free-counseling/contact-us",
    label: "Vandrevala contact details"
  }
] as const;

export default function ResourcesClient(): JSX.Element {
  return (
    <SanctuaryFrame
      eyebrow="Reset library"
      title="Wellness resources"
      description="Practical rituals for breathing, focus, planning, and moments when support needs to be more than motivation."
    >
      <div className="grid gap-5">
        <section className="grid gap-4 lg:grid-cols-2">
          <article className="overflow-hidden rounded-[28px] border border-white/55 bg-white/36 p-5 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="mindful-breath-orbit flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-[#8c6a70]/25">
                <Moon aria-hidden="true" className="h-9 w-9 text-[#6f454d]" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase text-[#c95d3e]">Meditation</p>
                <h2 className="mt-1 text-2xl font-bold">Four quiet rounds</h2>
                <p className="mt-2 text-sm leading-6 text-[#665a5d]">
                  Inhale, hold, exhale, and hold again. Let the study day slow down before it asks more from you.
                </p>
              </div>
            </div>
          </article>
          <article className="overflow-hidden rounded-[28px] border border-white/55 bg-white/36 p-5 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="mindful-pomodoro-ring flex h-24 w-24 shrink-0 items-center justify-center rounded-full">
                <Clock3 aria-hidden="true" className="h-9 w-9 text-[#6f454d]" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase text-[#c95d3e]">Pomodoro</p>
                <h2 className="mt-1 text-2xl font-bold">Focus without force</h2>
                <p className="mt-2 text-sm leading-6 text-[#665a5d]">
                  Work for 25 minutes, then step away for 5. Repeat only while your attention still feels kind.
                </p>
              </div>
            </div>
          </article>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
        {WELLNESS_RESOURCES.map((section) => (
          <article key={section.title} className="rounded-[28px] border border-white/55 bg-white/36 p-5 backdrop-blur-xl">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#2b2426]">
                <Wind aria-hidden="true" className="h-5 w-5 text-[#6f454d]" />
                {section.title}
              </h2>
              <p className="mt-1 text-sm text-[#665a5d]">A calm reference list for difficult study days.</p>
            </div>
            <ul className="mt-4 space-y-3">
              {section.items.map((item) => (
                <li key={item} className="rounded-2xl border border-white/55 bg-white/58 p-3 text-sm leading-6 text-[#51464a]">
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
        </section>

      <section className="rounded-[28px] border border-white/55 bg-white/36 p-5 backdrop-blur-xl" aria-labelledby="source-heading">
        <div className="flex items-center gap-3">
          <LifeBuoy aria-hidden="true" className="h-6 w-6 text-[#6f454d]" />
          <h2 id="source-heading" className="text-xl font-bold">Verify helplines</h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-[#665a5d]">
          Helpline availability can change, so these links open the current public pages.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {sourceLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/60 bg-white/60 px-4 text-sm font-bold text-[#3a2b30] focus-visible:ring-2 focus-visible:ring-ring"
            >
              {link.label}
              <ExternalLink aria-hidden="true" className="h-4 w-4" />
            </a>
          ))}
        </div>
      </section>
      </div>
    </SanctuaryFrame>
  );
}
