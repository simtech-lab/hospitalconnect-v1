import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { requireAdmin } from "./authz";
import { mutation, query } from "./_generated/server";
import { ROLES, roleValidator } from "./schema";

/**
 * Whether any administrator exists yet. Used by the console to offer
 * first-run setup without revealing who the administrator is.
 */
export const hasAdmin = query({
  args: {},
  handler: async (ctx) => {
    const admin = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), ROLES.ADMIN))
      .first();
    return admin !== null;
  },
});

/**
 * First-run bootstrap: the very first signed-in person can claim the
 * administrator role. Once an administrator exists, access is granted only
 * from the console's team panel.
 */
export const claimAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Sign in before claiming administrator access.");
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("Your account could not be found. Try signing in again.");
    }
    if (user.role === ROLES.ADMIN) {
      return userId;
    }

    const existing = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), ROLES.ADMIN))
      .first();
    if (existing) {
      throw new Error(
        "An administrator already exists. Ask them to grant you access from the team panel.",
      );
    }

    await ctx.db.patch(userId, { role: ROLES.ADMIN });
    return userId;
  },
});

/** Administrators only: everyone who has signed in to the website. */
export const listTeam = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const users = await ctx.db.query("users").collect();
    return users
      .filter((user) => !user.isAnonymous || user.role === ROLES.ADMIN)
      .map((user) => ({
        id: user._id,
        name: user.name ?? null,
        email: user.email ?? null,
        isAnonymous: user.isAnonymous ?? false,
        role: user.role ?? ROLES.USER,
        createdAt: user._creationTime,
      }))
      .sort((a, b) => {
        if (a.role === b.role) return a.createdAt - b.createdAt;
        return a.role === ROLES.ADMIN ? -1 : 1;
      });
  },
});

/** Administrators only: grant or revoke administrator access. */
export const setRole = mutation({
  args: {
    userId: v.id("users"),
    role: roleValidator,
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const target = await ctx.db.get(args.userId);
    if (!target) {
      throw new Error("That account could not be found.");
    }

    if (target.role === ROLES.ADMIN && args.role !== ROLES.ADMIN) {
      const admins = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("role"), ROLES.ADMIN))
        .collect();
      if (admins.length <= 1) {
        throw new Error("At least one administrator must keep access.");
      }
    }

    await ctx.db.patch(args.userId, { role: args.role });
    return { updated: args.userId, changedBy: admin._id };
  },
});
