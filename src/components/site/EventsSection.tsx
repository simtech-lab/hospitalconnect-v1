import { formatEventDate, formatEventTimeRange, eventDateParts, startOfToday } from "@/lib/date";
import type { SiteEvent } from "@/lib/site";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { ArrowUpRight, CalendarDays, Clock, MapPin } from "lucide-react";
import { useMemo, useState } from "react";

function youtubeId(url: string) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  return match?.[1] ?? null;
}

export function EventsSection({
  events,
  showHeading = true,
}: {
  events: SiteEvent[];
  showHeading?: boolean;
}) {
  const [active, setActive] = useState<SiteEvent | null>(null);
  const upcoming = useMemo(
    () =>
      events
        .filter((event) => event.startsAt >= startOfToday())
        .sort((a, b) => a.startsAt - b.startsAt),
    [events],
  );

  return (
    <section id="events" className="border-y border-border/70 bg-secondary/40">
      <div className="page-shell py-12 sm:py-16 md:py-24">
        {showHeading && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55 }}
            className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
          >
            <div>
              <span className="eyebrow">What's happening</span>
              <h2 className="mt-4 max-w-xl font-display text-4xl leading-[1.04] tracking-tight text-balance sm:text-5xl">
                Upcoming events at the hospital.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-7 text-muted-foreground">
              Outreach, screenings and community programmes. Every event is
              published by hospital administration.
            </p>
          </motion.div>
        )}

        {upcoming.length > 0 ? (
          <div className={`${showHeading ? "mt-8 md:mt-10" : ""} grid gap-5 md:grid-cols-2 lg:grid-cols-3`}>
            {upcoming.map((event, index) => {
              const date = eventDateParts(event.startsAt);
              return (
                <motion.button
                  key={event._id}
                  type="button"
                  onClick={() => setActive(event)}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: (index % 3) * 0.05 }}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card text-left transition duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_18px_50px_-30px_rgba(20,60,40,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                    {event.flyer ? (
                      <img
                        src={event.flyer}
                        alt=""
                        className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="grid size-full place-items-center bg-[linear-gradient(135deg,var(--secondary),var(--accent))]">
                        <CalendarDays className="size-10 text-primary/50" />
                      </div>
                    )}
                    <div className="absolute left-4 top-4 min-w-14 rounded-xl bg-card/95 px-3 py-2 text-center shadow-sm backdrop-blur">
                      <p className="font-display text-2xl leading-none text-foreground">
                        {date.day}
                      </p>
                      <p className="mt-0.5 text-[9px] font-semibold tracking-[0.2em] text-muted-foreground">
                        {date.month}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                      {formatEventDate(event.startsAt)}
                    </p>
                    <h3 className="mt-2 font-display text-2xl leading-tight tracking-tight">
                      {event.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {event.description}
                    </p>
                    <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                      <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3.5 shrink-0" />
                        <span className="truncate">
                          {event.location ?? "Hospital campus"}
                        </span>
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary">
                        Details
                        <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        ) : (
          <div className={`${showHeading ? "mt-10" : ""} flex items-start gap-4 rounded-2xl border border-dashed border-border bg-card/60 p-6`}>
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-card text-primary">
              <CalendarDays className="size-5" />
            </span>
            <p className="text-sm leading-7 text-muted-foreground">
              There are no upcoming events listed right now. New outreach and
              community programmes will appear here once published.
            </p>
          </div>
        )}
      </div>

      <Dialog open={Boolean(active)} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-h-[92vh] gap-0 overflow-y-auto p-0 sm:max-w-3xl">
          {active && (
            <>
              <div className="relative aspect-[16/8] overflow-hidden bg-secondary">
                {active.flyer ? (
                  <img
                    src={active.flyer}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="grid size-full place-items-center bg-[linear-gradient(135deg,var(--secondary),var(--accent))]">
                    <CalendarDays className="size-12 text-primary/50" />
                  </div>
                )}
              </div>

              <div className="p-6 md:p-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                  {formatEventDate(active.startsAt)}
                </p>
                <DialogTitle className="mt-2 font-display text-3xl leading-tight tracking-tight text-balance md:text-4xl">
                  {active.title}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Details for {active.title}
                </DialogDescription>

                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Clock className="size-4 text-primary" />
                    {formatEventTimeRange(active.startsAt, active.endsAt)}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="size-4 text-primary" />
                    {active.location ?? "Hospital campus"}
                  </span>
                </div>

                <p className="mt-5 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                  {active.description}
                </p>

                {active.images.length > 0 && (
                  <div className="mt-7">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Photos
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {active.images.map((image, index) => (
                        <img
                          key={image.storageId ?? image.url ?? index}
                          src={image.preview}
                          alt=""
                          className="aspect-[4/3] w-full rounded-xl border border-border/70 object-cover"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {active.videos.length > 0 && (
                  <div className="mt-7">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Videos
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {active.videos.map((video, index) => {
                        const embedId = youtubeId(video.preview);
                        return embedId ? (
                          <div
                            key={video.storageId ?? video.url ?? index}
                            className="aspect-video overflow-hidden rounded-xl bg-black"
                          >
                            <iframe
                              src={`https://www.youtube.com/embed/${embedId}`}
                              title={`${active.title} video`}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="size-full"
                            />
                          </div>
                        ) : (
                          <video
                            key={video.storageId ?? video.url ?? index}
                            src={video.preview}
                            controls
                            className="aspect-video w-full rounded-xl bg-black object-contain"
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
