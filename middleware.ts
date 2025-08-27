import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isSignInPage = createRouteMatcher(["/signin", "/signup"]);
const isProtectedRoute = createRouteMatcher([
  "/overview(.*)",
  "/settings(.*)",
  "/onboarding(.*)",
]);

export default convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    if (isSignInPage(request) && (await convexAuth.isAuthenticated())) {
      return nextjsMiddlewareRedirect(request, "/overview");
    }
    if (isProtectedRoute(request) && !(await convexAuth.isAuthenticated())) {
      return nextjsMiddlewareRedirect(request, "/signin");
    }
  },
  { cookieConfig: { maxAge: 60 * 60 * 24 * 30 } }
);

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets and specific API routes that handle their own auth
  matcher: [
    "/((?!.*\\..*|_next|api/meta/auth|api/meta/callback).*)",
    "/",
    "/(trpc)(.*)"
  ],
};
