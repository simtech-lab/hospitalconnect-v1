import { AdminGate } from "@/components/admin/AdminGate";
import { DoctorDialog } from "@/components/admin/DoctorDialog";
import { EventDialog } from "@/components/admin/EventDialog";
import { GalleryDialog } from "@/components/admin/GalleryDialog";
import { HospitalInfoForm } from "@/components/admin/HospitalInfoForm";
import { PartnerDialog } from "@/components/admin/PartnerDialog";
import { ManagementDialog } from "@/components/admin/ManagementDialog";
import { ServiceDialog } from "@/components/admin/ServiceDialog";
import { SlideDialog } from "@/components/admin/SlideDialog";
import { HospitalMark } from "@/components/site/HospitalMark";
import { ServiceIcon } from "@/components/site/ServiceIcon";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { youtubeThumbnail } from "@/lib/video";
import {
  formatEventDateRange,
  formatEventTimeRange,
  startOfToday,
} from "@/lib/date";
import type {
  AdminSite,
  ManagementMember,
  SiteDoctor,
  SiteGalleryItem,
  SitePartner,
  SiteEvent,
  SiteService,
  SiteSlide,
} from "@/lib/site";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  Building2,
  CalendarClock,
  CalendarDays,
  Camera,
  Check,
  Circle,
  Clock,
  ExternalLink,
  Handshake,
  ImageOff,
  Images,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Pencil,
  Phone,
  Plus,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Trash2,
  UserPlus,
  UserRound,
  Users,
  UsersRound,
  Video,
  type LucideIcon,
} from "lucide-react";
import type { FunctionReturnType } from "convex/server";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

type Appointment = FunctionReturnType<typeof api.appointments.list>[number];

type Tab =
  | "overview"
  | "slider"
  | "info"
  | "services"
  | "doctors"
  | "management"
  | "events"
  | "appointments"
  | "partners"
  | "gallery"
  | "team";

const TABS: {
  value: Tab;
  label: string;
  hint: string;
  icon: LucideIcon;
}[] = [
  {
    value: "overview",
    label: "Overview",
    hint: "What the public website is showing",
    icon: LayoutDashboard,
  },
  {
    value: "slider",
    label: "Slider banner",
    hint: "Homepage images, headlines and links",
    icon: Images,
  },
  {
    value: "info",
    label: "Hospital info",
    hint: "Profile, hours and contact details",
    icon: Building2,
  },
  {
    value: "services",
    label: "Services",
    hint: "Departments shown on the public site",
    icon: Stethoscope,
  },
  {
    value: "doctors",
    label: "Doctors",
    hint: "Profiles shown in Our doctors",
    icon: UserRound,
  },
  {
    value: "management",
    label: "Management",
    hint: "Hospital leadership profiles",
    icon: UsersRound,
  },
  {
    value: "events",
    label: "Events",
    hint: "Upcoming events, flyers and media",
    icon: CalendarDays,
  },
  {
    value: "appointments",
    label: "Appointments",
    hint: "Requests submitted from the website",
    icon: CalendarClock,
  },
  {
    value: "partners",
    label: "Partners",
    hint: "Partner logos shown on the website",
    icon: Handshake,
  },
  {
    value: "gallery",
    label: "Gallery",
    hint: "Titled photos and videos",
    icon: Camera,
  },
  {
    value: "team",
    label: "Team access",
    hint: "Who can publish content",
    icon: Users,
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (user.role !== "admin") {
    return <AdminGate />;
  }

  return <Console tab={tab} onTab={setTab} displayName={user.name || user.email} />;
}

function initialsOf(value?: string | null) {
  if (!value) return "AD";
  const parts = value.split(/[\s@._-]+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase());
  return letters.join("") || "AD";
}

function Console({
  tab,
  onTab,
  displayName,
}: {
  tab: Tab;
  onTab: (tab: Tab) => void;
  displayName?: string | null;
}) {
  const site = useQuery(api.content.getAdminSite);
  const appointments = useQuery(api.appointments.list);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const activeTab = TABS.find((item) => item.value === tab) ?? TABS[0];
  const firstName = displayName?.trim().split(/\s+/)[0] ?? "Administrator";

  const counts: Partial<Record<Tab, number>> = {
    slider: site?.slides.length,
    services: site?.services.length,
    doctors: site?.doctors.length,
    management: site?.management.length,
    events: site?.events.length,
    appointments: appointments?.length,
    partners: site?.partners.length,
    gallery: site?.gallery.length,
  };

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  function selectTab(next: Tab) {
    onTab(next);
    setMobileNavOpen(false);
  }

  return (
    <div className="min-h-screen bg-muted/30 lg:flex">
      <aside className="hidden border-r border-border/80 bg-card lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[264px] lg:shrink-0 lg:flex-col">
        <div className="flex items-center gap-3 border-b border-border/70 px-5 py-5">
          <HospitalMark className="size-10" />
          <div className="min-w-0">
            <p className="truncate font-display text-lg leading-tight tracking-tight">
              Kwahu Gov&apos;t Hospital
            </p>
            <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Administrator console
            </p>
          </div>
        </div>

        <ConsoleNav active={tab} onSelect={selectTab} counts={counts} />

        <div className="mt-auto border-t border-border/70 p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold text-primary">
              {initialsOf(displayName)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {displayName || "Administrator"}
              </p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Administrator
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-2">
            <Button asChild variant="outline" size="sm" className="justify-start">
              <a href="/" target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" />
                View public website
              </a>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start text-muted-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border/80 bg-background/90 px-4 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 lg:hidden"
                  aria-label="Open console menu"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[86vw] max-w-xs p-0">
                <SheetHeader className="border-b p-5 text-left">
                  <div className="flex items-center gap-3 pr-8">
                    <HospitalMark className="size-9" />
                    <div>
                      <SheetTitle className="font-display text-lg">
                        Admin console
                      </SheetTitle>
                      <SheetDescription className="text-[10px] uppercase tracking-[0.16em]">
                        Kwahu Government Hospital
                      </SheetDescription>
                    </div>
                  </div>
                </SheetHeader>
                <ConsoleNav active={tab} onSelect={selectTab} counts={counts} />
                <div className="mt-auto grid gap-2 border-t p-4">
                  <Button asChild variant="outline" size="sm" className="justify-start">
                    <a href="/" target="_blank" rel="noreferrer">
                      <ExternalLink className="size-4" />
                      View public website
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start text-muted-foreground"
                    onClick={handleSignOut}
                  >
                    <LogOut className="size-4" />
                    Sign out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{activeTab.label}</p>
              <p className="hidden truncate text-[11px] text-muted-foreground sm:block">
                {activeTab.hint}
              </p>
            </div>
          </div>

          <Button asChild variant="outline" size="sm" className="shrink-0 rounded-full">
            <a href="/" target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" />
              <span className="hidden sm:inline">View site</span>
            </a>
          </Button>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {!site ? (
            <div className="flex min-h-[50vh] items-center justify-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading hospital website content…
            </div>
          ) : (
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {tab === "overview" && (
                <OverviewTab site={site} onTab={onTab} firstName={firstName} />
              )}
              {tab === "slider" && <SlidesTab slides={site.slides} />}
              {tab === "info" && <InfoTab site={site} />}
              {tab === "services" && <ServicesTab services={site.services} />}
              {tab === "doctors" && <DoctorsTab doctors={site.doctors} />}
              {tab === "management" && (
                <ManagementTab members={site.management} />
              )}
              {tab === "events" && <EventsTab events={site.events} />}
              {tab === "appointments" && (
                <AppointmentsTab
                  appointments={appointments ?? []}
                  loading={appointments === undefined}
                />
              )}
              {tab === "partners" && <PartnersTab partners={site.partners} />}
              {tab === "gallery" && <GalleryTab items={site.gallery} />}
              {tab === "team" && <TeamTab />}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}

const APPOINTMENT_STATUS: Record<
  Appointment["status"],
  { label: string; className: string }
> = {
  new: { label: "New", className: "border-brand/25 bg-brand/10 text-brand" },
  contacted: {
    label: "Contacted",
    className: "border-border bg-secondary text-secondary-foreground",
  },
  scheduled: {
    label: "Scheduled",
    className: "border-primary/25 bg-primary/10 text-primary",
  },
  closed: {
    label: "Closed",
    className: "border-border bg-muted text-muted-foreground",
  },
};

const APPOINTMENT_TIME: Record<Appointment["preferredTime"], string> = {
  morning: "Morning · 8am – 12pm",
  afternoon: "Afternoon · 12pm – 5pm",
  anytime: "Any time",
};

function formatAppointmentDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function AppointmentsTab({
  appointments,
  loading,
}: {
  appointments: Appointment[];
  loading: boolean;
}) {
  const updateStatus = useMutation(api.appointments.updateStatus);
  const removeAppointment = useMutation(api.appointments.remove);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Appointment | null>(null);

  const newCount = appointments.filter((item) => item.status === "new").length;
  const scheduledCount = appointments.filter(
    (item) => item.status === "scheduled",
  ).length;

  async function changeStatus(
    appointment: Appointment,
    status: Appointment["status"],
  ) {
    setBusyId(appointment._id);
    try {
      await updateStatus({ id: appointment._id, status });
      toast.success(`Marked as ${APPOINTMENT_STATUS[status].label.toLowerCase()}.`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update this appointment.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await removeAppointment({ id: deleting._id });
      toast.success("Appointment request deleted.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not delete this request.",
      );
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
          Appointment requests
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Requests submitted from the About page. Call the patient to confirm a
          time, then update the request status here.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/80 bg-card p-5">
          <p className="eyebrow text-[10px]">Total requests</p>
          <p className="mt-2 font-display text-3xl tracking-tight">
            {appointments.length}
          </p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card p-5">
          <p className="eyebrow text-[10px]">Awaiting contact</p>
          <p className="mt-2 font-display text-3xl tracking-tight text-brand">
            {newCount}
          </p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card p-5">
          <p className="eyebrow text-[10px]">Scheduled</p>
          <p className="mt-2 font-display text-3xl tracking-tight text-primary">
            {scheduledCount}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading appointment requests…
        </div>
      ) : appointments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-secondary text-primary">
            <CalendarClock className="size-5" />
          </span>
          <p className="mt-4 font-display text-2xl tracking-tight">
            No appointment requests yet
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            New requests from the public About page will appear here.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {appointments.map((appointment) => (
            <li
              key={appointment._id}
              className="rounded-2xl border border-border/80 bg-card p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-2xl leading-tight tracking-tight">
                      {appointment.name}
                    </h2>
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full text-[10px]",
                        APPOINTMENT_STATUS[appointment.status].className,
                      )}
                    >
                      {APPOINTMENT_STATUS[appointment.status].label}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Requested{" "}
                    {new Date(appointment.createdAt).toLocaleString("en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-2 sm:shrink-0">
                  <Select
                    value={appointment.status}
                    onValueChange={(value) =>
                      changeStatus(
                        appointment,
                        value as Appointment["status"],
                      )
                    }
                    disabled={busyId === appointment._id}
                  >
                    <SelectTrigger className="h-9 w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(APPOINTMENT_STATUS) as Appointment["status"][]).map(
                        (status) => (
                          <SelectItem key={status} value={status}>
                            {APPOINTMENT_STATUS[status].label}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 text-muted-foreground hover:text-destructive"
                    aria-label={`Delete request from ${appointment.name}`}
                    onClick={() => setDeleting(appointment)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <a
                  href={`tel:${appointment.phone.replace(/\s+/g, "")}`}
                  className="flex items-center gap-2 hover:text-primary"
                >
                  <Phone className="size-4 shrink-0 text-primary" />
                  {appointment.phone}
                </a>
                {appointment.email ? (
                  <a
                    href={`mailto:${appointment.email}`}
                    className="flex min-w-0 items-center gap-2 hover:text-primary"
                  >
                    <Mail className="size-4 shrink-0 text-primary" />
                    <span className="truncate">{appointment.email}</span>
                  </a>
                ) : (
                  <span className="flex items-center gap-2">
                    <Mail className="size-4 shrink-0 text-primary/50" />
                    No email provided
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <CalendarClock className="size-4 shrink-0 text-primary" />
                  {formatAppointmentDate(appointment.preferredDate)} ·{" "}
                  {APPOINTMENT_TIME[appointment.preferredTime]}
                </span>
                <span className="flex items-center gap-2">
                  <Stethoscope className="size-4 shrink-0 text-primary" />
                  {appointment.service || "General outpatient"}
                </span>
              </div>

              {appointment.reason && (
                <p className="mt-4 whitespace-pre-line rounded-xl bg-secondary/40 p-4 text-sm leading-6 text-muted-foreground">
                  {appointment.reason}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this request?</AlertDialogTitle>
            <AlertDialogDescription>
              The appointment request from {deleting?.name ?? "this patient"} will
              be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep request</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ConsoleNav({
  active,
  onSelect,
  counts,
}: {
  active: Tab;
  onSelect: (tab: Tab) => void;
  counts: Partial<Record<Tab, number>>;
}) {
  return (
    <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3">
      {TABS.map((item) => {
        const isActive = item.value === active;
        const count = counts[item.value];

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onSelect(item.value)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <item.icon className="size-4 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {typeof count === "number" && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium tabular-nums",
                  isActive
                    ? "bg-primary-foreground/15 text-primary-foreground"
                    : "bg-secondary text-secondary-foreground",
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

function StatCard({
  label,
  value,
  note,
  icon: Icon,
  onClick,
}: {
  label: string;
  value: React.ReactNode;
  note: string;
  icon: LucideIcon;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-border/80 bg-card p-5 text-left transition-colors hover:border-primary/40"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="eyebrow text-[10px]">{label}</span>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-4 font-display text-3xl leading-none tracking-tight sm:text-4xl">
        {value}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">{note}</p>
    </button>
  );
}

function OverviewTab({
  site,
  onTab,
  firstName,
}: {
  site: AdminSite;
  onTab: (tab: Tab) => void;
  firstName: string;
}) {
  const publishStarterContent = useMutation(api.content.publishStarterContent);
  const [seeding, setSeeding] = useState(false);

  const info = site.info;
  const publishedSlides = site.slides.filter((slide) => slide.isPublished).length;
  const publishedServices = site.services.filter(
    (service) => service.isPublished,
  ).length;
  const publishedDoctors = site.doctors.filter(
    (doctor) => doctor.isPublished,
  ).length;
  const publishedManagement = site.management.filter(
    (member) => member.isPublished,
  ).length;
  const publishedEvents = site.events.filter(
    (event) => event.isPublished,
  ).length;
  const publishedPartners = site.partners.filter(
    (partner) => partner.isPublished,
  ).length;
  const publishedGallery = site.gallery.filter(
    (item) => item.isPublished,
  ).length;

  const steps = [
    {
      label: "Publish the hospital profile",
      detail: "Name, about, mission, hours and contacts.",
      done: info?.isPublished === true,
      tab: "info" as Tab,
    },
    {
      label: "Publish at least one slider banner",
      detail: "The banner is the first thing visitors see.",
      done: publishedSlides > 0,
      tab: "slider" as Tab,
    },
    {
      label: "Publish the hospital's services",
      detail: "Departments and care areas for patients.",
      done: publishedServices > 0,
      tab: "services" as Tab,
    },
    {
      label: "Publish a doctor profile",
      detail: "Give patients a name and specialty to look for.",
      done: publishedDoctors > 0,
      tab: "doctors" as Tab,
    },
    {
      label: "Add an upcoming event",
      detail: "Outreach, screenings and community programmes.",
      done: publishedEvents > 0,
      tab: "events" as Tab,
    },
    {
      label: "Add a partner organisation",
      detail: "Show the institutions supporting the hospital.",
      done: publishedPartners > 0,
      tab: "partners" as Tab,
    },
    {
      label: "Publish gallery photos and videos",
      detail: "Give visitors a look inside the hospital.",
      done: publishedGallery > 0,
      tab: "gallery" as Tab,
    },
  ];
  const completed = steps.filter((step) => step.done).length;
  const showStarter =
    site.slides.length === 0 ||
    site.services.length === 0 ||
    site.doctors.length === 0 ||
    site.management.length === 0 ||
    site.events.length === 0 ||
    site.partners.length === 0 ||
    site.gallery.length === 0 ||
    info === null;

  async function handleSeed() {
    setSeeding(true);
    try {
      const created = await publishStarterContent({});
      toast.success("Starter content published.", {
        description: `${created.slides} banners, ${created.services} services, ${created.doctors} doctors, ${created.management} management profiles, ${created.events} events, ${created.partners} partner logos and ${created.gallery} gallery items were added. Edit anything you like.`,
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not publish starter content.",
      );
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="eyebrow">Site control room</span>
        <h1 className="mt-2 font-display text-4xl tracking-tight text-balance">
          Welcome back, {firstName}.
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Everything visitors see is created and published here. Draft content
          stays private until you publish it.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Slider banners"
          value={
            <>
              {publishedSlides}
              <span className="text-xl text-muted-foreground">
                /{site.slides.length}
              </span>
            </>
          }
          note={`${publishedSlides} published on the homepage`}
          icon={Images}
          onClick={() => onTab("slider")}
        />
        <StatCard
          label="Hospital info"
          value={info?.isPublished ? "Live" : info ? "Draft" : "Not set"}
          note={
            info
              ? info.isPublished
                ? "Profile and contacts are public"
                : "Saved but hidden from visitors"
              : "Add the hospital profile to get started"
          }
          icon={Building2}
          onClick={() => onTab("info")}
        />
        <StatCard
          label="Services"
          value={
            <>
              {publishedServices}
              <span className="text-xl text-muted-foreground">
                /{site.services.length}
              </span>
            </>
          }
          note={`${publishedServices} published on the public site`}
          icon={Stethoscope}
          onClick={() => onTab("services")}
        />
        <StatCard
          label="Doctors"
          value={
            <>
              {publishedDoctors}
              <span className="text-xl text-muted-foreground">
                /{site.doctors.length}
              </span>
            </>
          }
          note={`${publishedDoctors} published in Our doctors`}
          icon={UserRound}
          onClick={() => onTab("doctors")}
        />
        <StatCard
          label="Management"
          value={
            <>
              {publishedManagement}
              <span className="text-xl text-muted-foreground">
                /{site.management.length}
              </span>
            </>
          }
          note={`${publishedManagement} published leadership profiles`}
          icon={UsersRound}
          onClick={() => onTab("management")}
        />
        <StatCard
          label="Events"
          value={
            <>
              {publishedEvents}
              <span className="text-xl text-muted-foreground">
                /{site.events.length}
              </span>
            </>
          }
          note={`${publishedEvents} published events`}
          icon={CalendarDays}
          onClick={() => onTab("events")}
        />
        <StatCard
          label="Partners"
          value={
            <>
              {publishedPartners}
              <span className="text-xl text-muted-foreground">
                /{site.partners.length}
              </span>
            </>
          }
          note={`${publishedPartners} logos on the public site`}
          icon={Handshake}
          onClick={() => onTab("partners")}
        />
        <StatCard
          label="Gallery"
          value={
            <>
              {publishedGallery}
              <span className="text-xl text-muted-foreground">
                /{site.gallery.length}
              </span>
            </>
          }
          note={`${publishedGallery} published photos and videos`}
          icon={Camera}
          onClick={() => onTab("gallery")}
        />
      </div>

      {showStarter && (
        <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-primary/35 bg-secondary/30 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="size-4 text-primary" />
              Need a head start?
            </p>
            <p className="mt-1.5 max-w-xl text-xs leading-6 text-muted-foreground">
              Publish editable starter content — a hospital profile, homepage
              banners, services, doctor and management profiles, sample events,
              partner logos and gallery media. Replace any wording, image or
              number with your hospital&apos;s own before sharing the site.
            </p>
          </div>
          <Button onClick={handleSeed} disabled={seeding} className="shrink-0">
            {seeding ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            Publish starter content
          </Button>
        </div>
      )}

      <div className="rounded-2xl border border-border/80 bg-card">
        <div className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
          <div>
            <p className="text-sm font-semibold">Publishing checklist</p>
            <p className="text-xs text-muted-foreground">
              {completed} of {steps.length} complete
            </p>
          </div>
          <span className="font-display text-2xl text-primary">
            {completed}/{steps.length}
          </span>
        </div>
        <ul className="divide-y divide-border/70">
          {steps.map((step) => (
            <li key={step.label}>
              <button
                type="button"
                onClick={() => onTab(step.tab)}
                className="flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-secondary/40"
              >
                {step.done ? (
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3" />
                  </span>
                ) : (
                  <Circle className="mt-0.5 size-5 shrink-0 text-muted-foreground/40" />
                )}
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block text-sm",
                      step.done && "text-muted-foreground line-through",
                    )}
                  >
                    {step.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {step.detail}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/80 bg-card">
          <div className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
            <p className="text-sm font-semibold">Homepage slider</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTab("slider")}
              className="text-primary"
            >
              Manage
            </Button>
          </div>
          {site.slides.length > 0 ? (
            <ul className="divide-y divide-border/70">
              {site.slides.slice(0, 3).map((slide) => (
                <li key={slide._id} className="flex items-center gap-3 px-5 py-3">
                  <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {slide.image ? (
                      <img
                        src={slide.image}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{slide.title}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {slide.eyebrow || "Homepage banner"}
                    </p>
                  </div>
                  <Badge
                    variant={slide.isPublished ? "default" : "secondary"}
                    className="rounded-full text-[10px]"
                  >
                    {slide.isPublished ? "Live" : "Draft"}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-5">
              <p className="text-xs leading-6 text-muted-foreground">
                No banners yet. The homepage shows a branded fallback until the
                first slide is published.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => onTab("slider")}
              >
                <Plus className="size-4" />
                Create the first slide
              </Button>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border/80 bg-card">
          <div className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
            <p className="text-sm font-semibold">Hospital information</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTab("info")}
              className="text-primary"
            >
              Edit
            </Button>
          </div>
          <div className="space-y-3 p-5 text-sm">
            <div className="flex items-start justify-between gap-3">
              <span className="text-muted-foreground">Name</span>
              <span className="text-right font-medium">
                {info?.name || "Not set up"}
              </span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-muted-foreground">Visibility</span>
              <Badge
                variant={info?.isPublished ? "default" : "secondary"}
                className="rounded-full text-[10px]"
              >
                {info?.isPublished ? "Published" : info ? "Draft" : "Not created"}
              </Badge>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="size-3.5" /> Visiting hours
              </span>
              <span className="max-w-[55%] text-right">
                {info?.visitingHours || "—"}
              </span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="size-3.5" /> Address
              </span>
              <span className="max-w-[55%] text-right">
                {info?.address || "—"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlidesTab({ slides }: { slides: SiteSlide[] }) {
  const updateSlide = useMutation(api.content.updateSlide);
  const deleteSlide = useMutation(api.content.deleteSlide);
  const reorderSlides = useMutation(api.content.reorderSlides);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SiteSlide | null>(null);
  const [deleting, setDeleting] = useState<SiteSlide | null>(null);

  function openNew() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(slide: SiteSlide) {
    setEditing(slide);
    setDialogOpen(true);
  }

  async function togglePublished(slide: SiteSlide, isPublished: boolean) {
    try {
      await updateSlide({ id: slide._id, isPublished });
      toast.success(
        isPublished ? "Banner published to the homepage." : "Banner moved to drafts.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update this slide.",
      );
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= slides.length) return;
    const next = [...slides];
    const current = next[index];
    next[index] = next[target];
    next[target] = current;
    try {
      await reorderSlides({ ids: next.map((slide) => slide._id) });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not reorder slides.",
      );
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await deleteSlide({ id: deleting._id });
      toast.success("Slider banner deleted.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete this slide.",
      );
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
            Slider banner
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            These slides rotate in the homepage hero. Use the arrows to set the
            order visitors see them in.
          </p>
        </div>
        <Button onClick={openNew} className="shrink-0">
          <Plus className="size-4" />
          New slide
        </Button>
      </div>

      {slides.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-secondary text-primary">
            <Images className="size-5" />
          </span>
          <p className="mt-4 font-display text-2xl tracking-tight">
            No slider banners yet
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Add a wide image, a strong headline and a link. Publish it to make
            it the first thing visitors see.
          </p>
          <Button onClick={openNew} className="mt-5">
            <Plus className="size-4" />
            Create first slide
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {slides.map((slide, index) => (
            <li
              key={slide._id}
              className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card p-4 sm:flex-row sm:items-center"
            >
              <div className="relative aspect-[16/8] w-full overflow-hidden rounded-xl bg-muted sm:w-36 sm:shrink-0">
                {slide.image ? (
                  <img
                    src={slide.image}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="grid size-full place-items-center text-muted-foreground">
                    <ImageOff className="size-5" />
                  </div>
                )}
                <span className="absolute left-2 top-2 rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                  {index + 1}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={slide.isPublished ? "default" : "secondary"}
                    className="rounded-full text-[10px]"
                  >
                    {slide.isPublished ? "Live" : "Draft"}
                  </Badge>
                  {slide.eyebrow && (
                    <span className="truncate text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      {slide.eyebrow}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 truncate font-display text-xl tracking-tight">
                  {slide.title}
                </p>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                  {slide.subtitle || "No supporting text"}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  Published
                  <Switch
                    checked={slide.isPublished}
                    onCheckedChange={(checked) =>
                      togglePublished(slide, checked)
                    }
                    aria-label={`Publish ${slide.title}`}
                  />
                </label>
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    aria-label="Move slide up"
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={index === slides.length - 1}
                    onClick={() => move(index, 1)}
                    aria-label="Move slide down"
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => openEdit(slide)}
                    aria-label={`Edit ${slide.title}`}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleting(slide)}
                    aria-label={`Delete ${slide.title}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <SlideDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        slide={editing}
      />

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this banner?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleting?.title}” will be removed from the homepage and the
              console. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep banner</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete banner
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ServicesTab({ services }: { services: SiteService[] }) {
  const updateService = useMutation(api.content.updateService);
  const deleteService = useMutation(api.content.deleteService);
  const reorderServices = useMutation(api.content.reorderServices);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SiteService | null>(null);
  const [deleting, setDeleting] = useState<SiteService | null>(null);

  function openNew() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(service: SiteService) {
    setEditing(service);
    setDialogOpen(true);
  }

  async function togglePublished(service: SiteService, isPublished: boolean) {
    try {
      await updateService({ id: service._id, isPublished });
      toast.success(
        isPublished
          ? "Service published to the website."
          : "Service moved to drafts.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update this service.",
      );
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= services.length) return;
    const next = [...services];
    const current = next[index];
    next[index] = next[target];
    next[target] = current;
    try {
      await reorderServices({ ids: next.map((service) => service._id) });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not reorder services.",
      );
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await deleteService({ id: deleting._id });
      toast.success("Service deleted.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete this service.",
      );
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
            Services & departments
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            The care areas listed on the public hospital information page. Drag
            free ordering is handled with the arrows.
          </p>
        </div>
        <Button onClick={openNew} className="shrink-0">
          <Plus className="size-4" />
          New service
        </Button>
      </div>

      {services.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-secondary text-primary">
            <Stethoscope className="size-5" />
          </span>
          <p className="mt-4 font-display text-2xl tracking-tight">
            No services published yet
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Add the departments patients and partners should know about, then
            publish each one.
          </p>
          <Button onClick={openNew} className="mt-5">
            <Plus className="size-4" />
            Create first service
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {services.map((service, index) => (
            <li
              key={service._id}
              className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card p-4 sm:flex-row sm:items-center"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
                <ServiceIcon name={service.icon} className="size-5" />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={service.isPublished ? "default" : "secondary"}
                    className="rounded-full text-[10px]"
                  >
                    {service.isPublished ? "Live" : "Draft"}
                  </Badge>
                  <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    Position {index + 1}
                  </span>
                </div>
                <p className="mt-1.5 font-display text-xl tracking-tight">
                  {service.title}
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-muted-foreground">
                  {service.description || "No description"}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  Published
                  <Switch
                    checked={service.isPublished}
                    onCheckedChange={(checked) =>
                      togglePublished(service, checked)
                    }
                    aria-label={`Publish ${service.title}`}
                  />
                </label>
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    aria-label="Move service up"
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={index === services.length - 1}
                    onClick={() => move(index, 1)}
                    aria-label="Move service down"
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => openEdit(service)}
                    aria-label={`Edit ${service.title}`}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleting(service)}
                    aria-label={`Delete ${service.title}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ServiceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        service={editing}
      />

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this service?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleting?.title}” will be removed from the public website and the
              console. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep service</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete service
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function PersonRow({
  photo,
  name,
  subtitle,
  bio,
  index,
  total,
  isPublished,
  onToggle,
  onMove,
  onEdit,
  onDelete,
}: {
  photo: string | null;
  name: string;
  subtitle: string;
  bio?: string;
  index: number;
  total: number;
  isPublished: boolean;
  onToggle: (isPublished: boolean) => void;
  onMove: (direction: -1 | 1) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card p-4 sm:flex-row sm:items-center">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted sm:w-20 sm:shrink-0">
        {photo ? (
          <img src={photo} alt="" className="size-full object-cover" />
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground">
            <UserRound className="size-5" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={isPublished ? "default" : "secondary"}
            className="rounded-full text-[10px]"
          >
            {isPublished ? "Live" : "Draft"}
          </Badge>
          <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Position {index + 1}
          </span>
        </div>
        <p className="mt-1.5 font-display text-xl tracking-tight">{name}</p>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
          {subtitle}
        </p>
        {bio && (
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
            {bio}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
        <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
          Published
          <Switch
            checked={isPublished}
            onCheckedChange={onToggle}
            aria-label={`Publish ${name}`}
          />
        </label>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={index === 0}
            onClick={() => onMove(-1)}
            aria-label={`Move ${name} up`}
          >
            <ArrowUp className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={index === total - 1}
            onClick={() => onMove(1)}
            aria-label={`Move ${name} down`}
          >
            <ArrowDown className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onEdit}
            aria-label={`Edit ${name}`}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
            aria-label={`Delete ${name}`}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </li>
  );
}

function DoctorsTab({ doctors }: { doctors: SiteDoctor[] }) {
  const updateDoctor = useMutation(api.content.updateDoctor);
  const deleteDoctor = useMutation(api.content.deleteDoctor);
  const reorderDoctors = useMutation(api.content.reorderDoctors);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SiteDoctor | null>(null);
  const [deleting, setDeleting] = useState<SiteDoctor | null>(null);

  function openNew() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(doctor: SiteDoctor) {
    setEditing(doctor);
    setDialogOpen(true);
  }

  async function togglePublished(doctor: SiteDoctor, isPublished: boolean) {
    try {
      await updateDoctor({ id: doctor._id, isPublished });
      toast.success(
        isPublished
          ? "Doctor published to the website."
          : "Doctor moved to drafts.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update this doctor.",
      );
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= doctors.length) return;
    const next = [...doctors];
    const current = next[index];
    next[index] = next[target];
    next[target] = current;
    try {
      await reorderDoctors({ ids: next.map((doctor) => doctor._id) });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not reorder doctors.",
      );
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await deleteDoctor({ id: deleting._id });
      toast.success("Doctor profile deleted.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete this doctor.",
      );
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
            Doctors
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Add the doctors patients should know about, with their specialty and
            a profile picture. Use the arrows to set the order on the website.
          </p>
        </div>
        <Button onClick={openNew} className="shrink-0">
          <Plus className="size-4" />
          Add doctor
        </Button>
      </div>

      {doctors.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-secondary text-primary">
            <UserRound className="size-5" />
          </span>
          <p className="mt-4 font-display text-2xl tracking-tight">
            No doctors added yet
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Create a profile with a name, specialty and portrait, then publish it
            to the public website.
          </p>
          <Button onClick={openNew} className="mt-5">
            <Plus className="size-4" />
            Add the first doctor
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {doctors.map((doctor, index) => (
            <PersonRow
              key={doctor._id}
              photo={doctor.photo}
              name={doctor.name}
              subtitle={doctor.specialty}
              bio={doctor.bio}
              index={index}
              total={doctors.length}
              isPublished={doctor.isPublished}
              onToggle={(checked) => togglePublished(doctor, checked)}
              onMove={(direction) => move(index, direction)}
              onEdit={() => openEdit(doctor)}
              onDelete={() => setDeleting(doctor)}
            />
          ))}
        </ul>
      )}

      <DoctorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        doctor={editing}
      />

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this doctor profile?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleting?.name}” will be removed from the public website and the
              console. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep profile</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ManagementTab({ members }: { members: ManagementMember[] }) {
  const updateMember = useMutation(api.content.updateManagementMember);
  const deleteMember = useMutation(api.content.deleteManagementMember);
  const reorderMembers = useMutation(api.content.reorderManagement);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ManagementMember | null>(null);
  const [deleting, setDeleting] = useState<ManagementMember | null>(null);

  function openNew() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(member: ManagementMember) {
    setEditing(member);
    setDialogOpen(true);
  }

  async function togglePublished(
    member: ManagementMember,
    isPublished: boolean,
  ) {
    try {
      await updateMember({ id: member._id, isPublished });
      toast.success(
        isPublished
          ? "Management profile published to the website."
          : "Management profile moved to drafts.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update this profile.",
      );
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= members.length) return;
    const next = [...members];
    const current = next[index];
    next[index] = next[target];
    next[target] = current;
    try {
      await reorderMembers({ ids: next.map((member) => member._id) });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not reorder management profiles.",
      );
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await deleteMember({ id: deleting._id });
      toast.success("Management profile deleted.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not delete this profile.",
      );
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
            Management
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            The leadership team shown on the public website, with their roles and
            portraits. Publish each profile when it is ready.
          </p>
        </div>
        <Button onClick={openNew} className="shrink-0">
          <Plus className="size-4" />
          Add member
        </Button>
      </div>

      {members.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-secondary text-primary">
            <UsersRound className="size-5" />
          </span>
          <p className="mt-4 font-display text-2xl tracking-tight">
            No management profiles yet
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Add the hospital administrator, medical director and other leadership
            roles for the public website.
          </p>
          <Button onClick={openNew} className="mt-5">
            <Plus className="size-4" />
            Add the first member
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {members.map((member, index) => (
            <PersonRow
              key={member._id}
              photo={member.photo}
              name={member.name}
              subtitle={member.role}
              bio={member.bio}
              index={index}
              total={members.length}
              isPublished={member.isPublished}
              onToggle={(checked) => togglePublished(member, checked)}
              onMove={(direction) => move(index, direction)}
              onEdit={() => openEdit(member)}
              onDelete={() => setDeleting(member)}
            />
          ))}
        </ul>
      )}

      <ManagementDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        member={editing}
      />

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this management profile?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleting?.name}” will be removed from the public website and the
              console. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep profile</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EventsTab({ events }: { events: SiteEvent[] }) {
  const updateEvent = useMutation(api.content.updateEvent);
  const deleteEvent = useMutation(api.content.deleteEvent);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SiteEvent | null>(null);
  const [deleting, setDeleting] = useState<SiteEvent | null>(null);
  const today = startOfToday();

  const ordered = useMemo(
    () =>
      [...events].sort((a, b) => {
        const aUpcoming = a.startsAt >= today;
        const bUpcoming = b.startsAt >= today;
        if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1;
        return aUpcoming ? a.startsAt - b.startsAt : b.startsAt - a.startsAt;
      }),
    [events, today],
  );

  function openNew() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(event: SiteEvent) {
    setEditing(event);
    setDialogOpen(true);
  }

  async function togglePublished(event: SiteEvent, isPublished: boolean) {
    try {
      await updateEvent({ id: event._id, isPublished });
      toast.success(
        isPublished ? "Event published to the website." : "Event moved to drafts.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update this event.",
      );
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await deleteEvent({ id: deleting._id });
      toast.success("Event deleted.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete this event.",
      );
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
            Upcoming events
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Create events with a flyer, photo gallery and videos. Published
            events appear in the “Upcoming events” section of the public site.
          </p>
        </div>
        <Button onClick={openNew} className="shrink-0">
          <Plus className="size-4" />
          Create event
        </Button>
      </div>

      {ordered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-secondary text-primary">
            <CalendarDays className="size-5" />
          </span>
          <p className="mt-4 font-display text-2xl tracking-tight">
            No events yet
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Add screenings, outreach programmes and open days so the community
            knows what is coming up.
          </p>
          <Button onClick={openNew} className="mt-5">
            <Plus className="size-4" />
            Create the first event
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {ordered.map((event) => {
            const isPast = (event.endsAt ?? event.startsAt) < today;

            return (
              <li
                key={event._id}
                className="rounded-2xl border border-border/80 bg-card p-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-muted sm:aspect-square sm:w-28 sm:shrink-0">
                    {event.flyer ? (
                      <img
                        src={event.flyer}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="grid size-full place-items-center text-muted-foreground">
                        <CalendarDays className="size-5" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={event.isPublished ? "default" : "secondary"}
                        className="rounded-full text-[10px]"
                      >
                        {event.isPublished ? "Live" : "Draft"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="rounded-full text-[10px]"
                      >
                        {isPast ? "Past" : "Upcoming"}
                      </Badge>
                    </div>
                    <p className="mt-1.5 font-display text-xl tracking-tight">
                      {event.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatEventDateRange(event.startsAt, event.endsAt)} ·{" "}
                      {formatEventTimeRange(event.startsAt, event.endsAt)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {event.location || "No location set"}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Images className="size-3.5" />
                        {event.images.length}{" "}
                        {event.images.length === 1 ? "photo" : "photos"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Video className="size-3.5" />
                        {event.videos.length}{" "}
                        {event.videos.length === 1 ? "video" : "videos"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      Published
                      <Switch
                        checked={event.isPublished}
                        onCheckedChange={(checked) =>
                          togglePublished(event, checked)
                        }
                        aria-label={`Publish ${event.title}`}
                      />
                    </label>
                    <div className="flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(event)}
                        aria-label={`Edit ${event.title}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleting(event)}
                        aria-label={`Delete ${event.title}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <EventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        event={editing}
      />

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this event?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleting?.title}” and its flyer, photos and videos will be
              removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep event</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function PartnersTab({ partners }: { partners: SitePartner[] }) {
  const updatePartner = useMutation(api.content.updatePartner);
  const deletePartner = useMutation(api.content.deletePartner);
  const reorderPartners = useMutation(api.content.reorderPartners);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SitePartner | null>(null);
  const [deleting, setDeleting] = useState<SitePartner | null>(null);

  function openNew() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(partner: SitePartner) {
    setEditing(partner);
    setDialogOpen(true);
  }

  async function togglePublished(partner: SitePartner, isPublished: boolean) {
    try {
      await updatePartner({ id: partner._id, isPublished });
      toast.success(
        isPublished
          ? "Partner published to the website."
          : "Partner moved to drafts.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update this partner.",
      );
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= partners.length) return;
    const next = [...partners];
    const current = next[index];
    next[index] = next[target];
    next[target] = current;
    try {
      await reorderPartners({ ids: next.map((partner) => partner._id) });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not reorder partners.",
      );
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await deletePartner({ id: deleting._id });
      toast.success("Partner deleted.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete this partner.",
      );
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
            Our partners
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Partner logos appear in the “In partnership with” strip on the public
            website. Use the arrows to set their order.
          </p>
        </div>
        <Button onClick={openNew} className="shrink-0">
          <Plus className="size-4" />
          Add partner
        </Button>
      </div>

      {partners.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-secondary text-primary">
            <Handshake className="size-5" />
          </span>
          <p className="mt-4 font-display text-2xl tracking-tight">
            No partners added yet
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Add the organisations that support the hospital, with their logo and
            name, then publish them to the website.
          </p>
          <Button onClick={openNew} className="mt-5">
            <Plus className="size-4" />
            Add the first partner
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {partners.map((partner, index) => (
            <li
              key={partner._id}
              className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card p-4 sm:flex-row sm:items-center"
            >
              <div className="grid h-20 w-full place-items-center overflow-hidden rounded-xl border border-border/70 bg-white p-2 sm:w-28 sm:shrink-0">
                {partner.logo ? (
                  <img
                    src={partner.logo}
                    alt=""
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <Handshake className="size-6 text-muted-foreground" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={partner.isPublished ? "default" : "secondary"}
                    className="rounded-full text-[10px]"
                  >
                    {partner.isPublished ? "Live" : "Draft"}
                  </Badge>
                  <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    Position {index + 1}
                  </span>
                </div>
                <p className="mt-1.5 font-display text-xl tracking-tight">
                  {partner.name}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  Published
                  <Switch
                    checked={partner.isPublished}
                    onCheckedChange={(checked) =>
                      togglePublished(partner, checked)
                    }
                    aria-label={`Publish ${partner.name}`}
                  />
                </label>
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    aria-label={`Move ${partner.name} up`}
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={index === partners.length - 1}
                    onClick={() => move(index, 1)}
                    aria-label={`Move ${partner.name} down`}
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => openEdit(partner)}
                    aria-label={`Edit ${partner.name}`}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleting(partner)}
                    aria-label={`Delete ${partner.name}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <PartnerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        partner={editing}
      />

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this partner?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleting?.name}” and its logo will be removed from the website
              and the console. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep partner</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete partner
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function GalleryTab({ items }: { items: SiteGalleryItem[] }) {
  const updateGalleryItem = useMutation(api.content.updateGalleryItem);
  const deleteGalleryItem = useMutation(api.content.deleteGalleryItem);
  const reorderGallery = useMutation(api.content.reorderGallery);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SiteGalleryItem | null>(null);
  const [deleting, setDeleting] = useState<SiteGalleryItem | null>(null);

  function openNew() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(item: SiteGalleryItem) {
    setEditing(item);
    setDialogOpen(true);
  }

  async function togglePublished(item: SiteGalleryItem, isPublished: boolean) {
    try {
      await updateGalleryItem({ id: item._id, isPublished });
      toast.success(
        isPublished
          ? "Gallery item published to the website."
          : "Gallery item moved to drafts.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update this gallery item.",
      );
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const current = next[index];
    next[index] = next[target];
    next[target] = current;
    try {
      await reorderGallery({ ids: next.map((item) => item._id) });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not reorder the gallery.",
      );
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await deleteGalleryItem({ id: deleting._id });
      toast.success("Gallery item deleted.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not delete this gallery item.",
      );
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
            Photo & video gallery
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Add titled photos or videos to the public gallery. Photos and videos
            can be uploaded or linked by URL.
          </p>
        </div>
        <Button onClick={openNew} className="shrink-0">
          <Plus className="size-4" />
          Add gallery item
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-secondary text-primary">
            <Camera className="size-5" />
          </span>
          <p className="mt-4 font-display text-2xl tracking-tight">
            The gallery is empty
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Add photos with titles and short videos showing the hospital, its
            teams and community work.
          </p>
          <Button onClick={openNew} className="mt-5">
            <Plus className="size-4" />
            Add the first item
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li
              key={item._id}
              className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card p-4 sm:flex-row sm:items-center"
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted sm:w-28 sm:shrink-0">
                {item.kind === "image" && item.src ? (
                  <img
                    src={item.src}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : item.kind === "video" && item.src ? (
                  youtubeThumbnail(item.src) ? (
                    <img
                      src={youtubeThumbnail(item.src) ?? ""}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <video
                      src={item.src}
                      muted
                      playsInline
                      preload="metadata"
                      className="size-full bg-black object-cover"
                    />
                  )
                ) : (
                  <div className="grid size-full place-items-center text-muted-foreground">
                    {item.kind === "video" ? (
                      <Video className="size-5" />
                    ) : (
                      <Camera className="size-5" />
                    )}
                  </div>
                )}
                <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur">
                  {item.kind === "video" ? "Video" : "Photo"}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={item.isPublished ? "default" : "secondary"}
                    className="rounded-full text-[10px]"
                  >
                    {item.isPublished ? "Live" : "Draft"}
                  </Badge>
                  <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    Position {index + 1}
                  </span>
                </div>
                <p className="mt-1.5 font-display text-xl tracking-tight">
                  {item.title}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  Published
                  <Switch
                    checked={item.isPublished}
                    onCheckedChange={(checked) =>
                      togglePublished(item, checked)
                    }
                    aria-label={`Publish ${item.title}`}
                  />
                </label>
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    aria-label={`Move ${item.title} up`}
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={index === items.length - 1}
                    onClick={() => move(index, 1)}
                    aria-label={`Move ${item.title} down`}
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => openEdit(item)}
                    aria-label={`Edit ${item.title}`}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleting(item)}
                    aria-label={`Delete ${item.title}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <GalleryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editing}
      />

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this gallery item?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleting?.title}” will be removed from the public gallery and the
              console. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep item</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function InfoTab({ site }: { site: AdminSite }) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
          Hospital information
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          This is the single source of truth for the hospital&apos;s name,
          profile, opening hours and contact details across the public website.
        </p>
      </div>

      <HospitalInfoForm info={site.info} />
    </div>
  );
}

function TeamTab() {
  const { user } = useAuth();
  const team = useQuery(api.admins.listTeam);
  const setRole = useMutation(api.admins.setRole);
  const inviteAdmin = useMutation(api.admins.inviteAdmin);

  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  const admins = useMemo(
    () => team?.filter((member) => member.role === "admin").length ?? 0,
    [team],
  );

  async function handleInvite(event: React.FormEvent) {
    event.preventDefault();
    if (!inviteEmail.trim()) {
      toast.error("Enter the administrator's email address.");
      return;
    }

    setInviting(true);
    try {
      const result = await inviteAdmin({
        name: inviteName.trim(),
        email: inviteEmail.trim(),
      });
      if (result.wasAdmin) {
        toast.info("That email already has administrator access.");
      } else if (result.created) {
        toast.success("Administrator invited.", {
          description: `They can now sign in with a one-time code sent to ${inviteEmail
            .trim()
            .toLowerCase()}.`,
        });
      } else {
        toast.success("Administrator access granted.", {
          description: "They can now sign in with their existing account.",
        });
      }
      setInviteName("");
      setInviteEmail("");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not invite this administrator.",
      );
    } finally {
      setInviting(false);
    }
  }

  async function changeRole(userId: Id<"users">, role: "admin" | "user") {
    try {
      await setRole({ userId, role });
      toast.success(
        role === "admin"
          ? "Administrator access granted."
          : "Administrator access revoked.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not change this role.",
      );
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
          Team access
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Only administrators can sign in and create or publish website content.
          Invite colleagues by email and give them access to the console.
        </p>
      </div>

      <form
        onSubmit={handleInvite}
        className="rounded-2xl border border-border/80 bg-card p-5"
      >
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-primary">
            <UserPlus className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold">Invite another administrator</p>
            <p className="mt-0.5 max-w-xl text-xs leading-5 text-muted-foreground">
              The invited person signs in with a one-time code sent to this
              email. They can create and publish content immediately.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1.25fr_auto] sm:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="invite-name">Name</Label>
            <Input
              id="invite-name"
              value={inviteName}
              placeholder="Full name"
              onChange={(event) => setInviteName(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">
              Email <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                placeholder="colleague@hospital.org"
                className="pl-9"
                onChange={(event) => setInviteEmail(event.target.value)}
                required
              />
            </div>
          </div>
          <Button type="submit" disabled={inviting}>
            {inviting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UserPlus className="size-4" />
            )}
            Add administrator
          </Button>
        </div>
      </form>

      {!team ? (
        <div className="flex items-center gap-3 rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading team…
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-card">
          <div className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
            <p className="text-sm font-semibold">Accounts</p>
            <span className="text-xs text-muted-foreground">
              {team.length} {team.length === 1 ? "account" : "accounts"} ·{" "}
              {admins} {admins === 1 ? "administrator" : "administrators"}
            </span>
          </div>

          <ul className="divide-y divide-border/70">
            {team.map((member) => {
              const isSelf = member.id === user?._id;
              const isAdmin = member.role === "admin";
              const label =
                member.name?.trim() ||
                (member.isAnonymous ? "Guest session" : "Unnamed account");

              return (
                <li
                  key={member.id}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-[11px] font-semibold text-primary">
                      {initialsOf(member.name || member.email)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {label}
                        {isSelf && (
                          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                            (you)
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {member.email || "No email on this account"}
                        {!member.hasSignedIn &&
                          member.role === "admin" &&
                          " · Invitation pending"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:shrink-0">
                    <Badge
                      variant={isAdmin ? "default" : "secondary"}
                      className="rounded-full text-[10px]"
                    >
                      {isAdmin ? "Administrator" : "No access"}
                    </Badge>
                    {isAdmin ? (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isSelf}
                        onClick={() => changeRole(member.id, "user")}
                      >
                        Revoke
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => changeRole(member.id, "admin")}
                      >
                        <ShieldCheck className="size-4" />
                        Grant admin
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <p className="text-xs leading-6 text-muted-foreground">
        Only the email addresses listed as administrators can sign in at{" "}
        <Link to="/auth" className="text-primary underline-offset-4 hover:underline">
          /auth
        </Link>
        . Revoking access keeps the account record but blocks that person from
        the console.
      </p>
    </div>
  );
}
