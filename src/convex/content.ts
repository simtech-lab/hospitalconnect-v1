import { v } from "convex/values";
import { requireAdmin } from "./authz";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { internalMutation, mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** Resolve the best available image for a slide (uploaded file first). */
async function slideWithImage(ctx: QueryCtx, slide: Doc<"slides">) {
  const uploaded = slide.storageId
    ? await ctx.storage.getUrl(slide.storageId)
    : null;
  return {
    ...slide,
    image: uploaded ?? slide.imageUrl ?? null,
  };
}

async function slidesInOrder(ctx: QueryCtx) {
  return await ctx.db.query("slides").withIndex("by_order").collect();
}

async function servicesInOrder(ctx: QueryCtx) {
  return await ctx.db.query("services").withIndex("by_order").collect();
}

const mediaItemValidator = v.object({
  storageId: v.optional(v.string()),
  url: v.optional(v.string()),
});

/** Resolve an uploaded profile photo, falling back to a pasted URL. */
async function profilePhoto(
  ctx: QueryCtx,
  photoId: Id<"_storage"> | undefined,
  photoUrl: string | undefined,
) {
  const uploaded = photoId ? await ctx.storage.getUrl(photoId) : null;
  return uploaded ?? photoUrl ?? null;
}

/** Resolve a partner logo and a gallery item's image or video. */
async function partnerWithLogo(ctx: QueryCtx, partner: Doc<"partners">) {
  return {
    ...partner,
    logo: await profilePhoto(ctx, partner.logoId, partner.logoUrl),
  };
}

async function galleryItemWithMedia(ctx: QueryCtx, item: Doc<"gallery">) {
  return {
    ...item,
    src: await profilePhoto(ctx, item.mediaId, item.mediaUrl),
  };
}

/** Attach resolved URLs to an event's flyer and media library. */
async function eventWithMedia(ctx: QueryCtx, event: Doc<"events">) {
  const uploadedFlyer = event.flyerId
    ? await ctx.storage.getUrl(event.flyerId)
    : null;

  const images = await Promise.all(
    event.images.map(async (item) => ({
      ...item,
      preview:
        (item.storageId ? await ctx.storage.getUrl(item.storageId) : null) ??
        item.url ??
        "",
    })),
  );

  const videos = await Promise.all(
    event.videos.map(async (item) => ({
      ...item,
      preview:
        (item.storageId ? await ctx.storage.getUrl(item.storageId) : null) ??
        item.url ??
        "",
    })),
  );

  return {
    ...event,
    flyer: uploadedFlyer ?? event.flyerUrl ?? null,
    images,
    videos,
  };
}

function mediaInput(
  items: { storageId?: string; url?: string }[],
): { storageId?: Id<"_storage">; url?: string }[] {
  return items
    .map((item) => ({
      storageId: item.storageId
        ? (item.storageId as Id<"_storage">)
        : undefined,
      url: item.url?.trim() || undefined,
    }))
    .filter((item) => item.storageId || item.url);
}

async function deleteStorageFile(
  ctx: MutationCtx,
  storageId: Id<"_storage"> | undefined,
) {
  if (!storageId) return;
  await ctx.storage.delete(storageId);
}

/* -------------------------------------------------------------------------- */
/* Public website                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Everything the public website displays. Only published records are
 * returned, so drafts created in the console never leak to visitors.
 */
export const getPublicSite = query({
  args: {},
  handler: async (ctx) => {
    const infoDoc = await ctx.db.query("hospitalInfo").first();
    const slides = (await slidesInOrder(ctx)).filter((slide) => slide.isPublished);
    const services = (await servicesInOrder(ctx)).filter(
      (service) => service.isPublished,
    );
    const doctors = (
      await ctx.db.query("doctors").withIndex("by_order").collect()
    ).filter((doctor) => doctor.isPublished);
    const management = (
      await ctx.db.query("management").withIndex("by_order").collect()
    ).filter((member) => member.isPublished);
    const events = (
      await ctx.db.query("events").withIndex("by_starts").collect()
    ).filter((event) => event.isPublished);
    const partners = (
      await ctx.db.query("partners").withIndex("by_order").collect()
    ).filter((partner) => partner.isPublished);
    const gallery = (
      await ctx.db.query("gallery").withIndex("by_order").collect()
    ).filter((item) => item.isPublished);

    return {
      info: infoDoc?.isPublished ? infoDoc : null,
      slides: await Promise.all(
        slides.map((slide) => slideWithImage(ctx, slide)),
      ),
      services,
      doctors: await Promise.all(
        doctors.map(async (doctor) => ({
          ...doctor,
          photo: await profilePhoto(ctx, doctor.photoId, doctor.photoUrl),
        })),
      ),
      management: await Promise.all(
        management.map(async (member) => ({
          ...member,
          photo: await profilePhoto(ctx, member.photoId, member.photoUrl),
        })),
      ),
      events: await Promise.all(events.map((event) => eventWithMedia(ctx, event))),
      partners: await Promise.all(partners.map((partner) => partnerWithLogo(ctx, partner))),
      gallery: await Promise.all(gallery.map((item) => galleryItemWithMedia(ctx, item))),
    };
  },
});

/* -------------------------------------------------------------------------- */
/* Administrator console                                                      */
/* -------------------------------------------------------------------------- */

/** Drafts and published records together, for the console. */
export const getAdminSite = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const infoDoc = await ctx.db.query("hospitalInfo").first();
    const slides = await slidesInOrder(ctx);
    const services = await servicesInOrder(ctx);
    const doctors = await ctx.db
      .query("doctors")
      .withIndex("by_order")
      .collect();
    const management = await ctx.db
      .query("management")
      .withIndex("by_order")
      .collect();
    const events = await ctx.db
      .query("events")
      .withIndex("by_starts")
      .collect();
    const partners = await ctx.db
      .query("partners")
      .withIndex("by_order")
      .collect();
    const gallery = await ctx.db
      .query("gallery")
      .withIndex("by_order")
      .collect();

    return {
      info: infoDoc ?? null,
      slides: await Promise.all(
        slides.map((slide) => slideWithImage(ctx, slide)),
      ),
      services,
      doctors: await Promise.all(
        doctors.map(async (doctor) => ({
          ...doctor,
          photo: await profilePhoto(ctx, doctor.photoId, doctor.photoUrl),
        })),
      ),
      management: await Promise.all(
        management.map(async (member) => ({
          ...member,
          photo: await profilePhoto(ctx, member.photoId, member.photoUrl),
        })),
      ),
      events: await Promise.all(events.map((event) => eventWithMedia(ctx, event))),
      partners: await Promise.all(partners.map((partner) => partnerWithLogo(ctx, partner))),
      gallery: await Promise.all(gallery.map((item) => galleryItemWithMedia(ctx, item))),
    };
  },
});

/** Short-lived upload target for slider images. */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const createSlide = mutation({
  args: {
    title: v.string(),
    eyebrow: v.optional(v.string()),
    subtitle: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    storageId: v.optional(v.string()),
    ctaLabel: v.optional(v.string()),
    ctaHref: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const title = args.title.trim();
    if (!title) throw new Error("A slide needs a headline.");

    const slides = await slidesInOrder(ctx);
    const order = slides.reduce((max, slide) => Math.max(max, slide.order), -1) + 1;

    return await ctx.db.insert("slides", {
      title,
      eyebrow: args.eyebrow?.trim() || undefined,
      subtitle: args.subtitle?.trim() || undefined,
      imageUrl: args.imageUrl?.trim() || undefined,
      storageId: args.storageId ? (args.storageId as Id<"_storage">) : undefined,
      ctaLabel: args.ctaLabel?.trim() || undefined,
      ctaHref: args.ctaHref?.trim() || undefined,
      order,
      isPublished: args.isPublished ?? false,
      updatedAt: Date.now(),
    });
  },
});

export const updateSlide = mutation({
  args: {
    id: v.id("slides"),
    title: v.optional(v.string()),
    eyebrow: v.optional(v.string()),
    subtitle: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    storageId: v.optional(v.string()),
    ctaLabel: v.optional(v.string()),
    ctaHref: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("That slide no longer exists.");

    const patch: Partial<Doc<"slides">> = { updatedAt: Date.now() };
    if (args.title !== undefined) {
      const title = args.title.trim();
      if (!title) throw new Error("A slide needs a headline.");
      patch.title = title;
    }
    if (args.eyebrow !== undefined) patch.eyebrow = args.eyebrow.trim() || undefined;
    if (args.subtitle !== undefined) patch.subtitle = args.subtitle.trim() || undefined;
    if (args.imageUrl !== undefined) patch.imageUrl = args.imageUrl.trim() || undefined;
    if (args.storageId !== undefined) {
      patch.storageId = args.storageId
        ? (args.storageId as Id<"_storage">)
        : undefined;
    }
    if (args.ctaLabel !== undefined) patch.ctaLabel = args.ctaLabel.trim() || undefined;
    if (args.ctaHref !== undefined) patch.ctaHref = args.ctaHref.trim() || undefined;
    if (args.isPublished !== undefined) patch.isPublished = args.isPublished;

    if (
      args.storageId &&
      existing.storageId &&
      existing.storageId !== args.storageId
    ) {
      await ctx.storage.delete(existing.storageId);
    }

    await ctx.db.patch(args.id, patch);
  },
});

export const deleteSlide = mutation({
  args: { id: v.id("slides") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const slide = await ctx.db.get(args.id);
    if (!slide) return;
    if (slide.storageId) {
      await ctx.storage.delete(slide.storageId);
    }
    await ctx.db.delete(args.id);
  },
});

/** Persist the console's custom slide order. */
export const reorderSlides = mutation({
  args: { ids: v.array(v.id("slides")) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    for (const [index, id] of args.ids.entries()) {
      await ctx.db.patch(id, { order: index, updatedAt: Date.now() });
    }
  },
});

export const createService = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    icon: v.string(),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const title = args.title.trim();
    if (!title) throw new Error("A service needs a name.");

    const services = await servicesInOrder(ctx);
    const order = services.reduce((max, service) => Math.max(max, service.order), -1) + 1;

    return await ctx.db.insert("services", {
      title,
      description: args.description.trim(),
      icon: args.icon,
      order,
      isPublished: args.isPublished ?? false,
      updatedAt: Date.now(),
    });
  },
});

export const updateService = mutation({
  args: {
    id: v.id("services"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("That service no longer exists.");

    const patch: Partial<Doc<"services">> = { updatedAt: Date.now() };
    if (args.title !== undefined) {
      const title = args.title.trim();
      if (!title) throw new Error("A service needs a name.");
      patch.title = title;
    }
    if (args.description !== undefined) patch.description = args.description.trim();
    if (args.icon !== undefined) patch.icon = args.icon;
    if (args.isPublished !== undefined) patch.isPublished = args.isPublished;

    await ctx.db.patch(args.id, patch);
  },
});

export const deleteService = mutation({
  args: { id: v.id("services") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});

export const reorderServices = mutation({
  args: { ids: v.array(v.id("services")) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    for (const [index, id] of args.ids.entries()) {
      await ctx.db.patch(id, { order: index, updatedAt: Date.now() });
    }
  },
});

/* -------------------------------------------------------------------------- */
/* Doctors                                                                    */
/* -------------------------------------------------------------------------- */

export const createDoctor = mutation({
  args: {
    name: v.string(),
    specialty: v.string(),
    bio: v.optional(v.string()),
    photoId: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const name = args.name.trim();
    const specialty = args.specialty.trim();
    if (!name) throw new Error("A doctor needs a name.");
    if (!specialty) throw new Error("A doctor needs a specialty.");

    const doctors = await ctx.db.query("doctors").withIndex("by_order").collect();
    const order = doctors.reduce((max, doctor) => Math.max(max, doctor.order), -1) + 1;

    return await ctx.db.insert("doctors", {
      name,
      specialty,
      bio: args.bio?.trim() || undefined,
      photoId: args.photoId ? (args.photoId as Id<"_storage">) : undefined,
      photoUrl: args.photoUrl?.trim() || undefined,
      isPublished: args.isPublished ?? false,
      order,
      updatedAt: Date.now(),
    });
  },
});

export const updateDoctor = mutation({
  args: {
    id: v.id("doctors"),
    name: v.optional(v.string()),
    specialty: v.optional(v.string()),
    bio: v.optional(v.string()),
    photoId: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("That doctor no longer exists.");

    const patch: Partial<Doc<"doctors">> = { updatedAt: Date.now() };
    if (args.name !== undefined) {
      const name = args.name.trim();
      if (!name) throw new Error("A doctor needs a name.");
      patch.name = name;
    }
    if (args.specialty !== undefined) {
      const specialty = args.specialty.trim();
      if (!specialty) throw new Error("A doctor needs a specialty.");
      patch.specialty = specialty;
    }
    if (args.bio !== undefined) patch.bio = args.bio.trim() || undefined;
    if (args.photoId !== undefined) {
      if (args.photoId) {
        const nextPhotoId = args.photoId as Id<"_storage">;
        if (existing.photoId && existing.photoId !== nextPhotoId) {
          await deleteStorageFile(ctx, existing.photoId);
        }
        patch.photoId = nextPhotoId;
      } else {
        await deleteStorageFile(ctx, existing.photoId);
        patch.photoId = undefined;
      }
    }
    if (args.photoUrl !== undefined) patch.photoUrl = args.photoUrl.trim() || undefined;
    if (args.isPublished !== undefined) patch.isPublished = args.isPublished;

    await ctx.db.patch(args.id, patch);
  },
});

export const deleteDoctor = mutation({
  args: { id: v.id("doctors") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const doctor = await ctx.db.get(args.id);
    if (!doctor) return;
    await deleteStorageFile(ctx, doctor.photoId);
    await ctx.db.delete(args.id);
  },
});

export const reorderDoctors = mutation({
  args: { ids: v.array(v.id("doctors")) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    for (const [index, id] of args.ids.entries()) {
      await ctx.db.patch(id, { order: index, updatedAt: Date.now() });
    }
  },
});

/* -------------------------------------------------------------------------- */
/* Management                                                                 */
/* -------------------------------------------------------------------------- */

export const createManagementMember = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    bio: v.optional(v.string()),
    photoId: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const name = args.name.trim();
    const role = args.role.trim();
    if (!name) throw new Error("A management member needs a name.");
    if (!role) throw new Error("Add a role or title for this management member.");

    const members = await ctx.db
      .query("management")
      .withIndex("by_order")
      .collect();
    const order = members.reduce((max, member) => Math.max(max, member.order), -1) + 1;

    return await ctx.db.insert("management", {
      name,
      role,
      bio: args.bio?.trim() || undefined,
      photoId: args.photoId ? (args.photoId as Id<"_storage">) : undefined,
      photoUrl: args.photoUrl?.trim() || undefined,
      isPublished: args.isPublished ?? false,
      order,
      updatedAt: Date.now(),
    });
  },
});

export const updateManagementMember = mutation({
  args: {
    id: v.id("management"),
    name: v.optional(v.string()),
    role: v.optional(v.string()),
    bio: v.optional(v.string()),
    photoId: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("That management member no longer exists.");

    const patch: Partial<Doc<"management">> = { updatedAt: Date.now() };
    if (args.name !== undefined) {
      const name = args.name.trim();
      if (!name) throw new Error("A management member needs a name.");
      patch.name = name;
    }
    if (args.role !== undefined) {
      const role = args.role.trim();
      if (!role) throw new Error("Add a role or title for this management member.");
      patch.role = role;
    }
    if (args.bio !== undefined) patch.bio = args.bio.trim() || undefined;
    if (args.photoId !== undefined) {
      if (args.photoId) {
        const nextPhotoId = args.photoId as Id<"_storage">;
        if (existing.photoId && existing.photoId !== nextPhotoId) {
          await deleteStorageFile(ctx, existing.photoId);
        }
        patch.photoId = nextPhotoId;
      } else {
        await deleteStorageFile(ctx, existing.photoId);
        patch.photoId = undefined;
      }
    }
    if (args.photoUrl !== undefined) patch.photoUrl = args.photoUrl.trim() || undefined;
    if (args.isPublished !== undefined) patch.isPublished = args.isPublished;

    await ctx.db.patch(args.id, patch);
  },
});

export const deleteManagementMember = mutation({
  args: { id: v.id("management") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const member = await ctx.db.get(args.id);
    if (!member) return;
    await deleteStorageFile(ctx, member.photoId);
    await ctx.db.delete(args.id);
  },
});

export const reorderManagement = mutation({
  args: { ids: v.array(v.id("management")) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    for (const [index, id] of args.ids.entries()) {
      await ctx.db.patch(id, { order: index, updatedAt: Date.now() });
    }
  },
});

/* -------------------------------------------------------------------------- */
/* Events                                                                     */
/* -------------------------------------------------------------------------- */

function validateEventWindow(startsAt: number, endsAt?: number) {
  if (!Number.isFinite(startsAt) || startsAt <= 0) {
    throw new Error("Choose a start date and time for the event.");
  }
  if (endsAt !== undefined && endsAt > 0 && endsAt < startsAt) {
    throw new Error("An event cannot end before it starts.");
  }
}

export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    location: v.optional(v.string()),
    startsAt: v.number(),
    endsAt: v.optional(v.number()),
    flyerId: v.optional(v.string()),
    flyerUrl: v.optional(v.string()),
    images: v.optional(v.array(mediaItemValidator)),
    videos: v.optional(v.array(mediaItemValidator)),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const title = args.title.trim();
    const description = args.description.trim();
    if (!title) throw new Error("An event needs a title.");
    if (!description) throw new Error("Add a description for this event.");
    validateEventWindow(args.startsAt, args.endsAt);

    return await ctx.db.insert("events", {
      title,
      description,
      location: args.location?.trim() || undefined,
      startsAt: args.startsAt,
      endsAt: args.endsAt && args.endsAt > 0 ? args.endsAt : undefined,
      flyerId: args.flyerId ? (args.flyerId as Id<"_storage">) : undefined,
      flyerUrl: args.flyerUrl?.trim() || undefined,
      images: mediaInput(args.images ?? []),
      videos: mediaInput(args.videos ?? []),
      isPublished: args.isPublished ?? false,
      updatedAt: Date.now(),
    });
  },
});

export const updateEvent = mutation({
  args: {
    id: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    startsAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    flyerId: v.optional(v.string()),
    flyerUrl: v.optional(v.string()),
    images: v.optional(v.array(mediaItemValidator)),
    videos: v.optional(v.array(mediaItemValidator)),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("That event no longer exists.");

    const nextStartsAt = args.startsAt ?? existing.startsAt;
    const nextEndsAt = args.endsAt ?? existing.endsAt;
    validateEventWindow(nextStartsAt, nextEndsAt);

    const patch: Partial<Doc<"events">> = { updatedAt: Date.now() };
    if (args.title !== undefined) {
      const title = args.title.trim();
      if (!title) throw new Error("An event needs a title.");
      patch.title = title;
    }
    if (args.description !== undefined) {
      const description = args.description.trim();
      if (!description) throw new Error("Add a description for this event.");
      patch.description = description;
    }
    if (args.location !== undefined) patch.location = args.location.trim() || undefined;
    if (args.startsAt !== undefined) patch.startsAt = args.startsAt;
    if (args.endsAt !== undefined) {
      patch.endsAt = args.endsAt > 0 ? args.endsAt : undefined;
    }

    if (args.flyerId !== undefined) {
      if (args.flyerId) {
        const nextFlyerId = args.flyerId as Id<"_storage">;
        if (existing.flyerId && existing.flyerId !== nextFlyerId) {
          await deleteStorageFile(ctx, existing.flyerId);
        }
        patch.flyerId = nextFlyerId;
      } else {
        await deleteStorageFile(ctx, existing.flyerId);
        patch.flyerId = undefined;
      }
    }
    if (args.flyerUrl !== undefined) patch.flyerUrl = args.flyerUrl.trim() || undefined;

    if (args.images !== undefined) {
      const nextImages = mediaInput(args.images);
      const keep = new Set(
        nextImages.flatMap((item) => (item.storageId ? [item.storageId] : [])),
      );
      for (const image of existing.images) {
        if (image.storageId && !keep.has(image.storageId)) {
          await deleteStorageFile(ctx, image.storageId);
        }
      }
      patch.images = nextImages;
    }

    if (args.videos !== undefined) {
      const nextVideos = mediaInput(args.videos);
      const keep = new Set(
        nextVideos.flatMap((item) => (item.storageId ? [item.storageId] : [])),
      );
      for (const video of existing.videos) {
        if (video.storageId && !keep.has(video.storageId)) {
          await deleteStorageFile(ctx, video.storageId);
        }
      }
      patch.videos = nextVideos;
    }

    if (args.isPublished !== undefined) patch.isPublished = args.isPublished;

    await ctx.db.patch(args.id, patch);
  },
});

export const deleteEvent = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const event = await ctx.db.get(args.id);
    if (!event) return;
    await deleteStorageFile(ctx, event.flyerId);
    for (const media of [...event.images, ...event.videos]) {
      await deleteStorageFile(ctx, media.storageId);
    }
    await ctx.db.delete(args.id);
  },
});

/* -------------------------------------------------------------------------- */
/* Partners                                                                   */
/* -------------------------------------------------------------------------- */

export const createPartner = mutation({
  args: {
    name: v.string(),
    logoId: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const name = args.name.trim();
    if (!name) throw new Error("A partner needs a name.");
    if (!args.logoId && !args.logoUrl?.trim()) {
      throw new Error("Add a logo for this partner.");
    }

    const partners = await ctx.db
      .query("partners")
      .withIndex("by_order")
      .collect();
    const order =
      partners.reduce((max, partner) => Math.max(max, partner.order), -1) + 1;

    return await ctx.db.insert("partners", {
      name,
      logoId: args.logoId ? (args.logoId as Id<"_storage">) : undefined,
      logoUrl: args.logoUrl?.trim() || undefined,
      isPublished: args.isPublished ?? false,
      order,
      updatedAt: Date.now(),
    });
  },
});

export const updatePartner = mutation({
  args: {
    id: v.id("partners"),
    name: v.optional(v.string()),
    logoId: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("That partner no longer exists.");

    const patch: Partial<Doc<"partners">> = { updatedAt: Date.now() };
    if (args.name !== undefined) {
      const name = args.name.trim();
      if (!name) throw new Error("A partner needs a name.");
      patch.name = name;
    }

    const nextLogoId =
      args.logoId !== undefined
        ? args.logoId
          ? (args.logoId as Id<"_storage">)
          : undefined
        : existing.logoId;
    const nextLogoUrl =
      args.logoUrl !== undefined
        ? args.logoUrl.trim() || undefined
        : existing.logoUrl;
    if (!nextLogoId && !nextLogoUrl) {
      throw new Error("Add a logo for this partner.");
    }

    if (args.logoId !== undefined) {
      if (args.logoId) {
        const nextLogoId = args.logoId as Id<"_storage">;
        if (existing.logoId && existing.logoId !== nextLogoId) {
          await deleteStorageFile(ctx, existing.logoId);
        }
        patch.logoId = nextLogoId;
      } else {
        await deleteStorageFile(ctx, existing.logoId);
        patch.logoId = undefined;
      }
    }
    if (args.logoUrl !== undefined) patch.logoUrl = args.logoUrl.trim() || undefined;
    if (args.isPublished !== undefined) patch.isPublished = args.isPublished;

    await ctx.db.patch(args.id, patch);
  },
});

export const deletePartner = mutation({
  args: { id: v.id("partners") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const partner = await ctx.db.get(args.id);
    if (!partner) return;
    await deleteStorageFile(ctx, partner.logoId);
    await ctx.db.delete(args.id);
  },
});

export const reorderPartners = mutation({
  args: { ids: v.array(v.id("partners")) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    for (const [index, id] of args.ids.entries()) {
      await ctx.db.patch(id, { order: index, updatedAt: Date.now() });
    }
  },
});

/* -------------------------------------------------------------------------- */
/* Gallery                                                                    */
/* -------------------------------------------------------------------------- */

export const createGalleryItem = mutation({
  args: {
    title: v.string(),
    kind: v.union(v.literal("image"), v.literal("video")),
    mediaId: v.optional(v.string()),
    mediaUrl: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const title = args.title.trim();
    if (!title) throw new Error("Add a title for this gallery item.");
    if (!args.mediaId && !args.mediaUrl?.trim()) {
      throw new Error(
        args.kind === "image" ? "Add a photo." : "Add a video.",
      );
    }

    const items = await ctx.db.query("gallery").withIndex("by_order").collect();
    const order = items.reduce((max, item) => Math.max(max, item.order), -1) + 1;

    return await ctx.db.insert("gallery", {
      title,
      kind: args.kind,
      mediaId: args.mediaId ? (args.mediaId as Id<"_storage">) : undefined,
      mediaUrl: args.mediaUrl?.trim() || undefined,
      isPublished: args.isPublished ?? false,
      order,
      updatedAt: Date.now(),
    });
  },
});

export const updateGalleryItem = mutation({
  args: {
    id: v.id("gallery"),
    title: v.optional(v.string()),
    kind: v.optional(v.union(v.literal("image"), v.literal("video"))),
    mediaId: v.optional(v.string()),
    mediaUrl: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("That gallery item no longer exists.");

    const patch: Partial<Doc<"gallery">> = { updatedAt: Date.now() };
    if (args.title !== undefined) {
      const title = args.title.trim();
      if (!title) throw new Error("Add a title for this gallery item.");
      patch.title = title;
    }
    if (args.kind !== undefined) patch.kind = args.kind;

    const nextMediaId =
      args.mediaId !== undefined
        ? args.mediaId
          ? (args.mediaId as Id<"_storage">)
          : undefined
        : existing.mediaId;
    const nextMediaUrl =
      args.mediaUrl !== undefined
        ? args.mediaUrl.trim() || undefined
        : existing.mediaUrl;
    if (!nextMediaId && !nextMediaUrl) {
      throw new Error(
        (patch.kind ?? existing.kind) === "image"
          ? "Add a photo."
          : "Add a video.",
      );
    }

    if (args.mediaId !== undefined) {
      if (args.mediaId) {
        const nextMediaId = args.mediaId as Id<"_storage">;
        if (existing.mediaId && existing.mediaId !== nextMediaId) {
          await deleteStorageFile(ctx, existing.mediaId);
        }
        patch.mediaId = nextMediaId;
      } else {
        await deleteStorageFile(ctx, existing.mediaId);
        patch.mediaId = undefined;
      }
    }
    if (args.mediaUrl !== undefined) patch.mediaUrl = args.mediaUrl.trim() || undefined;
    if (args.isPublished !== undefined) patch.isPublished = args.isPublished;

    await ctx.db.patch(args.id, patch);
  },
});

export const deleteGalleryItem = mutation({
  args: { id: v.id("gallery") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const item = await ctx.db.get(args.id);
    if (!item) return;
    await deleteStorageFile(ctx, item.mediaId);
    await ctx.db.delete(args.id);
  },
});

export const reorderGallery = mutation({
  args: { ids: v.array(v.id("gallery")) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    for (const [index, id] of args.ids.entries()) {
      await ctx.db.patch(id, { order: index, updatedAt: Date.now() });
    }
  },
});

/** Create or update the single hospital information record. */
export const saveHospitalInfo = mutation({
  args: {
    name: v.string(),
    tagline: v.string(),
    about: v.string(),
    mission: v.string(),
    vision: v.string(),
    opdHours: v.string(),
    visitingHours: v.string(),
    emergencyLine: v.string(),
    phone: v.string(),
    email: v.string(),
    address: v.string(),
    bedCapacity: v.string(),
    staffCount: v.string(),
    foundedYear: v.string(),
    isPublished: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const name = args.name.trim();
    if (!name) throw new Error("The hospital needs a name.");

    const payload = {
      key: "main" as const,
      name,
      tagline: args.tagline.trim(),
      about: args.about.trim(),
      mission: args.mission.trim(),
      vision: args.vision.trim(),
      opdHours: args.opdHours.trim(),
      visitingHours: args.visitingHours.trim(),
      emergencyLine: args.emergencyLine.trim(),
      phone: args.phone.trim(),
      email: args.email.trim(),
      address: args.address.trim(),
      bedCapacity: args.bedCapacity.trim() || undefined,
      staffCount: args.staffCount.trim() || undefined,
      foundedYear: args.foundedYear.trim() || undefined,
      isPublished: args.isPublished,
      updatedAt: Date.now(),
    };

    const existing = await ctx.db.query("hospitalInfo").first();
    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }
    return await ctx.db.insert("hospitalInfo", payload);
  },
});

async function insertStarterContent(ctx: MutationCtx) {
  const created = {
    info: false,
    slides: 0,
    services: 0,
    doctors: 0,
    management: 0,
    events: 0,
    partners: 0,
    gallery: 0,
  };

    const existingInfo = await ctx.db.query("hospitalInfo").first();
    if (!existingInfo) {
      await ctx.db.insert("hospitalInfo", {
        key: "main",
        name: "Kwahu Government Hospital",
        tagline: "Compassionate, accessible healthcare for the Kwahu ridge.",
        about:
          "Kwahu Government Hospital is a public health facility serving the people of the Kwahu ridge and the surrounding communities of the Eastern Region of Ghana.\n\nOur teams provide outpatient care, maternal and child health, emergency services, diagnostics and public health outreach, with referral to specialist centres when a higher level of care is needed.",
        mission:
          "To deliver accessible, safe and compassionate healthcare to every person who comes through our doors, with dignity and respect.",
        vision:
          "A healthier Kwahu community, with trusted public healthcare close to home.",
        opdHours: "Monday – Friday · 8:00 AM – 4:00 PM",
        visitingHours: "Daily · 2:00 PM – 4:00 PM",
        emergencyLine: "",
        phone: "",
        email: "",
        address: "Atibie, Kwahu South District, Eastern Region, Ghana",
        bedCapacity: undefined,
        staffCount: undefined,
        foundedYear: undefined,
        isPublished: true,
        updatedAt: Date.now(),
      });
      created.info = true;
    }

    const slides = await slidesInOrder(ctx);
    if (slides.length === 0) {
      const starterSlides = [
        {
          eyebrow: "Welcome to Kwahu Government Hospital",
          title: "Quality care, close to home.",
          subtitle:
            "Serving families across the Kwahu ridge with dependable outpatient, maternal and emergency services.",
          imageUrl:
            "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1800&q=80",
          ctaLabel: "Plan your visit",
          ctaHref: "#visit",
        },
        {
          eyebrow: "Maternal & child health",
          title: "Safer births, healthier beginnings.",
          subtitle:
            "Antenatal care, safe delivery and child welfare services delivered by a team that knows your community.",
          imageUrl:
            "https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=1800&q=80",
          ctaLabel: "Explore our services",
          ctaHref: "#services",
        },
        {
          eyebrow: "Community outreach",
          title: "Health that reaches every community.",
          subtitle:
            "Screening, immunisation and public health education that bring care beyond the hospital walls.",
          imageUrl:
            "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1800&q=80",
          ctaLabel: "About the hospital",
          ctaHref: "#about",
        },
      ];

      for (const [index, slide] of starterSlides.entries()) {
        await ctx.db.insert("slides", {
          ...slide,
          order: index,
          isPublished: true,
          updatedAt: Date.now(),
        });
        created.slides += 1;
      }
    }

    const services = await servicesInOrder(ctx);
    if (services.length === 0) {
      const starterServices = [
        {
          title: "Outpatient Department",
          description:
            "General consultations, reviews and referrals for adults and children, with a daily outpatient clinic.",
          icon: "stethoscope",
        },
        {
          title: "Maternal & Child Health",
          description:
            "Antenatal and postnatal care, safe delivery, family planning and child welfare clinics.",
          icon: "baby",
        },
        {
          title: "Emergency & Accident",
          description:
            "Urgent assessment and stabilisation for injuries and sudden illness, with onward referral when needed.",
          icon: "ambulance",
        },
        {
          title: "Laboratory & Diagnostics",
          description:
            "Routine blood work, pathology and diagnostic support for accurate, timely clinical decisions.",
          icon: "flask",
        },
        {
          title: "Pharmacy",
          description:
            "Dispensing and medication counselling so patients leave with the treatment they need.",
          icon: "pill",
        },
        {
          title: "Public Health & Outreach",
          description:
            "Immunisation, health screening, disease surveillance and community education across the district.",
          icon: "shield",
        },
      ];

      for (const [index, service] of starterServices.entries()) {
        await ctx.db.insert("services", {
          ...service,
          order: index,
          isPublished: true,
          updatedAt: Date.now(),
        });
        created.services += 1;
      }
    }

    const doctors = await ctx.db
      .query("doctors")
      .withIndex("by_order")
      .collect();
    if (doctors.length === 0) {
      const starterDoctors = [
        {
          name: "Dr. Kwame Asante",
          specialty: "General Surgery",
          bio: "General and emergency surgical care, including abdominal, hernia and trauma procedures.",
          photoUrl:
            "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=900&q=80",
        },
        {
          name: "Dr. Ama Boateng",
          specialty: "Obstetrics & Gynaecology",
          bio: "Antenatal care, safe delivery and women's health, with a focus on supporting first-time mothers.",
          photoUrl:
            "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=900&q=80",
        },
        {
          name: "Dr. Yaw Owusu",
          specialty: "Internal Medicine",
          bio: "Diagnosis and management of adult medical conditions, including hypertension and diabetes.",
          photoUrl:
            "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=900&q=80",
        },
        {
          name: "Dr. Akosua Mensah",
          specialty: "Paediatrics",
          bio: "Child health, growth monitoring, immunisation and the care of newborns and young children.",
          photoUrl:
            "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=80",
        },
      ];

      for (const [index, doctor] of starterDoctors.entries()) {
        await ctx.db.insert("doctors", {
          ...doctor,
          order: index,
          isPublished: true,
          updatedAt: Date.now(),
        });
        created.doctors += 1;
      }
    }

    const management = await ctx.db
      .query("management")
      .withIndex("by_order")
      .collect();
    if (management.length === 0) {
      const starterManagement = [
        {
          name: "Dr. Esi Frimpong",
          role: "Medical Director",
          bio: "Leads clinical services and quality improvement across the hospital.",
          photoUrl:
            "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=900&q=80",
        },
        {
          name: "Mrs. Abena Darko",
          role: "Hospital Administrator",
          bio: "Oversees hospital administration, patient services and community relations.",
          photoUrl:
            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=80",
        },
        {
          name: "Mr. Emmanuel Agyapong",
          role: "Finance & Administration",
          bio: "Responsible for finance, procurement and support services.",
          photoUrl:
            "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=80",
        },
      ];

      for (const [index, member] of starterManagement.entries()) {
        await ctx.db.insert("management", {
          ...member,
          order: index,
          isPublished: true,
          updatedAt: Date.now(),
        });
        created.management += 1;
      }
    }

    const events = await ctx.db
      .query("events")
      .withIndex("by_starts")
      .collect();
    if (events.length === 0) {
      const upcoming = (days: number, hour: number, minute = 0) => {
        const date = new Date();
        date.setDate(date.getDate() + days);
        date.setHours(hour, minute, 0, 0);
        return date.getTime();
      };

      const starterEvents = [
        {
          title: "Community health screening at Atibie market",
          description:
            "Free blood pressure and blood sugar checks, health education and referrals for adults and older people in the community. Our public health team will be at the market square from morning until mid-afternoon.",
          location: "Atibie Market Square",
          startsAt: upcoming(12, 8, 30),
          endsAt: upcoming(12, 15),
          flyerUrl:
            "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1400&q=80",
          images: [
            {
              url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
            },
            {
              url: "https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=1200&q=80",
            },
          ],
          videos: [],
        },
        {
          title: "Maternal health open day",
          description:
            "Meet our midwives and doctors, tour the maternity unit and learn about antenatal care, safe delivery and newborn support. Expectant mothers and their families are welcome.",
          location: "Hospital OPD hall",
          startsAt: upcoming(25, 9),
          endsAt: upcoming(25, 14),
          flyerUrl:
            "https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=1400&q=80",
          images: [
            {
              url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1200&q=80",
            },
          ],
          videos: [],
        },
        {
          title: "World Diabetes Day awareness walk",
          description:
            "Join hospital staff, partners and community members for a morning walk to raise awareness of diabetes prevention and care. Free screening follows at the hospital.",
          location: "Atibie town centre to the hospital",
          startsAt: upcoming(40, 6, 30),
          endsAt: upcoming(40, 9),
          flyerUrl:
            "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1400&q=80",
          images: [
            {
              url: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1200&q=80",
            },
          ],
          videos: [],
        },
      ];

      for (const event of starterEvents) {
        await ctx.db.insert("events", {
          ...event,
          isPublished: true,
          updatedAt: Date.now(),
        });
        created.events += 1;
      }
    }

    const partners = await ctx.db
      .query("partners")
      .withIndex("by_order")
      .collect();
    if (partners.length === 0) {
      const starterPartners = [
        {
          name: "Ghana Health Service",
          logoUrl:
            "https://ui-avatars.com/api/?name=GHS&background=1d4b38&color=ffffff&size=256&bold=true",
        },
        {
          name: "Eastern Regional Health Directorate",
          logoUrl:
            "https://ui-avatars.com/api/?name=ERHD&background=8c1d22&color=ffffff&size=256&bold=true",
        },
        {
          name: "Kwahu East District Assembly",
          logoUrl:
            "https://ui-avatars.com/api/?name=KEDA&background=b8862b&color=1d2b24&size=256&bold=true",
        },
        {
          name: "World Health Organization",
          logoUrl:
            "https://ui-avatars.com/api/?name=WHO&background=0b5c8a&color=ffffff&size=256&bold=true",
        },
      ];

      for (const [index, partner] of starterPartners.entries()) {
        await ctx.db.insert("partners", {
          ...partner,
          order: index,
          isPublished: true,
          updatedAt: Date.now(),
        });
        created.partners += 1;
      }
    }

    const gallery = await ctx.db
      .query("gallery")
      .withIndex("by_order")
      .collect();
    if (gallery.length === 0) {
      const starterGallery = [
        {
          title: "Outpatient department, morning clinic",
          kind: "image" as const,
          mediaUrl:
            "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1400&q=80",
        },
        {
          title: "Maternal health team at work",
          kind: "image" as const,
          mediaUrl:
            "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1400&q=80",
        },
        {
          title: "Community screening at Atibie",
          kind: "image" as const,
          mediaUrl:
            "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1400&q=80",
        },
        {
          title: "A short tour of our hospital",
          kind: "video" as const,
          mediaUrl:
            "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        },
      ];

      for (const [index, item] of starterGallery.entries()) {
        await ctx.db.insert("gallery", {
          ...item,
          order: index,
          isPublished: true,
          updatedAt: Date.now(),
        });
        created.gallery += 1;
      }
    }

  return created;
}

/**
 * Publish editable starter content so a new site is not empty. This is an
 * explicit administrator action, and every field can be replaced afterwards.
 */
export const publishStarterContent = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await insertStarterContent(ctx);
  },
});

/**
 * Deployment-time helper that fills a brand-new demo site. Internal functions
 * are not callable from the client, so public content still changes only
 * through the administrator console.
 */
export const seedDemoContent = internalMutation({
  args: {},
  handler: async (ctx) => await insertStarterContent(ctx),
});

