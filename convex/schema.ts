import { authTables } from "@convex-dev/auth/server";
import { defineSchema } from "convex/server";
import { onboarding, organizations, users } from "./schema/core";
import {
  leadActivities,
  leadCustomFields,
  leadStages,
  leadSyncJobs,
  leads,
  leadTags,
  leadViews,
  metaIntegrations,
  metaWebhookEvents,
} from "./schema/meta";

const schema = defineSchema({
  ...authTables,
  users,
  organizations,
  onboarding,
  metaIntegrations,
  leads,
  leadSyncJobs,
  metaWebhookEvents,
  leadCustomFields,
  leadStages,
  leadTags,
  leadActivities,
  leadViews,
});

export default schema;
