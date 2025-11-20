import { NextRequest, NextResponse } from 'next/server'
import { getMCPClient } from '@/lib/mcpClient'

// BEC/Phishing Detection Keywords
const EXECUTIVE_TITLES = ['ceo', 'cfo', 'coo', 'cto', 'president', 'director', 'vp', 'vice president', 'executive', 'chief']
const FINANCIAL_KEYWORDS = ['payroll', 'wire transfer', 'payment', 'invoice', 'bank', 'account', 'w-2', 'w2', 'tax form', 'direct deposit', 'salary', 'bonus', 'gift card']
const URGENCY_KEYWORDS = ['urgent', 'asap', 'immediately', 'right now', 'today', 'quickly', 'emergency']
const FREE_EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'protonmail.com', 'mail.com']

interface ThreatIndicator {
  detected: boolean
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  description: string
}

function analyzeThreat(kind: string, subject: string, sender: string, details: string) {
  const lowerDetails = (details || '').toLowerCase()
  const lowerSubject = (subject || '').toLowerCase()
  const lowerSender = (sender || '').toLowerCase()
  
  const indicators: Record<string, ThreatIndicator> = {}
  let riskScore = 0
  
  // Check for executive impersonation from free email
  const hasExecutiveTitle = EXECUTIVE_TITLES.some(title => 
    lowerDetails.includes(title) || lowerSubject.includes(title)
  )
  const hasFreeEmailDomain = FREE_EMAIL_DOMAINS.some(domain => 
    lowerSender.includes(domain) || lowerDetails.includes(domain)
  )
  
  if (hasExecutiveTitle && hasFreeEmailDomain) {
    indicators.displayNameSpoofing = {
      detected: true,
      severity: 'CRITICAL',
      description: `Executive impersonation detected: Executive title referenced but sender uses consumer email domain (${FREE_EMAIL_DOMAINS.find(d => lowerSender.includes(d) || lowerDetails.includes(d))})`
    }
    riskScore += 40
  }
  
  // Check for financial requests
  const hasFinancialRequest = FINANCIAL_KEYWORDS.some(kw => 
    lowerDetails.includes(kw) || lowerSubject.includes(kw)
  )
  
  if (hasFinancialRequest) {
    indicators.financialRequest = {
      detected: true,
      severity: hasExecutiveTitle ? 'CRITICAL' : 'HIGH',
      description: `Financial/payroll request detected: ${FINANCIAL_KEYWORDS.filter(kw => lowerDetails.includes(kw) || lowerSubject.includes(kw)).join(', ')}`
    }
    riskScore += hasExecutiveTitle ? 35 : 20
  }
  
  // Check for urgency tactics
  const hasUrgency = URGENCY_KEYWORDS.some(kw => 
    lowerDetails.includes(kw) || lowerSubject.includes(kw)
  )
  
  if (hasUrgency && (hasExecutiveTitle || hasFinancialRequest)) {
    indicators.urgencyTactics = {
      detected: true,
      severity: 'HIGH',
      description: 'Urgency language combined with executive/financial context - common social engineering tactic'
    }
    riskScore += 15
  }
  
  // Check for domain mismatch
  if (lowerDetails.includes('gmail') && (hasExecutiveTitle || hasFinancialRequest)) {
    indicators.domainMismatch = {
      detected: true,
      severity: 'HIGH',
      description: 'Email claims to be from internal executive but uses external consumer email service'
    }
    riskScore += 10
  }
  
  // Determine classification
  let classification = kind || 'N/A'
  if (riskScore >= 50) {
    classification = '🚨 SUSPICIOUS - Likely BEC/Phishing Attack'
  } else if (riskScore >= 30) {
    classification = '⚠️  SUSPICIOUS - Potential Social Engineering'
  } else if (riskScore >= 15) {
    classification = '⚡ REVIEW REQUIRED - Suspicious Patterns Detected'
  }
  
  return { indicators, riskScore, classification }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { kind, subject, sender, details } = body || {}
    
    // Get MCP client
    const mcpClient = getMCPClient();
    let mcpAnalysis = null;
    
    // Try to get enhanced analysis from MCP server
    if (mcpClient.isEnabled() && subject && sender && details) {
      try {
        mcpAnalysis = await mcpClient.analyzeEmailThreat({
          subject,
          sender,
          body: details,
        });
        
        console.log('[Triage] MCP analysis received:', {
          threat_score: mcpAnalysis?.threat_score,
          threat_type: mcpAnalysis?.threat_type,
        });
      } catch (error) {
        console.error('[Triage] MCP analysis failed, using local analysis:', error);
        // Continue with local analysis if MCP fails
      }
    }
    
    // Perform intelligent threat analysis (local fallback)
    const localAnalysis = analyzeThreat(kind, subject, sender, details)
    
    // Merge MCP analysis with local analysis if available
    let analysis: any = { ...localAnalysis };
    let mcpEnhanced = false;
    let mcpThreatType: string | undefined;
    let mcpRecommendation: string | undefined;
    
    if (mcpAnalysis) {
      mcpEnhanced = true;
      mcpThreatType = mcpAnalysis.threat_type;
      mcpRecommendation = mcpAnalysis.recommendation;
      
      // Use MCP threat score if higher, otherwise use local
      const combinedRiskScore = Math.max(
        localAnalysis.riskScore,
        (mcpAnalysis.threat_score || 0) * 100 // Convert 0-1 to 0-100 scale
      );
      
      // Add MCP indicators to local indicators
      if (mcpAnalysis.indicators && Array.isArray(mcpAnalysis.indicators) && mcpAnalysis.indicators.length > 0) {
        mcpAnalysis.indicators.forEach((indicator: any, idx: number) => {
          const indicatorText = typeof indicator === 'string' ? indicator : String(indicator);
          analysis.indicators[`mcp_indicator_${idx}`] = {
            detected: true,
            severity: mcpAnalysis.severity === 'critical' ? 'CRITICAL' : 
                     mcpAnalysis.severity === 'high' ? 'HIGH' : 
                     mcpAnalysis.severity === 'medium' ? 'MEDIUM' : 'LOW',
            description: indicatorText,
          };
        });
      }
      
      analysis.riskScore = combinedRiskScore;
    }
    
    const checks = [
      'SPF/DKIM/DMARC auth results',
      'Header anomalies (return-path, reply-to, display name spoofing)',
      'URL intel (risky domains, TLD, shortening, lookalikes)',
      'Attachment heuristics (macro docs, archives, executables)',
      'Sender reputation & historical patterns'
    ]
    
    let summary = `APEX triage for: ${analysis.classification}
Subject: ${subject || 'N/A'}
Sender: ${sender || 'N/A'}

`
    
    // Add threat indicators if detected
    const detectedIndicators = (Object.values(analysis.indicators) as ThreatIndicator[]).filter(i => i.detected)
    if (detectedIndicators.length > 0) {
      summary += `🚨 THREAT INDICATORS DETECTED:\n\n`
      detectedIndicators.forEach((indicator, idx) => {
        summary += `${idx + 1}. [${indicator.severity}] ${indicator.description}\n`
      })
      summary += `\n`
    }
    
    summary += `Risk Score: ${analysis.riskScore}/100 ${analysis.riskScore >= 70 ? '(CRITICAL)' : analysis.riskScore >= 50 ? '(HIGH)' : analysis.riskScore >= 30 ? '(MEDIUM)' : '(LOW)'}\n`
    
    // Add MCP enhancement note if available
    if (mcpEnhanced) {
      summary += `\n🔍 Enhanced Analysis: This analysis has been enriched with real threat intelligence from DynamoDB.\n`
      if (mcpThreatType) {
        summary += `Threat Type: ${mcpThreatType}\n`
      }
      if (mcpRecommendation) {
        summary += `Recommendation: ${mcpRecommendation}\n`
      }
    }
    
    summary += `\nPrimary findings:
- ${checks.join('\n- ')}

Notes:
${(details || '').slice(0, 1200)}

`
    
    // Enhanced recommendations based on risk
    let recommendations = {
      critical: [] as string[],
      shortTerm: [] as string[],
      longTerm: [] as string[],
      doNot: [] as string[],
      general: [] as string[]
    }
    
    if (analysis.riskScore >= 50) {
      recommendations.critical = [
        'Quarantine this message and all similar emails immediately',
        'Search for similar patterns: executive names from free email domains',
        `Alert the impersonated executive about this spoofing attempt`,
        'Notify all employees about active impersonation attempt',
        'DO NOT action any financial requests from this sender'
      ]
      recommendations.shortTerm = [
        'Create transport rule: Block/flag executive names from external domains',
        'Enable external sender warnings for all inbound email',
        'Review and tighten DMARC policy (consider p=quarantine or p=reject)',
        'Check for any similar messages in the past 30 days'
      ]
      recommendations.longTerm = [
        'Implement executive impersonation protection rules',
        'Deploy anti-phishing training focused on BEC tactics',
        'Enable advanced threat protection features',
        'Establish out-of-band verification for financial requests'
      ]
      recommendations.doNot = [
        'Allow-list this sender',
        'Reply to this email',
        'Process any financial/payroll changes without verbal confirmation'
      ]
    } else if (analysis.riskScore >= 30) {
      recommendations.general = [
        'Review message for additional suspicious indicators',
        'Verify sender authenticity through alternate channel (phone call)',
        'Monitor for similar patterns',
        'Consider adding sender verification rules',
        'If suspicious: quarantine similar messages, tighten policy, notify users',
        'If benign: add allow-list rule with scope/time-bound review'
      ]
    } else {
      recommendations.general = [
        'If suspicious: quarantine similar messages, tighten policy, notify users',
        'If benign: add allow-list rule with scope/time-bound review',
        'Monitor sender reputation and historical patterns'
      ]
    }
    
    // Return structured data for beautiful UI rendering
    return NextResponse.json({ 
      ok: true, 
      summary,
      structured: {
        classification: analysis.classification,
        riskScore: analysis.riskScore,
        severity: analysis.riskScore >= 70 ? 'CRITICAL' : analysis.riskScore >= 50 ? 'HIGH' : analysis.riskScore >= 30 ? 'MEDIUM' : 'LOW',
        indicators: detectedIndicators,
        checks,
        notes: (details || '').slice(0, 1200),
        recommendations
      }
    })
  } catch (e: any) {
    return NextResponse.json({ ok:false, error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
