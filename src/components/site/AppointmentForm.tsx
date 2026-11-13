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
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { HospitalInfo, SiteService } from "@/lib/site";
import { useMutation } from "convex/react";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Loader2,
  Phone,
} from "lucide-react";
import { useMemo, useState } from "react";

type PreferredTime = "morning" | "afternoon" | "anytime";

const TIME_LABELS: Record<PreferredTime, string> = {
  morning: "Morning · 8am – 12pm",
  afternoon: "Afternoon · 12pm – 5pm",
  anytime: "Any time",
};

function localToday() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function AppointmentForm({
  services,
  info,
}: {
  services: SiteService[];
  info: HospitalInfo | null;
}) {
  const createAppointment = useMutation(api.appointments.create);
  const today = useMemo(localToday, []);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("general");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState<PreferredTime>("morning");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<{
    name: string;
    date: string;
  } | null>(null);

  const department =
    service === "general" ? "General outpatient" : service || undefined;
  const emergency = info?.emergencyLine?.trim() || info?.phone?.trim();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await createAppointment({
        name,
        phone,
        email: email.trim() || undefined,
        service: department,
        preferredDate,
        preferredTime,
        reason: reason.trim() || undefined,
      });
      setSubmitted({ name: name.trim(), date: preferredDate });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not send the appointment request. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setSubmitted(null);
    setName("");
    setPhone("");
    setEmail("");
    setService("general");
    setPreferredDate("");
    setPreferredTime("morning");
    setReason("");
    setError(null);
  }

  return (
    <section
      id="appointment"
      className="border-t border-border/70 bg-secondary/30"
    >
      <div className="page-shell py-12 sm:py-16 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <div>
            <span className="eyebrow">Appointments</span>
            <h2 className="mt-3 max-w-md font-display text-3xl leading-[1.05] tracking-tight text-balance sm:text-4xl">
              Request a visit to the hospital.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">
              Tell us who needs care and when you would like to come. Hospital
              staff will call you to confirm the appointment.
            </p>

            <div className="mt-6 space-y-3 rounded-2xl border border-border/80 bg-card p-5">
              <p className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
                Requests are reviewed during normal working hours. This form does
                not confirm a booking.
              </p>
              {info?.phone?.trim() && (
                <p className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                  <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>
                    Prefer to call?{" "}
                    <a
                      href={`tel:${info.phone.replace(/\s+/g, "")}`}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {info.phone}
                    </a>
                  </span>
                </p>
              )}
              <p className="border-t border-border/70 pt-3 text-xs leading-5 text-muted-foreground">
                {emergency ? (
                  <>
                    For an emergency, call{" "}
                    <a
                      href={`tel:${emergency.replace(/\s+/g, "")}`}
                      className="font-semibold text-brand hover:underline"
                    >
                      {emergency}
                    </a>{" "}
                    or go to the nearest emergency department.
                  </>
                ) : (
                  <>
                    For an emergency, go to the nearest emergency department.
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-[0_24px_70px_-50px_rgba(20,60,40,0.5)] sm:p-8">
            {submitted ? (
              <div className="flex min-h-[360px] flex-col items-start justify-center">
                <span className="grid size-12 place-items-center rounded-full bg-secondary text-primary">
                  <CheckCircle2 className="size-6" />
                </span>
                <h3 className="mt-5 font-display text-3xl tracking-tight">
                  Request received.
                </h3>
                <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">
                  Thank you, {submitted.name}. Hospital staff will call you to
                  confirm your appointment for{" "}
                  <span className="font-medium text-foreground">
                    {new Date(`${submitted.date}T00:00:00`).toLocaleDateString(
                      "en-GB",
                      {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      },
                    )}
                  </span>
                  .
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-6 rounded-full"
                  onClick={resetForm}
                >
                  Book another appointment
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="appointment-name">
                      Patient's full name{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="appointment-name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Full name"
                      autoComplete="name"
                      maxLength={120}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="appointment-phone">
                      Phone number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="appointment-phone"
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="e.g. 024 000 0000"
                      autoComplete="tel"
                      maxLength={40}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="appointment-email">Email (optional)</Label>
                    <Input
                      id="appointment-email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      maxLength={160}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="appointment-service">Department</Label>
                    <Select value={service} onValueChange={setService}>
                      <SelectTrigger id="appointment-service" className="w-full">
                        <SelectValue placeholder="Choose a department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">
                          General outpatient
                        </SelectItem>
                        {services.map((item) => (
                          <SelectItem key={item._id} value={item.title}>
                            {item.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="appointment-date">
                      Preferred date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="appointment-date"
                      type="date"
                      min={today}
                      value={preferredDate}
                      onChange={(event) => setPreferredDate(event.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="appointment-time">Preferred time</Label>
                    <Select
                      value={preferredTime}
                      onValueChange={(value) =>
                        setPreferredTime(value as PreferredTime)
                      }
                    >
                      <SelectTrigger id="appointment-time" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(TIME_LABELS) as PreferredTime[]).map(
                          (value) => (
                            <SelectItem key={value} value={value}>
                              {TIME_LABELS[value]}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="appointment-reason">
                    Reason for visit (optional)
                  </Label>
                  <Textarea
                    id="appointment-reason"
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    rows={3}
                    maxLength={1000}
                    placeholder="Briefly describe the symptoms or the care needed."
                  />
                </div>

                {error && (
                  <p
                    role="alert"
                    className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm leading-6 text-destructive"
                  >
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting}
                  className="mt-1 w-full rounded-full"
                >
                  {submitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <CalendarCheck className="size-4" />
                  )}
                  {submitting ? "Sending request…" : "Request appointment"}
                </Button>

                <p className="text-center text-[11px] leading-5 text-muted-foreground">
                  By submitting, you agree to be contacted by the hospital about
                  this request.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
