import { META_CONFIG } from "@/configs/meta";
import { createOAuthHandler } from "@/lib/api/createOAuthHandler";

export const runtime = "edge";

export const GET = createOAuthHandler({
  platform: "Meta",
  scope: META_CONFIG.SCOPES.join(","),
  authorizationUrl: META_CONFIG.OAUTH_URL,
  clientId: process.env.NEXT_PUBLIC_META_APP_ID || "",
  redirectUri:
    process.env.NEXT_PUBLIC_META_REDIRECT_URI ||
    `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/meta/callback`,
});
