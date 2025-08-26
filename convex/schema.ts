import { defineSchema } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { users, organizations, onboarding } from "./schema/core";
import { metaIntegrations, leads, leadSyncJobs, metaWebhookEvents } from "./schema/meta";

const schema = defineSchema({
  ...authTables,
  users,
  organizations,
  onboarding,
  metaIntegrations,
  leads,
  leadSyncJobs,
  metaWebhookEvents,
});

export default schema;
