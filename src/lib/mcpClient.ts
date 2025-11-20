/**
 * MCP Client for apex.ilminate.com
 * 
 * Provides a client interface to the ilminate MCP server for enhanced
 * threat analysis and detection capabilities.
 */

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://54.237.174.195:8888';
const MCP_API_KEY = process.env.MCP_API_KEY || '';
const MCP_ENABLED = process.env.MCP_ENABLED === 'true';

export interface MCPToolResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface AnalyzeEmailThreatInput {
  subject: string;
  sender: string;
  body: string;
  attachments?: string[];
}

export interface AnalyzeEmailThreatOutput {
  threat_score: number;
  threat_type: string;
  indicators: string[];
  recommendation: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface GetPortalThreatsInput {
  tenant_id: string;
  limit?: number;
  offset?: number;
  status?: string;
  severity?: string;
}

export interface GetPortalThreatsOutput {
  threats: any[];
  count: number;
  tenant_id: string;
  success: boolean;
}

/**
 * Ilminate MCP Client
 */
export class IlminateMCPClient {
  private serverUrl: string;
  private apiKey: string;
  private enabled: boolean;

  constructor() {
    this.serverUrl = MCP_SERVER_URL;
    this.apiKey = MCP_API_KEY;
    this.enabled = MCP_ENABLED && !!this.apiKey;
  }

  /**
   * Check if MCP is enabled and configured
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Call APEX Bridge directly (MCP tools use this internally)
   */
  private async callAPEXBridge(endpoint: string, args: any): Promise<MCPToolResponse> {
    if (!this.enabled) {
      return { success: false, error: 'MCP client not enabled' };
    }

    try {
      const response = await fetch(`${this.serverUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify(args),
        // Timeout after 10 seconds
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        return {
          success: false,
          error: `APEX Bridge error: ${response.status} ${errorText}`,
        };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error: any) {
      console.error(`[MCP] Error calling APEX Bridge ${endpoint}:`, error);
      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  /**
   * Analyze email threat via APEX Bridge (used by MCP tools)
   */
  async analyzeEmailThreat(
    input: AnalyzeEmailThreatInput
  ): Promise<AnalyzeEmailThreatOutput | null> {
    const response = await this.callAPEXBridge('/api/analyze-email', {
      message_id: `apex-${Date.now()}`,
      subject: input.subject,
      sender: input.sender,
      body: input.body,
      attachments: input.attachments || [],
    });

    if (!response.success || !response.data) {
      return null;
    }

    // Transform APEX Bridge response to MCP format
    const verdict = response.data.verdict || response.data;
    if (!verdict) {
      return null;
    }

    return {
      threat_score: (verdict.risk_score || 0) / 100, // Convert 0-100 to 0-1
      threat_type: (verdict.threat_categories?.[0] || 'Safe') as any,
      indicators: verdict.indicators || [],
      recommendation: (verdict.action === 'QUARANTINE' || verdict.action === 'BLOCK' ? 'quarantine' : 
                       verdict.threat_level === 'HIGH' || verdict.threat_level === 'CRITICAL' ? 'review' : 'allow') as any,
      severity: (verdict.threat_level?.toLowerCase() || 'medium') as any,
    };
  }

  /**
   * Get portal threats via DynamoDB (MCP tools query DynamoDB directly)
   * Note: This is handled server-side in the API route using DynamoDB utilities
   */
  async getPortalThreats(
    input: GetPortalThreatsInput
  ): Promise<GetPortalThreatsOutput | null> {
    // Portal threats are queried directly from DynamoDB in the API route
    // This method is kept for API compatibility but actual querying happens server-side
    return null;
  }

  /**
   * Investigate suspicious indicator via APEX Bridge
   */
  async investigateSuspiciousIndicator(
    indicator: string,
    indicatorType: 'domain' | 'ip' | 'email' | 'hash'
  ): Promise<any> {
    if (indicatorType === 'domain') {
      const response = await this.callAPEXBridge('/api/check-domain', {
        domain: indicator,
      });
      return response.success ? response.data : null;
    }
    // Other indicator types can be added as needed
    return null;
  }

  /**
   * Get detection breakdown via APEX Bridge
   * Note: This would require additional endpoint on APEX Bridge
   */
  async getDetectionBreakdown(
    detectionId: string
  ): Promise<any> {
    // TODO: Implement when APEX Bridge exposes this endpoint
    return null;
  }

  /**
   * Explain detection result via APEX Bridge
   * Note: This would require additional endpoint on APEX Bridge
   */
  async explainDetectionResult(
    detectionId: string
  ): Promise<any> {
    // TODO: Implement when APEX Bridge exposes this endpoint
    return null;
  }
}

// Singleton instance
let mcpClientInstance: IlminateMCPClient | null = null;

/**
 * Get MCP client instance (singleton)
 */
export function getMCPClient(): IlminateMCPClient {
  if (!mcpClientInstance) {
    mcpClientInstance = new IlminateMCPClient();
  }
  return mcpClientInstance;
}

