/**
 * Meta Graph API Configuration
 */

export const META_CONFIG = {
  // API Version
  API_VERSION: 'v23.0',
  
  // Base URLs
  GRAPH_URL: 'https://graph.facebook.com',
  OAUTH_URL: 'https://www.facebook.com/v23.0/dialog/oauth',
  TOKEN_URL: 'https://graph.facebook.com/v23.0/oauth/access_token',
  
  // OAuth Scopes - only essential permissions for lead generation
  SCOPES: [
    'pages_show_list',
    'pages_read_engagement',
    'leads_retrieval',
    'pages_manage_metadata'
  ],
  
  // Webhook Configuration
  WEBHOOK_FIELDS: ['leadgen'],
  WEBHOOK_VERIFY_TOKEN: process.env.META_WEBHOOK_VERIFY_TOKEN || 'default_verify_token',
  
  // Lead Sync Configuration
  LEAD_BATCH_SIZE: 50,
  HISTORICAL_DAYS: 30,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // ms
  
  // Rate Limiting
  RATE_LIMIT: {
    MAX_REQUESTS_PER_HOUR: 200,
    MAX_REQUESTS_PER_SECOND: 10,
  },
  
  // Timeouts
  REQUEST_TIMEOUT: 30000, // 30 seconds
  WEBHOOK_TIMEOUT: 10000, // 10 seconds
} as const;

/**
 * Get OAuth URL for Meta login
 */
export function getOAuthUrl(redirectUri: string, state?: string): string {
  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_META_APP_ID!,
    redirect_uri: redirectUri,
    scope: META_CONFIG.SCOPES.join(','),
    response_type: 'code',
    ...(state && { state }),
  });
  
  return `${META_CONFIG.OAUTH_URL}?${params.toString()}`;
}

/**
 * Get Graph API endpoint URL
 */
export function getGraphUrl(endpoint: string, version: string = META_CONFIG.API_VERSION): string {
  return `${META_CONFIG.GRAPH_URL}/${version}/${endpoint}`;
}

