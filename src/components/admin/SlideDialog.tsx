import { Button, buttonVariants } from "@/components/ui/button";
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
import type { SiteSlide } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { ImageIcon, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export function SlideDialog({
  open,
  onOpenChange,
  slide,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slide: SiteSlide | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <SlideForm
          key={slide?._id ?? "new-slide"}
          slide={slide}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function SlideForm({
  slide,
  onDone,
}: {
  slide: SiteSlide | null;
  onDone: () => void;
}) {
  const createSlide = useMutation(api.content.createSlide);
  const updateSlide = useMutation(api.content.updateSlide);
  const generateUploadUrl = useMutation(api.content.generateUploadUrl);
  const fileRef = useRef<HTMLInputElement>(null);

  const [eyebrow, setEyebrow] = useState(slide?.eyebrow ?? "");
  const [title, setTitle] = useState(slide?.title ?? "");
  const [subtitle, setSubtitle] = useState(slide?.subtitle ?? "");
  const [imageUrl, setImageUrl] = useState(slide?.imageUrl ?? "");
  const [storageId, setStorageId] = useState<string | null>(
    slide?.storageId ?? null,
  );
  const [preview, setPreview] = useState(slide?.image ?? "");
  const [ctaLabel, setCtaLabel] = useState(slide?.ctaLabel ?? "");
  const [ctaHref, setCtaHref] = useState(slide?.ctaHref ?? "");
  const [isPublished, setIsPublished] = useState(slide?.isPublished ?? false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Banner images must be smaller than 8 MB.");
      return;
    }

    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl({});
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!response.ok) throw new Error("The image upload failed.");
      const result = (await response.json()) as { storageId?: string };
      if (!result.storageId) throw new Error("The upload returned no file id.");

      setStorageId(result.storageId);
      setImageUrl("");
      setPreview(URL.createObjectURL(file));
      toast.success("Image uploaded. Save the slide to keep it.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not upload that image.",
      );
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      toast.error("Add a headline before saving.");
      return;
    }

    setSaving(true);
    try {
      const shared = {
        title: title.trim(),
        eyebrow: eyebrow.trim(),
        subtitle: subtitle.trim(),
        imageUrl: storageId ? "" : imageUrl.trim(),
        ctaLabel: ctaLabel.trim(),
        ctaHref: ctaHref.trim(),
        isPublished,
      };

      if (slide) {
        await updateSlide({
          id: slide._id,
          ...shared,
          storageId: storageId ?? "",
        });
        toast.success("Slider banner updated.");
      } else {
        await createSlide({
          ...shared,
          storageId: storageId ?? undefined,
        });
        toast.success(
          isPublished
            ? "Slider banner published to the homepage."
            : "Slider banner saved as a draft.",
        );
      }
      onDone();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save this slide.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle className="font-display text-2xl">
          {slide ? "Edit slider banner" : "New slider banner"}
        </DialogTitle>
        <DialogDescription>
          Slides appear in the homepage banner in the order shown on the Slider
          tab. Drafts stay hidden from visitors.
        </DialogDescription>
      </DialogHeader>

      <div className="mt-5 grid gap-5">
        <div className="space-y-2">
          <div className="relative aspect-[16/7] overflow-hidden rounded-xl border bg-muted">
            {preview ? (
              <img
                src={preview}
                alt="Banner preview"
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <ImageIcon className="size-6" />
                <span className="text-xs">No banner image selected</span>
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 grid place-items-center bg-background/75">
                <Loader2 className="size-5 animate-spin text-primary" />
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "cursor-pointer",
                uploading ? "pointer-events-none opacity-50" : "",
              )}
            >
              <Upload className="size-4" />
              Upload image
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => handleFile(event.target.files?.[0])}
              />
            </label>
            {preview && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPreview("");
                  setImageUrl("");
                  setStorageId(null);
                }}
              >
                Remove image
              </Button>
            )}
            <span className="text-[11px] text-muted-foreground">
              JPG or PNG, up to 8 MB · wide images work best
            </span>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="slide-image-url">…or paste an image URL</Label>
            <Input
              id="slide-image-url"
              value={imageUrl}
              placeholder="https://example.com/banner.jpg"
              onChange={(event) => {
                setImageUrl(event.target.value);
                setStorageId(null);
                setPreview(event.target.value);
              }}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_1.2fr]">
          <div className="space-y-1.5">
            <Label htmlFor="slide-eyebrow">Eyebrow</Label>
            <Input
              id="slide-eyebrow"
              value={eyebrow}
              placeholder="Maternal & child health"
              onChange={(event) => setEyebrow(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="slide-title">
              Headline <span className="text-destructive">*</span>
            </Label>
            <Input
              id="slide-title"
              value={title}
              placeholder="Quality care, close to home."
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="slide-subtitle">Supporting text</Label>
          <Textarea
            id="slide-subtitle"
            value={subtitle}
            rows={3}
            placeholder="A short line about the service, announcement or message in this banner."
            onChange={(event) => setSubtitle(event.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="slide-cta-label">Button label</Label>
            <Input
              id="slide-cta-label"
              value={ctaLabel}
              placeholder="Plan your visit"
              onChange={(event) => setCtaLabel(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="slide-cta-href">Button link</Label>
            <Input
              id="slide-cta-href"
              value={ctaHref}
              placeholder="#visit"
              onChange={(event) => setCtaHref(event.target.value)}
            />
          </div>
        </div>

        <div className="flex items-start justify-between gap-5 rounded-xl border bg-secondary/30 p-4">
          <div>
            <p className="text-sm font-medium">Published</p>
            <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
              Published slides appear on the public homepage immediately.
            </p>
          </div>
          <Switch checked={isPublished} onCheckedChange={setIsPublished} />
        </div>
      </div>

      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving || uploading}>
          {saving && <Loader2 className="size-4 animate-spin" />}
          {slide ? "Save changes" : "Create slide"}
        </Button>
      </DialogFooter>
    </form>
  );
}
