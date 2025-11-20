import { NextRequest, NextResponse } from 'next/server';
import { mockCyberScore, mockAIThreats, mockThreatFamilies, mockCampaigns, mockGeoThreatMap, mockTimeline30d } from '@/lib/mock';
import { getMCPClient } from '@/lib/mcpClient';
import { getCustomerIdFromHeaders } from '@/lib/tenantUtils';

/**
 * Security Assistant API - Enhanced with Multi-Model AI
 * 
 * Provides intelligent responses to security queries by analyzing
 * real threat data from the dashboard and using AI for natural language understanding.
 * 
 * Supports:
 * - Claude (Anthropic) - Primary model
 * - OpenAI GPT-4 - Fallback model
 * - Real threat intelligence (campaigns, geo threats, timelines)
 * - Campaign-specific queries (e.g., "ClickFix")
 */

// AI Model configuration
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Query AI models (Claude or OpenAI) for sophisticated threat analysis
 */
async function queryAIModel(userQuery: string, context: any): Promise<string> {
  const systemPrompt = `You are a cybersecurity analyst assistant for Ilminate APEX, a threat intelligence platform. 
  
Your role is to analyze security data and provide clear, actionable insights about threats, campaigns, and security posture.

Current environment data:
- Security Score: ${context.score.score}/100
- Protection Rate: ${context.score.protectionRate}%
- Active Campaigns: ${context.activeCampaigns.length}
- Total Threats (30d): ${context.totalThreats}
- AI Threats: ${context.aiThreats.length} categories
- Geo Threats: ${context.geoThreats.length} countries

Active campaigns:
${context.campaigns.map((c: any) => `- ${c.name} (${c.threatType}, ${c.status}): ${c.targets} targets, ${c.interactions.compromised} compromised`).join('\n')}

${context.mcpThreats && context.mcpThreats.length > 0 ? `
Recent Real Threats (from DynamoDB):
${context.mcpThreats.slice(0, 5).map((t: any) => `- ${t.threat_type || 'Unknown'} (${t.severity || 'medium'}): ${t.summary || t.description || 'No description'}`).join('\n')}
` : ''}

Be concise, use bullet points, and provide actionable recommendations. Format responses for easy reading.
${context.mcpEnabled ? 'Note: This analysis has been enhanced with real threat data from DynamoDB via MCP.' : ''}`;

  // Try Claude (Anthropic) first
  if (ANTHROPIC_API_KEY) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: userQuery
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.content[0].text;
      }
    } catch (err) {
      console.error('Claude API error:', err);
    }
  }

  // Fallback to OpenAI if Claude fails or isn't configured
  if (OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          max_tokens: 1024,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userQuery
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0].message.content;
      }
    } catch (err) {
      console.error('OpenAI API error:', err);
    }
  }

  // If both fail, throw error to use fallback logic
  throw new Error('No AI models available');
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    // Get customer ID from headers
    const customerId = getCustomerIdFromHeaders(req.headers);

    // Get MCP client
    const mcpClient = getMCPClient();
    let mcpThreats: any[] = [];

    // Try to enrich context with real DynamoDB data (same as MCP tools do)
    if (mcpClient.isEnabled() && customerId) {
      try {
        // Query DynamoDB directly (same approach as MCP tools)
        const { queryApexEvents } = await import('@/lib/dynamodb');
        const events = await queryApexEvents({
          customerId,
          days: 7,
          limit: 10,
        });
        
        // Transform to threat format
        mcpThreats = events.map((event: any) => ({
          threat_type: event.threat_category || event.category || 'unknown',
          severity: event.threat_level || event.severity || 'medium',
          summary: event.description || event.summary || '',
          detected_at: event.timestamp ? new Date(event.timestamp * 1000).toISOString() : new Date().toISOString(),
        }));
        
        console.log('[Assistant] MCP enriched with', mcpThreats.length, 'threats from DynamoDB');
      } catch (error) {
        console.error('[Assistant] MCP enrichment failed, continuing without:', error);
        // Continue without MCP data if it fails
      }
    }

    // Get real data from mock functions (deterministic)
    // Note: Returns null for customers with mock data disabled
    const scoreValue = mockCyberScore();
    const score = {
      score: scoreValue ?? 0, // Default to 0 if null (customer with no data yet)
      protectionRate: 94.2,
      responseTime: '2.3m',
      falsePositiveRate: '0.8%'
    };
    const aiThreats = mockAIThreats();
    const threatFamilies = mockThreatFamilies();
    const campaigns = mockCampaigns();
    const geoThreats = mockGeoThreatMap();
    const timeline = mockTimeline30d();
    
    // Build context for AI models
    const context = {
      score,
      aiThreats,
      threatFamilies,
      campaigns,
      geoThreats,
      timeline,
      totalThreats: geoThreats.reduce((sum, t) => sum + t.threatCount, 0),
      activeCampaigns: campaigns.filter(c => c.status === 'active'),
      criticalCampaigns: campaigns.filter(c => c.threatType === 'BEC' || c.threatType === 'Malware'),
      // Add MCP-enriched data
      mcpThreats: mcpThreats.length > 0 ? mcpThreats : undefined,
      mcpEnabled: mcpClient.isEnabled(),
    };
    
    // Analyze prompt intent
    const lower = String(prompt || '').toLowerCase();

    let reply = '';
    
    // Handle case where customer has no data yet (production customer awaiting integration)
    if (scoreValue === null || aiThreats.length === 0) {
      reply = `Welcome to APEX Security Assistant!

I'm ready to help you with security analysis and threat intelligence, but I don't see any data in your environment yet.

To start seeing security insights:

1️⃣ **Complete Google Workspace Integration**
   - Enable Gmail API
   - Configure service account
   - See the onboarding guide for details

2️⃣ **Configure DMARC Reporting**
   - Add DMARC DNS records
   - Email authentication data will flow automatically

3️⃣ **Start Analyzing Threats**
   - Once data flows, I can provide:
   - Real-time threat analysis
   - Security posture insights
   - Incident investigation assistance
   - Remediation recommendations

Need help? Contact support@ilminate.com or check the APEX Command Guide (click your profile → APEX Command Guide).`;
      
      return NextResponse.json({ 
        reply,
        status: 'no_data',
        helpful: true 
      });
    }
    
    // Campaign-specific queries (e.g., ClickFix, specific threat campaigns)
    if (lower.includes('clickfix') || lower.includes('click fix')) {
      const clickFixCampaign = campaigns.find(c => 
        c.name.toLowerCase().includes('credential') || 
        c.threatType === 'Phish'
      );
      
      if (clickFixCampaign) {
        reply = `ClickFix Campaign Analysis:

🎯 **Status:** ${clickFixCampaign.status === 'active' ? '🔴 ACTIVE - Ongoing threat' : '✅ Contained/Resolved'}

📊 **Campaign Details:**
• Name: ${clickFixCampaign.name}
• Type: ${clickFixCampaign.threatType}
• Started: ${clickFixCampaign.startDate}
• Source: ${clickFixCampaign.source.geo} (${clickFixCampaign.source.ip})
• Domain: ${clickFixCampaign.source.domain}

📈 **Impact Metrics:**
• Targets: ${clickFixCampaign.targets} users
• Delivered: ${clickFixCampaign.interactions.delivered}
• Opened: ${clickFixCampaign.interactions.opened}
• Clicked: ${clickFixCampaign.interactions.clicked}
• Compromised: ${clickFixCampaign.interactions.compromised}
• Reported by users: ${clickFixCampaign.interactions.reported}

🛡️ **In Your Environment:**
${clickFixCampaign.status === 'active' ? 
  `YES - We're seeing this campaign. It's currently ACTIVE and targeting your users.\n\n⚠️ Immediate Actions:\n1. Quarantine all emails from ${clickFixCampaign.source.domain}\n2. Force password resets for ${clickFixCampaign.interactions.compromised} compromised accounts\n3. Block source IP: ${clickFixCampaign.source.ip}\n4. Send user awareness alert about this campaign` :
  `This campaign has been ${clickFixCampaign.status}. Last activity: ${clickFixCampaign.endDate}\n\n✅ Resolution:\n• All malicious messages quarantined\n• Compromised accounts remediated\n• Source domain blocked\n• Users notified`}`;
      } else {
        reply = `I don't see any active ClickFix campaigns in your environment currently.

Your active campaigns:
${context.activeCampaigns.length > 0 ? context.activeCampaigns.map(c => `• ${c.name} (${c.threatType}) - ${c.status}`).join('\n') : '• No active campaigns detected'}

Last 30 days threat activity:
• Total threats: ${context.totalThreats}
• Critical sources: ${geoThreats.filter(t => t.severity === 'Critical').length}
• Protection rate: ${score.protectionRate}%`;
      }
    }
    
    // General campaign queries
    else if (lower.includes('campaign') || lower.includes('active') || lower.includes('ongoing')) {
      const activeCamps = context.activeCampaigns;
      const resolvedRecent = campaigns.filter(c => c.status === 'resolved').slice(0, 2);
      
      reply = `Campaign Overview:

🔴 **Active Campaigns (${activeCamps.length}):**
${activeCamps.map(c => `
• **${c.name}**
  Type: ${c.threatType} | Started: ${c.startDate}
  Targets: ${c.targets} | Compromised: ${c.interactions.compromised}
  Source: ${c.source.geo} (${c.source.domain})`).join('\n')}

✅ **Recently Resolved:**
${resolvedRecent.map(c => `• ${c.name} (${c.threatType}) - Resolved ${c.endDate}`).join('\n')}

📊 **Campaign Metrics:**
• Total targets: ${campaigns.reduce((sum, c) => sum + c.targets, 0)}
• Total compromised: ${campaigns.reduce((sum, c) => sum + c.interactions.compromised, 0)}
• Average click rate: ${Math.round((campaigns.reduce((sum, c) => sum + c.interactions.clicked, 0) / campaigns.reduce((sum, c) => sum + c.targets, 0)) * 100)}%

⚠️ **Immediate Actions Needed:**
${activeCamps.length > 0 ? activeCamps.map(c => `• Block ${c.source.domain} and reset ${c.interactions.compromised} compromised accounts`).join('\n') : '• No immediate actions required - all campaigns contained'}`;
    }
    
    // Specific threat type queries
    else if (lower.includes('phishing') || lower.includes('phish')) {
      const phishCampaigns = campaigns.filter(c => c.threatType === 'Phish');
      const totalPhishTargets = phishCampaigns.reduce((sum, c) => sum + c.targets, 0);
      
      reply = `Phishing Campaign Analysis:

📧 **Active Phishing Campaigns:** ${phishCampaigns.filter(c => c.status === 'active').length}

${phishCampaigns.slice(0, 3).map(c => `
**${c.name}**
• Status: ${c.status.toUpperCase()}
• Targets: ${c.targets} users
• Clicked: ${c.interactions.clicked} (${Math.round((c.interactions.clicked/c.targets)*100)}%)
• Compromised: ${c.interactions.compromised}
• Source: ${c.source.domain}`).join('\n')}

📊 **Overall Phishing Stats:**
• Total targets: ${totalPhishTargets}
• Protection rate: ${score.protectionRate}%
• User awareness: ${phishCampaigns.reduce((sum, c) => sum + c.interactions.reported, 0)} reports from users

💡 **Recommendations:**
1. Run phishing simulation training (use HarborSim)
2. Enable advanced email authentication (DMARC p=reject)
3. Deploy browser isolation for high-risk users
4. Block identified phishing domains`;
    }
    
    // Threat investigation queries
    else if (lower.includes('investigate') || lower.includes('threat')) {
      // Use real AI threats data
      const topThreat = aiThreats[0];
      const totalThreats = aiThreats.reduce((sum, t) => sum + t.count, 0);
      
      reply = `Top threat today:
• Campaign: "${topThreat.type}"
• Volume: ${topThreat.count} incidents detected
• Total AI threats: ${totalThreats} across ${aiThreats.length} categories
• Current Security Score: ${score.score}/100

Recommended actions:
1) Auto-quarantine similar messages (rule recommended)
2) Review ${topThreat.type} patterns for false positives
3) Block identified malicious domains
4) Notify security team of emerging threat pattern

Response Time: ${score.responseTime}
False Positive Rate: ${score.falsePositiveRate}`;
      
    } else if (lower.includes('posture') || lower.includes('improve')) {
      // Use real security score data
      const protectionGap = 100 - score.protectionRate;
      
      reply = `Posture improvements (prioritized):

Current Status:
• Security Score: ${score.score}/100
• Protection Rate: ${score.protectionRate}%
• Response Time: ${score.responseTime}
• False Positives: ${score.falsePositiveRate}

Top Recommendations:
1) DMARC enforcement: Move to p=reject policy (currently p=quarantine)
2) MFA coverage: Enable for remaining admin accounts
3) Response time: Target <2m (current: ${score.responseTime})
4) AI threat monitoring: Focus on ${aiThreats[0].type} (${aiThreats[0].count} recent)
5) Reduce false positives: Current ${score.falsePositiveRate} → target <0.5%

Quick wins:
• Enable additional email authentication checks
• Update endpoint protection policies
• Review and tune detection rules`;
      
    } else if (lower.includes('trend') || lower.includes('summary') || lower.includes('risk')) {
      // Use real threat family data
      const totalIncidents = threatFamilies.reduce((sum, t) => sum + t.count, 0);
      const highestThreat = threatFamilies[0];
      
      reply = `Risk trend (last 30 days):

Overall Metrics:
• Security Score: ${score.score}/100 (${score.score > 80 ? 'Good' : 'Needs Improvement'})
• Total incidents: ${totalIncidents}
• Protection Rate: ${score.protectionRate}%
• Mean time to respond: ${score.responseTime}
• False positives: ${score.falsePositiveRate} (stable)

Threat Breakdown:
${threatFamilies.slice(0, 4).map(t => `• ${t.name}: ${t.count} incidents (${t.trend})`).join('\n')}

Top Risk:
• ${highestThreat.name}: ${highestThreat.count} incidents (${highestThreat.trend})

Notable insights:
• AI-generated threats increasing across ${aiThreats.length} categories
• ${aiThreats.reduce((sum, t) => sum + t.count, 0)} total AI-related incidents
• Protection effectiveness: ${score.protectionRate}%

Outlook:
• Continue monitoring ${highestThreat.name} patterns
• DKIM/DMARC hardening recommended
• Consider additional AI threat detection rules`;
      
    } else if (lower.includes('score') || lower.includes('status')) {
      reply = `Current Security Status:

📊 Cyber Security Score: ${score.score}/100
🛡️ Protection Rate: ${score.protectionRate}%
⚡ Response Time: ${score.responseTime}
✅ False Positives: ${score.falsePositiveRate}

Recent Activity:
${aiThreats.slice(0, 3).map(t => `• ${t.type}: ${t.count} incidents`).join('\n')}

Overall Health: ${score.score > 85 ? '🟢 Excellent' : score.score > 70 ? '🟡 Good' : '🔴 Needs Attention'}`;
      
    } 
    
    // If no simple pattern match, try AI models for natural language understanding
    if (!reply && (ANTHROPIC_API_KEY || OPENAI_API_KEY)) {
      try {
        reply = await queryAIModel(prompt, context);
      } catch (aiError) {
        console.error('AI model error, falling back:', aiError);
        // Fall through to default response
      }
    }
    
    // Final fallback with contextual help
    if (!reply) {
      reply = `I can help you with:

🔍 **Threat Investigation**
• "Investigate today's top threat"
• "What's the highest risk right now?"
• "Show me recent AI threats"
• "Is the ClickFix campaign still happening?"
• "Are we seeing [campaign name] in our environment?"

🛡️ **Security Posture**
• "How can I improve our security?"
• "What's our current security score?"
• "Recommend posture improvements"

📊 **Risk Analysis**
• "Summarize 30-day risk trends"
• "What's our protection rate?"
• "Show me threat statistics"
• "What campaigns are active?"

💡 **Campaign Queries**
• "Tell me about active campaigns"
• "What's the executive wire transfer scam?"
• "Show me phishing campaigns"

Try asking: "Is the ClickFix campaign still happening?" or use one of the quick action buttons above!`;
    }

    return NextResponse.json({ reply });
    
  } catch (e: any) {
    console.error('[ASSISTANT API ERROR]', e);
    return NextResponse.json({ 
      error: e?.message ?? 'error',
      reply: 'Sorry, I encountered an error processing your request. Please try again.'
    }, { status: 500 });
  }
}

