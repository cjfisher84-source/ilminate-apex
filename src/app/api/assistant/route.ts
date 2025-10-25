import { NextRequest, NextResponse } from 'next/server';
import { mockCyberScore, mockAIThreats, mockThreatFamilies } from '@/lib/mock';

/**
 * Security Assistant API
 * 
 * Provides intelligent responses to security queries by analyzing
 * real threat data from the dashboard.
 * 
 * Current: Deterministic mock responses (SSR-safe)
 * Future: Wire to AWS Lambda for live LLM analysis
 */
export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    // Get real data from mock functions (deterministic)
    const scoreValue = mockCyberScore();
    const score = {
      score: scoreValue,
      protectionRate: 94.2,
      responseTime: '2.3m',
      falsePositiveRate: '0.8%'
    };
    const aiThreats = mockAIThreats();
    const threatFamilies = mockThreatFamilies();
    
    // Analyze prompt intent
    const lower = String(prompt || '').toLowerCase();

    let reply = '';
    
    if (lower.includes('investigate') || lower.includes('threat')) {
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

Cyber Security Score: ${score.score}/100
Protection Rate: ${score.protectionRate}%
Response Time: ${score.responseTime}
False Positives: ${score.falsePositiveRate}

Recent Activity:
${aiThreats.slice(0, 3).map(t => `• ${t.type}: ${t.count} incidents`).join('\n')}

Overall Health: ${score.score > 85 ? 'Excellent' : score.score > 70 ? 'Good' : 'Needs Attention'}`;
      
    } else {
      // Fallback with contextual help
      reply = `I can help you with:

**Threat Investigation**
• "Investigate today's top threat"
• "What's the highest risk right now?"
• "Show me recent AI threats"

**Security Posture**
• "How can I improve our security?"
• "What's our current security score?"
• "Recommend posture improvements"

**Risk Analysis**
• "Summarize 30-day risk trends"
• "What's our protection rate?"
• "Show me threat statistics"

Try asking: "What's our security score?" or use one of the quick action buttons above!`;
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

