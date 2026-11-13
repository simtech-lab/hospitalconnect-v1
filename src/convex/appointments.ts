import { v } from "convex/values";
import { requireAdmin } from "./authz";
import { mutation, query } from "./_generated/server";

const preferredTime = v.union(
  v.literal("morning"),
  v.literal("afternoon"),
  v.literal("anytime"),
);

const status = v.union(
  v.literal("new"),
  v.literal("contacted"),
  v.literal("scheduled"),
  v.literal("closed"),
);

function todayKey() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/** Public form on the About page. No account is needed to request a visit. */
export const create = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    service: v.optional(v.string()),
    preferredDate: v.string(),
    preferredTime,
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim().slice(0, 120);
    const phone = args.phone.trim().slice(0, 40);
    const email = args.email?.trim().slice(0, 160) || undefined;
    const service = args.service?.trim().slice(0, 120) || undefined;
    const reason = args.reason?.trim().slice(0, 1000) || undefined;
    const preferredDate = args.preferredDate.trim();

    if (name.length < 2) {
      throw new Error("Please enter the patient's full name.");
    }
    if (phone.replace(/\D/g, "").length < 7) {
      throw new Error("Please enter a phone number the hospital can call.");
    }
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      throw new Error("Please enter a valid email address, or leave it blank.");
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(preferredDate)) {
      throw new Error("Please choose a preferred date.");
    }
    if (preferredDate < todayKey()) {
      throw new Error("Please choose today or a future date.");
    }

    return await ctx.db.insert("appointments", {
      name,
      phone,
      email,
      service,
      preferredDate,
      preferredTime: args.preferredTime,
      reason,
      status: "new",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/** Appointment requests, newest first, visible only to administrators. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("appointments")
      .withIndex("by_created")
      .order("desc")
      .collect();
  },
});

export const updateStatus = mutation({
  args: { id: v.id("appointments"), status },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const appointment = await ctx.db.get(args.id);
    if (!appointment) throw new Error("That appointment request no longer exists.");
    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("appointments") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});
