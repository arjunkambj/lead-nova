import type { Doc, Id } from "@/convex/_generated/dataModel";

// Filter configuration types
export interface LeadFilters {
  search?: string;
  stage?: string | null;
  priority?: string | null;
  assignedTo?: Id<"users"> | null;
  tags?: Id<"leadTags">[];
  dateRange?: DateRange | null;
  dateField?: string;
  score?: { min: number; max: number } | null;
}

export interface SortConfig {
  field: string;
  direction: "asc" | "desc";
}

export interface DateRange {
  start: Date | string;
  end: Date | string;
  preset?: string | null;
}

// Enhanced lead types
export type EnrichedLead = Doc<"leads"> & {
  assignedUser?: {
    id: Id<"users">;
    name: string;
    image?: string;
  } | null;
  tagDetails?: Doc<"leadTags">[];
};

// Kanban stage type
export interface KanbanStage {
  stage: string;
  stageInfo: Doc<"leadStages"> | null;
  leads: EnrichedLead[];
  count: number;
}

// Field update types
export type LeadFieldValue =
  | string
  | number
  | boolean
  | Id<"users">
  | Id<"leadTags">[]
  | null
  | undefined;

export interface BulkUpdateData {
  stage?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  assignedTo?: Id<"users"> | null;
  tags?: Id<"leadTags">[];
}

// View configuration types
export interface LeadView {
  name: string;
  viewType: "table" | "kanban" | "calendar";
  filters: LeadFilters;
  sorting?: SortConfig;
  columns?: string[];
  groupBy?: string;
  isDefault: boolean;
  isShared: boolean;
}

// Custom field types
export interface CustomField {
  name: string;
  label: string;
  fieldType:
    | "text"
    | "number"
    | "date"
    | "datetime"
    | "select"
    | "multiselect"
    | "checkbox"
    | "email"
    | "phone"
    | "url"
    | "currency"
    | "percent"
    | "textarea"
    | "richtext";
  options?: string[];
  required: boolean;
  defaultValue?: string;
  validation?: Record<string, unknown>;
  order: number;
  isActive: boolean;
  showInTable: boolean;
  showInKanban: boolean;
  searchable: boolean;
}

// Activity types
export type ActivityType =
  | "created"
  | "updated"
  | "stage_changed"
  | "assigned"
  | "note_added"
  | "email_sent"
  | "email_received"
  | "call_made"
  | "call_received"
  | "meeting_scheduled"
  | "task_created"
  | "task_completed"
  | "tag_added"
  | "tag_removed"
  | "custom";

export interface LeadActivity {
  _id: Id<"leadActivities">;
  organizationId: Id<"organizations">;
  leadId: Id<"leads">;
  userId: Id<"users">;
  activityType: ActivityType;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: number;
}

// Stats types
export interface LeadStats {
  total: number;
  byStage: Record<string, number>;
  byPriority: Record<string, number>;
  newLeadsToday: number;
  newLeadsThisWeek: number;
  newLeadsThisMonth: number;
  conversionRate: number;
}
