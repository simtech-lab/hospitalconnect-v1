import { ServiceIcon, SERVICE_ICON_OPTIONS } from "@/components/site/ServiceIcon";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { SiteService } from "@/lib/site";
import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ServiceDialog({
  open,
  onOpenChange,
  service,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: SiteService | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
        <ServiceForm
          key={service?._id ?? "new-service"}
          service={service}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function ServiceForm({
  service,
  onDone,
}: {
  service: SiteService | null;
  onDone: () => void;
}) {
  const createService = useMutation(api.content.createService);
  const updateService = useMutation(api.content.updateService);

  const [title, setTitle] = useState(service?.title ?? "");
  const [description, setDescription] = useState(service?.description ?? "");
  const [icon, setIcon] = useState(service?.icon ?? "stethoscope");
  const [isPublished, setIsPublished] = useState(service?.isPublished ?? false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      toast.error("Add a service name before saving.");
      return;
    }

    setSaving(true);
    try {
      const shared = {
        title: title.trim(),
        description: description.trim(),
        icon,
        isPublished,
      };

      if (service) {
        await updateService({ id: service._id, ...shared });
        toast.success("Service updated.");
      } else {
        await createService(shared);
        toast.success(
          isPublished
            ? "Service published to the hospital information page."
            : "Service saved as a draft.",
        );
      }
      onDone();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save this service.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle className="font-display text-2xl">
          {service ? "Edit service" : "New service"}
        </DialogTitle>
        <DialogDescription>
          Services appear in the departments section of the public hospital
          information page.
        </DialogDescription>
      </DialogHeader>

      <div className="mt-5 grid gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="service-title">
            Service name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="service-title"
            value={title}
            placeholder="Outpatient Department"
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="service-description">Description</Label>
          <Textarea
            id="service-description"
            value={description}
            rows={4}
            placeholder="What this service offers and who it is for."
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="service-icon">Icon</Label>
          <Select value={icon} onValueChange={setIcon}>
            <SelectTrigger id="service-icon" className="w-full">
              <SelectValue placeholder="Choose an icon" />
            </SelectTrigger>
            <SelectContent>
              {SERVICE_ICON_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <ServiceIcon name={option.value} className="size-4" />
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-start justify-between gap-5 rounded-xl border bg-secondary/30 p-4">
          <div>
            <p className="text-sm font-medium">Published</p>
            <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
              Published services appear on the public website immediately.
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
          {service ? "Save changes" : "Create service"}
        </Button>
      </DialogFooter>
    </form>
  );
}
