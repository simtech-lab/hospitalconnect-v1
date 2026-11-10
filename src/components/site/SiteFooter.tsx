import type { HospitalInfo } from "@/lib/site";
import { DEFAULT_HOSPITAL_NAME } from "@/lib/site";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router";
import { HospitalMark } from "./HospitalMark";

export function SiteFooter({
  name = DEFAULT_HOSPITAL_NAME,
  info,
  hasContent = true,
}: {
  name?: string;
  info?: HospitalInfo | null;
  hasContent?: boolean;
}) {
  const sectionHref = (hash: string) => (hasContent ? hash : "#information");
  const phone = info?.phone?.trim();
  const emergency = info?.emergencyLine?.trim();
  const email = info?.email?.trim();
  const address =
    info?.address?.trim() || "Atibie, Eastern Region, Ghana";

  return (
    <footer className="mt-8">
      <div className="ghana-stripe h-1 w-full" />
      <div className="border-t border-border/70 bg-secondary/30">
        <div className="page-shell grid gap-10 py-14 md:grid-cols-[1.4fr_0.8fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <HospitalMark className="size-10" />
              <div>
                <p className="font-display text-xl tracking-tight">{name}</p>
                <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Ghana Health Service · Eastern Region
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-7 text-muted-foreground">
              {info?.tagline?.trim() ||
                "Official information for patients, staff and partners of the hospital."}
            </p>
          </div>

          <div>
            <p className="eyebrow">Explore</p>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>
                <a
                  href={sectionHref("#about")}
                  className="transition-colors hover:text-primary"
                >
                  About the hospital
                </a>
              </li>
              <li>
                <a
                  href={sectionHref("#services")}
                  className="transition-colors hover:text-primary"
                >
                  Departments & services
                </a>
              </li>
              <li>
                <a
                  href={sectionHref("#team")}
                  className="transition-colors hover:text-primary"
                >
                  Doctors & management
                </a>
              </li>
              <li>
                <a
                  href={sectionHref("#events")}
                  className="transition-colors hover:text-primary"
                >
                  Upcoming events
                </a>
              </li>
              <li>
                <a
                  href={sectionHref("#partners")}
                  className="transition-colors hover:text-primary"
                >
                  Our partners
                </a>
              </li>
              <li>
                <a
                  href={sectionHref("#gallery")}
                  className="transition-colors hover:text-primary"
                >
                  Photo & video gallery
                </a>
              </li>
              <li>
                <a
                  href={sectionHref("#visit")}
                  className="transition-colors hover:text-primary"
                >
                  Plan your visit
                </a>
              </li>
              <li>
                <Link
                  to="/auth?returnTo=/dashboard"
                  className="inline-flex items-center gap-1 transition-colors hover:text-primary"
                >
                  Administrator sign in
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="eyebrow">Contact</p>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{address}</span>
              </li>
              {phone && (
                <li className="flex items-start gap-2.5">
                  <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
                  <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:text-primary">
                    {phone}
                  </a>
                </li>
              )}
              {emergency && emergency !== phone && (
                <li className="flex items-start gap-2.5">
                  <Phone className="mt-0.5 size-4 shrink-0 text-brand" />
                  <span>
                    <span className="font-medium text-foreground">Emergency</span>{" "}
                    ·{" "}
                    <a
                      href={`tel:${emergency.replace(/\s+/g, "")}`}
                      className="hover:text-primary"
                    >
                      {emergency}
                    </a>
                  </span>
                </li>
              )}
              {email && (
                <li className="flex items-start gap-2.5">
                  <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
                  <a href={`mailto:${email}`} className="hover:text-primary">
                    {email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-border/70">
          <div className="page-shell flex flex-col gap-2 py-5 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} {name}. All rights reserved.
            </p>
            <p>Content published by hospital administration.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
