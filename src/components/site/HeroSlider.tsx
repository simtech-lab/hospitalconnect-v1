import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import type { SiteSlide } from "@/lib/site";
import { cn } from "@/lib/utils";

export type HeroFallback = {
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string;
  ctaHref?: string;
};

function HeroCta({
  href,
  label,
  tone,
}: {
  href: string;
  label: string;
  tone: "solid" | "ghost";
}) {
  const className = cn(
    "inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-[13px] font-semibold transition-colors",
    tone === "solid"
      ? "bg-brand text-brand-foreground hover:bg-brand/90"
      : "border border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10",
  );

  const content = (
    <>
      {label}
      <ArrowRight className="size-4" />
    </>
  );

  if (href.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <a href={href} className={className}>
      {content}
    </a>
  );
}

/**
 * The homepage banner. Administrators control every slide (image, copy, link
 * and publish state) from the console; the static fallback is show chrome only.
 */
export function HeroSlider({
  slides,
  fallback,
  secondaryHref,
}: {
  slides: SiteSlide[];
  fallback: HeroFallback;
  secondaryHref?: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = slides.length;
  const activeIndex = count === 0 ? 0 : Math.min(index, count - 1);
  const activeSlide = count > 0 ? slides[activeIndex] : null;

  useEffect(() => {
    if (count <= 1 || paused) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [count, paused]);

  const fallbackContent = fallback;

  const eyebrow = activeSlide?.eyebrow?.trim() || "Official hospital website";
  const title = activeSlide?.title || fallbackContent.title;
  const subtitle = activeSlide?.subtitle?.trim() || fallbackContent.subtitle;
  const ctaHref =
    activeSlide?.ctaHref?.trim() || fallbackContent.ctaHref || "#visit";
  const ctaLabel = activeSlide?.ctaLabel?.trim() || "Plan your visit";
  const image = activeSlide?.image || fallbackContent.image;

  return (
    <div
      className="relative w-full overflow-hidden border-b border-border/70 bg-primary"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative h-[calc(100svh-7rem)] min-h-[460px] max-h-[720px]">
        <AnimatePresence initial={false}>
          <motion.div
            key={activeSlide?._id ?? "fallback"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <motion.img
              src={image}
              alt={activeSlide?.title ?? fallbackContent.title}
              initial={{ scale: 1.06 }}
              animate={{ scale: 1 }}
              transition={{ duration: 9, ease: "linear" }}
              className="size-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/70 to-primary/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/10 to-primary/25" />
        <div className="ridge-pattern absolute inset-0 opacity-40" />

        <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-24 sm:px-10 sm:pb-20 lg:px-14 lg:pb-16">
          <motion.div
            key={`copy-${activeSlide?._id ?? "fallback"}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="max-w-2xl text-primary-foreground"
          >
            <span className="inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-soft">
              <span className="h-px w-8 bg-brand-soft/80" />
              {eyebrow}
            </span>

            <h1 className="mt-4 font-display text-[2.65rem] leading-[0.97] tracking-tight text-balance sm:mt-5 sm:text-6xl lg:text-[4.5rem]">
              {title}
            </h1>

            {subtitle && (
              <p className="mt-4 max-w-xl text-sm leading-7 text-primary-foreground/80 sm:mt-5 sm:text-[15px] sm:leading-8">
                {subtitle}
              </p>
            )}

            <div className="mt-7 flex flex-wrap gap-3 sm:mt-8">
              <HeroCta href={ctaHref} label={ctaLabel} tone="solid" />
              {secondaryHref && (
                <HeroCta href={secondaryHref} label="Our services" tone="ghost" />
              )}
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-3 sm:bottom-8 sm:right-8">
          {count > 1 && (
            <div className="flex items-center gap-1.5">
              {slides.map((slide, slideIndex) => (
                <button
                  key={slide._id}
                  type="button"
                  aria-label={`Show slide ${slideIndex + 1}`}
                  aria-current={slideIndex === activeIndex}
                  onClick={() => setIndex(slideIndex)}
                  className={cn(
                    "h-1 rounded-full transition-all",
                    slideIndex === activeIndex
                      ? "w-7 bg-brand-soft"
                      : "w-3 bg-primary-foreground/35 hover:bg-primary-foreground/60",
                  )}
                />
              ))}
            </div>
          )}

          {count > 0 && (
            <span className="text-[10px] font-medium tabular-nums tracking-[0.22em] text-primary-foreground/70">
              {String(activeIndex + 1).padStart(2, "0")} /{" "}
              {String(count).padStart(2, "0")}
            </span>
          )}

          {count > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-label="Previous slide"
                onClick={() =>
                  setIndex((current) => (current - 1 + count) % count)
                }
                className="grid size-9 place-items-center rounded-full border border-primary-foreground/25 bg-primary/20 text-primary-foreground backdrop-blur transition-colors hover:bg-primary-foreground/15"
              >
                <ArrowLeft className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Next slide"
                onClick={() => setIndex((current) => (current + 1) % count)}
                className="grid size-9 place-items-center rounded-full border border-primary-foreground/25 bg-primary/20 text-primary-foreground backdrop-blur transition-colors hover:bg-primary-foreground/15"
              >
                <ArrowRight className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
