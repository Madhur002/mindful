"use client";

import { ExternalLink, LifeBuoy, Wind } from "lucide-react";
import { WELLNESS_RESOURCES } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-5">
        <div className="flex items-center gap-3">
          <LifeBuoy aria-hidden="true" className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Wellness resources</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Practical resets, planning supports, and India helpline contacts.
            </p>
          </div>
        </div>
      </section>
      <div className="grid gap-4 lg:grid-cols-3">
        {WELLNESS_RESOURCES.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wind aria-hidden="true" className="h-5 w-5 text-primary" />
                {section.title}
              </CardTitle>
              <CardDescription>Keyboard-friendly reference list.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {section.items.map((item) => (
                  <li key={item} className="rounded-md border bg-background p-3 text-sm leading-6">
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
      <section className="rounded-lg border bg-card p-5" aria-labelledby="source-heading">
        <h2 id="source-heading" className="text-lg font-semibold">Verify helplines</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Helpline availability can change, so these links open the current public pages.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {sourceLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-ring"
            >
              {link.label}
              <ExternalLink aria-hidden="true" className="h-4 w-4" />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
