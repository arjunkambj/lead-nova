/**
 * Meta Graph API Client
 */

import axios, { AxiosInstance } from "axios";
import { META_CONFIG } from "../../configs/meta";
import type {
  MetaApiResponse,
  MetaUser,
  MetaPage,
  MetaLead,
  MetaLeadForm,
  MetaTokenResponse,
  MetaError,
} from "../../types/meta";

export class MetaGraphAPI {
  private client: AxiosInstance;
  private accessToken?: string;

  constructor(accessToken?: string) {
    this.accessToken = accessToken;
    this.client = axios.create({
      baseURL: META_CONFIG.GRAPH_URL,
      timeout: META_CONFIG.REQUEST_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor for auth
    this.client.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.params = {
          ...config.params,
          access_token: this.accessToken,
        };
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.data?.error) {
          const metaError = error.response.data.error as MetaError;
          throw new MetaAPIError(
            metaError.message,
            metaError.code,
            metaError.type,
            metaError.fbtrace_id
          );
        }
        throw error;
      }
    );
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(
    code: string,
    redirectUri: string
  ): Promise<MetaTokenResponse> {
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_META_APP_ID!,
      client_secret: process.env.META_APP_SECRET!,
      code,
      redirect_uri: redirectUri,
    });

    const response = await this.client.get<MetaTokenResponse>(
      `/${META_CONFIG.API_VERSION}/oauth/access_token`,
      { params }
    );

    return response.data;
  }

  /**
   * Get current user info
   */
  async getMe(): Promise<MetaUser> {
    const response = await this.client.get<MetaUser>("/me", {
      params: {
        fields: "id,name,email,picture",
      },
    });
    return response.data;
  }

  /**
   * Get user's pages (direct pages only)
   */
  async getUserPages(): Promise<MetaPage[]> {
    const response = await this.client.get<MetaApiResponse<MetaPage[]>>(
      "/me/accounts",
      {
        params: {
          fields: "id,name,access_token,category,picture,tasks",
        },
      }
    );
    return response.data.data || [];
  }

  /**
   * Get user's Business Manager pages
   */
  async getBusinessPages(): Promise<MetaPage[]> {
    try {
      // First, get the user's businesses
      const businessResponse = await this.client.get<MetaApiResponse<Array<{ id: string; name: string }>>>(
        "/me/businesses",
        {
          params: {
            fields: "id,name",
          },
        }
      );
      
      const businesses = businessResponse.data.data || [];
      
      if (businesses.length === 0) {
        return [];
      }
      
      const allPages: MetaPage[] = [];
      
      // For each business, get owned pages and client pages
      for (const business of businesses) {
        try {
          // Try owned pages
          const ownedPagesResponse = await this.client.get<MetaApiResponse<MetaPage[]>>(
            `/${business.id}/owned_pages`,
            {
              params: {
                fields: "id,name,access_token,category,picture,tasks",
              },
            }
          );
          const ownedPages = ownedPagesResponse.data.data || [];
          allPages.push(...ownedPages);
        } catch {
          // Silently continue if owned pages cannot be fetched
        }
        
        try {
          // Try client pages (pages the business has been granted access to)
          const clientPagesResponse = await this.client.get<MetaApiResponse<MetaPage[]>>(
            `/${business.id}/client_pages`,
            {
              params: {
                fields: "id,name,access_token,category,picture,tasks",
              },
            }
          );
          const clientPages = clientPagesResponse.data.data || [];
          allPages.push(...clientPages);
        } catch {
          // Silently continue if client pages cannot be fetched
        }
      }
      
      // Remove duplicates based on page ID
      const uniquePages = Array.from(
        new Map(allPages.map(page => [page.id, page])).values()
      );
      
      return uniquePages;
    } catch {
      return [];
    }
  }

  /**
   * Get all accessible pages (direct + Business Manager)
   */
  async getAllPages(): Promise<MetaPage[]> {
    // Fetch both in parallel
    const [directPages, businessPages] = await Promise.all([
      this.getUserPages().catch(() => []),
      this.getBusinessPages().catch(() => [])
    ]);
    
    // Combine and remove duplicates
    const allPages = [...directPages, ...businessPages];
    const uniquePages = Array.from(
      new Map(allPages.map(page => [page.id, page])).values()
    );
    
    return uniquePages;
  }

  /**
   * Get user's permissions
   */
  async getUserPermissions(): Promise<Array<{ permission: string; status: string }>> {
    try {
      const response = await this.client.get<MetaApiResponse<Array<{ permission: string; status: string }>>>(
        "/me/permissions"
      );
      return response.data.data || [];
    } catch {
      return [];
    }
  }

  /**
   * Check if app is in development mode
   */
  async getAppInfo(): Promise<{
    id: string;
    name?: string;
    namespace?: string;
    category?: string;
    app_type?: number;
    supports_attribution?: boolean;
    deployment_status?: 'DEVELOPMENT' | 'LIVE';
  }> {
    try {
      const appId = process.env.NEXT_PUBLIC_META_APP_ID!;
      const appToken = `${appId}|${process.env.META_APP_SECRET}`;
      
      const response = await this.client.get(`/${appId}`, {
        params: {
          access_token: appToken,
          fields: 'id,name,namespace,category,app_type,supports_attribution,deployment_status'
        }
      });
      
      return response.data;
    } catch {
      return {
        id: process.env.NEXT_PUBLIC_META_APP_ID!,
        deployment_status: 'DEVELOPMENT' // Default to development if we can't check
      };
    }
  }

  /**
   * Get detailed debug info for connection issues
   */
  async getDebugInfo(): Promise<{
    user?: MetaUser;
    permissions: Array<{ permission: string; status: string }>;
    pages: MetaPage[];
    appInfo: {
      id: string;
      deployment_status?: 'DEVELOPMENT' | 'LIVE';
    };
    tokenInfo?: {
      isValid: boolean;
      expiresAt?: number;
      scopes?: string[];
    };
  }> {
    try {
      const [user, permissions, pages, appInfo] = await Promise.all([
        this.getMe().catch(() => undefined),
        this.getUserPermissions(),
        this.getUserPages(),
        this.getAppInfo()
      ]);

      let tokenInfo;
      if (this.accessToken) {
        tokenInfo = await this.debugToken(this.accessToken);
      }

      return {
        user,
        permissions,
        pages,
        appInfo,
        tokenInfo
      };
    } catch {
      return {
        permissions: [],
        pages: [],
        appInfo: {
          id: process.env.NEXT_PUBLIC_META_APP_ID!,
          deployment_status: 'DEVELOPMENT'
        }
      };
    }
  }

  /**
   * Get page details
   */
  async getPage(pageId: string): Promise<MetaPage> {
    const response = await this.client.get<MetaPage>(`/${pageId}`, {
      params: {
        fields: "id,name,access_token,category,picture",
      },
    });
    return response.data;
  }

  /**
   * Get lead forms for a page
   */
  async getPageLeadForms(pageId: string): Promise<MetaLeadForm[]> {
    const response = await this.client.get<MetaApiResponse<MetaLeadForm[]>>(
      `/${pageId}/leadgen_forms`,
      {
        params: {
          fields:
            "id,name,status,questions,privacy_policy_url,created_time,leads_count",
        },
      }
    );
    return response.data.data || [];
  }

  /**
   * Get leads from a form
   */
  async getFormLeads(
    formId: string,
    limit: number = META_CONFIG.LEAD_BATCH_SIZE,
    cursor?: string
  ): Promise<{ leads: MetaLead[]; nextCursor?: string }> {
    const params: Record<string, string | number> = {
      fields:
        "id,created_time,ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name,form_id,form_name,is_organic,platform,field_data",
      limit,
    };
    
    // Add cursor if provided for pagination
    if (cursor) {
      params.after = cursor;
    }
    
    const response = await this.client.get<MetaApiResponse<MetaLead[]>>(
      `/${formId}/leads`,
      { params }
    );

    return {
      leads: response.data.data || [],
      nextCursor: response.data.paging?.cursors?.after,
    };
  }

  /**
   * Get a specific lead
   */
  async getLead(leadId: string): Promise<MetaLead> {
    const response = await this.client.get<MetaLead>(`/${leadId}`, {
      params: {
        fields:
          "id,created_time,ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name,form_id,form_name,is_organic,platform,field_data",
      },
    });
    return response.data;
  }

  /**
   * Get historical leads for a page (last 30 days)
   */
  async getPageHistoricalLeads(
    pageId: string,
    since?: Date
  ): Promise<MetaLead[]> {
    const sinceDate =
      since ||
      new Date(Date.now() - META_CONFIG.HISTORICAL_DAYS * 24 * 60 * 60 * 1000);
    const sinceTimestamp = Math.floor(sinceDate.getTime() / 1000);

    const allLeads: MetaLead[] = [];

    // First, get all lead forms
    const forms = await this.getPageLeadForms(pageId);

    // Then get leads from each form
    for (const form of forms) {
      if (form.status !== "ACTIVE") continue;

      let hasMore = true;
      let cursor: string | undefined;

      while (hasMore) {
        const params: Record<string, string | number> = {
          fields:
            "id,created_time,ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name,form_id,form_name,is_organic,platform,field_data",
          limit: META_CONFIG.LEAD_BATCH_SIZE,
          filtering: JSON.stringify([
            {
              field: "time_created",
              operator: "GREATER_THAN",
              value: sinceTimestamp,
            },
          ]),
        };

        if (cursor) {
          params.after = cursor;
        }

        const response = await this.client.get<MetaApiResponse<MetaLead[]>>(
          `/${form.id}/leads`,
          { params }
        );

        const leads = response.data.data || [];
        allLeads.push(...leads);

        cursor = response.data.paging?.cursors?.after;
        hasMore = !!cursor && leads.length === META_CONFIG.LEAD_BATCH_SIZE;
      }
    }

    return allLeads;
  }

  /**
   * Subscribe to webhooks for a page
   */
  async subscribePageWebhook(
    pageId: string,
    callbackUrl: string,
    pageAccessToken?: string
  ): Promise<boolean> {
    try {
      // Use page access token if provided, otherwise use the instance token
      const originalToken = this.accessToken;
      if (pageAccessToken) {
        this.accessToken = pageAccessToken;
      }
      
      await this.client.post(`/${pageId}/subscribed_apps`, {
        subscribed_fields: META_CONFIG.WEBHOOK_FIELDS,
        callback_url: callbackUrl,
        verify_token: META_CONFIG.WEBHOOK_VERIFY_TOKEN,
      });
      
      // Restore original token
      if (pageAccessToken) {
        this.accessToken = originalToken;
      }
      
      return true;
    } catch (error) {
      console.error("Failed to subscribe to webhook:", error);
      return false;
    }
  }

  /**
   * Unsubscribe from webhooks for a page
   */
  async unsubscribePageWebhook(pageId: string): Promise<boolean> {
    try {
      await this.client.delete(`/${pageId}/subscribed_apps`);
      return true;
    } catch (error) {
      console.error("Failed to unsubscribe from webhook:", error);
      return false;
    }
  }

  /**
   * Test if token is valid
   */
  async debugToken(token: string): Promise<{
    isValid: boolean;
    expiresAt?: number;
    scopes?: string[];
  }> {
    try {
      const response = await this.client.get("/debug_token", {
        params: {
          input_token: token,
          access_token: `${process.env.NEXT_PUBLIC_META_APP_ID}|${process.env.META_APP_SECRET}`,
        },
      });

      const data = response.data.data;
      return {
        isValid: data.is_valid,
        expiresAt: data.expires_at,
        scopes: data.scopes,
      };
    } catch {
      return { isValid: false };
    }
  }
}

/**
 * Custom error class for Meta API errors
 */
export class MetaAPIError extends Error {
  constructor(
    message: string,
    public code: number,
    public type: string,
    public traceId?: string
  ) {
    super(message);
    this.name = "MetaAPIError";
  }
}

/**
 * Singleton instance
 */
let apiInstance: MetaGraphAPI | null = null;

export function getMetaAPI(accessToken?: string): MetaGraphAPI {
  if (!apiInstance || accessToken) {
    apiInstance = new MetaGraphAPI(accessToken);
  }
  return apiInstance;
}
