import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import {
  ImageIcon,
  ImagePlus,
  Link2,
  Loader2,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export type ImageValue = {
  storageId: string | null;
  url: string;
  preview: string;
};

export function emptyImage(): ImageValue {
  return { storageId: null, url: "", preview: "" };
}

async function uploadFile(uploadUrl: string, file: File) {
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!response.ok) throw new Error("The file upload failed.");
  const result = (await response.json()) as { storageId?: string };
  if (!result.storageId) throw new Error("The upload returned no file id.");
  return result.storageId;
}

export function ImageField({
  id,
  label,
  value,
  onChange,
  shape = "wide",
  hint,
}: {
  id: string;
  label: string;
  value: ImageValue;
  onChange: (value: ImageValue) => void;
  shape?: "wide" | "portrait";
  hint?: string;
}) {
  const generateUploadUrl = useMutation(api.content.generateUploadUrl);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Images must be smaller than 8 MB.");
      return;
    }

    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl({});
      const storageId = await uploadFile(uploadUrl, file);
      onChange({
        storageId,
        url: "",
        preview: URL.createObjectURL(file),
      });
      toast.success("Image uploaded. Save to keep it.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not upload that image.",
      );
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={`${id}-url`}>{label}</Label>

      <div className="flex flex-wrap items-start gap-4">
        <div
          className={cn(
            "relative overflow-hidden rounded-xl border bg-muted",
            shape === "portrait"
              ? "aspect-[4/5] w-32 shrink-0"
              : "aspect-[16/8] w-full",
          )}
        >
          {value.preview ? (
            <img
              src={value.preview}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <ImageIcon className="size-6" />
              <span className="text-[11px]">No image</span>
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
            {value.preview ? "Replace" : "Upload"}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => handleFile(event.target.files?.[0])}
            />
          </label>
          {value.preview && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange(emptyImage())}
            >
              <Trash2 className="size-4" />
              Remove
            </Button>
          )}
          <span className="max-w-48 text-[11px] leading-5 text-muted-foreground">
            {hint ?? "JPG or PNG, up to 8 MB"}
          </span>
        </div>
      </div>

      <Input
        id={`${id}-url`}
        value={value.storageId ? "" : value.url}
        disabled={Boolean(value.storageId)}
        placeholder="…or paste an image URL"
        onChange={(event) =>
          onChange({
            storageId: null,
            url: event.target.value,
            preview: event.target.value,
          })
        }
      />
      {value.storageId && (
        <p className="text-[11px] text-muted-foreground">
          Uploaded image selected. Remove it if you would rather link an image
          URL.
        </p>
      )}
    </div>
  );
}

export type MediaDraft = {
  key: string;
  storageId: string | null;
  url: string;
  preview: string;
};

function mediaKey() {
  return `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function MediaListEditor({
  label,
  hint,
  kind = "image",
  items,
  onChange,
}: {
  label: string;
  hint: string;
  kind?: "image" | "video";
  items: MediaDraft[];
  onChange: (items: MediaDraft[]) => void;
}) {
  const generateUploadUrl = useMutation(api.content.generateUploadUrl);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const isVideo = kind === "video";

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;

    const maxMb = isVideo ? 40 : 8;
    const chosen = Array.from(files);
    const wrongType = chosen.find((file) =>
      isVideo
        ? !file.type.startsWith("video/")
        : !file.type.startsWith("image/"),
    );
    if (wrongType) {
      toast.error(
        isVideo ? "Choose video files." : "Choose image files.",
      );
      return;
    }
    const tooLarge = chosen.find((file) => file.size > maxMb * 1024 * 1024);
    if (tooLarge) {
      toast.error(`Files must be smaller than ${maxMb} MB.`);
      return;
    }

    setUploading(true);
    try {
      const added: MediaDraft[] = [];
      for (const file of chosen) {
        const uploadUrl = await generateUploadUrl({});
        const storageId = await uploadFile(uploadUrl, file);
        added.push({
          key: mediaKey(),
          storageId,
          url: "",
          preview: URL.createObjectURL(file),
        });
      }
      onChange([...items, ...added]);
      toast.success(
        `${added.length} ${isVideo ? "video" : "photo"}${
          added.length === 1 ? "" : "s"
        } uploaded. Save to keep them.`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not upload that file.",
      );
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function updateItem(key: string, patch: Partial<MediaDraft>) {
    onChange(
      items.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    );
  }

  function removeItem(key: string) {
    onChange(items.filter((item) => item.key !== key));
  }

  function addUrl() {
    onChange([
      ...items,
      { key: mediaKey(), storageId: null, url: "", preview: "" },
    ]);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label>{label}</Label>
        <span className="text-[11px] text-muted-foreground">
          {items.length} added
        </span>
      </div>

      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.key}
              className="flex items-center gap-3 rounded-xl border bg-secondary/20 p-2"
            >
              <div className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-muted text-muted-foreground">
                {item.preview ? (
                  isVideo ? (
                    <video
                      src={item.preview}
                      muted
                      className="size-full object-cover"
                    />
                  ) : (
                    <img
                      src={item.preview}
                      alt=""
                      className="size-full object-cover"
                    />
                  )
                ) : isVideo ? (
                  <Video className="size-5" />
                ) : (
                  <ImagePlus className="size-5" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                {item.storageId ? (
                  <p className="text-xs text-muted-foreground">
                    Uploaded {isVideo ? "video" : "photo"} · ready to save
                  </p>
                ) : (
                  <Input
                    value={item.url}
                    placeholder={
                      isVideo
                        ? "YouTube link or video URL"
                        : "https://…/photo.jpg"
                    }
                    onChange={(event) =>
                      updateItem(item.key, {
                        url: event.target.value,
                        preview: event.target.value,
                      })
                    }
                  />
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => removeItem(item.key)}
                aria-label={`Remove ${isVideo ? "video" : "photo"}`}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <label
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "cursor-pointer",
            uploading ? "pointer-events-none opacity-50" : "",
          )}
        >
          <Upload className="size-4" />
          Upload {isVideo ? "video" : "photos"}
          <input
            ref={fileRef}
            type="file"
            accept={isVideo ? "video/*" : "image/*"}
            multiple={!isVideo}
            className="hidden"
            onChange={(event) => handleFiles(event.target.files)}
          />
        </label>
        <Button type="button" variant="outline" size="sm" onClick={addUrl}>
          <Link2 className="size-4" />
          Add by URL
        </Button>
        {uploading && (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        )}
        <span className="text-[11px] leading-5 text-muted-foreground">{hint}</span>
      </div>
    </div>
  );
}
