/**
 * Meta OAuth Authentication Flow
 */

import { getOAuthUrl, META_CONFIG } from "../../configs/meta";
import type { MetaOAuthState, MetaTokenResponse } from "../../types/meta";
import { getMetaAPI } from "./api";

/**
 * Generate OAuth state for security
 */
export function generateOAuthState(data: Partial<MetaOAuthState>): string {
  const state: MetaOAuthState = {
    organizationId: data.organizationId || "",
    userId: data.userId || "",
    redirectTo: data.redirectTo,
    timestamp: Date.now(),
  };

  // Encode as base64
  return Buffer.from(JSON.stringify(state)).toString("base64");
}

/**
 * Parse OAuth state
 */
export function parseOAuthState(stateString: string): MetaOAuthState | null {
  try {
    const decoded = Buffer.from(stateString, "base64").toString("utf-8");
    return JSON.parse(decoded) as MetaOAuthState;
  } catch (error) {
    console.error("Failed to parse OAuth state:", error);
    return null;
  }
}

/**
 * Validate OAuth state (check timestamp to prevent replay attacks)
 */
export function validateOAuthState(state: MetaOAuthState): boolean {
  const MAX_AGE = 10 * 60 * 1000; // 10 minutes
  const age = Date.now() - state.timestamp;
  return age < MAX_AGE;
}

/**
 * Initiate OAuth flow
 */
export function initiateOAuth(
  organizationId: string,
  userId: string,
  redirectUri: string,
): string {
  const state = generateOAuthState({ organizationId, userId });
  return getOAuthUrl(redirectUri, state);
}

/**
 * Handle OAuth callback
 */
export async function handleOAuthCallback(
  code: string,
  state: string,
  redirectUri: string,
): Promise<{
  success: boolean;
  token?: string;
  expiresIn?: number;
  state?: MetaOAuthState;
  error?: string;
}> {
  try {
    // Parse and validate state
    const oauthState = parseOAuthState(state);
    if (!oauthState) {
      return { success: false, error: "Invalid OAuth state" };
    }

    if (!validateOAuthState(oauthState)) {
      return { success: false, error: "OAuth state expired" };
    }

    // Exchange code for token
    const api = getMetaAPI();
    const tokenResponse = await api.exchangeCodeForToken(code, redirectUri);

    return {
      success: true,
      token: tokenResponse.access_token,
      expiresIn: tokenResponse.expires_in,
      state: oauthState,
    };
  } catch (error) {
    console.error("OAuth callback error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "OAuth callback failed",
    };
  }
}

/**
 * Refresh access token using a long-lived token
 */
export async function refreshAccessToken(currentToken: string): Promise<{
  success: boolean;
  token?: string;
  expiresIn?: number;
  error?: string;
}> {
  try {
    // Direct axios call for token refresh
    const { default: axios } = await import("axios");
    const response = await axios.get(
      `https://graph.facebook.com/${META_CONFIG.API_VERSION}/oauth/access_token`,
      {
        params: {
          grant_type: "fb_exchange_token",
          client_id: process.env.NEXT_PUBLIC_META_APP_ID,
          client_secret: process.env.META_APP_SECRET,
          fb_exchange_token: currentToken,
        },
      },
    );

    const data = response.data as MetaTokenResponse;

    return {
      success: true,
      token: data.access_token,
      expiresIn: data.expires_in,
    };
  } catch (error) {
    console.error("Token refresh error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Token refresh failed",
    };
  }
}

/**
 * Validate access token
 */
export async function validateAccessToken(token: string): Promise<boolean> {
  try {
    const api = getMetaAPI(token);
    const result = await api.debugToken(token);
    return result.isValid;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
}

/**
 * Revoke access token
 */
export async function revokeAccessToken(token: string): Promise<boolean> {
  try {
    const { default: axios } = await import("axios");
    await axios.delete(
      `https://graph.facebook.com/${META_CONFIG.API_VERSION}/me/permissions`,
      {
        params: { access_token: token },
      },
    );
    return true;
  } catch (error) {
    console.error("Token revocation error:", error);
    return false;
  }
}
