import { ImageField, type ImageValue } from "@/components/admin/MediaFields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { SiteDoctor } from "@/lib/site";
import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function DoctorDialog({
  open,
  onOpenChange,
  doctor,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor: SiteDoctor | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
        <DoctorForm
          key={doctor?._id ?? "new-doctor"}
          doctor={doctor}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function DoctorForm({
  doctor,
  onDone,
}: {
  doctor: SiteDoctor | null;
  onDone: () => void;
}) {
  const createDoctor = useMutation(api.content.createDoctor);
  const updateDoctor = useMutation(api.content.updateDoctor);

  const [name, setName] = useState(doctor?.name ?? "");
  const [specialty, setSpecialty] = useState(doctor?.specialty ?? "");
  const [bio, setBio] = useState(doctor?.bio ?? "");
  const [photo, setPhoto] = useState<ImageValue>({
    storageId: doctor?.photoId ?? null,
    url: doctor?.photoUrl ?? "",
    preview: doctor?.photo ?? "",
  });
  const [isPublished, setIsPublished] = useState(doctor?.isPublished ?? false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      toast.error("Add the doctor's name before saving.");
      return;
    }
    if (!specialty.trim()) {
      toast.error("Add the doctor's specialty before saving.");
      return;
    }

    setSaving(true);
    try {
      const shared = {
        name: name.trim(),
        specialty: specialty.trim(),
        bio: bio.trim(),
        isPublished,
      };

      if (doctor) {
        await updateDoctor({
          id: doctor._id,
          ...shared,
          photoId: photo.storageId ?? "",
          photoUrl: photo.storageId ? "" : photo.url.trim(),
        });
        toast.success("Doctor profile updated.");
      } else {
        await createDoctor({
          ...shared,
          photoId: photo.storageId ?? undefined,
          photoUrl: photo.storageId ? undefined : photo.url.trim() || undefined,
        });
        toast.success(
          isPublished
            ? "Doctor profile published to the website."
            : "Doctor profile saved as a draft.",
        );
      }
      onDone();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not save this doctor profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle className="font-display text-2xl">
          {doctor ? "Edit doctor" : "Add a doctor"}
        </DialogTitle>
        <DialogDescription>
          Doctor profiles appear in the “Our doctors” section of the public
          website once published.
        </DialogDescription>
      </DialogHeader>

      <div className="mt-5 grid gap-4">
        <ImageField
          id="doctor-photo"
          label="Profile picture"
          value={photo}
          onChange={setPhoto}
          shape="portrait"
          hint="A clear portrait works best. JPG or PNG, up to 8 MB."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="doctor-name">
              Full name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="doctor-name"
              value={name}
              placeholder="Dr. Ama Boateng"
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="doctor-specialty">
              Specialty <span className="text-destructive">*</span>
            </Label>
            <Input
              id="doctor-specialty"
              value={specialty}
              placeholder="Obstetrics & Gynaecology"
              onChange={(event) => setSpecialty(event.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="doctor-bio">Short profile</Label>
          <Textarea
            id="doctor-bio"
            value={bio}
            rows={4}
            placeholder="Areas of practice, experience or a short welcome note."
            onChange={(event) => setBio(event.target.value)}
          />
        </div>

        <div className="flex items-start justify-between gap-5 rounded-xl border bg-secondary/30 p-4">
          <div>
            <p className="text-sm font-medium">Published</p>
            <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
              Published doctors appear on the public website immediately.
            </p>
          </div>
          <Switch checked={isPublished} onCheckedChange={setIsPublished} />
        </div>
      </div>

      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="size-4 animate-spin" />}
          {doctor ? "Save changes" : "Add doctor"}
        </Button>
      </DialogFooter>
    </form>
  );
}
