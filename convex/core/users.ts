import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "../_generated/server";
import { v } from "convex/values";

///// Get Current Authenticated User
export const getCurrentUser = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      phone: v.optional(v.string()),
      phoneVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      organizationId: v.optional(v.id("organizations")),
      isOnboarded: v.optional(v.boolean()),
      role: v.optional(
        v.union(
          v.literal("clientAdmin"),
          v.literal("manager"),
          v.literal("member"),
          v.literal("superAdmin"),
          v.literal("oppsDev")
        )
      ),
      status: v.optional(
        v.union(
          v.literal("active"),
          v.literal("inactive"),
          v.literal("invited"),
          v.literal("suspended"),
          v.literal("deleted"),
          v.literal("expired")
        )
      ),
      invitedBy: v.optional(v.id("users")),
      invitedAt: v.optional(v.number()),
      inviteExpiresAt: v.optional(v.number()),
      assignedClients: v.optional(v.array(v.id("organizations"))),
      loginCount: v.optional(v.number()),
      lastLoginAt: v.optional(v.number()),
      createdAt: v.optional(v.number()),
      updatedAt: v.optional(v.number()),
    })
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    return user;
  },
});
