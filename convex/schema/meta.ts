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
      v.literal("failed"),
    ),
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
    }),
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
    v.literal("lost"),
  ),
  notes: v.optional(v.string()),
  assignedTo: v.optional(v.id("users")),

  // Enhanced fields for advanced management
  stage: v.optional(
    v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("qualified"),
      v.literal("proposal"),
      v.literal("negotiation"),
      v.literal("closed-won"),
      v.literal("closed-lost"),
      v.literal("nurture"),
    ),
  ),
  priority: v.optional(
    v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent"),
    ),
  ),
  score: v.optional(v.number()), // Lead scoring 0-100
  source: v.optional(v.string()), // UTM source, referrer, etc.
  tags: v.optional(v.array(v.id("leadTags"))),
  customFields: v.optional(v.string()), // JSON string for dynamic fields
  lastActivityAt: v.optional(v.number()),
  followUpDate: v.optional(v.number()),
  estimatedValue: v.optional(v.number()),
  probability: v.optional(v.number()), // Win probability 0-100

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
  .index("byEmail", ["email"])
  .index("byOrganizationAndStage", ["organizationId", "stage"])
  .index("byPriority", ["priority"])
  .index("byScore", ["score"])
  .index("byFollowUpDate", ["followUpDate"]);

// Lead sync jobs for Work Pool tracking
export const leadSyncJobs = defineTable({
  organizationId: v.id("organizations"),
  pageId: v.string(),
  jobType: v.union(
    v.literal("historical"),
    v.literal("webhook"),
    v.literal("manual"),
  ),
  status: v.union(
    v.literal("pending"),
    v.literal("processing"),
    v.literal("completed"),
    v.literal("failed"),
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

// Custom field definitions for leads
export const leadCustomFields = defineTable({
  organizationId: v.id("organizations"),
  name: v.string(),
  label: v.string(),
  fieldType: v.union(
    v.literal("text"),
    v.literal("number"),
    v.literal("date"),
    v.literal("datetime"),
    v.literal("select"),
    v.literal("multiselect"),
    v.literal("checkbox"),
    v.literal("email"),
    v.literal("phone"),
    v.literal("url"),
    v.literal("currency"),
    v.literal("percent"),
    v.literal("textarea"),
    v.literal("richtext"),
  ),
  options: v.optional(v.array(v.string())), // For select/multiselect
  required: v.boolean(),
  defaultValue: v.optional(v.string()),
  validation: v.optional(v.string()), // JSON string for validation rules
  order: v.number(), // Display order
  isActive: v.boolean(),
  showInTable: v.boolean(),
  showInKanban: v.boolean(),
  searchable: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("byOrganization", ["organizationId"])
  .index("byOrganizationAndActive", ["organizationId", "isActive"])
  .index("byOrder", ["order"]);

// Pipeline stages configuration
export const leadStages = defineTable({
  organizationId: v.id("organizations"),
  name: v.string(),
  label: v.string(),
  color: v.string(), // HeroUI color: primary, secondary, success, warning, danger
  order: v.number(),
  probability: v.optional(v.number()), // Default win probability for this stage
  isActive: v.boolean(),
  isDefault: v.boolean(), // Default stage for new leads
  wipLimit: v.optional(v.number()), // Work in progress limit
  automations: v.optional(v.string()), // JSON string for stage automation rules
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("byOrganization", ["organizationId"])
  .index("byOrganizationAndActive", ["organizationId", "isActive"])
  .index("byOrder", ["order"]);

// Lead tags for categorization
export const leadTags = defineTable({
  organizationId: v.id("organizations"),
  name: v.string(),
  color: v.string(), // HeroUI color
  description: v.optional(v.string()),
  usageCount: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("byOrganization", ["organizationId"])
  .index("byName", ["name"])
  .index("byUsageCount", ["usageCount"]);

// Lead activity log
export const leadActivities = defineTable({
  organizationId: v.id("organizations"),
  leadId: v.id("leads"),
  userId: v.id("users"),
  activityType: v.union(
    v.literal("created"),
    v.literal("updated"),
    v.literal("stage_changed"),
    v.literal("assigned"),
    v.literal("note_added"),
    v.literal("email_sent"),
    v.literal("email_received"),
    v.literal("call_made"),
    v.literal("call_received"),
    v.literal("meeting_scheduled"),
    v.literal("task_created"),
    v.literal("task_completed"),
    v.literal("tag_added"),
    v.literal("tag_removed"),
    v.literal("custom"),
  ),
  description: v.string(),
  metadata: v.optional(v.string()), // JSON string for additional data
  createdAt: v.number(),
})
  .index("byLead", ["leadId"])
  .index("byOrganization", ["organizationId"])
  .index("byUser", ["userId"])
  .index("byLeadAndCreatedAt", ["leadId", "createdAt"])
  .index("byActivityType", ["activityType"]);

// Lead views/filters saved configurations
export const leadViews = defineTable({
  organizationId: v.id("organizations"),
  userId: v.optional(v.id("users")), // null for org-wide views
  name: v.string(),
  viewType: v.union(
    v.literal("table"),
    v.literal("kanban"),
    v.literal("calendar"),
  ),
  filters: v.string(), // JSON string for filter configuration
  sorting: v.optional(v.string()), // JSON string for sort configuration
  columns: v.optional(v.string()), // JSON string for visible columns
  groupBy: v.optional(v.string()),
  isDefault: v.boolean(),
  isShared: v.boolean(),
  order: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("byOrganization", ["organizationId"])
  .index("byUser", ["userId"])
  .index("byOrganizationAndUser", ["organizationId", "userId"])
  .index("byOrganizationAndShared", ["organizationId", "isShared"])
  .index("byOrder", ["order"]);
