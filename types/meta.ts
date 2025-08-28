/**
 * Meta Graph API TypeScript Types
 */

export interface MetaUser {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

export interface MetaPage {
  id: string;
  name: string;
  access_token: string;
  category?: string;
  picture?: {
    data: {
      url: string;
    };
  };
  tasks?: string[];
  lead_forms_count?: number;
}

export interface MetaLeadFormField {
  name: string;
  values: string[];
}

export interface MetaLead {
  id: string;
  created_time: string;
  ad_id?: string;
  ad_name?: string;
  adset_id?: string;
  adset_name?: string;
  campaign_id?: string;
  campaign_name?: string;
  form_id?: string;
  form_name?: string;
  is_organic: boolean;
  platform?: string;
  field_data: MetaLeadFormField[];
  custom_disclaimer_responses?: Array<{
    checkbox_key: string;
    is_checked: boolean;
  }>;
  retailer_item_ids?: string[];
}

export interface MetaLeadForm {
  id: string;
  name: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'DELETED' | 'DRAFT';
  page: {
    id: string;
    name: string;
  };
  questions?: Array<{
    key: string;
    label: string;
    type: string;
    options?: string[];
  }>;
  privacy_policy_url?: string;
  follow_up_action_url?: string;
  context_card?: {
    title: string;
    content: string;
    button_text: string;
  };
  created_time: string;
  leads_count?: number;
}

export interface MetaWebhookEntry {
  id: string;
  time: number;
  changes: Array<{
    field: string;
    value: {
      ad_id?: string;
      form_id?: string;
      leadgen_id?: string;
      created_time?: number;
      page_id?: string;
      adgroup_id?: string;
    };
  }>;
}

export interface MetaWebhookPayload {
  object: string;
  entry: MetaWebhookEntry[];
}

export interface MetaTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export interface MetaError {
  message: string;
  type: string;
  code: number;
  error_subcode?: number;
  fbtrace_id?: string;
}

export interface MetaApiResponse<T = unknown> {
  data?: T;
  error?: MetaError;
  paging?: {
    cursors?: {
      before: string;
      after: string;
    };
    next?: string;
    previous?: string;
  };
}

export interface MetaOAuthState {
  organizationId: string;
  userId: string;
  redirectTo?: string;
  timestamp: number;
}

export interface MetaIntegrationStatus {
  isConnected: boolean;
  pageId?: string;
  pageName?: string;
  tokenExpiresAt?: number;
  lastSyncedAt?: number;
  leadCount?: number;
  error?: string;
}

export interface LeadSyncProgress {
  total: number;
  processed: number;
  failed: number;
  status: 'idle' | 'syncing' | 'completed' | 'failed';
  currentPage?: string;
  error?: string;
}