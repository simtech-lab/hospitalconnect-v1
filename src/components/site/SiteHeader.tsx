import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import type { HospitalInfo } from "@/lib/site";
import { DEFAULT_HOSPITAL_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";
import { ArrowUpRight, Clock, MapPin, Menu, Phone } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";
import { HospitalMark } from "./HospitalMark";

export type NavItem = { label: string; href: string };

export function SiteHeader({
  name = DEFAULT_HOSPITAL_NAME,
  info,
  navItems,
}: {
  name?: string;
  info?: HospitalInfo | null;
  navItems: NavItem[];
}) {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = user?.role === "admin";

  const emergency = info?.emergencyLine?.trim() || info?.phone?.trim();
  const topRight = info?.visitingHours?.trim()
    ? { icon: Clock, text: `Visiting hours · ${info.visitingHours.trim()}` }
    : emergency
      ? { icon: Phone, text: emergency }
      : null;

  return (
    <>
      <div className="border-b border-primary/20 bg-primary text-primary-foreground">
        <div className="page-shell flex h-9 items-center justify-between gap-4 text-[10px] font-medium uppercase tracking-[0.18em] sm:text-[11px]">
          <span className="flex min-w-0 items-center gap-2">
            <MapPin className="size-3.5 shrink-0 text-accent" />
            <span className="truncate">
              {info?.address?.trim() || "Atibie · Eastern Region · Ghana"}
            </span>
          </span>
          {topRight ? (
            <span className="hidden items-center gap-2 sm:flex">
              <topRight.icon className="size-3.5 shrink-0 text-accent" />
              <span className="truncate">{topRight.text}</span>
            </span>
          ) : (
            <span className="hidden items-center gap-2 sm:flex">
              <span className="size-1.5 rounded-full bg-accent" />
              Official hospital website
            </span>
          )}
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="page-shell flex h-[76px] items-center justify-between gap-4">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <HospitalMark className="size-11" />
            <span className="flex min-w-0 flex-col leading-none">
              <span className="truncate font-display text-[1.18rem] tracking-tight text-foreground sm:text-[1.5rem]">
                {name}
              </span>
              <span className="mt-1.5 truncate text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Ghana Health Service · Eastern Region
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[15px] font-medium text-foreground/70 transition-colors hover:text-primary"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden h-9 rounded-full border-primary/25 px-4 text-[13px] lg:inline-flex"
            >
              <Link to={isAdmin ? "/dashboard" : "/auth?returnTo=/dashboard"}>
                {isAdmin ? "Admin console" : "Administrator sign in"}
                <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-10 lg:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[86vw] max-w-sm p-0">
                <SheetHeader className="border-b p-6">
                  <div className="flex items-center gap-3 pr-8">
                    <HospitalMark className="size-10" />
                    <div className="min-w-0">
                      <SheetTitle className="truncate font-display text-xl">
                        {name}
                      </SheetTitle>
                      <SheetDescription className="text-[10px] font-medium uppercase tracking-[0.18em]">
                        Official website
                      </SheetDescription>
                    </div>
                  </div>
                </SheetHeader>

                <nav className="flex flex-col px-6 py-4">
                  {navItems.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "border-b border-border/60 py-4 font-display text-2xl tracking-tight",
                        "transition-colors hover:text-primary",
                      )}
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>

                <div className="mt-auto space-y-3 border-t p-6">
                  <Button asChild className="w-full rounded-full">
                    <Link to={isAdmin ? "/dashboard" : "/auth?returnTo=/dashboard"}>
                      {isAdmin ? "Open admin console" : "Administrator sign in"}
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </Button>
                  {emergency && (
                    <a
                      href={`tel:${emergency.replace(/\s+/g, "")}`}
                      className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
                    >
                      <Phone className="size-4" /> {emergency}
                    </a>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
