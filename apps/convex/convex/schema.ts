import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    imageUrl: v.string(),
    clerkId: v.string(),
    fullName: v.string(),
    
    tokenIdentifier: v.string(),
  }).index("ByClerkId", ["clerkId"]),
});