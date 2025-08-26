import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { fetchMutation } from "convex/nextjs";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "@/convex/_generated/api";
import { createLogger } from "@/lib/logging/Logger";
import { META_CONFIG } from "@/configs/meta";
import { getMetaAPI } from "@/lib/meta/api";

const logger = createLogger("Meta.Callback");

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");
    
    // Handle OAuth errors
    if (error) {
      logger.warn("Meta OAuth error", { error, errorDescription });
      return NextResponse.redirect(
        `${request.nextUrl.origin}/onboarding/meta-connect?error=${encodeURIComponent(
          errorDescription || error
        )}`
      );
    }
    
    if (!code || !state) {
      logger.error("Missing required Meta OAuth parameters");
      return NextResponse.redirect(
        `${request.nextUrl.origin}/onboarding/meta-connect?error=missing_parameters`
      );
    }
    
    // Get Convex auth token for the authenticated user
    const token = await convexAuthNextjsToken();
    
    if (!token) {
      logger.info("No authenticated user, redirecting to signin");
      return NextResponse.redirect(
        `${request.nextUrl.origin}/auth/sign-in?redirect=/onboarding/meta-connect`
      );
    }
    
    // Parse state to get original context (if needed in future)
    // const stateData = state ? JSON.parse(Buffer.from(state, "base64").toString()) : {};
    
    const clientId = process.env.NEXT_PUBLIC_META_APP_ID!;
    const clientSecret = process.env.META_APP_SECRET!;
    const redirectUri = process.env.NEXT_PUBLIC_META_REDIRECT_URI || 
      `${request.nextUrl.origin}/api/meta/callback`;
    
    // Exchange code for access token
    logger.info("Exchanging authorization code for tokens");
    const tokenUrl = new URL(
      `https://graph.facebook.com/${META_CONFIG.API_VERSION}/oauth/access_token`
    );
    
    tokenUrl.searchParams.set("client_id", clientId);
    tokenUrl.searchParams.set("client_secret", clientSecret);
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("code", code);
    
    const tokenResponse = await axios.get(tokenUrl.toString());
    
    logger.info("Token exchange response", {
      hasAccessToken: !!tokenResponse.data.access_token,
      expiresIn: tokenResponse.data.expires_in,
    });
    
    const accessToken = tokenResponse.data.access_token;
    const expiresIn = tokenResponse.data.expires_in || 60 * 60 * 24 * 60; // 60 days default
    
    if (!accessToken) {
      return NextResponse.redirect(
        `${request.nextUrl.origin}/onboarding/meta-connect?error=no_access_token`
      );
    }
    
    // Initialize Meta API with the access token
    const metaAPI = getMetaAPI(accessToken);
    
    try {
      // Get user info
      logger.info("Fetching user information");
      const userInfo = await metaAPI.getMe();
      
      logger.info("User info retrieved", {
        id: userInfo.id,
        name: userInfo.name,
      });
      
      // Get user's pages
      logger.info("Fetching user pages");
      const pages = await metaAPI.getUserPages();
      
      if (pages.length === 0) {
        logger.warn("No Facebook pages found for user");
        return NextResponse.redirect(
          `${request.nextUrl.origin}/onboarding/meta-connect?error=no_pages`
        );
      }
      
      // For now, auto-select the first page
      // TODO: In production, show page selection UI
      const selectedPage = pages[0];
      logger.info("Selected page", {
        pageId: selectedPage.id,
        pageName: selectedPage.name,
      });
      
      // Store Meta connection in Convex (tokens stored as plain text for now)
      logger.info("Storing Meta connection in database");
      const integrationResult = await fetchMutation(
        api.integration.meta.connectMetaAccount,
        {
          pageId: selectedPage.id,
          pageName: selectedPage.name,
          pageAccessToken: selectedPage.access_token,
          userAccessToken: accessToken,
          tokenExpiresAt: Date.now() + expiresIn * 1000,
        },
        { token }
      );
      
      if (!integrationResult.success || !integrationResult.integrationId) {
        throw new Error("Failed to store integration");
      }
      
      logger.info("Meta connection stored successfully", {
        integrationId: integrationResult.integrationId,
      });
      
      // Subscribe to webhooks (pointing directly to Convex HTTP endpoint)
      const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
      if (convexUrl) {
        const webhookUrl = `${convexUrl.replace('.convex.cloud', '.convex.site')}/webhook/meta`;
        logger.info("Subscribing to webhooks", { webhookUrl });
        
        const subscribed = await metaAPI.subscribePageWebhook(selectedPage.id, webhookUrl);
        if (!subscribed) {
          logger.error("Failed to subscribe to webhooks");
        } else {
          logger.info("Successfully subscribed to webhooks");
        }
      }
      
      // Prepare success URL with page info
      const successUrl = new URL(`${request.nextUrl.origin}/onboarding/meta-connect`);
      successUrl.searchParams.set("success", "true");
      successUrl.searchParams.set("page", selectedPage.name);
      successUrl.searchParams.set("pageId", selectedPage.id);
      
      // Add all pages info for display
      if (pages.length > 1) {
        const pagesInfo = pages.map(p => ({
          id: p.id,
          name: p.name,
          selected: p.id === selectedPage.id
        }));
        successUrl.searchParams.set("pages", JSON.stringify(pagesInfo));
      }
      
      logger.info("Meta connection complete, redirecting to success page");
      return NextResponse.redirect(successUrl.toString());
      
    } catch (apiError) {
      logger.error("Meta API error", apiError as Error);
      return NextResponse.redirect(
        `${request.nextUrl.origin}/onboarding/meta-connect?error=api_error&details=${
          encodeURIComponent(apiError instanceof Error ? apiError.message : "Unknown error")
        }`
      );
    }
  } catch (error) {
    logger.error("Meta callback error", error as Error);
    return NextResponse.redirect(
      `${request.nextUrl.origin}/onboarding/meta-connect?error=callback_failed&details=${
        encodeURIComponent(error instanceof Error ? error.message : "Unknown error")
      }`
    );
  }
}