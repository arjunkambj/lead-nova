import workpool from "@convex-dev/workpool/convex.config";
import { defineApp } from "convex/server";

const app = defineApp();

// Configure Work Pool for lead syncing
app.use(workpool, {
  name: "leadSyncPool",
});

export default app;
