import { defineApp } from "convex/server";
import workpool from "@convex-dev/workpool/convex.config";

const app = defineApp();

// Configure Work Pool for lead syncing
app.use(workpool, { 
  name: "leadSyncPool" 
});

export default app;