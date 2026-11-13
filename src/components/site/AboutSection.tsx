import type { HospitalInfo } from "@/lib/site";
import { motion } from "framer-motion";
import { Compass, MapPin, Target } from "lucide-react";

const reveal = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

export function AboutSection({
  info,
  showHeading = true,
}: {
  info: HospitalInfo | null;
  showHeading?: boolean;
}) {
  return (
    <section id="about" className="page-shell py-12 sm:py-16 md:py-24">
      <motion.div {...reveal} className="grid gap-8 md:gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div>
          {showHeading && (
            <>
              <span className="eyebrow">About the hospital</span>
              <h2 className="mt-4 max-w-xl font-display text-4xl leading-[1.04] tracking-tight text-balance sm:text-5xl">
                A government hospital, rooted in the Kwahu community.
              </h2>
            </>
          )}

          {info?.about ? (
            <div
              className={`${showHeading ? "mt-6" : ""} max-w-xl whitespace-pre-line text-[15px] leading-8 text-muted-foreground`}
            >
              {info.about}
            </div>
          ) : (
            <p
              className={`${showHeading ? "mt-6" : ""} max-w-xl text-[15px] leading-8 text-muted-foreground`}
            >
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
              <span className="grid size-11 place-items-center rounded-full bg-brand/10 text-brand">
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
