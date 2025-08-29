"use node";

import { v } from "convex/values";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { internalAction } from "../_generated/server";

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
  handler: async (
    ctx,
    args,
  ): Promise<{
    success: boolean;
    totalLeads: number;
    processedLeads: number;
    failedLeads: number;
    error?: string;
  }> => {
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
      const startDate = args.startDate || endDate - 30 * 24 * 60 * 60 * 1000;
      new Date(startDate); // For date validation

      // Update sync status to processing
      await ctx.runMutation(internal.integration.meta.updateSyncStatus, {
        integrationId: args.integrationId,
        status: "syncing",
      });

      // Get the integration details including selected forms
      const integration: {
        _id: Id<"metaIntegrations">;
        organizationId: Id<"organizations">;
        pageId: string;
        pageAccessToken: string;
        leadFormIds?: string[];
        isActive: boolean;
      } | null = await ctx.runQuery(
        internal.integration.meta.getIntegrationById,
        { integrationId: args.integrationId },
      );

      if (!integration) {
        throw new Error("Integration not found");
      }

      // Get all lead forms for the page
      let allForms: Array<{
        id: string;
        name: string;
        status: string;
        leads_count?: number;
      }> = [];

      try {
        allForms = await metaAPI.getPageLeadForms(args.pageId);
      } catch (error) {
        // Check if this is a permissions error
        if (error instanceof Error && error.message.includes("permissions")) {
          throw new Error(
            "Missing permissions to access lead forms. Please ensure the page has lead access enabled and reconnect.",
          );
        }

        // For other errors, continue with empty forms array
      }

      // Filter forms based on selection if specified
      let forms = allForms;
      if (integration.leadFormIds && integration.leadFormIds.length > 0) {
        forms = allForms.filter((form) =>
          integration.leadFormIds?.includes(form.id),
        );
        console.log(
          `Filtering to ${forms.length} selected forms out of ${allForms.length} total forms`,
        );
      } else {
        console.log(
          `Processing all ${forms.length} forms (no specific selection)`,
        );
      }

      // If no forms found, update status and return early
      if (forms.length === 0) {
        // Update sync status to completed (even though no leads were found)
        await ctx.runMutation(internal.integration.meta.updateSyncStatus, {
          integrationId: args.integrationId,
          status: "completed",
          lastSyncedAt: Date.now(),
        });

        return {
          success: true,
          totalLeads: 0,
          processedLeads: 0,
          failedLeads: 0,
          error:
            integration.leadFormIds && integration.leadFormIds.length > 0
              ? "No selected forms found. Forms may have been deleted."
              : "No lead forms found. Please create lead generation forms in Facebook Ads Manager.",
        };
      }

      // Process each selected form
      for (const form of forms) {
        if (form.status !== "ACTIVE" && form.status !== "ARCHIVED") {
          console.log(`Skipping form ${form.id} with status ${form.status}`);
          continue;
        }

        console.log(`\n📂 Processing form: ${form.name}`);
        console.log(`   Form ID: ${form.id}`);
        console.log(`   Status: ${form.status}`);

        let hasMore = true;
        let cursor: string | undefined;
        let previousCursor: string | undefined;
        let formLeadCount = 0;
        let batchCount = 0;
        const MAX_BATCHES = 100; // Increased safety limit for larger forms
        const MAX_LEADS_PER_FORM = 10000; // Maximum leads to fetch per form
        const seenLeadIds = new Set<string>(); // Track seen leads to detect duplicates

        while (
          hasMore &&
          batchCount < MAX_BATCHES &&
          formLeadCount < MAX_LEADS_PER_FORM
        ) {
          batchCount++;
          try {
            console.log(
              `   🔄 Fetching leads batch ${batchCount} (total so far: ${formLeadCount})...`,
            );
            // Fetch leads from Meta API with pagination
            const result = await metaAPI.getFormLeads(form.id, 100, cursor);
            const leads = result.leads || [];

            console.log(
              `   📥 Received ${leads.length} leads in batch ${batchCount}`,
            );

            // Check if we're getting duplicate data (infinite loop detection)
            if (leads.length === 0) {
              console.log(`   ✅ No more leads to fetch (empty batch)`);
              hasMore = false;
              break;
            }

            // Check if cursor hasn't changed (another infinite loop detection)
            if (cursor && cursor === previousCursor) {
              console.log(
                `   ⚠️ Cursor unchanged, stopping to prevent infinite loop`,
              );
              hasMore = false;
              break;
            }

            let newLeadsInBatch = 0;

            // Process each lead
            for (const lead of leads) {
              // Skip if we've already seen this lead (duplicate detection)
              if (seenLeadIds.has(lead.id)) {
                console.log(
                  `   ⚠️ Duplicate lead detected: ${lead.id}, skipping...`,
                );
                continue;
              }
              seenLeadIds.add(lead.id);
              newLeadsInBatch++;

              try {
                // Parse lead data - convert Meta field format to our storage format
                const fieldData = (lead.field_data || []).map(
                  (field: { name: string; values?: string[] }) => ({
                    name: field.name,
                    value: field.values?.join(", ") || "", // Join multiple values with comma
                  }),
                );

                const leadData = {
                  leadId: lead.id,
                  formId: lead.form_id || form.id,
                  formName: lead.form_name || form.name,
                  adId: lead.ad_id,
                  adName: lead.ad_name,
                  adsetId: lead.adset_id,
                  adsetName: lead.adset_name,
                  campaignId: lead.campaign_id,
                  campaignName: lead.campaign_name,
                  fieldData,
                  createdTime: lead.created_time
                    ? new Date(lead.created_time).getTime()
                    : Date.now(),
                  platform: lead.platform || "fb",
                  isOrganic: lead.is_organic ?? !lead.ad_id,
                  customDisclaimer: lead.custom_disclaimer_responses
                    ? JSON.stringify(lead.custom_disclaimer_responses)
                    : undefined,
                  retailerItemId: lead.retailer_item_id,
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

            totalLeads += newLeadsInBatch;
            formLeadCount += newLeadsInBatch;

            // If all leads in this batch were duplicates, stop fetching
            if (newLeadsInBatch === 0) {
              console.log(`   ⚠️ All leads in batch were duplicates, stopping`);
              hasMore = false;
              break;
            }

            // Update cursor for next iteration
            previousCursor = cursor;
            cursor = result.nextCursor;

            // Check if there are more leads to fetch
            // Stop if no cursor or cursor is the same as before
            hasMore = !!cursor && cursor !== previousCursor;

            // Add a small delay to avoid rate limiting
            if (hasMore) {
              await new Promise((resolve) => setTimeout(resolve, 100));
            }
          } catch (formError) {
            console.error(
              `Error fetching leads from form ${form.id}:`,
              formError,
            );
            break;
          }
        }

        if (batchCount >= MAX_BATCHES) {
          console.log(
            `   ⚠️ Reached batch limit (${MAX_BATCHES}). Stopping to prevent infinite loop.`,
          );
        }
        if (formLeadCount >= MAX_LEADS_PER_FORM) {
          console.log(
            `   ⚠️ Reached maximum leads per form (${MAX_LEADS_PER_FORM}). Stopping.`,
          );
        }
        console.log(
          `   ✅ Processed ${formLeadCount} unique leads from form: ${form.name} (${batchCount} batches)\n`,
        );
      }

      // Update sync status to completed
      await ctx.runMutation(internal.integration.meta.updateSyncStatus, {
        integrationId: args.integrationId,
        status: "completed",
        lastSyncedAt: Date.now(),
      });

      console.log("=".repeat(60));
      console.log(`🎉 HISTORICAL SYNC COMPLETED`);
      console.log(`📊 Summary:`);
      console.log(`   Total forms processed: ${forms.length}`);
      console.log(`   Total leads found: ${totalLeads}`);
      console.log(`   Successfully processed: ${processedLeads}`);
      console.log(`   Failed to process: ${failedLeads}`);
      console.log(
        `   Success rate: ${totalLeads > 0 ? ((processedLeads / totalLeads) * 100).toFixed(1) : 0}%`,
      );
      console.log("=".repeat(60));

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
      }),
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
        { expirationThreshold },
      );

      console.log(
        `Found ${integrations.length} integrations with expiring tokens`,
      );

      for (const integration of integrations) {
        try {
          // Get current token (no decryption needed for now)
          const currentToken =
            integration.userAccessToken || integration.pageAccessToken;

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
              tokenExpiresAt:
                Date.now() + (result.expiresIn || 60 * 60 * 24 * 60) * 1000,
            });

            refreshed++;
            console.log(`Refreshed token for integration ${integration._id}`);
          } else {
            failed++;
            console.error(
              `Failed to refresh token for integration ${integration._id}:`,
              result.error,
            );
          }
        } catch (error) {
          failed++;
          console.error(
            `Error refreshing token for integration ${integration._id}:`,
            error,
          );
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
