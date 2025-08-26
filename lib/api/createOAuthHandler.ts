import { NextResponse } from "next/server";

import { createLogger } from "../logging/Logger";

interface OAuthHandlerOptions {
  platform: string;
  scope: string | string[];
  authorizationUrl: string;
  clientId: string;
  redirectUri: string;
  additionalParams?: Record<string, string>;
}

/**
 * Factory function to create OAuth authorization handlers
 * This standardizes the OAuth flow across different platforms
 */
export function createOAuthHandler(options: OAuthHandlerOptions) {
  const {
    platform,
    scope,
    authorizationUrl,
    clientId,
    redirectUri,
    additionalParams = {},
  } = options;

  const logger = createLogger(`${platform}.Auth`);

  return async () => {
    try {
      logger.info(`Starting ${platform} OAuth flow`);

      // Create state parameter for CSRF protection
      const state = Math.random().toString(36).substring(7);

      // Build authorization URL
      const authUrl = new URL(authorizationUrl);

      authUrl.searchParams.set("client_id", clientId);
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("state", state);
      authUrl.searchParams.set(
        "scope",
        Array.isArray(scope) ? scope.join(" ") : scope
      );

      // Add any additional parameters
      Object.entries(additionalParams).forEach(([key, value]) => {
        authUrl.searchParams.set(key, value);
      });

      logger.info(`Redirecting to ${platform} authorization`);

      return NextResponse.redirect(authUrl.toString());
    } catch (error) {
      logger.error(`${platform} OAuth error`, error as Error);

      return NextResponse.json(
        { error: `Failed to start ${platform} OAuth flow` },
        { status: 500 }
      );
    }
  };
}
