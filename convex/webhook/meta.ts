import { v } from "convex/values";
import { internalMutation, internalAction, internalQuery } from "../_generated/server";
import { internal } from "../_generated/api";

// Process incoming webhook from Meta
export const processWebhook = internalMutation({
  args: {
    payload: v.object({
      object: v.string(),
      entry: v.array(v.any()),
    }),
    signature: v.optional(v.string()),
    rawBody: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Verify webhook signature if provided
    // Note: Signature verification will be done in a separate action
    let verified = false;
    if (args.signature) {
      // For now, mark as unverified - actual verification needs Node.js runtime
      console.log("Webhook signature provided but verification skipped in mutation");
      verified = false;
    }

    // Extract lead IDs from the payload
    const leadInfo = extractLeadInfo(args.payload);
    
    // Store webhook event for debugging
    await ctx.db.insert("metaWebhookEvents", {
      pageId: leadInfo.length > 0 ? leadInfo[0].pageId : undefined,
      eventType: "leadgen",
      payload: JSON.stringify(args.payload),
      signature: args.signature,
      verified,
      processed: false,
      leadIds: leadInfo.map(l => l.leadId),
      createdAt: now,
    });

    // Schedule lead fetching for each lead
    for (const info of leadInfo) {
      await ctx.scheduler.runAfter(0, internal.webhook.meta.fetchAndStoreLead, {
        leadId: info.leadId,
        pageId: info.pageId,
        formId: info.formId,
        adId: info.adId,
        createdTime: info.createdTime,
      });
    }

    return null;
  },
});

// Fetch and store a lead from Meta API
export const fetchAndStoreLead = internalAction({
  args: {
    leadId: v.string(),
    pageId: v.string(),
    formId: v.optional(v.string()),
    adId: v.optional(v.string()),
    createdTime: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      // Get the integration for this page
      const integration = await ctx.runQuery(
        internal.integration.meta.getIntegrationByPageId,
        { pageId: args.pageId }
      );

      if (!integration) {
        console.error(`No active integration found for page ${args.pageId}`);
        return null;
      }

      // Get the page access token (no decryption needed for now)
      const accessToken = integration.pageAccessToken;

      // Initialize Meta API client
      const { getMetaAPI } = await import("../../lib/meta/api");
      const metaAPI = getMetaAPI(accessToken);

      try {
        // Fetch the lead details from Meta
        const lead = await metaAPI.getLead(args.leadId);
        
        // Parse and store the lead
        // Convert Meta field format to our storage format
        const fieldData = (lead.field_data || []).map(field => ({
          name: field.name,
          value: field.values?.join(", ") || "" // Join multiple values with comma
        }));
        
        const leadData = {
          leadId: lead.id,
          formId: lead.form_id || args.formId || "unknown_form",
          formName: lead.form_name,
          adId: lead.ad_id || args.adId,
          adsetId: lead.adset_id,
          campaignId: lead.campaign_id,
          campaignName: lead.campaign_name,
          fieldData,
          createdTime: lead.created_time 
            ? new Date(lead.created_time).getTime() 
            : args.createdTime || Date.now(),
          platform: lead.platform || "fb",
          isOrganic: lead.is_organic ?? !lead.ad_id,
        };

        // Store the lead in database
        await ctx.runMutation(internal.integration.meta.storeLead, {
          organizationId: integration.organizationId,
          pageId: args.pageId,
          lead: leadData,
        });

        console.log(`Lead ${args.leadId} fetched and stored successfully`);
      } catch (apiError) {
        // Check if it's a permission error or rate limit
        const error = apiError as { code?: number; message?: string };
        if (error.code === 190 || error.code === 4) {
          // Token might be expired or invalid
          console.error(`Token error for page ${args.pageId}:`, error.message);
          // TODO: Trigger token refresh flow
        } else {
          throw apiError;
        }
      }
    } catch (error) {
      console.error(`Failed to fetch and store lead ${args.leadId}:`, error);
      
      // Store webhook event for manual retry if needed
      await ctx.runMutation(internal.webhook.meta.logFailedLead, {
        leadId: args.leadId,
        pageId: args.pageId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    return null;
  },
});

// Process batch of webhook events (for recovery)
export const processPendingWebhooks = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Get unprocessed webhook events
    const pendingEvents = await ctx.runQuery(
      internal.webhook.meta._getPendingEvents,
      { limit: 10 }
    );

    for (const event of pendingEvents) {
      try {
        const payload = JSON.parse(event.payload);
        const leadInfo = extractLeadInfo(payload);

        for (const info of leadInfo) {
          await ctx.runAction(internal.webhook.meta.fetchAndStoreLead, {
            leadId: info.leadId,
            pageId: info.pageId,
            formId: info.formId,
            adId: info.adId,
            createdTime: info.createdTime,
          });
        }

        // Mark as processed
        await ctx.runMutation(internal.webhook.meta.markWebhookProcessed, {
          eventId: event._id,
        });
      } catch (error) {
        console.error(`Failed to process webhook event ${event._id}:`, error);
        
        // Mark as failed
        await ctx.runMutation(internal.webhook.meta.markWebhookFailed, {
          eventId: event._id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return null;
  },
});

// Internal query to get pending webhook events  
export const _getPendingEvents = internalQuery({
  args: { limit: v.number() },
  returns: v.array(
    v.object({
      _id: v.id("metaWebhookEvents"),
      payload: v.string(),
      pageId: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("metaWebhookEvents")
      .withIndex("byProcessed", (q) => q.eq("processed", false))
      .take(args.limit);
    
    return events.map(e => ({
      _id: e._id,
      payload: e.payload,
      pageId: e.pageId,
    }));
  },
});

// Mark webhook as processed
export const markWebhookProcessed = internalMutation({
  args: { eventId: v.id("metaWebhookEvents") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.eventId, {
      processed: true,
    });
    return null;
  },
});

// Mark webhook as failed
export const markWebhookFailed = internalMutation({
  args: {
    eventId: v.id("metaWebhookEvents"),
    error: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.eventId, {
      processed: true,
      error: args.error,
    });
    return null;
  },
});

// Log failed lead for manual retry
export const logFailedLead = internalMutation({
  args: {
    leadId: v.string(),
    pageId: v.string(),
    error: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("metaWebhookEvents", {
      pageId: args.pageId,
      eventType: "leadgen_failed",
      payload: JSON.stringify({
        leadId: args.leadId,
        error: args.error,
      }),
      verified: false,
      processed: false,
      error: args.error,
      leadIds: [args.leadId],
      createdAt: Date.now(),
    });
    return null;
  },
});

// ============= HELPER FUNCTIONS =============

interface WebhookPayload {
  object: string;
  entry?: Array<{
    id: string;
    changes?: Array<{
      field: string;
      value?: {
        leadgen_id?: string;
        page_id?: string;
        form_id?: string;
        ad_id?: string;
        adgroup_id?: string;
        created_time?: number;
      };
    }>;
  }>;
}

function extractLeadInfo(payload: WebhookPayload): Array<{
  leadId: string;
  pageId: string;
  formId?: string;
  adId?: string;
  createdTime?: number;
}> {
  const leadInfo: Array<{
    leadId: string;
    pageId: string;
    formId?: string;
    adId?: string;
    createdTime?: number;
  }> = [];

  if (payload.object !== "page") {
    return leadInfo;
  }

  for (const entry of payload.entry || []) {
    const pageId = entry.id;
    
    for (const change of entry.changes || []) {
      if (change.field === "leadgen" && change.value) {
        const value = change.value;
        
        if (value.leadgen_id) {
          leadInfo.push({
            leadId: value.leadgen_id,
            pageId: pageId || value.page_id || "",
            formId: value.form_id,
            adId: value.ad_id || value.adgroup_id,
            createdTime: value.created_time ? value.created_time * 1000 : undefined,
          });
        }
      }
    }
  }

  return leadInfo;
}