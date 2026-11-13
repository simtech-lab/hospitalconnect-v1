import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SiteGalleryItem } from "@/lib/site";
import { youtubeId, youtubeThumbnail } from "@/lib/video";
import { motion } from "framer-motion";
import { Images, Play, Video } from "lucide-react";
import { useState } from "react";

export function GallerySection({
  items,
  showHeading = true,
}: {
  items: SiteGalleryItem[];
  showHeading?: boolean;
}) {
  const [active, setActive] = useState<SiteGalleryItem | null>(null);
  const embedId =
    active?.kind === "video" ? youtubeId(active.src ?? "") : null;

  return (
    <section id="gallery" className="page-shell py-12 sm:py-16 md:py-24">
      {showHeading && (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55 }}
          className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <span className="eyebrow">Photo & video gallery</span>
            <h2 className="mt-4 max-w-xl font-display text-4xl leading-[1.04] tracking-tight text-balance sm:text-5xl">
              Life and care at our hospital.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-muted-foreground">
            Moments from our wards, clinics and community programmes, published by
            hospital administration.
          </p>
        </motion.div>
      )}

      {items.length > 0 ? (
        <div className={`${showHeading ? "mt-8 md:mt-10" : ""} grid gap-4 sm:grid-cols-2 lg:grid-cols-3`}>
          {items.map((item, index) => {
            const isVideo = item.kind === "video";
            const poster = isVideo ? youtubeThumbnail(item.src ?? "") : null;

            return (
              <motion.button
                key={item._id}
                type="button"
                onClick={() => setActive(item)}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.45, delay: (index % 3) * 0.05 }}
                className="group overflow-hidden rounded-2xl border border-border/80 bg-card text-left transition duration-300 hover:-translate-y-0.5 hover:border-brand/45 hover:shadow-[0_18px_50px_-32px_rgba(70,20,20,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                  {poster ? (
                    <img
                      src={poster}
                      alt=""
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  ) : isVideo && item.src ? (
                    <video
                      src={item.src}
                      muted
                      playsInline
                      preload="metadata"
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  ) : item.kind === "image" && item.src ? (
                    <img
                      src={item.src}
                      alt={item.title}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="grid size-full place-items-center bg-[linear-gradient(135deg,var(--secondary),var(--accent))]">
                      <Images className="size-10 text-primary/40" />
                    </div>
                  )}

                  {isVideo && (
                    <span className="absolute inset-0 grid place-items-center bg-black/25 transition-colors group-hover:bg-black/35">
                      <span className="grid size-14 place-items-center rounded-full bg-card/95 text-foreground shadow-lg transition-transform duration-300 group-hover:scale-110">
                        <Play className="ml-0.5 size-5 fill-current" />
                      </span>
                    </span>
                  )}

                  <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur">
                    {isVideo ? (
                      <Video className="size-3" />
                    ) : (
                      <Images className="size-3" />
                    )}
                    {isVideo ? "Video" : "Photo"}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3 p-4">
                  <p className="font-display text-xl leading-tight tracking-tight">
                    {item.title}
                  </p>
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-primary transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                    <Play className="ml-0.5 size-3 fill-current" />
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      ) : (
        <div className={`${showHeading ? "mt-10" : ""} flex items-start gap-4 rounded-2xl border border-dashed border-border bg-card/60 p-6`}>
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-primary">
            <Images className="size-5" />
          </span>
          <p className="text-sm leading-7 text-muted-foreground">
            Photos and videos from around the hospital will appear here once they
            are published.
          </p>
        </div>
      )}

      <Dialog
        open={active !== null}
        onOpenChange={(open) => {
          if (!open) setActive(null);
        }}
      >
        <DialogContent className="max-h-[92vh] gap-0 overflow-y-auto p-0 sm:max-w-4xl">
          {active && (
            <>
              <div className="bg-black">
                {active.kind === "image" && active.src ? (
                  <img
                    src={active.src}
                    alt={active.title}
                    className="mx-auto max-h-[70vh] w-full object-contain"
                  />
                ) : embedId ? (
                  <div className="aspect-video w-full">
                    <iframe
                      src={`https://www.youtube.com/embed/${embedId}`}
                      title={active.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="size-full"
                    />
                  </div>
                ) : active.src ? (
                  <video
                    src={active.src}
                    controls
                    className="mx-auto max-h-[70vh] w-full bg-black object-contain"
                  />
                ) : (
                  <div className="grid aspect-video place-items-center text-white/50">
                    <Images className="size-10" />
                  </div>
                )}
              </div>

              <div className="flex items-start gap-3 p-5 sm:p-6">
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-primary">
                  {active.kind === "video" ? (
                    <Video className="size-4" />
                  ) : (
                    <Images className="size-4" />
                  )}
                </span>
                <div>
                  <DialogTitle className="font-display text-2xl leading-tight tracking-tight">
                    {active.title}
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-xs text-muted-foreground">
                    {active.kind === "video"
                      ? "Video from Kwahu Government Hospital"
                      : "Photograph from Kwahu Government Hospital"}
                  </DialogDescription>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
