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
import type { ManagementMember } from "@/lib/site";
import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ManagementDialog({
  open,
  onOpenChange,
  member,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: ManagementMember | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
        <ManagementForm
          key={member?._id ?? "new-management-member"}
          member={member}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function ManagementForm({
  member,
  onDone,
}: {
  member: ManagementMember | null;
  onDone: () => void;
}) {
  const createMember = useMutation(api.content.createManagementMember);
  const updateMember = useMutation(api.content.updateManagementMember);

  const [name, setName] = useState(member?.name ?? "");
  const [role, setRole] = useState(member?.role ?? "");
  const [bio, setBio] = useState(member?.bio ?? "");
  const [photo, setPhoto] = useState<ImageValue>({
    storageId: member?.photoId ?? null,
    url: member?.photoUrl ?? "",
    preview: member?.photo ?? "",
  });
  const [isPublished, setIsPublished] = useState(member?.isPublished ?? false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      toast.error("Add the management member's name before saving.");
      return;
    }
    if (!role.trim()) {
      toast.error("Add a role or title before saving.");
      return;
    }

    setSaving(true);
    try {
      const shared = {
        name: name.trim(),
        role: role.trim(),
        bio: bio.trim(),
        isPublished,
      };

      if (member) {
        await updateMember({
          id: member._id,
          ...shared,
          photoId: photo.storageId ?? "",
          photoUrl: photo.storageId ? "" : photo.url.trim(),
        });
        toast.success("Management profile updated.");
      } else {
        await createMember({
          ...shared,
          photoId: photo.storageId ?? undefined,
          photoUrl: photo.storageId ? undefined : photo.url.trim() || undefined,
        });
        toast.success(
          isPublished
            ? "Management member published to the website."
            : "Management member saved as a draft.",
        );
      }
      onDone();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not save this management profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle className="font-display text-2xl">
          {member ? "Edit management member" : "Add a management member"}
        </DialogTitle>
        <DialogDescription>
          Management profiles appear in the “Hospital management” section of the
          public website once published.
        </DialogDescription>
      </DialogHeader>

      <div className="mt-5 grid gap-4">
        <ImageField
          id="management-photo"
          label="Profile picture"
          value={photo}
          onChange={setPhoto}
          shape="portrait"
          hint="A clear portrait works best. JPG or PNG, up to 8 MB."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="management-name">
              Full name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="management-name"
              value={name}
              placeholder="Mrs. Abena Darko"
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="management-role">
              Role or title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="management-role"
              value={role}
              placeholder="Hospital Administrator"
              onChange={(event) => setRole(event.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="management-bio">Short profile</Label>
          <Textarea
            id="management-bio"
            value={bio}
            rows={4}
            placeholder="Responsibilities and a short welcome note."
            onChange={(event) => setBio(event.target.value)}
          />
        </div>

        <div className="flex items-start justify-between gap-5 rounded-xl border bg-secondary/30 p-4">
          <div>
            <p className="text-sm font-medium">Published</p>
            <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
              Published profiles appear on the public website immediately.
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
          {member ? "Save changes" : "Add member"}
        </Button>
      </DialogFooter>
    </form>
  );
}
