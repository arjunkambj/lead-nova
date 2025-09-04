import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Core user record for Clerk users
  users: defineTable({
    name: v.string(),
    email: v.string(),
    imageUrl: v.string(),
    clerkId: v.string(),
    fullName: v.string(),
    tokenIdentifier: v.string(),
  }).index("ByClerkId", ["clerkId"]),

  // Organizations managed in Convex (not using Clerk orgs)
  organizations: defineTable({
    name: v.string(),
    slug: v.string(),
    imageUrl: v.optional(v.string()),
    ownerId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("BySlug", ["slug"])
    .index("ByOwner", ["ownerId"]),

  // Memberships linking users to organizations with a role
  memberships: defineTable({
    orgId: v.id("organizations"),
    userId: v.id("users"),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
    createdAt: v.number(),
  })
    .index("ByUser", ["userId"])
    .index("ByOrg", ["orgId"]),
});
