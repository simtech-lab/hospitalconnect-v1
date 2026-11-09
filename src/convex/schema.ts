import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Homepage slider banners. Content and visibility are controlled entirely
    // from the administrator console.
    slides: defineTable({
      eyebrow: v.optional(v.string()),
      title: v.string(),
      subtitle: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      storageId: v.optional(v.id("_storage")),
      ctaLabel: v.optional(v.string()),
      ctaHref: v.optional(v.string()),
      order: v.number(),
      isPublished: v.boolean(),
      updatedAt: v.number(),
    }).index("by_order", ["order"]),

    // Departments / care areas shown on the public hospital information page.
    services: defineTable({
      title: v.string(),
      description: v.string(),
      icon: v.string(),
      order: v.number(),
      isPublished: v.boolean(),
      updatedAt: v.number(),
    }).index("by_order", ["order"]),

    // Doctors shown in the public "Our team" section.
    doctors: defineTable({
      name: v.string(),
      specialty: v.string(),
      bio: v.optional(v.string()),
      photoId: v.optional(v.id("_storage")),
      photoUrl: v.optional(v.string()),
      isPublished: v.boolean(),
      order: v.number(),
      updatedAt: v.number(),
    }).index("by_order", ["order"]),

    // Hospital management / leadership profiles.
    management: defineTable({
      name: v.string(),
      role: v.string(),
      bio: v.optional(v.string()),
      photoId: v.optional(v.id("_storage")),
      photoUrl: v.optional(v.string()),
      isPublished: v.boolean(),
      order: v.number(),
      updatedAt: v.number(),
    }).index("by_order", ["order"]),

    // Upcoming hospital events with a flyer, additional photos and videos.
    events: defineTable({
      title: v.string(),
      description: v.string(),
      location: v.optional(v.string()),
      startsAt: v.number(),
      endsAt: v.optional(v.number()),
      flyerId: v.optional(v.id("_storage")),
      flyerUrl: v.optional(v.string()),
      images: v.array(
        v.object({
          storageId: v.optional(v.id("_storage")),
          url: v.optional(v.string()),
        }),
      ),
      videos: v.array(
        v.object({
          storageId: v.optional(v.id("_storage")),
          url: v.optional(v.string()),
        }),
      ),
      isPublished: v.boolean(),
      updatedAt: v.number(),
    }).index("by_starts", ["startsAt"]),

    // Single document holding the hospital profile, hours and contact details.
    hospitalInfo: defineTable({
      key: v.literal("main"),
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
      bedCapacity: v.optional(v.string()),
      staffCount: v.optional(v.string()),
      foundedYear: v.optional(v.string()),
      isPublished: v.boolean(),
      updatedAt: v.number(),
    }).index("by_key", ["key"])
  },
  {
    schemaValidation: false,
  },
);

export default schema;
