import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { Id, Doc } from "../_generated/dataModel";
import { paginationOptsValidator } from "convex/server";
import { getAuthUserId } from "../helpers/auth";

// Get paginated leads for table view - optimized with proper indexing
export const getLeadsTable = query({
  args: { 
    paginationOpts: paginationOptsValidator,
    filters: v.optional(v.string()), // JSON string of filter config
    sorting: v.optional(v.string()), // JSON string of sort config
  },
  returns: v.object({
    page: v.array(v.any()),
    isDone: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (!user?.organizationId) throw new Error("No organization");

    const filters = args.filters ? JSON.parse(args.filters) : {};
    const sortConfig = args.sorting ? JSON.parse(args.sorting) : { field: "createdAt", direction: "desc" };

    // Build query with proper indexes
    let query;
    
    // Use the most specific index based on filters
    if (filters.stage && filters.priority) {
      // For stage + priority, we'll need to filter priority in memory
      query = ctx.db
        .query("leads")
        .withIndex("byOrganizationAndStage", q => 
          q.eq("organizationId", user.organizationId!)
           .eq("stage", filters.stage)
        );
    } else if (filters.stage) {
      query = ctx.db
        .query("leads")
        .withIndex("byOrganizationAndStage", q => 
          q.eq("organizationId", user.organizationId!)
           .eq("stage", filters.stage)
        );
    } else {
      query = ctx.db
        .query("leads")
        .withIndex("byOrganization", q => q.eq("organizationId", user.organizationId!));
    }

    // Apply sorting direction
    if (sortConfig.direction === "desc") {
      query = query.order("desc");
    } else {
      query = query.order("asc");
    }

    // Use native pagination
    const paginatedResult = await query.paginate(args.paginationOpts);
    
    // Apply additional filters that can't be indexed
    let filteredLeads = paginatedResult.page;
    
    // Apply priority filter if not using stage+priority combo
    if (filters.priority && !filters.stage) {
      filteredLeads = filteredLeads.filter((lead) => lead.priority === filters.priority);
    }
    
    // Apply date range filter if specified
    if (filters.dateRange && filters.dateRange.start && filters.dateRange.end) {
      const dateField = filters.dateField || "createdTime";
      const startDate = new Date(filters.dateRange.start).getTime();
      const endDate = new Date(filters.dateRange.end).getTime() + 86400000;
      
      filteredLeads = filteredLeads.filter((lead) => {
        const dateValue = lead[dateField as keyof typeof lead] as number | undefined;
        if (!dateValue) return false;
        return dateValue >= startDate && dateValue <= endDate;
      });
    }
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredLeads = filteredLeads.filter((lead) => {
        return (
          lead.fullName?.toLowerCase().includes(searchLower) ||
          lead.email?.toLowerCase().includes(searchLower) ||
          lead.phone?.toLowerCase().includes(searchLower) ||
          lead.company?.toLowerCase().includes(searchLower) ||
          lead.city?.toLowerCase().includes(searchLower) ||
          lead.campaignName?.toLowerCase().includes(searchLower) ||
          lead.adName?.toLowerCase().includes(searchLower)
        );
      });
    }
    
    // Apply tags filter
    if (filters.tags && filters.tags.length > 0) {
      filteredLeads = filteredLeads.filter((lead) => {
        if (!lead.tags || lead.tags.length === 0) return false;
        return filters.tags.some((tagId: string) => lead.tags?.includes(tagId as Id<"leadTags">));
      });
    }

    // Batch enrich leads with related data using Promise.all
    const assignedUserIds = [...new Set(filteredLeads.map(lead => lead.assignedTo).filter(Boolean))] as Id<"users">[];
    const tagIds = [...new Set(filteredLeads.flatMap(lead => lead.tags || []))] as Id<"leadTags">[];
    
    // Fetch all related data in parallel
    const [assignedUsers, tags] = await Promise.all([
      Promise.all(assignedUserIds.map(id => ctx.db.get(id))),
      Promise.all(tagIds.map(id => ctx.db.get(id))),
    ]);
    
    // Create lookup maps for O(1) access
    const userMap = new Map(assignedUsers.filter(Boolean).map(user => [user!._id, user]));
    const tagMap = new Map(tags.filter(Boolean).map(tag => [tag!._id, tag]));
    
    // Enrich leads using the lookup maps
    const enrichedLeads = filteredLeads.map((lead) => ({
      ...lead,
      assignedUser: lead.assignedTo && userMap.has(lead.assignedTo) 
        ? {
            id: lead.assignedTo,
            name: userMap.get(lead.assignedTo)?.name || '',
            image: userMap.get(lead.assignedTo)?.image,
          } 
        : null,
      tagDetails: (lead.tags || []).map(tagId => tagMap.get(tagId)).filter(Boolean) as Doc<"leadTags">[],
    }));

    return {
      page: enrichedLeads,
      isDone: paginatedResult.isDone,
      continueCursor: paginatedResult.continueCursor,
    };
  },
});

// Get leads for kanban view - optimized with batched queries
export const getLeadsKanban = query({
  args: {
    filters: v.optional(v.string()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (!user?.organizationId) throw new Error("No organization");

    const filters = args.filters ? JSON.parse(args.filters) : {};

    // Fetch stages and leads in parallel
    const [stages, allLeads] = await Promise.all([
      ctx.db
        .query("leadStages")
        .withIndex("byOrganizationAndActive", q => 
          q.eq("organizationId", user.organizationId!)
           .eq("isActive", true)
        )
        .order("asc")
        .collect(),
      ctx.db
        .query("leads")
        .withIndex("byOrganization", q => q.eq("organizationId", user.organizationId!))
        .collect(),
    ]);
    
    // Apply filters
    let filteredLeads = allLeads;
    
    // Apply date range filter
    if (filters.dateRange && filters.dateRange.start && filters.dateRange.end) {
      const dateField = filters.dateField || "createdTime";
      const startDate = new Date(filters.dateRange.start).getTime();
      const endDate = new Date(filters.dateRange.end).getTime() + 86400000;
      
      filteredLeads = filteredLeads.filter((lead) => {
        const dateValue = lead[dateField as keyof typeof lead] as number | undefined;
        if (!dateValue) return false;
        return dateValue >= startDate && dateValue <= endDate;
      });
    }
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredLeads = filteredLeads.filter((lead) => {
        return (
          lead.fullName?.toLowerCase().includes(searchLower) ||
          lead.email?.toLowerCase().includes(searchLower) ||
          lead.phone?.toLowerCase().includes(searchLower) ||
          lead.company?.toLowerCase().includes(searchLower)
        );
      });
    }
    
    // Apply priority filter
    if (filters.priority) {
      filteredLeads = filteredLeads.filter((lead) => lead.priority === filters.priority);
    }
    
    // Apply tags filter
    if (filters.tags && filters.tags.length > 0) {
      filteredLeads = filteredLeads.filter((lead) => {
        if (!lead.tags || lead.tags.length === 0) return false;
        return filters.tags.some((tagId: string) => lead.tags?.includes(tagId as Id<"leadTags">));
      });
    }

    // Batch fetch all related data
    const assignedUserIds = [...new Set(filteredLeads.map(lead => lead.assignedTo).filter(Boolean))] as Id<"users">[];
    const assignedUsers = await Promise.all(assignedUserIds.map(id => ctx.db.get(id)));
    const userMap = new Map(assignedUsers.filter(Boolean).map(user => [user!._id, user]));

    // Group leads by stage with enrichment
    const leadsByStage = stages.map((stage) => {
      const stageLeads = filteredLeads
        .filter((lead) => (lead.stage || "new") === stage.name)
        .map((lead) => ({
          ...lead,
          assignedUser: lead.assignedTo && userMap.has(lead.assignedTo)
            ? {
                id: lead.assignedTo,
                name: userMap.get(lead.assignedTo)?.name || '',
                image: userMap.get(lead.assignedTo)?.image,
              }
            : null,
        }));

      return {
        stage: stage.name,
        stageInfo: stage,
        leads: stageLeads,
        count: stageLeads.length,
      };
    });

    return leadsByStage;
  },
});

// Update a single lead field
export const updateLeadField = mutation({
  args: {
    leadId: v.id("leads"),
    field: v.string(),
    value: v.union(
      v.string(),
      v.number(),
      v.boolean(),
      v.null(),
      v.id("users"),
      v.array(v.id("leadTags"))
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (!user?.organizationId) throw new Error("No organization");

    const lead = await ctx.db.get(args.leadId);
    if (!lead || lead.organizationId !== user.organizationId) {
      throw new Error("Lead not found");
    }

    // Update the specific field
    const updateData: Record<string, unknown> = {
      [args.field]: args.value,
      updatedAt: Date.now(),
    };

    // Special handling for stage changes
    if (args.field === "stage") {
      updateData.lastActivityAt = Date.now();
      
      // Log activity
      await ctx.db.insert("leadActivities", {
        organizationId: user.organizationId,
        leadId: args.leadId,
        userId,
        activityType: "stage_changed",
        description: `Stage changed from ${lead.stage || 'new'} to ${args.value}`,
        metadata: JSON.stringify({ from: lead.stage, to: args.value }),
        createdAt: Date.now(),
      });
    }

    await ctx.db.patch(args.leadId, updateData);
    return null;
  },
});

// Bulk update leads
export const bulkUpdateLeads = mutation({
  args: {
    leadIds: v.array(v.id("leads")),
    updates: v.object({
      stage: v.optional(v.string()),
      assignedTo: v.optional(v.id("users")),
      priority: v.optional(v.string()),
      tags: v.optional(v.array(v.id("leadTags"))),
    }),
  },
  returns: v.object({
    updated: v.number(),
    failed: v.number(),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (!user?.organizationId) throw new Error("No organization");

    let updated = 0;
    let failed = 0;

    for (const leadId of args.leadIds) {
      try {
        const lead = await ctx.db.get(leadId);
        if (!lead || lead.organizationId !== user.organizationId) {
          failed++;
          continue;
        }

        const patchData: Record<string, unknown> = {
          updatedAt: Date.now(),
          lastActivityAt: Date.now(),
        };
        
        if (args.updates.stage) patchData.stage = args.updates.stage;
        if (args.updates.assignedTo) patchData.assignedTo = args.updates.assignedTo;
        if (args.updates.priority) patchData.priority = args.updates.priority;
        if (args.updates.tags) patchData.tags = args.updates.tags;
        
        await ctx.db.patch(leadId, patchData);

        // Log activity for important changes
        if (args.updates.stage && args.updates.stage !== lead.stage) {
          await ctx.db.insert("leadActivities", {
            organizationId: user.organizationId,
            leadId,
            userId,
            activityType: "stage_changed",
            description: `Bulk stage change from ${lead.stage || 'new'} to ${args.updates.stage}`,
            createdAt: Date.now(),
          });
        }

        updated++;
      } catch (error) {
        console.error(`Failed to update lead ${leadId}:`, error);
        failed++;
      }
    }

    return { updated, failed };
  },
});

// Create custom field
export const createCustomField = mutation({
  args: {
    name: v.string(),
    label: v.string(),
    fieldType: v.string(),
    options: v.optional(v.array(v.string())),
    required: v.boolean(),
    defaultValue: v.optional(v.string()),
    showInTable: v.boolean(),
    showInKanban: v.boolean(),
  },
  returns: v.id("leadCustomFields"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (!user?.organizationId) throw new Error("No organization");

    // Get the next order number
    const existingFields = await ctx.db
      .query("leadCustomFields")
      .withIndex("byOrganization", q => q.eq("organizationId", user.organizationId!))
      .collect();

    const maxOrder = Math.max(0, ...existingFields.map(f => f.order));

    const fieldId = await ctx.db.insert("leadCustomFields", {
      organizationId: user.organizationId,
      name: args.name,
      label: args.label,
      fieldType: args.fieldType as "text" | "number" | "date" | "datetime" | "select" | "multiselect" | "checkbox" | "email" | "phone" | "url" | "currency" | "percent" | "textarea" | "richtext",
      options: args.options,
      required: args.required,
      defaultValue: args.defaultValue,
      order: maxOrder + 1,
      isActive: true,
      showInTable: args.showInTable,
      showInKanban: args.showInKanban,
      searchable: ["text", "email", "phone", "url"].includes(args.fieldType),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return fieldId;
  },
});

// Get custom fields for organization
export const getCustomFields = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (!user?.organizationId) throw new Error("No organization");

    const fields = await ctx.db
      .query("leadCustomFields")
      .withIndex("byOrganizationAndActive", q => 
        q.eq("organizationId", user.organizationId!)
         .eq("isActive", true)
      )
      .order("asc")
      .collect();

    return fields;
  },
});

// Get or create default stages for organization
export const ensureDefaultStages = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (!user?.organizationId) throw new Error("No organization");

    // Check if stages already exist
    const existingStages = await ctx.db
      .query("leadStages")
      .withIndex("byOrganization", q => q.eq("organizationId", user.organizationId!))
      .collect();

    if (existingStages.length > 0) {
      return null;
    }

    // Create default stages
    const defaultStages = [
      { name: "new", label: "New", color: "default", probability: 10, isDefault: true },
      { name: "contacted", label: "Contacted", color: "primary", probability: 20 },
      { name: "qualified", label: "Qualified", color: "secondary", probability: 40 },
      { name: "proposal", label: "Proposal", color: "warning", probability: 60 },
      { name: "negotiation", label: "Negotiation", color: "warning", probability: 80 },
      { name: "closed-won", label: "Closed Won", color: "success", probability: 100 },
      { name: "closed-lost", label: "Closed Lost", color: "danger", probability: 0 },
    ];

    for (let i = 0; i < defaultStages.length; i++) {
      const stage = defaultStages[i];
      await ctx.db.insert("leadStages", {
        organizationId: user.organizationId,
        name: stage.name,
        label: stage.label,
        color: stage.color,
        order: i,
        probability: stage.probability,
        isActive: true,
        isDefault: stage.isDefault || false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return null;
  },
});

// Get lead stages for organization
export const getStages = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (!user?.organizationId) throw new Error("No organization");

    const stages = await ctx.db
      .query("leadStages")
      .withIndex("byOrganizationAndActive", q => 
        q.eq("organizationId", user.organizationId!)
         .eq("isActive", true)
      )
      .order("asc")
      .collect();

    return stages;
  },
});

// Create or update a tag
export const upsertTag = mutation({
  args: {
    name: v.string(),
    color: v.string(),
    description: v.optional(v.string()),
  },
  returns: v.id("leadTags"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (!user?.organizationId) throw new Error("No organization");

    // Check if tag exists
    const existingTags = await ctx.db
      .query("leadTags")
      .withIndex("byOrganization", q => q.eq("organizationId", user.organizationId!))
      .collect();
    
    const existingTag = existingTags.find(t => t.name === args.name);

    if (existingTag) {
      await ctx.db.patch(existingTag._id, {
        color: args.color,
        description: args.description,
        updatedAt: Date.now(),
      });
      return existingTag._id;
    }

    // Create new tag
    const tagId = await ctx.db.insert("leadTags", {
      organizationId: user.organizationId,
      name: args.name,
      color: args.color,
      description: args.description,
      usageCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return tagId;
  },
});

// Get all tags for organization
export const getTags = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (!user?.organizationId) throw new Error("No organization");

    const tags = await ctx.db
      .query("leadTags")
      .withIndex("byOrganization", q => q.eq("organizationId", user.organizationId!))
      .order("desc")
      .collect();

    return tags;
  },
});

// Get lead activities
export const getLeadActivities = query({
  args: {
    leadId: v.id("leads"),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const limit = args.limit || 50;

    const activities = await ctx.db
      .query("leadActivities")
      .withIndex("byLeadAndCreatedAt", q => q.eq("leadId", args.leadId))
      .order("desc")
      .take(limit);

    // Enrich with user info
    const enrichedActivities = await Promise.all(
      activities.map(async (activity) => {
        const user = await ctx.db.get(activity.userId);
        return {
          ...activity,
          user: user ? {
            id: user._id,
            name: user.name,
            image: user.image,
          } : null,
        };
      })
    );

    return enrichedActivities;
  },
});

// Save a view configuration
export const saveView = mutation({
  args: {
    name: v.string(),
    viewType: v.union(v.literal("table"), v.literal("kanban"), v.literal("calendar")),
    filters: v.string(),
    sorting: v.optional(v.string()),
    columns: v.optional(v.string()),
    groupBy: v.optional(v.string()),
    isShared: v.boolean(),
  },
  returns: v.id("leadViews"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (!user?.organizationId) throw new Error("No organization");

    // Get the next order number
    const existingViews = await ctx.db
      .query("leadViews")
      .withIndex("byOrganizationAndUser", q => 
        q.eq("organizationId", user.organizationId!)
         .eq("userId", userId)
      )
      .collect();

    const maxOrder = Math.max(0, ...existingViews.map(v => v.order));

    const viewId = await ctx.db.insert("leadViews", {
      organizationId: user.organizationId,
      userId: args.isShared ? undefined : userId,
      name: args.name,
      viewType: args.viewType,
      filters: args.filters,
      sorting: args.sorting,
      columns: args.columns,
      groupBy: args.groupBy,
      isDefault: false,
      isShared: args.isShared,
      order: maxOrder + 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return viewId;
  },
});

// Get saved views
export const getSavedViews = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (!user?.organizationId) throw new Error("No organization");

    // Get user's views and shared org views
    const [userViews, sharedViews] = await Promise.all([
      ctx.db
        .query("leadViews")
        .withIndex("byOrganizationAndUser", q => 
          q.eq("organizationId", user.organizationId!)
           .eq("userId", userId)
        )
        .order("asc")
        .collect(),
      ctx.db
        .query("leadViews")
        .withIndex("byOrganization", q => q.eq("organizationId", user.organizationId!))
        .filter(q => q.eq(q.field("isShared"), true))
        .collect(),
    ]);

    return [...userViews, ...sharedViews];
  },
});

// Get single lead details
export const getLeadDetails = query({
  args: {
    leadId: v.id("leads"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new Error("Lead not found");

    // Verify user has access to this lead
    const user = await ctx.db.get(userId);
    if (!user?.organizationId || lead.organizationId !== user.organizationId) {
      throw new Error("Access denied");
    }

    // Enrich with related data
    const [assignedUser, tags] = await Promise.all([
      lead.assignedTo ? ctx.db.get(lead.assignedTo) : null,
      lead.tags ? Promise.all(lead.tags.map((tagId: Id<"leadTags">) => ctx.db.get(tagId))) : [],
    ]);

    return {
      ...lead,
      assignedUser: assignedUser ? {
        id: assignedUser._id,
        name: assignedUser.name,
        image: assignedUser.image,
      } : null,
      tagDetails: tags.filter(Boolean),
    };
  },
});

// Get lead statistics - optimized
export const getLeadStats = query({
  args: {},
  returns: v.object({
    total: v.number(),
    byStage: v.array(v.object({
      stage: v.string(),
      count: v.number(),
      value: v.number(),
    })),
    byPriority: v.array(v.object({
      priority: v.string(),
      count: v.number(),
    })),
    recentActivity: v.number(),
    averageScore: v.number(),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (!user?.organizationId) throw new Error("No organization");

    // Get all leads for the organization
    const leads = await ctx.db
      .query("leads")
      .withIndex("byOrganization", q => q.eq("organizationId", user.organizationId!))
      .collect();

    // Calculate statistics
    const total = leads.length;

    // Group by stage
    const stageGroups = new Map<string, { count: number; value: number }>();
    const priorityGroups = new Map<string, number>();
    let totalScore = 0;
    let scoreCount = 0;
    let recentActivityCount = 0;
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;

    for (const lead of leads) {
      // Stage statistics
      const stage = lead.stage || "new";
      const current = stageGroups.get(stage) || { count: 0, value: 0 };
      current.count++;
      current.value += lead.estimatedValue || 0;
      stageGroups.set(stage, current);

      // Priority statistics
      const priority = lead.priority || "medium";
      priorityGroups.set(priority, (priorityGroups.get(priority) || 0) + 1);

      // Score average
      if (lead.score !== undefined && lead.score !== null) {
        totalScore += lead.score;
        scoreCount++;
      }

      // Recent activity
      if (lead.lastActivityAt && lead.lastActivityAt > dayAgo) {
        recentActivityCount++;
      }
    }

    const byStage = Array.from(stageGroups.entries()).map(([stage, data]) => ({
      stage,
      count: data.count,
      value: data.value,
    }));

    const byPriority = Array.from(priorityGroups.entries()).map(([priority, count]) => ({
      priority,
      count,
    }));

    return {
      total,
      byStage,
      byPriority,
      recentActivity: recentActivityCount,
      averageScore: scoreCount > 0 ? totalScore / scoreCount : 0,
    };
  },
});

// Batched query for dashboard data - fetches multiple datasets in parallel
export const getDashboardData = query({
  args: {},
  returns: v.object({
    stats: v.any(),
    stages: v.array(v.any()),
    tags: v.array(v.any()),
    customFields: v.array(v.any()),
    savedViews: v.array(v.any()),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (!user?.organizationId) throw new Error("No organization");

    // Fetch all data in parallel
    const [leads, stages, tags, customFields, userViews, sharedViews] = await Promise.all([
      ctx.db
        .query("leads")
        .withIndex("byOrganization", q => q.eq("organizationId", user.organizationId!))
        .collect(),
      ctx.db
        .query("leadStages")
        .withIndex("byOrganizationAndActive", q => 
          q.eq("organizationId", user.organizationId!)
           .eq("isActive", true)
        )
        .order("asc")
        .collect(),
      ctx.db
        .query("leadTags")
        .withIndex("byOrganization", q => q.eq("organizationId", user.organizationId!))
        .order("desc")
        .collect(),
      ctx.db
        .query("leadCustomFields")
        .withIndex("byOrganizationAndActive", q => 
          q.eq("organizationId", user.organizationId!)
           .eq("isActive", true)
        )
        .order("asc")
        .collect(),
      ctx.db
        .query("leadViews")
        .withIndex("byOrganizationAndUser", q => 
          q.eq("organizationId", user.organizationId!)
           .eq("userId", userId)
        )
        .order("asc")
        .collect(),
      ctx.db
        .query("leadViews")
        .withIndex("byOrganization", q => q.eq("organizationId", user.organizationId!))
        .filter(q => q.eq(q.field("isShared"), true))
        .collect(),
    ]);

    // Calculate stats from leads
    const total = leads.length;
    const stageGroups = new Map<string, { count: number; value: number }>();
    const priorityGroups = new Map<string, number>();
    let totalScore = 0;
    let scoreCount = 0;
    let recentActivityCount = 0;
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;

    for (const lead of leads) {
      const stage = lead.stage || "new";
      const current = stageGroups.get(stage) || { count: 0, value: 0 };
      current.count++;
      current.value += lead.estimatedValue || 0;
      stageGroups.set(stage, current);

      const priority = lead.priority || "medium";
      priorityGroups.set(priority, (priorityGroups.get(priority) || 0) + 1);

      if (lead.score !== undefined && lead.score !== null) {
        totalScore += lead.score;
        scoreCount++;
      }

      if (lead.lastActivityAt && lead.lastActivityAt > dayAgo) {
        recentActivityCount++;
      }
    }

    const stats = {
      total,
      byStage: Array.from(stageGroups.entries()).map(([stage, data]) => ({
        stage,
        count: data.count,
        value: data.value,
      })),
      byPriority: Array.from(priorityGroups.entries()).map(([priority, count]) => ({
        priority,
        count,
      })),
      recentActivity: recentActivityCount,
      averageScore: scoreCount > 0 ? totalScore / scoreCount : 0,
    };

    return {
      stats,
      stages,
      tags,
      customFields,
      savedViews: [...userViews, ...sharedViews],
    };
  },
});