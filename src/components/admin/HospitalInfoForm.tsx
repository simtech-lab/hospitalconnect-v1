import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { HospitalInfo } from "@/lib/site";
import { DEFAULT_HOSPITAL_NAME } from "@/lib/site";
import { useMutation } from "convex/react";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4 border-b border-border/70 pb-3">
      <h3 className="font-display text-xl tracking-tight">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
    </div>
  );
}

export function HospitalInfoForm({ info }: { info: HospitalInfo | null }) {
  const saveHospitalInfo = useMutation(api.content.saveHospitalInfo);

  const [name, setName] = useState(info?.name ?? DEFAULT_HOSPITAL_NAME);
  const [tagline, setTagline] = useState(info?.tagline ?? "");
  const [about, setAbout] = useState(info?.about ?? "");
  const [mission, setMission] = useState(info?.mission ?? "");
  const [vision, setVision] = useState(info?.vision ?? "");
  const [opdHours, setOpdHours] = useState(info?.opdHours ?? "");
  const [visitingHours, setVisitingHours] = useState(info?.visitingHours ?? "");
  const [emergencyLine, setEmergencyLine] = useState(
    info?.emergencyLine ?? "",
  );
  const [phone, setPhone] = useState(info?.phone ?? "");
  const [email, setEmail] = useState(info?.email ?? "");
  const [address, setAddress] = useState(info?.address ?? "");
  const [bedCapacity, setBedCapacity] = useState(info?.bedCapacity ?? "");
  const [staffCount, setStaffCount] = useState(info?.staffCount ?? "");
  const [foundedYear, setFoundedYear] = useState(info?.foundedYear ?? "");
  const [isPublished, setIsPublished] = useState(info?.isPublished ?? false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      toast.error("Add the hospital's name before saving.");
      return;
    }

    setSaving(true);
    try {
      await saveHospitalInfo({
        name,
        tagline,
        about,
        mission,
        vision,
        opdHours,
        visitingHours,
        emergencyLine,
        phone,
        email,
        address,
        bedCapacity,
        staffCount,
        foundedYear,
        isPublished,
      });
      toast.success(
        isPublished
          ? "Hospital information saved and published."
          : "Hospital information saved as a draft.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not save the hospital information.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card">
        <div className="flex flex-col gap-4 border-b border-border/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="font-display text-2xl tracking-tight">
              Hospital information
            </h2>
            <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
              The profile, opening hours and contact details shown across the
              public website.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Badge
              variant={isPublished ? "default" : "secondary"}
              className="rounded-full"
            >
              {isPublished ? "Published" : "Draft"}
            </Badge>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Check className="size-4" />
              )}
              Save changes
            </Button>
          </div>
        </div>

        <div className="grid gap-9 p-5 sm:p-6">
          <section>
            <SectionTitle
              title="Identity"
              description="The hospital's name and the line that sits beneath it on the homepage."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="info-name">Hospital name</Label>
                <Input
                  id="info-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="info-tagline">Tagline</Label>
                <Input
                  id="info-tagline"
                  value={tagline}
                  placeholder="Compassionate, accessible healthcare for the Kwahu ridge."
                  onChange={(event) => setTagline(event.target.value)}
                />
              </div>
            </div>
          </section>

          <section>
            <SectionTitle
              title="Profile"
              description="The hospital's story, mission and vision. These appear in the About section."
            />
            <div className="grid gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="info-about">About the hospital</Label>
                <Textarea
                  id="info-about"
                  value={about}
                  rows={6}
                  placeholder="Describe the hospital, the communities it serves and the care it provides."
                  onChange={(event) => setAbout(event.target.value)}
                />
                <p className="text-[11px] text-muted-foreground">
                  Leave a blank line between paragraphs.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="info-mission">Mission</Label>
                  <Textarea
                    id="info-mission"
                    value={mission}
                    rows={3}
                    onChange={(event) => setMission(event.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="info-vision">Vision</Label>
                  <Textarea
                    id="info-vision"
                    value={vision}
                    rows={3}
                    onChange={(event) => setVision(event.target.value)}
                  />
                </div>
              </div>
            </div>
          </section>

          <section>
            <SectionTitle
              title="Opening & visiting hours"
              description="Shown in the Plan your visit section and the top information bar."
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="info-opd">Outpatient (OPD) hours</Label>
                <Input
                  id="info-opd"
                  value={opdHours}
                  placeholder="Monday – Friday · 8:00 AM – 4:00 PM"
                  onChange={(event) => setOpdHours(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="info-visiting">Visiting hours</Label>
                <Input
                  id="info-visiting"
                  value={visitingHours}
                  placeholder="Daily · 2:00 PM – 4:00 PM"
                  onChange={(event) => setVisitingHours(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="info-emergency">Emergency line</Label>
                <Input
                  id="info-emergency"
                  value={emergencyLine}
                  placeholder="+233 …"
                  onChange={(event) => setEmergencyLine(event.target.value)}
                />
              </div>
            </div>
          </section>

          <section>
            <SectionTitle
              title="Contact & location"
              description="Used in the contact panel, footer and the Get directions link."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="info-phone">Phone</Label>
                <Input
                  id="info-phone"
                  value={phone}
                  placeholder="Hospital switchboard"
                  onChange={(event) => setPhone(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="info-email">Email</Label>
                <Input
                  id="info-email"
                  type="email"
                  value={email}
                  placeholder="info@example.gov.gh"
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="info-address">Address</Label>
                <Input
                  id="info-address"
                  value={address}
                  placeholder="Atibie, Kwahu South District, Eastern Region, Ghana"
                  onChange={(event) => setAddress(event.target.value)}
                />
              </div>
            </div>
          </section>

          <section>
            <SectionTitle
              title="Hospital at a glance"
              description="Optional figures. They appear in the facts strip below the homepage banner."
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="info-beds">Inpatient beds</Label>
                <Input
                  id="info-beds"
                  value={bedCapacity}
                  placeholder="e.g. 120"
                  onChange={(event) => setBedCapacity(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="info-staff">Staff members</Label>
                <Input
                  id="info-staff"
                  value={staffCount}
                  placeholder="e.g. 240"
                  onChange={(event) => setStaffCount(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="info-founded">Serving since</Label>
                <Input
                  id="info-founded"
                  value={foundedYear}
                  placeholder="e.g. 1957"
                  onChange={(event) => setFoundedYear(event.target.value)}
                />
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-4 rounded-xl border bg-secondary/30 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Publish this information</p>
              <p className="mt-0.5 max-w-lg text-xs leading-5 text-muted-foreground">
                Drafts are saved for administrators but hidden from visitors.
                Publishing makes the profile, hours and contacts visible on the
                public website.
              </p>
            </div>
            <Switch
              checked={isPublished}
              onCheckedChange={setIsPublished}
              aria-label="Publish hospital information"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving} className="min-w-40">
              {saving && <Loader2 className="size-4 animate-spin" />}
              Save changes
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
