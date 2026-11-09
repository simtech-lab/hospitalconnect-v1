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

    return {
      info: infoDoc?.isPublished ? infoDoc : null,
      slides: await Promise.all(
        slides.map((slide) => slideWithImage(ctx, slide)),
      ),
      services,
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

    return {
      info: infoDoc ?? null,
      slides: await Promise.all(
        slides.map((slide) => slideWithImage(ctx, slide)),
      ),
      services,
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
  const created = { info: false, slides: 0, services: 0 };

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
