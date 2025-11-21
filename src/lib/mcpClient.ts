/**
 * MCP Client for apex.ilminate.com
 * 
 * Provides a client interface to the ilminate MCP server for enhanced
 * threat analysis and detection capabilities.
 */

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://54.237.174.195:8889';
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
   * Call MCP tool via HTTP API
   */
  private async callMCPTool(toolName: string, args: any): Promise<MCPToolResponse> {
    if (!this.enabled) {
      return { success: false, error: 'MCP client not enabled' };
    }

    try {
      const response = await fetch(`${this.serverUrl}/api/mcp/tools/${toolName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify({ args }),
        // Timeout after 30 seconds (some tools may take longer)
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        return {
          success: false,
          error: `MCP tool error: ${response.status} ${errorText}`,
        };
      }

      const data = await response.json();
      if (data.success && data.result) {
        return { success: true, data: data.result };
      }
      return { success: false, error: data.error || 'Unknown error' };
    } catch (error: any) {
      console.error(`[MCP] Error calling tool ${toolName}:`, error);
      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  /**
   * Call APEX Bridge directly (fallback for tools not yet in MCP)
   */
  private async callAPEXBridge(endpoint: string, args: any): Promise<MCPToolResponse> {
    if (!this.enabled) {
      return { success: false, error: 'MCP client not enabled' };
    }

    try {
      // Try APEX Bridge on port 8888
      const bridgeUrl = this.serverUrl.replace(':8889', ':8888');
      const response = await fetch(`${bridgeUrl}${endpoint}`, {
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
   * Analyze email threat via MCP tool
   */
  async analyzeEmailThreat(
    input: AnalyzeEmailThreatInput
  ): Promise<AnalyzeEmailThreatOutput | null> {
    const response = await this.callMCPTool('analyze_email_threat', {
      subject: input.subject,
      sender: input.sender,
      body: input.body,
      attachments: input.attachments || [],
    });

    if (!response.success || !response.data) {
      return null;
    }

    return response.data as AnalyzeEmailThreatOutput;
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
   * Investigate suspicious indicator via MCP tool
   */
  async investigateSuspiciousIndicator(
    indicator: string,
    indicatorType: 'domain' | 'ip' | 'email' | 'hash' | 'url' | 'attachment'
  ): Promise<any> {
    const response = await this.callMCPTool('investigate_suspicious_indicator', {
      indicator_type: indicatorType,
      indicator_value: indicator,
    });
    
    return response.success ? response.data : null;
  }

  /**
   * Get detection breakdown via MCP tool
   */
  async getDetectionBreakdown(
    input: {
      subject: string;
      sender: string;
      body: string;
      message_id?: string;
    }
  ): Promise<any> {
    const response = await this.callMCPTool('get_detection_breakdown', {
      subject: input.subject,
      sender: input.sender,
      body: input.body,
      message_id: input.message_id,
    });
    
    return response.success ? response.data : null;
  }

  /**
   * Explain detection result via MCP tool
   */
  async explainDetectionResult(
    input: {
      subject: string;
      sender: string;
      body: string;
      message_id?: string;
      verdict_data?: any;
    }
  ): Promise<any> {
    const response = await this.callMCPTool('explain_detection_result', {
      subject: input.subject,
      sender: input.sender,
      body: input.body,
      message_id: input.message_id,
      verdict_data: input.verdict_data,
    });
    
    return response.success ? response.data : null;
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

