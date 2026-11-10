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
import { api } from "@/convex/_generated/api";
import type { SitePartner } from "@/lib/site";
import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function PartnerDialog({
  open,
  onOpenChange,
  partner,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner: SitePartner | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <PartnerForm
          key={partner?._id ?? "new-partner"}
          partner={partner}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function PartnerForm({
  partner,
  onDone,
}: {
  partner: SitePartner | null;
  onDone: () => void;
}) {
  const createPartner = useMutation(api.content.createPartner);
  const updatePartner = useMutation(api.content.updatePartner);

  const [name, setName] = useState(partner?.name ?? "");
  const [logo, setLogo] = useState<ImageValue>({
    storageId: partner?.logoId ?? null,
    url: partner?.logoUrl ?? "",
    preview: partner?.logo ?? "",
  });
  const [isPublished, setIsPublished] = useState(partner?.isPublished ?? false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      toast.error("Add the partner's name before saving.");
      return;
    }
    if (!logo.preview.trim()) {
      toast.error("Add the partner's logo before saving.");
      return;
    }

    setSaving(true);
    try {
      if (partner) {
        await updatePartner({
          id: partner._id,
          name: name.trim(),
          logoId: logo.storageId ?? "",
          logoUrl: logo.storageId ? "" : logo.url.trim(),
          isPublished,
        });
        toast.success("Partner updated.");
      } else {
        await createPartner({
          name: name.trim(),
          logoId: logo.storageId ?? undefined,
          logoUrl: logo.storageId ? undefined : logo.url.trim() || undefined,
          isPublished,
        });
        toast.success(
          isPublished
            ? "Partner published to the website."
            : "Partner saved as a draft.",
        );
      }
      onDone();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not save this partner.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle className="font-display text-2xl">
          {partner ? "Edit partner" : "Add a partner"}
        </DialogTitle>
        <DialogDescription>
          Partner logos appear in the “In partnership with” strip on the public
          website once published.
        </DialogDescription>
      </DialogHeader>

      <div className="mt-5 grid gap-5">
        <ImageField
          id="partner-logo"
          label="Partner logo"
          value={logo}
          onChange={setLogo}
          shape="logo"
          hint="PNG with a transparent background works best, up to 8 MB."
        />

        <div className="space-y-1.5">
          <Label htmlFor="partner-name">
            Partner name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="partner-name"
            value={name}
            placeholder="Ghana Health Service"
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>

        <div className="flex items-start justify-between gap-5 rounded-xl border bg-secondary/30 p-4">
          <div>
            <p className="text-sm font-medium">Published</p>
            <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
              Published partners appear on the public website immediately.
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
          {partner ? "Save changes" : "Add partner"}
        </Button>
      </DialogFooter>
    </form>
  );
}
