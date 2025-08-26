import { v } from "convex/values";
import {
  query,
  mutation,
  internalQuery,
  internalMutation,
  internalAction,
} from "../_generated/server";
import { internal } from "../_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc, Id } from "../_generated/dataModel";

// Work Pool will be configured later when properly set up
// For now, we'll use direct action calls

// ============= PUBLIC QUERIES =============

export const getConnectionStatus = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      isConnected: v.boolean(),
      pageId: v.optional(v.string()),
      pageName: v.optional(v.string()),
      tokenExpiresAt: v.optional(v.number()),
      lastSyncedAt: v.optional(v.number()),
      syncStatus: v.optional(v.string()),
      leadCount: v.optional(v.number()),
    })
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId) as Doc<"users"> | null;
    if (!user || !user.organizationId) return null;

    const integration = await ctx.db
      .query("metaIntegrations")
      .withIndex("byOrganizationAndActive", (q) =>
        q.eq("organizationId", user.organizationId!).eq("isActive", true)
      )
      .first();

    if (!integration) {
      return {
        isConnected: false,
        leadCount: 0,
      };
    }

    const leadCount = await ctx.db
      .query("leads")
      .withIndex("byOrganization", (q) =>
        q.eq("organizationId", user.organizationId!)
      )
      .collect()
      .then((leads) => leads.length);

    return {
      isConnected: true,
      pageId: integration.pageId,
      pageName: integration.pageName,
      tokenExpiresAt: integration.tokenExpiresAt,
      lastSyncedAt: integration.lastSyncedAt,
      syncStatus: integration.syncStatus,
      leadCount,
    };
  },
});

export const getLeads = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("new"),
        v.literal("contacted"),
        v.literal("qualified"),
        v.literal("converted"),
        v.literal("lost")
      )
    ),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("leads"),
      leadId: v.string(),
      formName: v.optional(v.string()),
      email: v.optional(v.string()),
      fullName: v.optional(v.string()),
      phone: v.optional(v.string()),
      status: v.string(),
      createdTime: v.number(),
      platform: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const user = await ctx.db.get(userId) as Doc<"users"> | null;
    if (!user || !user.organizationId) return [];

    // Use the appropriate index based on whether status filter is provided
    const query = args.status
      ? ctx.db
          .query("leads")
          .withIndex("byOrganizationAndStatus", (q) =>
            q.eq("organizationId", user.organizationId!).eq("status", args.status!)
          )
      : ctx.db
          .query("leads")
          .withIndex("byOrganization", (q) =>
            q.eq("organizationId", user.organizationId!)
          );

    const allLeads = await query.collect();

    // Sort by created time (newest first)
    const sortedLeads = allLeads.sort((a, b) => b.createdTime - a.createdTime);

    // Apply limit if provided
    const limitedLeads = args.limit ? sortedLeads.slice(0, args.limit) : sortedLeads;

    return limitedLeads.map((lead) => ({
      _id: lead._id,
      leadId: lead.leadId,
      formName: lead.formName,
      email: lead.email,
      fullName: lead.fullName,
      phone: lead.phone,
      status: lead.status,
      createdTime: lead.createdTime,
      platform: lead.platform,
    }));
  },
});

// ============= PUBLIC MUTATIONS =============

export const connectMetaAccount = mutation({
  args: {
    pageId: v.string(),
    pageName: v.string(),
    pageAccessToken: v.string(),
    userAccessToken: v.optional(v.string()),
    tokenExpiresAt: v.number(),
  },
  returns: v.object({
    success: v.boolean(),
    integrationId: v.optional(v.id("metaIntegrations")),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId) as Doc<"users"> | null;
    if (!user || !user.organizationId) throw new Error("No organization found");

    const now = Date.now();

    // Check if integration already exists
    const existing = await ctx.db
      .query("metaIntegrations")
      .withIndex("byPageId", (q) => q.eq("pageId", args.pageId))
      .first();

    let integrationId: Id<"metaIntegrations">;

    if (existing) {
      // Update existing integration
      await ctx.db.patch(existing._id, {
        pageName: args.pageName,
        pageAccessToken: args.pageAccessToken,
        userAccessToken: args.userAccessToken,
        tokenExpiresAt: args.tokenExpiresAt,
        isActive: true,
        updatedAt: now,
      });

      integrationId = existing._id;
    } else {
      // Create new integration
      const webhookVerifyToken = generateWebhookToken();
      
      integrationId = await ctx.db.insert("metaIntegrations", {
        organizationId: user.organizationId,
        pageId: args.pageId,
        pageName: args.pageName,
        pageAccessToken: args.pageAccessToken,
        userAccessToken: args.userAccessToken,
        tokenExpiresAt: args.tokenExpiresAt,
        webhookVerifyToken,
        isActive: true,
        syncStatus: "idle",
        createdAt: now,
        updatedAt: now,
      });

      // Schedule initial historical sync
      await ctx.scheduler.runAfter(0, internal.integration.meta.startHistoricalSync, {
        integrationId,
      });
    }

    // Update onboarding status to reflect Meta connection
    const onboarding = await ctx.db
      .query("onboarding")
      .withIndex("byUserOrganization", (q) =>
        q.eq("userId", userId).eq("organizationId", user.organizationId!)
      )
      .first();

    if (onboarding) {
      const updates: Record<string, unknown> = {
        isMetaConnected: true,
        updatedAt: now,
      };

      // If currently on step 2 (Meta Connect), advance to step 3
      if (onboarding.onboardingStep === 2) {
        updates.onboardingStep = 3;
      }

      await ctx.db.patch(onboarding._id, updates);
    }

    return {
      success: true,
      integrationId,
    };
  },
});

export const disconnectMetaAccount = mutation({
  args: {},
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId) as Doc<"users"> | null;
    if (!user || !user.organizationId) throw new Error("No organization found");

    const now = Date.now();

    const integration = await ctx.db
      .query("metaIntegrations")
      .withIndex("byOrganizationAndActive", (q) =>
        q.eq("organizationId", user.organizationId!).eq("isActive", true)
      )
      .first();

    if (integration) {
      await ctx.db.patch(integration._id, {
        isActive: false,
        updatedAt: now,
      });
    }

    // Update onboarding status to reflect Meta disconnection
    const onboarding = await ctx.db
      .query("onboarding")
      .withIndex("byUserOrganization", (q) =>
        q.eq("userId", userId).eq("organizationId", user.organizationId!)
      )
      .first();

    if (onboarding) {
      await ctx.db.patch(onboarding._id, {
        isMetaConnected: false,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

export const updateLeadStatus = mutation({
  args: {
    leadId: v.id("leads"),
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("qualified"),
      v.literal("converted"),
      v.literal("lost")
    ),
    notes: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new Error("Lead not found");

    const user = await ctx.db.get(userId) as Doc<"users"> | null;
    if (!user || user.organizationId !== lead.organizationId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.leadId, {
      status: args.status,
      notes: args.notes || lead.notes,
      processedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// ============= INTERNAL QUERIES =============

export const getIntegrationByPageId = internalQuery({
  args: { pageId: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("metaIntegrations"),
      organizationId: v.id("organizations"),
      pageAccessToken: v.string(),
      isActive: v.boolean(),
    })
  ),
  handler: async (ctx, args) => {
    const integration = await ctx.db
      .query("metaIntegrations")
      .withIndex("byPageId", (q) => q.eq("pageId", args.pageId))
      .first();

    if (!integration || !integration.isActive) return null;

    return {
      _id: integration._id,
      organizationId: integration.organizationId,
      pageAccessToken: integration.pageAccessToken,
      isActive: integration.isActive,
    };
  },
});

// ============= INTERNAL MUTATIONS =============

export const storeLead = internalMutation({
  args: {
    organizationId: v.id("organizations"),
    pageId: v.string(),
    lead: v.object({
      leadId: v.string(),
      formId: v.string(),
      formName: v.optional(v.string()),
      adId: v.optional(v.string()),
      adsetId: v.optional(v.string()),
      campaignId: v.optional(v.string()),
      campaignName: v.optional(v.string()),
      fieldData: v.array(
        v.object({
          name: v.string(),
          value: v.string(),
        })
      ),
      createdTime: v.number(),
      platform: v.optional(v.string()),
      isOrganic: v.boolean(),
    }),
  },
  returns: v.id("leads"),
  handler: async (ctx, args) => {
    // Check if lead already exists
    const existing = await ctx.db
      .query("leads")
      .withIndex("byLeadId", (q) => q.eq("leadId", args.lead.leadId))
      .first();

    if (existing) {
      return existing._id;
    }

    const now = Date.now();

    // Parse common fields from fieldData
    const parsedFields = parseLeadFields(args.lead.fieldData);

    const leadId = await ctx.db.insert("leads", {
      organizationId: args.organizationId,
      pageId: args.pageId,
      leadId: args.lead.leadId,
      formId: args.lead.formId,
      formName: args.lead.formName,
      adId: args.lead.adId,
      adsetId: args.lead.adsetId,
      campaignId: args.lead.campaignId,
      campaignName: args.lead.campaignName,
      fieldData: args.lead.fieldData,
      ...parsedFields,
      createdTime: args.lead.createdTime,
      platform: args.lead.platform,
      isOrganic: args.lead.isOrganic,
      syncedAt: now,
      status: "new",
      createdAt: now,
      updatedAt: now,
    });

    return leadId;
  },
});

export const updateSyncStatus = internalMutation({
  args: {
    integrationId: v.id("metaIntegrations"),
    status: v.union(
      v.literal("idle"),
      v.literal("syncing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    lastSyncedAt: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.integrationId, {
      syncStatus: args.status,
      lastSyncedAt: args.lastSyncedAt || Date.now(),
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const createSyncJob = internalMutation({
  args: {
    organizationId: v.id("organizations"),
    pageId: v.string(),
    jobType: v.union(
      v.literal("historical"),
      v.literal("webhook"),
      v.literal("manual")
    ),
  },
  returns: v.id("leadSyncJobs"),
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const jobId = await ctx.db.insert("leadSyncJobs", {
      organizationId: args.organizationId,
      pageId: args.pageId,
      jobType: args.jobType,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    return jobId;
  },
});

// ============= INTERNAL ACTIONS =============

export const startHistoricalSync = internalAction({
  args: {
    integrationId: v.id("metaIntegrations"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Get integration details
    const integration = await ctx.runQuery(
      internal.integration.meta.getIntegrationById,
      { integrationId: args.integrationId }
    );

    if (!integration) {
      console.error("Integration not found");
      return null;
    }

    // Update sync status
    await ctx.runMutation(internal.integration.meta.updateSyncStatus, {
      integrationId: args.integrationId,
      status: "syncing",
    });

    // Create sync job
    const jobId = await ctx.runMutation(internal.integration.meta.createSyncJob, {
      organizationId: integration.organizationId,
      pageId: integration.pageId,
      jobType: "historical",
    });

    // Schedule the sync action directly (Work Pool to be configured later)
    await ctx.scheduler.runAfter(
      0,
      internal.integration.meta.syncHistoricalLeads,
      {
        integrationId: args.integrationId,
        jobId,
        pageId: integration.pageId,
        accessToken: integration.pageAccessToken,
      }
    );

    return null;
  },
});

export const syncHistoricalLeads = internalAction({
  args: {
    integrationId: v.id("metaIntegrations"),
    jobId: v.id("leadSyncJobs"),
    pageId: v.string(),
    accessToken: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      console.log(`Starting historical sync for page ${args.pageId}`);

      // Update job status to processing
      await ctx.runMutation(internal.integration.meta.updateSyncJobStatus, {
        jobId: args.jobId,
        status: "processing",
      });

      // Call the Work Pool action for actual sync
      const result = await ctx.runAction(internal.workpool.leadSync.syncHistoricalLeads, {
        integrationId: args.integrationId,
        pageId: args.pageId,
        accessToken: args.accessToken,
      });

      // Update job status based on result
      await ctx.runMutation(internal.integration.meta.updateSyncJobStatus, {
        jobId: args.jobId,
        status: result.success ? "completed" : "failed",
        totalLeads: result.totalLeads,
        processedLeads: result.processedLeads,
        error: result.error,
      });

      // Update integration sync status
      await ctx.runMutation(internal.integration.meta.updateSyncStatus, {
        integrationId: args.integrationId,
        status: result.success ? "completed" : "failed",
        lastSyncedAt: Date.now(),
      });

      if (!result.success) {
        throw new Error(result.error || "Historical sync failed");
      }

    } catch (error) {
      console.error("Historical sync failed:", error);
      
      // Update job status to failed
      await ctx.runMutation(internal.integration.meta.updateSyncJobStatus, {
        jobId: args.jobId,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });

      // Update integration sync status
      await ctx.runMutation(internal.integration.meta.updateSyncStatus, {
        integrationId: args.integrationId,
        status: "failed",
      });

      throw error;
    }

    return null;
  },
});

export const onSyncComplete = internalMutation({
  args: {
    success: v.boolean(),
    error: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (_ctx, args) => {
    console.log("Sync completed:", args.success ? "Success" : "Failed");
    if (args.error) {
      console.error("Sync error:", args.error);
    }
    return null;
  },
});

// ============= HELPER FUNCTIONS =============

function generateWebhookToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

interface ParsedLeadFields {
  email?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

function parseLeadFields(fieldData: Array<{ name: string; value: string }>): ParsedLeadFields {
  const fields: ParsedLeadFields = {};
  
  for (const field of fieldData) {
    switch (field.name.toLowerCase()) {
      case "email":
        fields.email = field.value;
        break;
      case "full_name":
      case "name":
        fields.fullName = field.value;
        break;
      case "first_name":
        fields.firstName = field.value;
        break;
      case "last_name":
        fields.lastName = field.value;
        break;
      case "phone":
      case "phone_number":
        fields.phone = field.value;
        break;
      case "company":
      case "company_name":
        fields.company = field.value;
        break;
      case "city":
        fields.city = field.value;
        break;
      case "state":
      case "province":
        fields.state = field.value;
        break;
      case "country":
        fields.country = field.value;
        break;
      case "zip":
      case "zip_code":
      case "postal_code":
        fields.zipCode = field.value;
        break;
    }
  }
  
  return fields;
}

// Additional internal helpers
export const getIntegrationById = internalQuery({
  args: { integrationId: v.id("metaIntegrations") },
  returns: v.union(
    v.null(),
    v.object({
      organizationId: v.id("organizations"),
      pageId: v.string(),
      pageAccessToken: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    const integration = await ctx.db.get(args.integrationId);
    if (!integration) return null;

    return {
      organizationId: integration.organizationId,
      pageId: integration.pageId,
      pageAccessToken: integration.pageAccessToken,
    };
  },
});

export const updateSyncJobStatus = internalMutation({
  args: {
    jobId: v.id("leadSyncJobs"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    totalLeads: v.optional(v.number()),
    processedLeads: v.optional(v.number()),
    error: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.totalLeads !== undefined) {
      updates.totalLeads = args.totalLeads;
    }
    if (args.processedLeads !== undefined) {
      updates.processedLeads = args.processedLeads;
    }
    if (args.error) {
      updates.error = args.error;
    }
    if (args.status === "processing" && !updates.startedAt) {
      updates.startedAt = Date.now();
    }
    if (args.status === "completed" || args.status === "failed") {
      updates.completedAt = Date.now();
    }

    await ctx.db.patch(args.jobId, updates);
    return null;
  },
});

// Get integrations with expiring tokens
export const getExpiringIntegrations = internalQuery({
  args: { expirationThreshold: v.number() },
  returns: v.array(
    v.object({
      _id: v.id("metaIntegrations"),
      pageAccessToken: v.string(),
      userAccessToken: v.optional(v.string()),
      tokenExpiresAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const integrations = await ctx.db
      .query("metaIntegrations")
      .withIndex("byActive", (q) => q.eq("isActive", true))
      .collect();

    return integrations
      .filter((i) => i.tokenExpiresAt <= args.expirationThreshold)
      .map((i) => ({
        _id: i._id,
        pageAccessToken: i.pageAccessToken,
        userAccessToken: i.userAccessToken,
        tokenExpiresAt: i.tokenExpiresAt,
      }));
  },
});

// Update tokens for an integration
export const updateTokens = internalMutation({
  args: {
    integrationId: v.id("metaIntegrations"),
    pageAccessToken: v.string(),
    userAccessToken: v.optional(v.string()),
    tokenExpiresAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.integrationId, {
      pageAccessToken: args.pageAccessToken,
      userAccessToken: args.userAccessToken,
      tokenExpiresAt: args.tokenExpiresAt,
      updatedAt: Date.now(),
    });
    return null;
  },
});