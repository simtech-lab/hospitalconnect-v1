import { getAuthUserId } from "@convex-dev/auth/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { ROLES } from "./schema";

export type AuthedCtx = QueryCtx | MutationCtx;

/** The signed-in user, or nulls when nobody is signed in. */
export async function getViewer(ctx: AuthedCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    return { userId: null, user: null } as const;
  }
  const user = await ctx.db.get(userId);
  return { userId, user } as const;
}

/**
 * Every write to public website content goes through an administrator.
 * Throws for signed-out users and signed-in non-admins.
 */
export async function requireAdmin(ctx: AuthedCtx) {
  const { user } = await getViewer(ctx);
  if (!user) {
    throw new Error("Sign in to manage website content.");
  }
  if (user.role !== ROLES.ADMIN) {
    throw new Error("Administrator access is required for this action.");
  }
  return user;
}
