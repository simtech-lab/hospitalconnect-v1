import { EventsSection } from "@/components/site/EventsSection";
import { HeroSlider } from "@/components/site/HeroSlider";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader, type NavItem } from "@/components/site/SiteHeader";
import { ServiceIcon } from "@/components/site/ServiceIcon";
import { TeamSection } from "@/components/site/TeamSection";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import type { HospitalInfo, SiteService } from "@/lib/site";
import {
  DEFAULT_HOSPITAL_NAME,
  DEFAULT_TAGLINE,
  FALLBACK_HERO_IMAGE,
} from "@/lib/site";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  Compass,
  HeartHandshake,
  Mail,
  MapPin,
  Phone,
  Stethoscope,
  Target,
} from "lucide-react";
import { Link } from "react-router";

const SECTION_NAV: NavItem[] = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Our team", href: "#team" },
  { label: "Events", href: "#events" },
  { label: "Visit us", href: "#visit" },
];

const reveal = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

function QuickAction({
  href,
  audience,
  title,
  detail,
  icon: Icon,
}: {
  href: string;
  audience: string;
  title: string;
  detail: string;
  icon: typeof Stethoscope;
}) {
  return (
    <a
      href={href}
      className="group flex items-start gap-4 rounded-2xl border border-border/80 bg-card p-5 transition-colors hover:border-primary/35 hover:bg-secondary/40"
    >
      <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-primary">
        <Icon className="size-[18px]" />
      </span>
      <span className="min-w-0">
        <span className="eyebrow block text-[10px]">{audience}</span>
        <span className="mt-1.5 flex items-center gap-1.5 font-display text-xl leading-tight tracking-tight">
          {title}
          <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
        </span>
        <span className="mt-1 block truncate text-xs text-muted-foreground">
          {detail}
        </span>
      </span>
    </a>
  );
}

function HourRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-primary-foreground/10 py-4 last:border-0">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-foreground/55">
        {label}
      </span>
      <span className="text-right text-sm text-primary-foreground">
        {value?.trim()}
      </span>
    </div>
  );
}

function AboutSection({ info }: { info: HospitalInfo | null }) {
  return (
    <section id="about" className="page-shell py-16 md:py-24">
      <motion.div {...reveal} className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div>
          <span className="eyebrow">About the hospital</span>
          <h2 className="mt-4 max-w-xl font-display text-4xl leading-[1.04] tracking-tight text-balance sm:text-5xl">
            A government hospital, rooted in the Kwahu community.
          </h2>

          {info?.about ? (
            <div className="mt-6 max-w-xl whitespace-pre-line text-[15px] leading-8 text-muted-foreground">
              {info.about}
            </div>
          ) : (
            <p className="mt-6 max-w-xl text-[15px] leading-8 text-muted-foreground">
              The hospital's official profile is maintained by our administration
              and will be published here.
            </p>
          )}

          {info?.address && (
            <div className="mt-8 flex items-start gap-3 border-t border-border/80 pt-5 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{info.address}</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <span className="grid size-11 place-items-center rounded-full bg-accent/20 text-accent-foreground">
                <Compass className="size-5" />
              </span>
              <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground/60">
                01
              </span>
            </div>
            <h3 className="mt-5 font-display text-2xl tracking-tight">Our mission</h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {info?.mission?.trim() ||
                "The hospital's mission statement is being prepared for publication."}
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <span className="grid size-11 place-items-center rounded-full bg-secondary text-primary">
                <Target className="size-5" />
              </span>
              <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground/60">
                02
              </span>
            </div>
            <h3 className="mt-5 font-display text-2xl tracking-tight">Our vision</h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {info?.vision?.trim() ||
                "The hospital's vision statement is being prepared for publication."}
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function ServicesSection({ services }: { services: SiteService[] }) {
  return (
    <section
      id="services"
      className="border-y border-border/70 bg-secondary/35"
    >
      <div className="page-shell py-16 md:py-24">
        <motion.div
          {...reveal}
          className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <span className="eyebrow">Departments & services</span>
            <h2 className="mt-4 max-w-xl font-display text-4xl leading-[1.04] tracking-tight text-balance sm:text-5xl">
              Care for every stage of life.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-muted-foreground">
            Clinical services published by hospital administration, from everyday
            outpatient care to maternal health and community outreach.
          </p>
        </motion.div>

        {services.length > 0 ? (
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <motion.article
                key={service._id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: (index % 3) * 0.06 }}
                className="group relative rounded-2xl border border-border/80 bg-card p-6 transition-colors hover:border-primary/35"
              >
                <span className="absolute right-5 top-5 font-mono text-[10px] tracking-[0.2em] text-muted-foreground/50">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="grid size-11 place-items-center rounded-full bg-accent/20 text-accent-foreground">
                  <ServiceIcon name={service.icon} className="size-5" />
                </span>
                <h3 className="mt-5 font-display text-2xl tracking-tight">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {service.description}
                </p>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-2xl border border-dashed border-border bg-card/60 p-8 text-sm leading-7 text-muted-foreground">
            The hospital's service directory is maintained by administration and
            will appear here once published.
          </div>
        )}
      </div>
    </section>
  );
}

function VisitSection({ info }: { info: HospitalInfo | null }) {
  const phone = info?.phone?.trim();
  const emergency = info?.emergencyLine?.trim();
  const email = info?.email?.trim();
  const address = info?.address?.trim();
  const hours = [
    { label: "Outpatient department", value: info?.opdHours },
    { label: "Visiting hours", value: info?.visitingHours },
    { label: "Emergency line", value: emergency },
  ].filter((row) => row.value?.trim());

  const mapsHref = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : null;

  return (
    <section id="visit" className="page-shell py-16 md:py-24">
      <motion.div
        {...reveal}
        className="overflow-hidden rounded-[2rem] border border-primary/30 bg-primary text-primary-foreground"
      >
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-7 sm:p-10 lg:p-12">
            <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
              Plan your visit
            </span>
            <h2 className="mt-4 max-w-md font-display text-4xl leading-[1.05] tracking-tight text-balance sm:text-5xl">
              Know before you go.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-primary-foreground/70">
              Opening hours, visiting guidance and emergency contacts are published
              here by hospital administration.
            </p>

            {hours.length > 0 ? (
              <div className="mt-9">
                {hours.map((row) => (
                  <HourRow key={row.label} label={row.label} value={row.value} />
                ))}
              </div>
            ) : (
              <p className="mt-8 rounded-xl border border-primary-foreground/15 bg-primary-foreground/5 p-4 text-xs leading-6 text-primary-foreground/65">
                Visiting and opening hours will be published here by hospital
                administration.
              </p>
            )}
          </div>

          <div className="border-t border-primary-foreground/15 bg-[oklch(0.3_0.05_165)] p-7 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
            <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary-foreground/45">
              Contact & location
            </span>
            <h3 className="mt-3 font-display text-3xl tracking-tight">
              Reach the hospital
            </h3>

            <ul className="mt-7 space-y-5 text-sm">
              {address && (
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
                  <span className="leading-6 text-primary-foreground/85">
                    {address}
                  </span>
                </li>
              )}
              {phone && (
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 size-4 shrink-0 text-accent" />
                  <a
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className="leading-6 text-primary-foreground/85 hover:text-primary-foreground"
                  >
                    {phone}
                  </a>
                </li>
              )}
              {emergency && emergency !== phone && (
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 size-4 shrink-0 text-accent" />
                  <span className="leading-6 text-primary-foreground/85">
                    <span className="font-medium text-primary-foreground">
                      Emergency
                    </span>{" "}
                    ·{" "}
                    <a
                      href={`tel:${emergency.replace(/\s+/g, "")}`}
                      className="hover:text-primary-foreground"
                    >
                      {emergency}
                    </a>
                  </span>
                </li>
              )}
              {email && (
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 size-4 shrink-0 text-accent" />
                  <a
                    href={`mailto:${email}`}
                    className="break-all leading-6 text-primary-foreground/85 hover:text-primary-foreground"
                  >
                    {email}
                  </a>
                </li>
              )}
            </ul>

            {!address && !phone && !emergency && !email && (
              <p className="mt-6 text-xs leading-6 text-primary-foreground/60">
                Contact details are being prepared by hospital administration.
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              {mapsHref && (
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-5 text-[13px] font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
                >
                  Get directions
                  <ArrowUpRight className="size-4" />
                </a>
              )}
              {emergency && (
                <a
                  href={`tel:${emergency.replace(/\s+/g, "")}`}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-primary-foreground/25 px-5 text-[13px] font-semibold transition-colors hover:bg-primary-foreground/10"
                >
                  <Phone className="size-4" />
                  Call emergency
                </a>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default function Landing() {
  const site = useQuery(api.content.getPublicSite);
  const { user } = useAuth();

  const info = site?.info ?? null;
  const slides = site?.slides ?? [];
  const services = site?.services ?? [];
  const doctors = site?.doctors ?? [];
  const management = site?.management ?? [];
  const events = site?.events ?? [];

  const name = info?.name?.trim() || DEFAULT_HOSPITAL_NAME;
  const tagline = info?.tagline?.trim() || DEFAULT_TAGLINE;
  const hasInfo = Boolean(info);
  const hasContent =
    hasInfo ||
    services.length > 0 ||
    doctors.length > 0 ||
    management.length > 0 ||
    events.length > 0;
  const isAdmin = user?.role === "admin";

  const navItems: NavItem[] = hasContent ? SECTION_NAV : [];

  const facts = [
    info?.bedCapacity?.trim() && {
      value: info.bedCapacity.trim(),
      label: "Inpatient beds",
    },
    info?.staffCount?.trim() && {
      value: info.staffCount.trim(),
      label: "Staff members",
    },
    info?.foundedYear?.trim() && {
      value: info.foundedYear.trim(),
      label: "Serving since",
    },
    services.length > 0 && {
      value: String(services.length),
      label: "Published services",
    },
  ].filter(Boolean) as { value: string; label: string }[];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader name={name} info={info} navItems={navItems} />

      <main className="flex-1">
        <section className="page-shell pt-5 sm:pt-7">
          <HeroSlider
            slides={slides}
            fallback={{
              eyebrow: "Official hospital website",
              title: name,
              subtitle: tagline,
              image: FALLBACK_HERO_IMAGE,
              ctaHref: hasContent ? "#visit" : "#information",
            }}
            secondaryHref={hasContent ? "#services" : undefined}
          />

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <QuickAction
              href={hasContent ? "#visit" : "#information"}
              audience="For patients & visitors"
              title="Plan a visit"
              detail={info?.visitingHours?.trim() || "Visiting guidance"}
              icon={CalendarClock}
            />
            <QuickAction
              href={hasContent ? "#services" : "#information"}
              audience="For staff & departments"
              title="Our services"
              detail={
                services.length > 0
                  ? `${services.length} care areas published`
                  : "Service directory"
              }
              icon={Stethoscope}
            />
            <QuickAction
              href={hasContent ? "#about" : "#information"}
              audience="For partners & stakeholders"
              title="About the hospital"
              detail="Mission, vision and profile"
              icon={HeartHandshake}
            />
          </div>
        </section>

        {hasContent ? (
          <>
            {facts.length > 1 && (
              <section className="mt-14 border-y border-border/70 bg-secondary/35">
                <div className="page-shell grid grid-cols-2 gap-8 py-10 md:grid-cols-4 md:divide-x md:divide-border/70">
                  {facts.map((fact) => (
                    <div key={fact.label} className="md:px-8 md:first:pl-0">
                      <p className="font-display text-4xl leading-none tracking-tight text-primary sm:text-5xl">
                        {fact.value}
                      </p>
                      <p className="eyebrow mt-3 text-[10px]">{fact.label}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <AboutSection info={info} />
            <ServicesSection services={services} />
            <TeamSection doctors={doctors} management={management} />
            <EventsSection events={events} />
            <VisitSection info={info} />
          </>
        ) : (
          <section id="information" className="page-shell py-16 md:py-24">
            <motion.div
              {...reveal}
              className="grid gap-10 rounded-[2rem] border border-border/80 bg-card p-8 sm:p-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center"
            >
              <div>
                <span className="eyebrow">Hospital information</span>
                <h2 className="mt-4 max-w-lg font-display text-4xl leading-[1.05] tracking-tight text-balance sm:text-5xl">
                  Our official hospital profile is being prepared.
                </h2>
                <p className="mt-5 max-w-lg text-[15px] leading-8 text-muted-foreground">
                  Hospital administration publishes every banner, service and
                  notice on this website. Opening hours, visiting guidance,
                  services and contact details will appear here as soon as they
                  are published.
                </p>
              </div>
              <div className="rounded-2xl bg-secondary/50 p-6">
                <p className="eyebrow text-[10px]">In the meantime</p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Staff and administrators can sign in to the console to publish
                  the hospital's slider banners, profile, services and contact
                  details.
                </p>
                <Button asChild className="mt-5 w-full rounded-full">
                  <Link to={isAdmin ? "/dashboard" : "/auth?returnTo=/dashboard"}>
                    {isAdmin ? "Open admin console" : "Administrator sign in"}
                    <ArrowUpRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </section>
        )}

        <section className="page-shell pb-16 pt-4 md:pb-24">
          <div className="flex flex-col gap-6 rounded-3xl border border-border/80 bg-card p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div>
              <span className="eyebrow">For staff & stakeholders</span>
              <h2 className="mt-3 max-w-xl font-display text-3xl leading-tight tracking-tight sm:text-4xl">
                Official information, straight from the hospital.
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-7 text-muted-foreground">
                Every slide, doctor profile, event and service detail on this
                website is created and published by hospital administration.
              </p>
            </div>
            <Button asChild size="lg" className="shrink-0 rounded-full px-6">
              <Link to={isAdmin ? "/dashboard" : "/auth?returnTo=/dashboard"}>
                {isAdmin ? "Open admin console" : "Administrator sign in"}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter name={name} info={info} hasContent={hasContent} />
    </div>
  );
}
