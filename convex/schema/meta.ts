import { defineTable } from "convex/server";
import { v } from "convex/values";

// Meta Integration Configuration
export const metaIntegrations = defineTable({
  organizationId: v.id("organizations"),
  pageId: v.string(), // Facebook Page ID
  pageName: v.string(),
  pageAccessToken: v.string(), // TODO: Add encryption in production
  userAccessToken: v.optional(v.string()), // TODO: Add encryption in production
  tokenExpiresAt: v.number(),
  webhookVerifyToken: v.string(),
  isActive: v.boolean(),
  leadFormIds: v.optional(v.array(v.string())),
  lastSyncedAt: v.optional(v.number()),
  syncStatus: v.optional(
    v.union(
      v.literal("idle"),
      v.literal("syncing"),
      v.literal("completed"),
      v.literal("failed")
    )
  ),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("byOrganization", ["organizationId"])
  .index("byPageId", ["pageId"])
  .index("byActive", ["isActive"])
  .index("byOrganizationAndActive", ["organizationId", "isActive"])
  .index("byActiveAndTokenExpiry", ["isActive", "tokenExpiresAt"]);

// Facebook Leads Storage
export const leads = defineTable({
  organizationId: v.id("organizations"),
  pageId: v.string(),
  leadId: v.string(), // Meta lead ID
  formId: v.string(),
  formName: v.optional(v.string()),
  adId: v.optional(v.string()),
  adName: v.optional(v.string()),
  adsetId: v.optional(v.string()),
  adsetName: v.optional(v.string()),
  campaignId: v.optional(v.string()),
  campaignName: v.optional(v.string()),
  fieldData: v.array(
    v.object({
      name: v.string(),
      value: v.string(),
    })
  ),
  // Parsed common fields for easy access
  email: v.optional(v.string()),
  fullName: v.optional(v.string()),
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
  phone: v.optional(v.string()),
  company: v.optional(v.string()),
  city: v.optional(v.string()),
  state: v.optional(v.string()),
  country: v.optional(v.string()),
  zipCode: v.optional(v.string()),
  
  // Work-related fields
  jobTitle: v.optional(v.string()),
  workEmail: v.optional(v.string()),
  workPhone: v.optional(v.string()),
  
  // Demographic fields
  dateOfBirth: v.optional(v.string()),
  gender: v.optional(v.string()),
  maritalStatus: v.optional(v.string()),
  militaryStatus: v.optional(v.string()),
  
  // Extended location fields  
  streetAddress: v.optional(v.string()),
  addressLine2: v.optional(v.string()),
  postBox: v.optional(v.string()),
  
  // National ID fields (for specific countries)
  nationalIdNumber: v.optional(v.string()),
  nationalIdType: v.optional(v.string()),
  
  // Retailer/Dealer fields
  retailerItemId: v.optional(v.string()),
  selectedDealer: v.optional(v.string()),
  
  // Custom fields
  customDisclaimer: v.optional(v.string()), // JSON string for disclaimer responses
  customQuestions: v.optional(v.string()), // JSON string for custom question responses
  
  createdTime: v.number(), // Meta creation timestamp
  platform: v.optional(v.string()), // fb, ig, etc.
  isOrganic: v.boolean(),
  syncedAt: v.number(),
  processedAt: v.optional(v.number()),
  status: v.union(
    v.literal("new"),
    v.literal("contacted"),
    v.literal("qualified"),
    v.literal("converted"),
    v.literal("lost")
  ),
  notes: v.optional(v.string()),
  assignedTo: v.optional(v.id("users")),
  
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("byOrganization", ["organizationId"])
  .index("byPageId", ["pageId"])
  .index("byLeadId", ["leadId"])
  .index("byCreatedTime", ["createdTime"])
  .index("byStatus", ["status"])
  .index("byFormId", ["formId"])
  .index("byOrganizationAndStatus", ["organizationId", "status"])
  .index("byAssignedTo", ["assignedTo"])
  .index("byEmail", ["email"]);

// Lead sync jobs for Work Pool tracking
export const leadSyncJobs = defineTable({
  organizationId: v.id("organizations"),
  pageId: v.string(),
  jobType: v.union(
    v.literal("historical"),
    v.literal("webhook"),
    v.literal("manual")
  ),
  status: v.union(
    v.literal("pending"),
    v.literal("processing"),
    v.literal("completed"),
    v.literal("failed")
  ),
  startDate: v.optional(v.number()),
  endDate: v.optional(v.number()),
  totalLeads: v.optional(v.number()),
  processedLeads: v.optional(v.number()),
  failedLeads: v.optional(v.number()),
  error: v.optional(v.string()),
  startedAt: v.optional(v.number()),
  completedAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("byOrganization", ["organizationId"])
  .index("byPageId", ["pageId"])
  .index("byStatus", ["status"])
  .index("byOrganizationAndStatus", ["organizationId", "status"]);

// Webhook events log
export const metaWebhookEvents = defineTable({
  organizationId: v.optional(v.id("organizations")),
  pageId: v.optional(v.string()),
  eventType: v.string(), // leadgen, page_update, etc.
  payload: v.string(), // JSON stringified payload
  signature: v.optional(v.string()),
  verified: v.boolean(),
  processed: v.boolean(),
  error: v.optional(v.string()),
  leadIds: v.optional(v.array(v.string())),
  createdAt: v.number(),
})
  .index("byPageId", ["pageId"])
  .index("byProcessed", ["processed"])
  .index("byCreatedAt", ["createdAt"]);