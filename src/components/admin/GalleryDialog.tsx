import {
  MediaField,
  emptyImage,
  type ImageValue,
} from "@/components/admin/MediaFields";
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
import type { SiteGalleryItem } from "@/lib/site";
import { useMutation } from "convex/react";
import { ImageIcon, Loader2, Video } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type GalleryKind = "image" | "video";

export function GalleryDialog({
  open,
  onOpenChange,
  item,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: SiteGalleryItem | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
        <GalleryForm
          key={item?._id ?? "new-gallery-item"}
          item={item}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function GalleryForm({
  item,
  onDone,
}: {
  item: SiteGalleryItem | null;
  onDone: () => void;
}) {
  const createGalleryItem = useMutation(api.content.createGalleryItem);
  const updateGalleryItem = useMutation(api.content.updateGalleryItem);

  const [title, setTitle] = useState(item?.title ?? "");
  const [kind, setKind] = useState<GalleryKind>(item?.kind ?? "image");
  const [media, setMedia] = useState<ImageValue>({
    storageId: item?.mediaId ?? null,
    url: item?.mediaUrl ?? "",
    preview: item?.src ?? "",
  });
  const [isPublished, setIsPublished] = useState(item?.isPublished ?? false);
  const [saving, setSaving] = useState(false);

  function changeKind(next: GalleryKind) {
    if (next === kind) return;
    setKind(next);
    setMedia(emptyImage());
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      toast.error("Add a title for this gallery item.");
      return;
    }
    if (!media.preview.trim()) {
      toast.error(kind === "image" ? "Add a photo." : "Add a video.");
      return;
    }

    setSaving(true);
    try {
      if (item) {
        await updateGalleryItem({
          id: item._id,
          title: title.trim(),
          kind,
          mediaId: media.storageId ?? "",
          mediaUrl: media.storageId ? "" : media.url.trim(),
          isPublished,
        });
        toast.success("Gallery item updated.");
      } else {
        await createGalleryItem({
          title: title.trim(),
          kind,
          mediaId: media.storageId ?? undefined,
          mediaUrl: media.storageId ? undefined : media.url.trim() || undefined,
          isPublished,
        });
        toast.success(
          isPublished
            ? "Gallery item published to the website."
            : "Gallery item saved as a draft.",
        );
      }
      onDone();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not save this gallery item.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle className="font-display text-2xl">
          {item ? "Edit gallery item" : "Add to the gallery"}
        </DialogTitle>
        <DialogDescription>
          Titled photos and videos appear in the public “Photo & video gallery”
          once published.
        </DialogDescription>
      </DialogHeader>

      <div className="mt-5 grid gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="gallery-title">
            Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="gallery-title"
            value={title}
            placeholder="Maternal health team at work"
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label>Media type</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={kind === "image" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => changeKind("image")}
            >
              <ImageIcon className="size-4" />
              Photo
            </Button>
            <Button
              type="button"
              variant={kind === "video" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => changeKind("video")}
            >
              <Video className="size-4" />
              Video
            </Button>
          </div>
        </div>

        <MediaField
          id="gallery-media"
          label={kind === "image" ? "Photo" : "Video"}
          kind={kind}
          value={media}
          onChange={setMedia}
          hint={
            kind === "video"
              ? "Upload an MP4/WebM up to 40 MB, or paste a YouTube or video URL."
              : "JPG or PNG, up to 8 MB, or paste an image URL."
          }
        />

        <div className="flex items-start justify-between gap-5 rounded-xl border bg-secondary/30 p-4">
          <div>
            <p className="text-sm font-medium">Published</p>
            <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
              Published items appear in the public gallery immediately.
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
          {item ? "Save changes" : "Add to gallery"}
        </Button>
      </DialogFooter>
    </form>
  );
}
