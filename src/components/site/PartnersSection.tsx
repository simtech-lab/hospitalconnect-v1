import type { SitePartner } from "@/lib/site";
import { motion } from "framer-motion";
import { Handshake } from "lucide-react";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function PartnersSection({ partners }: { partners: SitePartner[] }) {
  return (
    <section id="partners" className="border-y border-border/70">
      <div className="page-shell py-10 sm:py-14 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55 }}
          className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <span className="eyebrow">In partnership with</span>
            <h2 className="mt-4 max-w-xl font-display text-4xl leading-[1.04] tracking-tight text-balance sm:text-5xl">
              Working together for a healthier Kwahu.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-muted-foreground">
            The organisations and public institutions that support care,
            outreach and health education across the district.
          </p>
        </motion.div>

        {partners.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-3 md:mt-10 sm:grid-cols-3 lg:grid-cols-4">
            {partners.map((partner, index) => (
              <motion.div
                key={partner._id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: (index % 4) * 0.05 }}
                className="group flex min-h-36 flex-col items-center justify-center gap-4 rounded-2xl border border-border/80 bg-card p-6 transition-colors hover:border-brand/45"
              >
                <div className="flex h-14 w-full items-center justify-center">
                  {partner.logo ? (
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      loading="lazy"
                      className="max-h-14 max-w-[85%] object-contain transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <span className="grid size-14 place-items-center rounded-full bg-secondary font-display text-lg text-primary">
                      {initials(partner.name)}
                    </span>
                  )}
                </div>
                <p className="text-center text-xs font-semibold leading-5 text-muted-foreground">
                  {partner.name}
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="mt-8 flex items-start gap-4 rounded-2xl border border-dashed border-border bg-card/60 p-6 md:mt-10">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-primary">
              <Handshake className="size-5" />
            </span>
            <p className="text-sm leading-7 text-muted-foreground">
              Our partner organisations are published by hospital administration
              and will appear here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
