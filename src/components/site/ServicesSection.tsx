import { ServiceIcon } from "@/components/site/ServiceIcon";
import type { SiteService } from "@/lib/site";
import { motion } from "framer-motion";

const reveal = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

export function ServicesSection({
  services,
  showHeading = true,
}: {
  services: SiteService[];
  showHeading?: boolean;
}) {
  return (
    <section
      id="services"
      className="border-y border-border/70 bg-secondary/35"
    >
      <div className="page-shell py-16 md:py-24">
        {showHeading && (
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
        )}

        {services.length > 0 ? (
          <div className={`${showHeading ? "mt-12" : ""} grid gap-4 sm:grid-cols-2 lg:grid-cols-3`}>
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
                <span className="grid size-11 place-items-center rounded-full bg-brand/10 text-brand">
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
          <div className={`${showHeading ? "mt-12" : ""} rounded-2xl border border-dashed border-border bg-card/60 p-8 text-sm leading-7 text-muted-foreground`}>
            The hospital's service directory is maintained by administration and
            will appear here once published.
          </div>
        )}
      </div>
    </section>
  );
}
