import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { PUBLIC_NAV } from "@/lib/navigation";
import {
  DEFAULT_HOSPITAL_NAME,
  type HospitalInfo,
} from "@/lib/site";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function SitePage({
  info,
  eyebrow,
  title,
  intro,
  children,
}: {
  info: HospitalInfo | null;
  eyebrow: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  const name = info?.name?.trim() || DEFAULT_HOSPITAL_NAME;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader name={name} info={info} navItems={PUBLIC_NAV} />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border/70 bg-primary text-primary-foreground">
          <div className="ridge-pattern absolute inset-0 opacity-30" />
          <div className="page-shell relative py-14 md:py-20">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-foreground/55"
            >
              <Link to="/" className="transition-colors hover:text-primary-foreground">
                Home
              </Link>
              <ChevronRight className="size-3.5" />
              <span className="text-brand-soft">{eyebrow}</span>
            </nav>

            <h1 className="mt-5 max-w-3xl font-display text-4xl leading-[1.03] tracking-tight text-balance sm:text-5xl lg:text-6xl">
              {title}
            </h1>

            {intro && (
              <p className="mt-5 max-w-2xl text-sm leading-7 text-primary-foreground/70 sm:text-[15px] sm:leading-8">
                {intro}
              </p>
            )}
          </div>
        </section>

        {children}
      </main>

      <SiteFooter name={name} info={info} />
    </div>
  );
}
