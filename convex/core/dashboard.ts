import { query } from "../_generated/server";
import { v } from "convex/values";
import { Doc } from "../_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getBasicStats = query({
  args: {},
  returns: v.object({
    totalLeads: v.number(),
    leadsToday: v.number(),
    connectedPages: v.number(),
    lastSyncTime: v.optional(v.number()),
    syncStatus: v.optional(v.string()),
    leadsByStatus: v.object({
      new: v.number(),
      contacted: v.number(),
      qualified: v.number(),
      converted: v.number(),
      lost: v.number(),
    }),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        totalLeads: 0,
        leadsToday: 0,
        connectedPages: 0,
        lastSyncTime: undefined,
        syncStatus: undefined,
        leadsByStatus: {
          new: 0,
          contacted: 0,
          qualified: 0,
          converted: 0,
          lost: 0,
        },
      };
    }

    const user = await ctx.db.get(userId) as Doc<"users"> | null;
    if (!user?.organizationId) {
      return {
        totalLeads: 0,
        leadsToday: 0,
        connectedPages: 0,
        lastSyncTime: undefined,
        syncStatus: undefined,
        leadsByStatus: {
          new: 0,
          contacted: 0,
          qualified: 0,
          converted: 0,
          lost: 0,
        },
      };
    }

    // Get all leads for the organization
    const leads = await ctx.db
      .query("leads")
      .withIndex("byOrganization", (q) => q.eq("organizationId", user.organizationId!))
      .collect();

    // Count leads by status
    const leadsByStatus = {
      new: 0,
      contacted: 0,
      qualified: 0,
      converted: 0,
      lost: 0,
    };

    // Get today's date at midnight
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayTimestamp = todayStart.getTime();

    let leadsToday = 0;

    leads.forEach((lead) => {
      leadsByStatus[lead.status]++;
      if (lead.createdAt >= todayTimestamp) {
        leadsToday++;
      }
    });

    // Get Meta integration status
    const activeIntegrations = await ctx.db
      .query("metaIntegrations")
      .withIndex("byOrganizationAndActive", (q) => 
        q.eq("organizationId", user.organizationId!).eq("isActive", true)
      )
      .collect();

    // Get latest sync job
    const latestSyncJob = await ctx.db
      .query("leadSyncJobs")
      .withIndex("byOrganization", (q) => q.eq("organizationId", user.organizationId!))
      .order("desc")
      .first();

    return {
      totalLeads: leads.length,
      leadsToday,
      connectedPages: activeIntegrations.length,
      lastSyncTime: latestSyncJob?.completedAt || latestSyncJob?.startedAt,
      syncStatus: latestSyncJob?.status,
      leadsByStatus,
    };
  },
});

export const getLatestLeads = query({
  args: {
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
      city: v.optional(v.string()),
      campaignName: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const user = await ctx.db.get(userId) as Doc<"users"> | null;
    if (!user?.organizationId) return [];

    const limit = args.limit || 10;

    const leads = await ctx.db
      .query("leads")
      .withIndex("byOrganization", (q) => q.eq("organizationId", user.organizationId!))
      .order("desc")
      .take(limit);

    return leads.map((lead) => ({
      _id: lead._id,
      leadId: lead.leadId,
      formName: lead.formName,
      email: lead.email,
      fullName: lead.fullName,
      phone: lead.phone,
      status: lead.status,
      createdTime: lead.createdTime,
      platform: lead.platform,
      city: lead.city,
      campaignName: lead.campaignName,
    }));
  },
});

export const getSyncStatus = query({
  args: {},
  returns: v.object({
    currentJob: v.optional(
      v.object({
        _id: v.id("leadSyncJobs"),
        status: v.string(),
        jobType: v.string(),
        totalLeads: v.optional(v.number()),
        processedLeads: v.optional(v.number()),
        failedLeads: v.optional(v.number()),
        startedAt: v.optional(v.number()),
        pageId: v.string(),
        error: v.optional(v.string()),
      })
    ),
    recentJobs: v.array(
      v.object({
        _id: v.id("leadSyncJobs"),
        status: v.string(),
        jobType: v.string(),
        totalLeads: v.optional(v.number()),
        completedAt: v.optional(v.number()),
        pageId: v.string(),
      })
    ),
    webhookEvents: v.number(),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        currentJob: undefined,
        recentJobs: [],
        webhookEvents: 0,
      };
    }

    const user = await ctx.db.get(userId) as Doc<"users"> | null;
    if (!user?.organizationId) {
      return {
        currentJob: undefined,
        recentJobs: [],
        webhookEvents: 0,
      };
    }

    // Get current processing or pending job
    const processingJob = await ctx.db
      .query("leadSyncJobs")
      .withIndex("byOrganizationAndStatus", (q) =>
        q.eq("organizationId", user.organizationId!).eq("status", "processing")
      )
      .first();
    
    // Only show processing job if it's not stale (started less than 10 minutes ago)
    const isProcessingJobStale = processingJob && processingJob.startedAt 
      ? Date.now() - processingJob.startedAt > 10 * 60 * 1000 // 10 minutes
      : false;
    
    const pendingJob = !processingJob || isProcessingJobStale
      ? await ctx.db
          .query("leadSyncJobs")
          .withIndex("byOrganizationAndStatus", (q) =>
            q.eq("organizationId", user.organizationId!).eq("status", "pending")
          )
          .first()
      : null;
    
    const currentJob = (!isProcessingJobStale ? processingJob : null) || pendingJob;

    // Get recent completed jobs - fetch completed and failed jobs separately using indexes
    const [completedJobs, failedJobs] = await Promise.all([
      ctx.db
        .query("leadSyncJobs")
        .withIndex("byOrganizationAndStatus", (q) =>
          q.eq("organizationId", user.organizationId!).eq("status", "completed")
        )
        .order("desc")
        .take(3),
      ctx.db
        .query("leadSyncJobs")
        .withIndex("byOrganizationAndStatus", (q) =>
          q.eq("organizationId", user.organizationId!).eq("status", "failed")
        )
        .order("desc")
        .take(3),
    ]);

    // Combine and sort completed and failed jobs
    const recentJobs = [...completedJobs, ...failedJobs]
      .sort((a, b) => {
        // Sort by completedAt or updatedAt, most recent first
        const aTime = a.completedAt || a.updatedAt || 0;
        const bTime = b.completedAt || b.updatedAt || 0;
        return bTime - aTime;
      })
      .slice(0, 3);

    // Count webhook events
    const webhookEvents = await ctx.db
      .query("metaWebhookEvents")
      .withIndex("byProcessed", (q) => q.eq("processed", true))
      .collect();

    return {
      currentJob: currentJob
        ? {
            _id: currentJob._id,
            status: currentJob.status,
            jobType: currentJob.jobType,
            totalLeads: currentJob.totalLeads,
            processedLeads: currentJob.processedLeads,
            failedLeads: currentJob.failedLeads,
            startedAt: currentJob.startedAt,
            pageId: currentJob.pageId,
            error: currentJob.error,
          }
        : undefined,
      recentJobs: recentJobs.map((job) => ({
        _id: job._id,
        status: job.status,
        jobType: job.jobType,
        totalLeads: job.totalLeads,
        completedAt: job.completedAt,
        pageId: job.pageId,
      })),
      webhookEvents: webhookEvents.length,
    };
  },
});

export const getDashboardData = query({
  args: {
    leadLimit: v.optional(v.number()),
  },
  returns: v.object({
    user: v.union(
      v.object({
        _id: v.id("users"),
        name: v.optional(v.string()),
        email: v.string(),
        image: v.optional(v.string()),
        role: v.optional(v.string()),
        status: v.optional(v.string()),
        createdAt: v.optional(v.number()),
        isOnboarded: v.optional(v.boolean()),
        organizationId: v.optional(v.id("organizations")),
      }),
      v.null()
    ),
    organization: v.union(
      v.object({
        _id: v.id("organizations"),
        name: v.string(),
        totalMembers: v.optional(v.number()),
        activeMembers: v.optional(v.array(v.id("users"))),
        invitedMembers: v.optional(v.number()),
      }),
      v.null()
    ),
    stats: v.object({
      totalLeads: v.number(),
      leadsToday: v.number(),
      connectedPages: v.number(),
      lastSyncTime: v.optional(v.number()),
      syncStatus: v.optional(v.string()),
      leadsByStatus: v.object({
        new: v.number(),
        contacted: v.number(),
        qualified: v.number(),
        converted: v.number(),
        lost: v.number(),
      }),
    }),
    latestLeads: v.array(
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
        city: v.optional(v.string()),
        campaignName: v.optional(v.string()),
      })
    ),
    syncStatus: v.object({
      currentJob: v.optional(
        v.object({
          _id: v.id("leadSyncJobs"),
          status: v.string(),
          jobType: v.string(),
          totalLeads: v.optional(v.number()),
          processedLeads: v.optional(v.number()),
          failedLeads: v.optional(v.number()),
          startedAt: v.optional(v.number()),
          pageId: v.string(),
          error: v.optional(v.string()),
        })
      ),
      recentJobs: v.array(
        v.object({
          _id: v.id("leadSyncJobs"),
          status: v.string(),
          jobType: v.string(),
          totalLeads: v.optional(v.number()),
          completedAt: v.optional(v.number()),
          pageId: v.string(),
        })
      ),
      webhookEvents: v.number(),
    }),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        user: null,
        organization: null,
        stats: {
          totalLeads: 0,
          leadsToday: 0,
          connectedPages: 0,
          lastSyncTime: undefined,
          syncStatus: undefined,
          leadsByStatus: {
            new: 0,
            contacted: 0,
            qualified: 0,
            converted: 0,
            lost: 0,
          },
        },
        latestLeads: [],
        syncStatus: {
          currentJob: undefined,
          recentJobs: [],
          webhookEvents: 0,
        },
      };
    }

    const user = await ctx.db.get(userId) as Doc<"users"> | null;
    if (!user || !user.email) {
      return {
        user: null,
        organization: null,
        stats: {
          totalLeads: 0,
          leadsToday: 0,
          connectedPages: 0,
          lastSyncTime: undefined,
          syncStatus: undefined,
          leadsByStatus: {
            new: 0,
            contacted: 0,
            qualified: 0,
            converted: 0,
            lost: 0,
          },
        },
        latestLeads: [],
        syncStatus: {
          currentJob: undefined,
          recentJobs: [],
          webhookEvents: 0,
        },
      };
    }

    // Fetch organization data
    const organization = user.organizationId
      ? await ctx.db.get(user.organizationId) as Doc<"organizations"> | null
      : null;

    if (!organization || !user.organizationId) {
      return {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          status: user.status,
          createdAt: user._creationTime,
          isOnboarded: user.isOnboarded,
          organizationId: user.organizationId,
        },
        organization: null,
        stats: {
          totalLeads: 0,
          leadsToday: 0,
          connectedPages: 0,
          lastSyncTime: undefined,
          syncStatus: undefined,
          leadsByStatus: {
            new: 0,
            contacted: 0,
            qualified: 0,
            converted: 0,
            lost: 0,
          },
        },
        latestLeads: [],
        syncStatus: {
          currentJob: undefined,
          recentJobs: [],
          webhookEvents: 0,
        },
      };
    }

    // Parallel fetching of all data
    const [
      leads,
      activeIntegrations,
      latestSyncJob,
      processingJob,
      pendingJob,
      recentJobsResult,
      webhookEvents
    ] = await Promise.all([
      // Get all leads for the organization
      ctx.db
        .query("leads")
        .withIndex("byOrganization", (q) => q.eq("organizationId", user.organizationId!))
        .collect(),
      
      // Get active Meta integrations
      ctx.db
        .query("metaIntegrations")
        .withIndex("byOrganizationAndActive", (q) => 
          q.eq("organizationId", user.organizationId!).eq("isActive", true)
        )
        .collect(),
      
      // Get latest sync job for last sync time
      ctx.db
        .query("leadSyncJobs")
        .withIndex("byOrganization", (q) => q.eq("organizationId", user.organizationId!))
        .order("desc")
        .first(),
      
      // Get current processing job
      ctx.db
        .query("leadSyncJobs")
        .withIndex("byOrganizationAndStatus", (q) =>
          q.eq("organizationId", user.organizationId!).eq("status", "processing")
        )
        .first(),
      
      // Get pending job
      ctx.db
        .query("leadSyncJobs")
        .withIndex("byOrganizationAndStatus", (q) =>
          q.eq("organizationId", user.organizationId!).eq("status", "pending")
        )
        .first(),
      
      // Get recent completed and failed jobs separately using indexes
      Promise.all([
        ctx.db
          .query("leadSyncJobs")
          .withIndex("byOrganizationAndStatus", (q) =>
            q.eq("organizationId", user.organizationId!).eq("status", "completed")
          )
          .order("desc")
          .take(3),
        ctx.db
          .query("leadSyncJobs")
          .withIndex("byOrganizationAndStatus", (q) =>
            q.eq("organizationId", user.organizationId!).eq("status", "failed")
          )
          .order("desc")
          .take(3),
      ]),
      
      // Count webhook events
      ctx.db
        .query("metaWebhookEvents")
        .withIndex("byProcessed", (q) => q.eq("processed", true))
        .collect()
    ]);

    // Process stats data
    const leadsByStatus = {
      new: 0,
      contacted: 0,
      qualified: 0,
      converted: 0,
      lost: 0,
    };

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayTimestamp = todayStart.getTime();
    let leadsToday = 0;

    leads.forEach((lead) => {
      leadsByStatus[lead.status]++;
      if (lead.createdAt >= todayTimestamp) {
        leadsToday++;
      }
    });

    // Process recent jobs - combine completed and failed jobs, then sort
    const [completedJobs, failedJobs] = recentJobsResult;
    const recentJobs = [...completedJobs, ...failedJobs]
      .sort((a, b) => {
        const aTime = a.completedAt || a.updatedAt || 0;
        const bTime = b.completedAt || b.updatedAt || 0;
        return bTime - aTime;
      })
      .slice(0, 3);

    // Process sync status
    const isProcessingJobStale = processingJob && processingJob.startedAt 
      ? Date.now() - processingJob.startedAt > 10 * 60 * 1000
      : false;
    
    const currentJob = (!isProcessingJobStale ? processingJob : null) || pendingJob;

    // Get latest leads
    const limit = args.leadLimit || 5;
    const latestLeads = leads
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit)
      .map((lead) => ({
        _id: lead._id,
        leadId: lead.leadId,
        formName: lead.formName,
        email: lead.email,
        fullName: lead.fullName,
        phone: lead.phone,
        status: lead.status,
        createdTime: lead.createdTime,
        platform: lead.platform,
        city: lead.city,
        campaignName: lead.campaignName,
      }));

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        status: user.status,
        createdAt: user._creationTime,
        isOnboarded: user.isOnboarded,
        organizationId: user.organizationId,
      },
      organization: {
        _id: organization._id,
        name: organization.name,
        totalMembers: organization.members?.length || 0,
        activeMembers: organization.members,
        invitedMembers: 0,
      },
      stats: {
        totalLeads: leads.length,
        leadsToday,
        connectedPages: activeIntegrations.length,
        lastSyncTime: latestSyncJob?.completedAt || latestSyncJob?.startedAt,
        syncStatus: latestSyncJob?.status,
        leadsByStatus,
      },
      latestLeads,
      syncStatus: {
        currentJob: currentJob
          ? {
              _id: currentJob._id,
              status: currentJob.status,
              jobType: currentJob.jobType,
              totalLeads: currentJob.totalLeads,
              processedLeads: currentJob.processedLeads,
              failedLeads: currentJob.failedLeads,
              startedAt: currentJob.startedAt,
              pageId: currentJob.pageId,
              error: currentJob.error,
            }
          : undefined,
        recentJobs: recentJobs.map((job) => ({
          _id: job._id,
          status: job.status,
          jobType: job.jobType,
          totalLeads: job.totalLeads,
          completedAt: job.completedAt,
          pageId: job.pageId,
        })),
        webhookEvents: webhookEvents.length,
      },
    };
  },
});