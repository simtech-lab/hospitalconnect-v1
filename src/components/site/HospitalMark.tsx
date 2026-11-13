import { cn } from "@/lib/utils";

/** The hospital's official badge logo. */
export function HospitalMark({ className }: { className?: string }) {
  return (
    <img
      src="/hospital-logo.jpg"
      alt="Kwahu Government Hospital logo"
      width={720}
      height={720}
      className={cn(
        "size-11 shrink-0 rounded-full bg-white object-contain ring-1 ring-border/50",
        className,
      )}
    />
  );
}
