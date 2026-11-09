import { cn } from "@/lib/utils";

/** The hospital's brand mark: a care cross with an ochre ridge arc. */
export function HospitalMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={cn("size-11 shrink-0", className)}
    >
      <rect width="64" height="64" rx="16" className="fill-primary" />
      <path
        d="M32 15v34M15 32h34"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        className="text-primary-foreground"
      />
      <path
        d="M46 17c6.5 4 9 10.5 7 17"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        className="text-accent"
      />
    </svg>
  );
}
