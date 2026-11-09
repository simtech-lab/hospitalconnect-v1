import {
  ImageField,
  MediaListEditor,
  type ImageValue,
  type MediaDraft,
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
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { fromDateTimeLocal, toDateTimeLocal } from "@/lib/date";
import type { SiteEvent } from "@/lib/site";
import { useMutation } from "convex/react";
import { CalendarDays, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function defaultStart() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(9, 0, 0, 0);
  return date.getTime();
}

function mediaPayload(
  items: MediaDraft[],
): { storageId?: string; url?: string }[] {
  return items.flatMap((item): { storageId?: string; url?: string }[] => {
    if (item.storageId) return [{ storageId: item.storageId }];
    const url = item.url.trim();
    return url ? [{ url }] : [];
  });
}

export function EventDialog({
  open,
  onOpenChange,
  event,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: SiteEvent | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <EventForm
          key={event?._id ?? "new-event"}
          event={event}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function EventForm({
  event,
  onDone,
}: {
  event: SiteEvent | null;
  onDone: () => void;
}) {
  const createEvent = useMutation(api.content.createEvent);
  const updateEvent = useMutation(api.content.updateEvent);

  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [location, setLocation] = useState(event?.location ?? "");
  const [startsAt, setStartsAt] = useState(
    toDateTimeLocal(event?.startsAt ?? defaultStart()),
  );
  const [endsAt, setEndsAt] = useState(
    event?.endsAt ? toDateTimeLocal(event.endsAt) : "",
  );
  const [flyer, setFlyer] = useState<ImageValue>({
    storageId: event?.flyerId ?? null,
    url: event?.flyerUrl ?? "",
    preview: event?.flyer ?? "",
  });
  const [images, setImages] = useState<MediaDraft[]>(() =>
    (event?.images ?? []).map((item, index) => ({
      key: `existing-image-${index}`,
      storageId: item.storageId ?? null,
      url: item.url ?? "",
      preview: item.preview,
    })),
  );
  const [videos, setVideos] = useState<MediaDraft[]>(() =>
    (event?.videos ?? []).map((item, index) => ({
      key: `existing-video-${index}`,
      storageId: item.storageId ?? null,
      url: item.url ?? "",
      preview: item.preview,
    })),
  );
  const [isPublished, setIsPublished] = useState(event?.isPublished ?? false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(submitEvent: React.FormEvent) {
    submitEvent.preventDefault();
    if (!title.trim()) {
      toast.error("Add a title for the event.");
      return;
    }
    if (!description.trim()) {
      toast.error("Add a description for the event.");
      return;
    }

    const start = fromDateTimeLocal(startsAt);
    if (start === null) {
      toast.error("Choose a valid start date and time.");
      return;
    }
    const end = fromDateTimeLocal(endsAt);
    if (endsAt && end === null) {
      toast.error("The end time is not valid.");
      return;
    }
    if (end !== null && end < start) {
      toast.error("An event cannot end before it starts.");
      return;
    }

    setSaving(true);
    try {
      const shared = {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        startsAt: start,
        flyerId: flyer.storageId ?? "",
        flyerUrl: flyer.storageId ? "" : flyer.url.trim(),
        images: mediaPayload(images),
        videos: mediaPayload(videos),
        isPublished,
      };

      if (event) {
        await updateEvent({
          id: event._id,
          ...shared,
          endsAt: end ?? 0,
        });
        toast.success("Event updated.");
      } else {
        await createEvent({
          ...shared,
          endsAt: end ?? undefined,
          flyerId: flyer.storageId ?? undefined,
          flyerUrl: flyer.storageId
            ? undefined
            : flyer.url.trim() || undefined,
        });
        toast.success(
          isPublished
            ? "Event published to the website."
            : "Event saved as a draft.",
        );
      }
      onDone();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save this event.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 font-display text-2xl">
          <CalendarDays className="size-5 text-primary" />
          {event ? "Edit event" : "Create an upcoming event"}
        </DialogTitle>
        <DialogDescription>
          Events appear in the “Upcoming events” section of the public website
          with their flyer, photos and videos.
        </DialogDescription>
      </DialogHeader>

      <div className="mt-5 grid gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="event-title">
              Event title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="event-title"
              value={title}
              placeholder="Community health screening"
              onChange={(input) => setTitle(input.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="event-location">Location</Label>
            <Input
              id="event-location"
              value={location}
              placeholder="Atibie Market Square"
              onChange={(input) => setLocation(input.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="event-starts">
              Starts <span className="text-destructive">*</span>
            </Label>
            <Input
              id="event-starts"
              type="datetime-local"
              value={startsAt}
              onChange={(input) => setStartsAt(input.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="event-ends">Ends (optional)</Label>
            <Input
              id="event-ends"
              type="datetime-local"
              value={endsAt}
              onChange={(input) => setEndsAt(input.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="event-description">
            Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="event-description"
            value={description}
            rows={4}
            placeholder="What is happening, who it is for and what visitors should expect."
            onChange={(input) => setDescription(input.target.value)}
            required
          />
        </div>

        <ImageField
          id="event-flyer"
          label="Flyer"
          value={flyer}
          onChange={setFlyer}
          hint="The main image shown on the event card. JPG or PNG, up to 8 MB."
        />

        <div className="rounded-xl border bg-card p-4">
          <MediaListEditor
            label="Photos"
            hint="Upload several photos, or add image links."
            items={images}
            onChange={setImages}
          />
        </div>

        <div className="rounded-xl border bg-card p-4">
          <MediaListEditor
            label="Videos"
            hint="Upload a video file or add a YouTube link."
            kind="video"
            items={videos}
            onChange={setVideos}
          />
        </div>

        <div className="flex items-start justify-between gap-5 rounded-xl border bg-secondary/30 p-4">
          <div>
            <p className="text-sm font-medium">Published</p>
            <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
              Published events appear on the public website immediately.
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
          {event ? "Save changes" : "Create event"}
        </Button>
      </DialogFooter>
    </form>
  );
}
