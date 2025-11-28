/**
 * Intel API Client for ilminate-apex
 * 
 * Provides a client interface to the Ilminate Threat Intelligence Platform (TIP)
 * for threat intelligence enrichment and queries.
 */

const INTEL_API_URL = process.env.NEXT_PUBLIC_INTEL_API_URL || process.env.INTEL_API_URL || '';
const INTEL_API_KEY = process.env.INTEL_API_KEY || '';
const INTEL_ENABLED = process.env.INTEL_ENABLED !== 'false' && !!INTEL_API_URL && !!INTEL_API_KEY;

export interface IOC {
  type: 'url' | 'domain' | 'ip' | 'hash' | 'email';
  value: string;
}

export interface EnrichmentResult {
  type: string;
  value: string;
  risk_score: number;
  confidence: number;
  sources: string[];
  first_seen: string | null;
  last_seen: string | null;
  tenants_seen: number;
  categories: string[];
  campaigns: string[];
  malware_families: string[];
}

export interface EnrichResponse {
  results: EnrichmentResult[];
  enrichment_time_ms: number;
}

export interface IndicatorDetail {
  type: string;
  value: string;
  risk_score: number;
  confidence: number;
  sources: Array<{
    name: string;
    first_seen: string;
    last_seen: string;
    tenant_ids?: string[];
  }>;
  first_seen: string;
  last_seen: string;
  tenants_seen: number;
  categories: string[];
  campaigns: Array<{
    id: string;
    name: string;
    first_seen: string;
  }>;
  malware_families: string[];
  related_indicators: Array<{
    type: string;
    value: string;
    risk_score: number;
  }>;
  mitre_techniques?: Array<{
    id: string;
    name: string;
  }>;
}

export interface TenantSummary {
  tenant_id: string;
  period: string;
  summary: {
    total_threats: number;
    unique_indicators: number;
    top_categories: Array<{ category: string; count: number }>;
    top_malware_families: Array<{ family: string; count: number }>;
    top_campaigns: Array<{
      campaign_id: string;
      name: string;
      threat_count: number;
      first_seen: string;
    }>;
    geographic_distribution: {
      c2_servers: Array<{ country: string; count: number }>;
      hosting: Array<{ country: string; count: number }>;
    };
    trends: {
      daily: Array<{ date: string; count: number }>;
    };
  };
}

export interface ThreatTrends {
  period: string;
  trends: {
    new_campaigns: number;
    new_indicators: number;
    top_categories: Array<{ category: string; count: number }>;
    emerging_threats: Array<{
      indicator: string;
      type: string;
      first_seen: string;
      sightings: number;
    }>;
    geographic_heatmap: {
      attack_sources: Array<{ country: string; intensity: number }>;
    };
  };
}

/**
 * Ilminate Intel API Client
 */
export class IlminateIntelClient {
  private apiUrl: string;
  private apiKey: string;
  private enabled: boolean;

  constructor() {
    this.apiUrl = INTEL_API_URL;
    this.apiKey = INTEL_API_KEY;
    this.enabled = INTEL_ENABLED;
  }

  /**
   * Check if Intel API is enabled and configured
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Make authenticated request to Intel API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.enabled) {
      throw new Error('Intel API client not enabled');
    }

    const url = `${this.apiUrl}${endpoint}`;
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    
    if (this.apiKey) {
      headers.set('Authorization', `Bearer ${this.apiKey}`);
      headers.set('X-API-Key', this.apiKey);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        throw new Error(`Intel API error: ${response.status} ${errorText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error(`[Intel API] Error calling ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Enrich IOCs (batch enrichment)
   */
  async enrich(tenantId: string, indicators: IOC[]): Promise<EnrichResponse> {
    return this.request<EnrichResponse>('/intel/enrich', {
      method: 'POST',
      body: JSON.stringify({
        tenant_id: tenantId,
        indicators,
      }),
    });
  }

  /**
   * Get detailed information about a single indicator
   */
  async getIndicator(
    value: string,
    type?: IOC['type'],
    tenantId?: string
  ): Promise<IndicatorDetail> {
    const params = new URLSearchParams({ value });
    if (type) params.set('type', type);
    if (tenantId) params.set('tenant_id', tenantId);

    return this.request<IndicatorDetail>(`/intel/indicator?${params.toString()}`);
  }

  /**
   * Get tenant intelligence summary
   */
  async getTenantSummary(
    tenantId: string,
    period: '7d' | '30d' | '90d' = '30d'
  ): Promise<TenantSummary> {
    const params = new URLSearchParams({
      tenant_id: tenantId,
      period,
    });

    return this.request<TenantSummary>(`/intel/tenant-summary?${params.toString()}`);
  }

  /**
   * Get global threat trends
   */
  async getTrends(
    period: '7d' | '30d' | '90d' = '30d',
    category?: string,
    campaignId?: string
  ): Promise<ThreatTrends> {
    const params = new URLSearchParams({ period });
    if (category) params.set('category', category);
    if (campaignId) params.set('campaign_id', campaignId);

    return this.request<ThreatTrends>(`/intel/trends?${params.toString()}`);
  }

  /**
   * Record a new sighting (for telemetry ingestion)
   */
  async createSighting(data: {
    tenant_id: string;
    indicators: IOC[];
    event_id: string;
    timestamp: string;
    categories: string[];
    detection_source: string;
    confidence: number;
    metadata?: Record<string, any>;
  }): Promise<{ sightings_created: number; observables_created: number; observables_updated: number }> {
    return this.request('/intel/sighting', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// Singleton instance
let intelClientInstance: IlminateIntelClient | null = null;

/**
 * Get Intel API client instance (singleton)
 */
export function getIntelClient(): IlminateIntelClient {
  if (!intelClientInstance) {
    intelClientInstance = new IlminateIntelClient();
  }
  return intelClientInstance;
}

