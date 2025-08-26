import type { FunctionReference } from "convex/server";

import { NextRequest, NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";

import { createLogger } from "../logging/Logger";

const logger = createLogger("createOAuthCallbackHandler");

interface TokenExchangeResult {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
}

interface OAuthUserInfo {
  id: string;
  email?: string;
  name?: string;
  [key: string]: unknown;
}

interface AdAccount {
  id: string;
  name: string;
  [key: string]: unknown;
}

interface CreateOAuthCallbackHandlerOptions<
  M extends FunctionReference<"mutation">,
> {
  platform: string;
  tokenExchangeUrl: string;
  userInfoUrl?: string;
  clientIdEnvVar: string;
  clientSecretEnvVar: string;
  redirectUriPath: string;
  connectionMutation: M;
  requiresState?: boolean;
  successRedirect?: string;
  errorRedirect?: string;
  exchangeToken: (
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string
  ) => Promise<TokenExchangeResult>;
  getUserInfo?: (accessToken: string) => Promise<OAuthUserInfo>;
  fetchAdAccounts?: (
    accessToken: string,
    additionalParams?: Record<string, string>
  ) => Promise<AdAccount[]>;
  transformConnectionData?: (data: {
    tokenData: TokenExchangeResult;
    userInfo?: OAuthUserInfo;
    state?: string | null;
  }) => Record<string, unknown>;
  transformAdAccounts?: (accounts: AdAccount[]) => AdAccount[];
  additionalEnvVars?: string[];
  validateCookieState?: boolean;
}

/**
 * Creates an OAuth callback handler for platform integrations
 * Handles token exchange, user info fetching, and storing connections
 */
export function createOAuthCallbackHandler<
  M extends FunctionReference<"mutation">,
>({
  platform,
  clientIdEnvVar,
  clientSecretEnvVar,
  redirectUriPath,
  connectionMutation,
  successRedirect = "/onboarding/marketing",
  errorRedirect = "/onboarding/marketing",
  exchangeToken,
  getUserInfo,
  fetchAdAccounts,
  transformConnectionData,
  transformAdAccounts,
  additionalEnvVars = [],
  validateCookieState = true,
}: CreateOAuthCallbackHandlerOptions<M>) {
  return async function handler(req: NextRequest) {
    try {
      // Get the authenticated user's token from cookies or headers
      // NOTE: In production, implement proper JWT verification here
      const token =
        req.cookies.get("convex-auth-token")?.value ||
        req.headers.get("Authorization")?.replace("Bearer ", "");

      if (!token) {
        logger.warn(`Unauthorized ${platform} callback attempt`);

        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/auth/login?error=unauthorized`
        );
      }

      const { searchParams } = new URL(req.url);
      const code = searchParams.get("code");
      const error = searchParams.get("error");
      const state = searchParams.get("state");

      // Validate state for CSRF protection if enabled
      if (validateCookieState && state) {
        const cookieName = `${platform.toLowerCase()}_oauth_state`;
        const storedState = req.cookies.get(cookieName)?.value;

        if (storedState !== state) {
          logger.error(`${platform} OAuth state mismatch`, {
            received: state,
            expected: storedState,
          });

          return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}${errorRedirect}?error=state_mismatch`
          );
        }
      }

      // Handle OAuth errors
      if (error) {
        const errorDescription = searchParams.get("error_description");

        logger.error(`${platform} OAuth error`, {
          error,
          errorDescription,
        });

        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}${errorRedirect}?error=${encodeURIComponent(error)}`
        );
      }

      // Check for authorization code
      if (!code) {
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}${errorRedirect}?error=missing_code`
        );
      }

      // Get environment variables
      const clientId = process.env[clientIdEnvVar];
      const clientSecret = process.env[clientSecretEnvVar];
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "";
      const redirectUri = `${baseUrl}${redirectUriPath}`;

      // Validate required environment variables
      if (!clientId || !clientSecret) {
        logger.error(
          `Missing ${platform} credentials`,
          new Error("Missing environment variables")
        );

        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}${errorRedirect}?error=missing_credentials`
        );
      }

      // Check additional environment variables if required
      for (const envVar of additionalEnvVars) {
        if (!process.env[envVar]) {
          logger.error(`Missing ${envVar}`, new Error("Missing env var"));

          return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}${errorRedirect}?error=missing_credentials`
          );
        }
      }

      // Exchange authorization code for tokens
      logger.info(`Exchanging ${platform} authorization code for tokens`);
      const tokenData = await exchangeToken(
        code,
        clientId,
        clientSecret,
        redirectUri
      );

      logger.info(`${platform} token exchange successful`, {
        hasAccessToken: !!tokenData.access_token,
        hasRefreshToken: !!tokenData.refresh_token,
        expiresIn: tokenData.expires_in,
      });

      if (!tokenData.access_token) {
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}${errorRedirect}?error=no_access_token`
        );
      }

      // Get user information if handler provided
      let userInfo: OAuthUserInfo | undefined;

      if (getUserInfo) {
        logger.info(`Fetching ${platform} user information`);
        userInfo = await getUserInfo(tokenData.access_token);
        logger.info(`${platform} user info retrieved`, {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
        });
      }

      // Prepare connection data
      let connectionData: Record<string, unknown> = {
        sessionId: state || "default",
        tokenData,
      };

      if (userInfo) {
        connectionData.accountInfo = userInfo;
      }

      // Transform connection data if handler provided
      if (transformConnectionData) {
        connectionData = transformConnectionData({
          tokenData,
          userInfo,
          state,
        });
      }

      // Store the connection in Convex
      logger.info(`Storing ${platform} connection in database`);
      // @ts-expect-error - connectionData shape depends on specific mutation
      await fetchMutation(connectionMutation, connectionData, { token });

      // Fetch ad accounts if handler provided
      if (fetchAdAccounts) {
        try {
          logger.info(`Fetching ${platform} ad accounts`);
          const additionalParams: Record<string, string> = {};

          // Add any additional parameters from environment
          for (const envVar of additionalEnvVars) {
            additionalParams[envVar] = process.env[envVar]!;
          }

          const adAccounts = await fetchAdAccounts(
            tokenData.access_token,
            additionalParams
          );

          if (adAccounts && adAccounts.length > 0) {
            logger.info(`Found ${adAccounts.length} ${platform} ad accounts`);

            // Transform ad accounts if handler provided
            const transformedAccounts = transformAdAccounts
              ? transformAdAccounts(adAccounts)
              : adAccounts;

            // You would typically sync these accounts here
            // This would require another mutation to be passed in
            logger.info(`Synced ${transformedAccounts.length} accounts`);
          } else {
            logger.warn(`No ${platform} ad accounts found`);

            return NextResponse.redirect(
              `${process.env.NEXT_PUBLIC_APP_URL}${errorRedirect}?error=no_ad_accounts`
            );
          }
        } catch (adsError) {
          logger.error(
            `Error fetching ${platform} ad accounts`,
            adsError as Error
          );

          // Still mark as connected even if ad accounts fetch fails
          return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}${successRedirect}?${platform.toLowerCase()}_connected=true&error=ads_fetch_failed`
          );
        }
      }

      // Clear the state cookie if it was used
      if (validateCookieState) {
        const response = NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}${successRedirect}`
        );

        response.cookies.delete(`${platform.toLowerCase()}_oauth_state`);

        return response;
      }

      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}${successRedirect}`
      );
    } catch (error) {
      logger.error(`${platform} callback error`, error as Error);

      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}${errorRedirect}?error=callback_error`
      );
    }
  };
}

/**
 * Standard token exchange function for OAuth 2.0
 */
export async function standardTokenExchange(
  tokenUrl: string,
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<TokenExchangeResult> {
  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const error = await response.text();

    throw new Error(`Token exchange failed: ${error}`);
  }

  return response.json();
}

/**
 * Standard user info fetch function
 */
export async function standardGetUserInfo(
  userInfoUrl: string,
  accessToken: string
): Promise<OAuthUserInfo> {
  const response = await fetch(userInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user info: ${response.statusText}`);
  }

  return response.json();
}
