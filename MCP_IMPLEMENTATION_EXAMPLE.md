# MCP Implementation Example for ilminate Security Assistant

This document provides a practical example of how to integrate MCP into ilminate's Security Assistant.

---

## Quick Start: Adding MCP Client to Security Assistant

### Step 1: Install MCP SDK

```bash
cd /Users/cfisher/Library/Mobile\ Documents/com~apple~CloudDocs/ilminate-apex
npm install @modelcontextprotocol/sdk
```

### Step 2: Create MCP Client Wrapper

Create `src/lib/mcpClient.ts`:

```typescript
/**
 * MCP Client for ilminate Security Assistant
 * 
 * Provides standardized access to external threat intelligence
 * and security tools via Model Context Protocol.
 */

interface MCPTool {
  name: string
  description: string
  inputSchema: any
}

interface MCPClientConfig {
  serverUrl: string
  apiKey?: string
  timeout?: number
}

export class IlminateMCPClient {
  private serverUrl: string
  private apiKey?: string
  private timeout: number

  constructor(config: MCPClientConfig) {
    this.serverUrl = config.serverUrl
    this.apiKey = config.apiKey
    this.timeout = config.timeout || 5000
  }

  /**
   * Call an MCP tool with parameters
   */
  async callTool(toolName: string, params: Record<string, any>): Promise<any> {
    try {
      const response = await fetch(`${this.serverUrl}/tools/${toolName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({ arguments: params }),
        signal: AbortSignal.timeout(this.timeout)
      })

      if (!response.ok) {
        throw new Error(`MCP tool call failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data.content || data.result
    } catch (error) {
      console.error(`[MCP] Error calling tool ${toolName}:`, error)
      throw error
    }
  }

  /**
   * List available tools from MCP server
   */
  async listTools(): Promise<MCPTool[]> {
    try {
      const response = await fetch(`${this.serverUrl}/tools`, {
        headers: {
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to list tools: ${response.statusText}`)
      }

      const data = await response.json()
      return data.tools || []
    } catch (error) {
      console.error('[MCP] Error listing tools:', error)
      return []
    }
  }
}

/**
 * Threat Intelligence MCP Client
 * 
 * Example integration with external threat intelligence services
 */
export class ThreatIntelMCPClient extends IlminateMCPClient {
  /**
   * Check domain reputation via MCP threat intelligence service
   */
  async checkDomainReputation(domain: string): Promise<{
    reputation: 'clean' | 'suspicious' | 'malicious'
    score: number
    sources: string[]
    lastSeen?: string
  }> {
    return this.callTool('check_domain_reputation', { domain })
  }

  /**
   * Check IP reputation
   */
  async checkIPReputation(ip: string): Promise<{
    reputation: 'clean' | 'suspicious' | 'malicious'
    score: number
    abuseReports: number
    country?: string
  }> {
    return this.callTool('check_ip_reputation', { ip })
  }

  /**
   * Check file hash against threat intelligence
   */
  async checkFileHash(hash: string): Promise<{
    detected: boolean
    threatType?: string
    detectionRate: number
    vendors: string[]
  }> {
    return this.callTool('check_file_hash', { hash })
  }

  /**
   * Get threat actor intelligence
   */
  async getThreatActorInfo(actorName: string): Promise<{
    name: string
    aliases: string[]
    techniques: string[]
    campaigns: string[]
  }> {
    return this.callTool('get_threat_actor_info', { actor_name: actorName })
  }
}
```

### Step 3: Enhance Security Assistant with MCP

Update `src/app/api/assistant/route.ts`:

```typescript
import { ThreatIntelMCPClient } from '@/lib/mcpClient'

// Initialize MCP client (if configured)
const threatIntelClient = process.env.THREAT_INTEL_MCP_URL
  ? new ThreatIntelMCPClient({
      serverUrl: process.env.THREAT_INTEL_MCP_URL,
      apiKey: process.env.THREAT_INTEL_MCP_API_KEY,
      timeout: 5000
    })
  : null

/**
 * Enrich threat analysis with external intelligence via MCP
 */
async function enrichWithThreatIntel(context: any): Promise<any> {
  if (!threatIntelClient) {
    return context // No MCP client configured, return original context
  }

  const enriched = { ...context }
  
  try {
    // Extract domains from campaigns
    const domains = new Set<string>()
    context.campaigns?.forEach((campaign: any) => {
      if (campaign.source?.domain) {
        domains.add(campaign.source.domain)
      }
    })

    // Check domain reputations in parallel
    const domainChecks = await Promise.allSettled(
      Array.from(domains).map(domain => 
        threatIntelClient.checkDomainReputation(domain)
      )
    )

    // Add threat intelligence to context
    enriched.threatIntel = {
      domains: domainChecks
        .filter((result) => result.status === 'fulfilled')
        .map((result, idx) => ({
          domain: Array.from(domains)[idx],
          ...(result as PromiseFulfilledResult<any>).value
        })),
      enriched: true
    }
  } catch (error) {
    console.error('[MCP] Error enriching with threat intel:', error)
    // Continue without enrichment if MCP fails
  }

  return enriched
}

/**
 * Enhanced AI query with MCP-enriched context
 */
async function queryAIModelWithMCP(userQuery: string, context: any): Promise<string> {
  // Enrich context with external threat intelligence
  const enrichedContext = await enrichWithThreatIntel(context)

  const systemPrompt = `You are a cybersecurity analyst assistant for Ilminate APEX, a threat intelligence platform. 
  
Your role is to analyze security data and provide clear, actionable insights about threats, campaigns, and security posture.

Current environment data:
- Security Score: ${enrichedContext.score.score}/100
- Protection Rate: ${enrichedContext.score.protectionRate}%
- Active Campaigns: ${enrichedContext.activeCampaigns.length}
- Total Threats (30d): ${enrichedContext.totalThreats}
- AI Threats: ${enrichedContext.aiThreats.length} categories
- Geo Threats: ${enrichedContext.geoThreats.length} countries

${enrichedContext.threatIntel?.enriched ? `
External Threat Intelligence:
${enrichedContext.threatIntel.domains.map((d: any) => 
  `- ${d.domain}: ${d.reputation} (score: ${d.score})`
).join('\n')}
` : ''}

Active campaigns:
${enrichedContext.campaigns.map((c: any) => 
  `- ${c.name} (${c.threatType}, ${c.status}): ${c.targets} targets, ${c.interactions.compromised} compromised`
).join('\n')}

Be concise, use bullet points, and provide actionable recommendations. Format responses for easy reading.
When external threat intelligence is available, incorporate it into your analysis.`;

  // Use existing Claude/OpenAI integration...
  // (keep existing code from assistant route)
  
  // ... rest of queryAIModel function
}

// Update POST handler to use MCP-enhanced query
export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()
    
    // ... existing context building code ...
    
    // Use MCP-enhanced query function
    if (!reply && (ANTHROPIC_API_KEY || OPENAI_API_KEY)) {
      try {
        reply = await queryAIModelWithMCP(prompt, context)
      } catch (aiError) {
        console.error('AI model error, falling back:', aiError)
      }
    }
    
    // ... rest of handler
  }
}
```

---

## Example: Creating ilminate MCP Server

### Simple MCP Server Implementation

Create `ilminate-mcp-server/server.ts`:

```typescript
/**
 * ilminate MCP Server
 * 
 * Exposes ilminate detection engines as MCP tools
 */

import express from 'express'
import { analyzeThreat } from '../src/app/api/triage/route'

const app = express()
app.use(express.json())

// MCP Tool: Analyze Email Threat
app.post('/tools/analyze_email_threat', async (req, res) => {
  try {
    const { arguments: args } = req.body
    const { subject, sender, body } = args

    // Use existing ilminate triage analysis
    const analysis = analyzeThreat('email', subject, sender, body)

    res.json({
      content: [{
        type: 'text',
        text: JSON.stringify({
          riskScore: analysis.riskScore,
          classification: analysis.classification,
          indicators: Object.values(analysis.indicators).filter(i => i.detected),
          severity: analysis.riskScore >= 70 ? 'CRITICAL' : 
                   analysis.riskScore >= 50 ? 'HIGH' : 
                   analysis.riskScore >= 30 ? 'MEDIUM' : 'LOW'
        })
      }]
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// MCP Tool: Map to MITRE ATT&CK
app.post('/tools/map_to_mitre_attack', async (req, res) => {
  try {
    const { arguments: args } = req.body
    const { event_text } = args

    // Call existing ATT&CK mapper Lambda
    const response = await fetch(
      process.env.ATTACK_MAPPER_API_URL || 
      'https://7bdfwnsqfj.execute-api.us-east-1.amazonaws.com/prod/map',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: event_text })
      }
    )

    const data = await response.json()

    res.json({
      content: [{
        type: 'text',
        text: JSON.stringify(data)
      }]
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// MCP Tool: Get Campaign Analysis
app.post('/tools/get_campaign_analysis', async (req, res) => {
  try {
    const { arguments: args } = req.body
    const { campaign_name, time_range } = args

    // Query DynamoDB for campaign data
    // (implementation depends on your DynamoDB schema)

    res.json({
      content: [{
        type: 'text',
        text: JSON.stringify({
          campaign: campaign_name,
          status: 'active',
          // ... campaign data
        })
      }]
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// List available tools
app.get('/tools', (req, res) => {
  res.json({
    tools: [
      {
        name: 'analyze_email_threat',
        description: 'Analyze email for BEC/phishing indicators using ilminate triage engine',
        inputSchema: {
          type: 'object',
          properties: {
            subject: { type: 'string' },
            sender: { type: 'string' },
            body: { type: 'string' }
          },
          required: ['subject', 'sender']
        }
      },
      {
        name: 'map_to_mitre_attack',
        description: 'Map security event to MITRE ATT&CK techniques',
        inputSchema: {
          type: 'object',
          properties: {
            event_text: { type: 'string' }
          },
          required: ['event_text']
        }
      },
      {
        name: 'get_campaign_analysis',
        description: 'Get analysis of active threat campaigns',
        inputSchema: {
          type: 'object',
          properties: {
            campaign_name: { type: 'string' },
            time_range: { type: 'string' }
          }
        }
      }
    ]
  })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`ilminate MCP Server running on port ${PORT}`)
})
```

---

## Environment Variables

Add to `.env.local`:

```bash
# MCP Client Configuration
THREAT_INTEL_MCP_URL=https://threat-intel-mcp.example.com
THREAT_INTEL_MCP_API_KEY=your-api-key-here

# ilminate MCP Server (if deploying)
ILMINATE_MCP_SERVER_URL=https://mcp.ilminate.com
ILMINATE_MCP_API_KEY=your-server-api-key
```

---

## Testing MCP Integration

### Test Threat Intelligence MCP Client

```typescript
// test-mcp.ts
import { ThreatIntelMCPClient } from './src/lib/mcpClient'

async function testMCP() {
  const client = new ThreatIntelMCPClient({
    serverUrl: process.env.THREAT_INTEL_MCP_URL!,
    apiKey: process.env.THREAT_INTEL_MCP_API_KEY
  })

  // Test domain reputation check
  const result = await client.checkDomainReputation('suspicious-domain.tk')
  console.log('Domain Reputation:', result)

  // Test IP reputation
  const ipResult = await client.checkIPReputation('192.0.2.1')
  console.log('IP Reputation:', ipResult)
}

testMCP().catch(console.error)
```

---

## Next Steps

1. **Start Small:** Integrate one MCP service (e.g., domain reputation)
2. **Test Thoroughly:** Verify MCP calls don't break existing functionality
3. **Monitor Performance:** Track MCP call latency and errors
4. **Expand Gradually:** Add more MCP tools as needed
5. **Document:** Update API documentation with MCP capabilities

---

## Resources

- [MCP SDK Documentation](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Specification](https://spec.modelcontextprotocol.io)
- [Example MCP Servers](https://github.com/modelcontextprotocol/servers)





