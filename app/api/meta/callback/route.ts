import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import axios from "axios";
import { type NextRequest, NextResponse } from "next/server";
import { META_CONFIG } from "@/configs/meta";
import { createLogger } from "@/lib/logging/Logger";
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
          errorDescription || error,
        )}`,
      );
    }

    if (!code || !state) {
      logger.error("Missing required Meta OAuth parameters");
      return NextResponse.redirect(
        `${request.nextUrl.origin}/onboarding/meta-connect?error=missing_parameters`,
      );
    }

    // Get Convex auth token for the authenticated user
    const token = await convexAuthNextjsToken();

    if (!token) {
      logger.info("No authenticated user, redirecting to signin");
      return NextResponse.redirect(
        `${request.nextUrl.origin}/auth/sign-in?redirect=/onboarding/meta-connect`,
      );
    }

    // Parse state to get original context (if needed in future)
    // const stateData = state ? JSON.parse(Buffer.from(state, "base64").toString()) : {};

    const clientId = process.env.NEXT_PUBLIC_META_APP_ID;
    const clientSecret = process.env.META_APP_SECRET;

    if (!clientId || !clientSecret) {
      logger.error("Missing Meta API credentials");
      return NextResponse.redirect(
        `${request.nextUrl.origin}/onboarding/meta-connect?error=missing_credentials`,
      );
    }

    const redirectUri =
      process.env.NEXT_PUBLIC_META_REDIRECT_URI ||
      `${request.nextUrl.origin}/api/meta/callback`;

    // Exchange code for access token
    logger.info("Exchanging authorization code for tokens");
    const tokenUrl = new URL(
      `https://graph.facebook.com/${META_CONFIG.API_VERSION}/oauth/access_token`,
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
        `${request.nextUrl.origin}/onboarding/meta-connect?error=no_access_token`,
      );
    }

    // Initialize Meta API with the access token
    const metaAPI = getMetaAPI(accessToken);

    try {
      // Get user info
      logger.info("Fetching user information");
      await metaAPI.getMe();

      // Check app deployment status and permissions
      const debugInfo = await metaAPI.getDebugInfo();

      // Check if app is in development mode
      if (debugInfo.appInfo.deployment_status === "DEVELOPMENT") {
        // Check if user has granted necessary permissions
        const grantedPermissions = debugInfo.permissions
          .filter((p) => p.status === "granted")
          .map((p) => p.permission);

        const requiredPermissions = ["pages_show_list", "leads_retrieval"];
        const missingPermissions = requiredPermissions.filter(
          (p) => !grantedPermissions.includes(p),
        );

        if (missingPermissions.length > 0) {
          logger.error("Missing required permissions", { missingPermissions });
          return NextResponse.redirect(
            `${request.nextUrl.origin}/onboarding/meta-connect?error=missing_permissions&details=${encodeURIComponent(
              missingPermissions.join(","),
            )}`,
          );
        }
      }

      // Get user's pages - try all methods
      // First try direct pages
      const directPages = await metaAPI.getUserPages();

      // If no direct pages, try Business Manager pages
      let pages = directPages;
      if (directPages.length === 0) {
        const businessPages = await metaAPI.getBusinessPages();
        pages = businessPages;
      }

      // If still no pages, try getting all pages (both direct and business)
      if (pages.length === 0) {
        pages = await metaAPI.getAllPages();
      }

      if (pages.length === 0) {
        logger.warn("No Facebook pages found", {
          isDevelopment: debugInfo.appInfo.deployment_status === "DEVELOPMENT",
        });

        // Provide more specific error message based on app mode
        const errorDetails =
          debugInfo.appInfo.deployment_status === "DEVELOPMENT"
            ? "No pages found. In dev mode: 1) Add yourself as app tester, 2) Ensure direct page admin access (not just Business Manager), 3) Or create a test page."
            : "No Facebook pages found. Make sure you have admin access to at least one Facebook Page.";

        return NextResponse.redirect(
          `${request.nextUrl.origin}/onboarding/meta-connect?error=no_pages&dev_mode=${
            debugInfo.appInfo.deployment_status === "DEVELOPMENT"
          }&details=${encodeURIComponent(errorDetails)}`,
        );
      }

      logger.info("Pages found", { count: pages.length });

      // Check each page for lead forms count using PAGE access token
      const pagesWithFormInfo = await Promise.all(
        pages.map(async (page) => {
          try {
            // IMPORTANT: Use the page's access token for leadgen_forms endpoint
            // In dev mode, leadgen_forms requires page access token, not user token
            const pageMetaAPI = getMetaAPI(page.access_token);
            const forms = await pageMetaAPI.getPageLeadForms(page.id);

            return {
              ...page,
              lead_forms_count: forms.length,
            };
          } catch (error) {
            logger.debug("Failed to fetch lead forms", {
              pageId: page.id,
              pageName: page.name,
              error: error instanceof Error ? error.message : "Unknown error",
            });

            // In dev mode, we might not be able to fetch forms even if they exist
            // Add a flag to indicate this might be a dev mode limitation
            return {
              ...page,
              lead_forms_count: 0,
              lead_forms_error:
                error instanceof Error ? error.message : "Unknown error",
              dev_mode_limitation: true,
            };
          }
        }),
      );

      // Prepare page selection URL with all page data
      const pageSelectionUrl = new URL(
        `${request.nextUrl.origin}/onboarding/select-page`,
      );

      // Pass pages data
      pageSelectionUrl.searchParams.set(
        "pages",
        encodeURIComponent(JSON.stringify(pagesWithFormInfo)),
      );

      // Pass tokens for later use
      const tokens = {
        userAccessToken: accessToken,
        tokenExpiresAt: Date.now() + expiresIn * 1000,
      };
      pageSelectionUrl.searchParams.set(
        "tokens",
        encodeURIComponent(JSON.stringify(tokens)),
      );

      logger.info("Redirecting to page selection", {
        pageCount: pages.length,
        pagesWithForms: pagesWithFormInfo.filter((p) => p.lead_forms_count > 0)
          .length,
      });

      return NextResponse.redirect(pageSelectionUrl.toString());
    } catch (apiError) {
      logger.error("Meta API error", apiError as Error);
      return NextResponse.redirect(
        `${request.nextUrl.origin}/onboarding/meta-connect?error=api_error&details=${encodeURIComponent(
          apiError instanceof Error ? apiError.message : "Unknown error",
        )}`,
      );
    }
  } catch (error) {
    logger.error("Meta callback error", error as Error);
    return NextResponse.redirect(
      `${request.nextUrl.origin}/onboarding/meta-connect?error=callback_failed&details=${encodeURIComponent(
        error instanceof Error ? error.message : "Unknown error",
      )}`,
    );
  }
}
