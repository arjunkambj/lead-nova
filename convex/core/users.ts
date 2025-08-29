import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import { mutation, query } from "../_generated/server";

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
          v.literal("oppsDev"),
        ),
      ),
      status: v.optional(
        v.union(
          v.literal("active"),
          v.literal("inactive"),
          v.literal("invited"),
          v.literal("suspended"),
          v.literal("deleted"),
          v.literal("expired"),
        ),
      ),
      invitedBy: v.optional(v.id("users")),
      invitedAt: v.optional(v.number()),
      inviteExpiresAt: v.optional(v.number()),
      assignedClients: v.optional(v.array(v.id("organizations"))),
      loginCount: v.optional(v.number()),
      lastLoginAt: v.optional(v.number()),
      createdAt: v.optional(v.number()),
      updatedAt: v.optional(v.number()),
    }),
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    return user;
  },
});

// Reset everything - delete all user data and return to fresh state
export const resetEverything = mutation({
  args: {},
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = (await ctx.db.get(userId)) as Doc<"users"> | null;
    if (!user) throw new Error("User not found");

    const organizationId = user.organizationId;
    if (!organizationId) {
      throw new Error("No organization found");
    }

    try {
      // 1. Delete all leads for the organization
      const leads = await ctx.db
        .query("leads")
        .withIndex("byOrganization", (q) =>
          q.eq("organizationId", organizationId),
        )
        .collect();

      for (const lead of leads) {
        await ctx.db.delete(lead._id);
      }
      console.log(`Deleted ${leads.length} leads`);

      // 2. Delete all lead sync jobs
      const syncJobs = await ctx.db
        .query("leadSyncJobs")
        .withIndex("byOrganization", (q) =>
          q.eq("organizationId", organizationId),
        )
        .collect();

      for (const job of syncJobs) {
        await ctx.db.delete(job._id);
      }
      console.log(`Deleted ${syncJobs.length} sync jobs`);

      // 3. Delete all Meta integrations
      const metaIntegrations = await ctx.db
        .query("metaIntegrations")
        .withIndex("byOrganization", (q) =>
          q.eq("organizationId", organizationId),
        )
        .collect();

      for (const integration of metaIntegrations) {
        await ctx.db.delete(integration._id);
      }
      console.log(`Deleted ${metaIntegrations.length} Meta integrations`);

      // 4. Reset onboarding status
      const onboardingRecords = await ctx.db
        .query("onboarding")
        .withIndex("byUser", (q) => q.eq("userId", userId))
        .collect();

      for (const record of onboardingRecords) {
        await ctx.db.delete(record._id);
      }
      console.log(`Deleted ${onboardingRecords.length} onboarding records`);

      // 5. Update user to reset state
      await ctx.db.patch(userId, {
        isOnboarded: false,
        updatedAt: Date.now(),
      });

      // 6. Optionally reset organization (keep it but reset members)
      const organization = await ctx.db.get(organizationId);
      if (organization) {
        await ctx.db.patch(organizationId, {
          members: [userId], // Keep only current user as member
          updatedAt: Date.now(),
        });
      }

      console.log(`Successfully reset all data for user ${userId}`);

      return {
        success: true,
        message:
          "All data has been reset successfully. You can start fresh now.",
      };
    } catch (error) {
      console.error("Failed to reset user data:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to reset data",
      );
    }
  },
});
