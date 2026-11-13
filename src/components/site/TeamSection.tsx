import type { ManagementMember, SiteDoctor } from "@/lib/site";
import { motion } from "framer-motion";
import { UsersRound } from "lucide-react";

function initials(name: string) {
  return name
    .replace(/^(dr|mr|mrs|ms|prof)\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function TeamSection({
  doctors,
  management,
  showHeading = true,
}: {
  doctors: SiteDoctor[];
  management: ManagementMember[];
  showHeading?: boolean;
}) {
  const hasTeam = doctors.length > 0 || management.length > 0;

  return (
    <section id="team" className="page-shell py-12 sm:py-16 md:py-24">
      {showHeading && (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55 }}
          className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <span className="eyebrow">Our people</span>
            <h2 className="mt-4 max-w-xl font-display text-4xl leading-[1.04] tracking-tight text-balance sm:text-5xl">
              The team behind your care.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-muted-foreground">
            Meet the doctors and hospital leadership whose profiles are published
            by hospital administration.
          </p>
        </motion.div>
      )}

      {hasTeam ? (
        <div className={`${showHeading ? "mt-8 md:mt-12" : ""} space-y-10 md:space-y-14`}>
          {doctors.length > 0 && (
            <div>
              <div className="flex items-end justify-between gap-4 border-b border-border/70 pb-3">
                <h3 className="font-display text-2xl tracking-tight">
                  Our doctors
                </h3>
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {doctors.length} {doctors.length === 1 ? "profile" : "profiles"}
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {doctors.map((doctor, index) => (
                  <motion.article
                    key={doctor._id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.45, delay: (index % 4) * 0.05 }}
                    className="group overflow-hidden rounded-2xl border border-border/80 bg-card"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
                      {doctor.photo ? (
                        <img
                          src={doctor.photo}
                          alt={doctor.name}
                          className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="grid size-full place-items-center">
                          <span className="grid size-16 place-items-center rounded-full bg-card font-display text-2xl text-primary">
                            {initials(doctor.name)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                        {doctor.specialty}
                      </p>
                      <h4 className="mt-1.5 font-display text-2xl leading-tight tracking-tight">
                        {doctor.name}
                      </h4>
                      {doctor.bio && (
                        <p className="mt-2 text-xs leading-6 text-muted-foreground">
                          {doctor.bio}
                        </p>
                      )}
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          )}

          {management.length > 0 && (
            <div>
              <div className="flex items-end justify-between gap-4 border-b border-border/70 pb-3">
                <h3 className="font-display text-2xl tracking-tight">
                  Hospital management
                </h3>
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Leadership
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {management.map((member, index) => (
                  <motion.article
                    key={member._id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.45, delay: (index % 3) * 0.05 }}
                    className="flex gap-4 rounded-2xl border border-border/80 bg-card p-5"
                  >
                    <div className="size-16 shrink-0 overflow-hidden rounded-full bg-secondary">
                      {member.photo ? (
                        <img
                          src={member.photo}
                          alt={member.name}
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="grid size-full place-items-center font-display text-xl text-primary">
                          {initials(member.name)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        {member.role}
                      </p>
                      <h4 className="mt-1 font-display text-xl leading-tight tracking-tight">
                        {member.name}
                      </h4>
                      {member.bio && (
                        <p className="mt-1.5 line-clamp-3 text-xs leading-5 text-muted-foreground">
                          {member.bio}
                        </p>
                      )}
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={`${showHeading ? "mt-10" : ""} flex items-start gap-4 rounded-2xl border border-dashed border-border bg-card/60 p-6`}>
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-primary">
            <UsersRound className="size-5" />
          </span>
          <p className="text-sm leading-7 text-muted-foreground">
            Doctor and management profiles are maintained by hospital
            administration and will appear here once published.
          </p>
        </div>
      )}
    </section>
  );
}
