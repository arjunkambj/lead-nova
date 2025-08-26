"use node";

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";

// Historical lead sync action for Work Pool
export const syncHistoricalLeads = internalAction({
  args: {
    integrationId: v.id("metaIntegrations"),
    pageId: v.string(),
    accessToken: v.string(), // Encrypted token
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  returns: v.object({
    success: v.boolean(),
    totalLeads: v.number(),
    processedLeads: v.number(),
    failedLeads: v.number(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    let totalLeads = 0;
    let processedLeads = 0;
    let failedLeads = 0;

    try {
      // Get the access token (no decryption needed for now)
      const accessToken = args.accessToken;

      // Initialize Meta API client
      const { getMetaAPI } = await import("../../lib/meta/api");
      const metaAPI = getMetaAPI(accessToken);

      // Calculate date range (default: last 30 days)
      const endDate = args.endDate || Date.now();
      const startDate = args.startDate || (endDate - 30 * 24 * 60 * 60 * 1000);
      const sinceDate = new Date(startDate);

      console.log(`Starting historical sync for page ${args.pageId} from ${sinceDate.toISOString()}`);

      // Update sync status to processing
      await ctx.runMutation(internal.integration.meta.updateSyncStatus, {
        integrationId: args.integrationId,
        status: "syncing",
      });

      // Get all lead forms for the page
      const forms = await metaAPI.getPageLeadForms(args.pageId);
      console.log(`Found ${forms.length} lead forms for page ${args.pageId}`);

      // Get the organization ID for this integration
      const integration = await ctx.runQuery(
        internal.integration.meta.getIntegrationById,
        { integrationId: args.integrationId }
      );

      if (!integration) {
        throw new Error("Integration not found");
      }

      // Process each form
      for (const form of forms) {
        if (form.status !== "ACTIVE" && form.status !== "ARCHIVED") {
          console.log(`Skipping form ${form.id} with status ${form.status}`);
          continue;
        }

        console.log(`Processing form ${form.name} (${form.id})`);

        let hasMore = true;
        let cursor: string | undefined;
        let formLeadCount = 0;

        while (hasMore) {
          try {
            // Fetch leads from Meta API with pagination
            const result = await metaAPI.getFormLeads(form.id, 100);
            const leads = result.leads || [];
            
            totalLeads += leads.length;
            formLeadCount += leads.length;

            // Process each lead
            for (const lead of leads) {
              try {
                // Parse lead data - convert Meta field format to our storage format
                const fieldData = (lead.field_data || []).map((field: { name: string; values?: string[] }) => ({
                  name: field.name,
                  value: field.values?.join(", ") || "" // Join multiple values with comma
                }));
                
                const leadData = {
                  leadId: lead.id,
                  formId: lead.form_id || form.id,
                  formName: lead.form_name || form.name,
                  adId: lead.ad_id,
                  adsetId: lead.adset_id,
                  campaignId: lead.campaign_id,
                  campaignName: lead.campaign_name,
                  fieldData,
                  createdTime: lead.created_time
                    ? new Date(lead.created_time).getTime()
                    : Date.now(),
                  platform: lead.platform || "fb",
                  isOrganic: lead.is_organic ?? !lead.ad_id,
                };

                // Store the lead
                await ctx.runMutation(internal.integration.meta.storeLead, {
                  organizationId: integration.organizationId,
                  pageId: args.pageId,
                  lead: leadData,
                });

                processedLeads++;
              } catch (leadError) {
                console.error(`Failed to process lead ${lead.id}:`, leadError);
                failedLeads++;
              }
            }

            // Check if there are more leads to fetch
            cursor = result.nextCursor;
            hasMore = !!cursor && leads.length > 0;

            // Add a small delay to avoid rate limiting
            if (hasMore) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          } catch (formError) {
            console.error(`Error fetching leads from form ${form.id}:`, formError);
            break;
          }
        }

        console.log(`Processed ${formLeadCount} leads from form ${form.name}`);
      }

      // Update sync status to completed
      await ctx.runMutation(internal.integration.meta.updateSyncStatus, {
        integrationId: args.integrationId,
        status: "completed",
        lastSyncedAt: Date.now(),
      });

      console.log(`Historical sync completed: ${processedLeads}/${totalLeads} leads processed, ${failedLeads} failed`);

      return {
        success: true,
        totalLeads,
        processedLeads,
        failedLeads,
      };
    } catch (error) {
      console.error("Historical sync failed:", error);

      // Update sync status to failed
      await ctx.runMutation(internal.integration.meta.updateSyncStatus, {
        integrationId: args.integrationId,
        status: "failed",
      });

      return {
        success: false,
        totalLeads,
        processedLeads,
        failedLeads,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

// Batch process webhook leads
export const processBatchLeads = internalAction({
  args: {
    leads: v.array(
      v.object({
        leadId: v.string(),
        pageId: v.string(),
        formId: v.optional(v.string()),
        adId: v.optional(v.string()),
        createdTime: v.optional(v.number()),
      })
    ),
  },
  returns: v.object({
    success: v.boolean(),
    processed: v.number(),
    failed: v.number(),
  }),
  handler: async (ctx, args) => {
    let processed = 0;
    let failed = 0;

    for (const lead of args.leads) {
      try {
        await ctx.runAction(internal.webhook.meta.fetchAndStoreLead, lead);
        processed++;
      } catch (error) {
        console.error(`Failed to process lead ${lead.leadId}:`, error);
        failed++;
      }
    }

    return {
      success: failed === 0,
      processed,
      failed,
    };
  },
});

// Refresh expired tokens
export const refreshExpiredTokens = internalAction({
  args: {},
  returns: v.object({
    success: v.boolean(),
    refreshed: v.number(),
    failed: v.number(),
  }),
  handler: async (ctx) => {
    let refreshed = 0;
    let failed = 0;

    try {
      // Get all integrations with expiring tokens (within 7 days)
      const expirationThreshold = Date.now() + 7 * 24 * 60 * 60 * 1000;
      
      const integrations = await ctx.runQuery(
        internal.integration.meta.getExpiringIntegrations,
        { expirationThreshold }
      );

      console.log(`Found ${integrations.length} integrations with expiring tokens`);

      for (const integration of integrations) {
        try {
          // Get current token (no decryption needed for now)
          const currentToken = integration.userAccessToken || integration.pageAccessToken;

          // Refresh the token
          const { refreshAccessToken } = await import("../../lib/meta/auth");
          const result = await refreshAccessToken(currentToken);

          if (result.success && result.token) {
            // Store new token (no encryption needed for now)
            const newToken = result.token;
            
            await ctx.runMutation(internal.integration.meta.updateTokens, {
              integrationId: integration._id,
              pageAccessToken: newToken,
              userAccessToken: newToken,
              tokenExpiresAt: Date.now() + (result.expiresIn || 60 * 60 * 24 * 60) * 1000,
            });

            refreshed++;
            console.log(`Refreshed token for integration ${integration._id}`);
          } else {
            failed++;
            console.error(`Failed to refresh token for integration ${integration._id}:`, result.error);
          }
        } catch (error) {
          failed++;
          console.error(`Error refreshing token for integration ${integration._id}:`, error);
        }
      }

      return {
        success: failed === 0,
        refreshed,
        failed,
      };
    } catch (error) {
      console.error("Token refresh job failed:", error);
      return {
        success: false,
        refreshed,
        failed,
      };
    }
  },
});