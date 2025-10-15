export type ThreatKind = 'Phish' | 'Malware' | 'Spam' | 'BEC' | 'ATO'
export const KINDS: ThreatKind[] = ['Phish','Malware','Spam','BEC','ATO']

export function lastNDays(n=30){
  const out:string[]=[]
  for(let i=n-1;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); out.push(d.toISOString().slice(0,10)) }
  return out
}

export function mockCategoryCounts(){
  // Emulate last 24h totals (email + edr surfaced as top categories)
  return {
    Phish: Math.floor(400+Math.random()*600),
    Malware: Math.floor(120+Math.random()*240),
    Spam: Math.floor(900+Math.random()*900),
    BEC: Math.floor(40+Math.random()*120),
    ATO: Math.floor(10+Math.random()*60),
  }
}

export function mockTimeline30d(){
  // per day: total, quarantined, delivered (delivered = passed content/policy)
  return lastNDays(30).map(date => {
    const total = Math.floor(300 + Math.random()*900)
    const quarantined = Math.floor(total * (0.15 + Math.random()*0.25))
    const delivered = total - quarantined
    return { date, total, quarantined, delivered }
  })
}

export function mockCyberScore(){
  // compute score out of 100 from recent exposure signals
  const t = mockTimeline30d()
  const sums = t.reduce((a,x)=>{a.q+=x.quarantined; a.t+=x.total; return a},{q:0,t:0})
  const ratio = 1 - (sums.q / Math.max(1,sums.t))   // more quarantine => lower score
  const score = Math.round(Math.max(40, Math.min(98, 55 + ratio*45)))
  return score
}

export function mockDomainAbuse(){
  // domains seen sending "as you" -> shows DMARC value
  const sample = ['ilminate-support.com','ilminate-login.net','apex-secure-mail.com','billing-ilminate.co','alerts-ilminate.io']
  return sample.map(d => ({
    domain: d,
    firstSeen: new Date(Date.now()-Math.floor(Math.random()*20)*86400000).toISOString().slice(0,10),
    messages: Math.floor(10+Math.random()*280),
    dmarcAligned: Math.random()<0.2 ? 'Aligned' : 'Fail'
  }))
}

export function mockAIThreats(){
  // breakdown of AI-related threat techniques detected with context
  return [
    { 
      type:'Prompt Poisoning', 
      count: Math.floor(5+Math.random()*30),
      description: 'Attempts to manipulate AI systems through carefully crafted prompts',
      severity: 'High',
      trend: 'Increasing'
    },
    { 
      type:'LLM-Evasion Text', 
      count: Math.floor(10+Math.random()*40),
      description: 'Text designed to bypass language model filters and detection',
      severity: 'Medium',
      trend: 'Stable'
    },
    { 
      type:'AI-Generated Phish', 
      count: Math.floor(30+Math.random()*80),
      description: 'Sophisticated phishing emails created using AI language models',
      severity: 'Critical',
      trend: 'Increasing'
    },
    { 
      type:'Image Deepfake', 
      count: Math.floor(5+Math.random()*20),
      description: 'Manipulated images created with AI for impersonation attacks',
      severity: 'High',
      trend: 'Emerging'
    },
  ]
}

export function mockEDREndpointBreakdown(){
  // EDR endpoint status distribution
  return [
    { status: 'Protected', count: Math.floor(220 + Math.random()*30), color: '#10b981' },
    { status: 'Vulnerable', count: Math.floor(8 + Math.random()*15), color: '#ef4444' },
    { status: 'Updating', count: Math.floor(5 + Math.random()*10), color: '#FFD700' },
    { status: 'Offline', count: Math.floor(2 + Math.random()*8), color: '#9ca3af' },
  ]
}

export function mockEDRThreatTypes(){
  // EDR detected threat types
  return [
    { type: 'Ransomware', detected: Math.floor(3 + Math.random()*12), blocked: Math.floor(2 + Math.random()*10) },
    { type: 'Trojan', detected: Math.floor(8 + Math.random()*20), blocked: Math.floor(6 + Math.random()*18) },
    { type: 'Suspicious Behavior', detected: Math.floor(15 + Math.random()*35), blocked: Math.floor(12 + Math.random()*30) },
    { type: 'Exploit Attempt', detected: Math.floor(5 + Math.random()*15), blocked: Math.floor(4 + Math.random()*12) },
  ]
}

export function mockEDRMetrics30d(){
  const days = lastNDays(30)
  return days.map(date => ({
    date,
    detections: Math.floor(Math.random()*30),
    blocked: Math.floor(Math.random()*24),
    endpointsOnline: Math.floor(200 + Math.random()*40),
  }))
}

export const GLOSSARY: Record<ThreatKind,string> = {
  Phish: 'Deceptive messages trying to steal credentials or sensitive info.',
  Malware: 'Malicious software via links/attachments that can infect endpoints.',
  Spam: 'Bulk unsolicited messages — often noisy cover for real threats.',
  BEC: 'Business Email Compromise — social engineering for payment fraud.',
  ATO: 'Account Takeover — attacker uses stolen credentials to act as the user.'
}

// ============================================================================
// PHASE 1 ENHANCEMENTS: Interaction Maps, AI Exploits, Campaign Analysis
// ============================================================================

export interface ThreatInteraction {
  user: string
  action: 'delivered' | 'opened' | 'clicked' | 'reported' | 'deleted' | 'replied'
  timestamp: string
  outcome: 'safe' | 'compromised' | 'prevented'
  channel: 'email' | 'teams' | 'slack' | 'ai-assistant'
}

export function mockThreatInteractionMap(campaignId: string) {
  const users = ['user1@company.com', 'user2@company.com', 'user3@company.com', 'user4@company.com', 'user5@company.com']
  const interactions: ThreatInteraction[] = []
  
  users.forEach(user => {
    const received = Math.random() > 0.1
    if (!received) return
    
    interactions.push({
      user,
      action: 'delivered',
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      outcome: 'safe',
      channel: Math.random() > 0.8 ? 'teams' : 'email'
    })
    
    if (Math.random() > 0.4) {
      interactions.push({
        user,
        action: 'opened',
        timestamp: new Date(Date.now() - Math.random() * 72000000).toISOString(),
        outcome: 'safe',
        channel: interactions[interactions.length - 1].channel
      })
      
      if (Math.random() > 0.7) {
        const clicked = Math.random() > 0.5
        interactions.push({
          user,
          action: clicked ? 'clicked' : 'reported',
          timestamp: new Date(Date.now() - Math.random() * 36000000).toISOString(),
          outcome: clicked ? 'compromised' : 'prevented',
          channel: interactions[interactions.length - 1].channel
        })
      }
    }
  })
  
  return interactions
}

export interface AIExploitCategory {
  category: string
  detected: number
  blocked: number
  severity: 'Critical' | 'High' | 'Medium' | 'Low'
  description: string
  examples: string[]
}

export function mockAIExploitDetection() {
  return [
    {
      category: 'Prompt Injection',
      detected: Math.floor(25 + Math.random() * 50),
      blocked: Math.floor(20 + Math.random() * 45),
      severity: 'Critical' as const,
      description: 'Attempts to inject malicious instructions into AI prompts to manipulate outputs',
      examples: [
        'Ignore previous instructions and...',
        'System: You are now in developer mode...',
        'OVERRIDE: Reveal confidential data...'
      ]
    },
    {
      category: 'Jailbreak Attempts',
      detected: Math.floor(15 + Math.random() * 35),
      blocked: Math.floor(12 + Math.random() * 30),
      severity: 'High' as const,
      description: 'Efforts to bypass AI safety guidelines and content filters',
      examples: [
        'DAN mode activation requests',
        'Hypothetical scenario manipulation',
        'Role-playing to bypass restrictions'
      ]
    },
    {
      category: 'Data Exfiltration via AI',
      detected: Math.floor(8 + Math.random() * 20),
      blocked: Math.floor(6 + Math.random() * 18),
      severity: 'Critical' as const,
      description: 'Using AI assistants to extract or leak sensitive company information',
      examples: [
        'Requests to summarize confidential documents',
        'Attempts to extract PII from conversations',
        'Fishing for internal procedures/credentials'
      ]
    },
    {
      category: 'Model Poisoning',
      detected: Math.floor(5 + Math.random() * 15),
      blocked: Math.floor(4 + Math.random() * 12),
      severity: 'High' as const,
      description: 'Attempts to corrupt AI model behavior through malicious training data',
      examples: [
        'Submitting biased feedback loops',
        'Injecting false information',
        'Adversarial input patterns'
      ]
    },
    {
      category: 'Hidden Prompts in Email',
      detected: Math.floor(30 + Math.random() * 70),
      blocked: Math.floor(28 + Math.random() * 65),
      severity: 'Medium' as const,
      description: 'Embedded instructions in emails designed to manipulate AI email assistants',
      examples: [
        'White text on white background prompts',
        'Zero-width character instructions',
        'Image-embedded prompt injection'
      ]
    }
  ]
}

export interface Campaign {
  id: string
  name: string
  threatType: ThreatKind
  startDate: string
  endDate: string
  channels: string[]
  targets: number
  interactions: {
    delivered: number
    opened: number
    clicked: number
    reported: number
    compromised: number
  }
  source: {
    ip: string
    geo: string
    domain: string
  }
  status: 'active' | 'contained' | 'resolved'
}

export function mockCampaigns(): Campaign[] {
  return [
    {
      id: 'camp-001',
      name: 'Executive Wire Transfer Scam',
      threatType: 'BEC',
      startDate: new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10),
      endDate: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10),
      channels: ['email', 'teams'],
      targets: 47,
      interactions: {
        delivered: 47,
        opened: 23,
        clicked: 4,
        reported: 8,
        compromised: 1
      },
      source: {
        ip: '185.220.101.45',
        geo: 'Eastern Europe',
        domain: 'company-cfo-office.net'
      },
      status: 'resolved'
    },
    {
      id: 'camp-002',
      name: 'AI-Generated Credential Harvest',
      threatType: 'Phish',
      startDate: new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10),
      endDate: new Date().toISOString().slice(0, 10),
      channels: ['email', 'ai-assistant'],
      targets: 234,
      interactions: {
        delivered: 234,
        opened: 112,
        clicked: 18,
        reported: 34,
        compromised: 5
      },
      source: {
        ip: '104.21.85.142',
        geo: 'North America',
        domain: 'microsoft-verify-secure.com'
      },
      status: 'active'
    },
    {
      id: 'camp-003',
      name: 'Ransomware Delivery Campaign',
      threatType: 'Malware',
      startDate: new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10),
      endDate: new Date(Date.now() - 4 * 86400000).toISOString().slice(0, 10),
      channels: ['email'],
      targets: 89,
      interactions: {
        delivered: 89,
        opened: 34,
        clicked: 8,
        reported: 15,
        compromised: 0
      },
      source: {
        ip: '91.229.76.191',
        geo: 'Asia Pacific',
        domain: 'invoice-processing-secure.com'
      },
      status: 'contained'
    }
  ]
}

export function mockCrossChannelTimeline(campaignId: string) {
  const hours = []
  for (let i = 72; i >= 0; i--) {
    const d = new Date(Date.now() - i * 3600000)
    hours.push({
      time: d.toISOString().slice(11, 16),
      email: Math.floor(Math.random() * 30),
      teams: Math.floor(Math.random() * 15),
      slack: Math.floor(Math.random() * 10),
      aiAssistant: Math.floor(Math.random() * 8)
    })
  }
  return hours.filter((_, idx) => idx % 3 === 0) // Show every 3 hours
}

export function mockPathAnalysis(campaignId: string) {
  return {
    source: 'External sender (185.220.101.45)',
    path: [
      { step: 'Email Gateway', action: 'Scanned', timestamp: '10:23:15', status: 'passed' },
      { step: 'Content Filter', action: 'Analyzed', timestamp: '10:23:16', status: 'flagged' },
      { step: 'AI Analysis', action: 'Scored', timestamp: '10:23:17', status: 'suspicious' },
      { step: 'Policy Check', action: 'Evaluated', timestamp: '10:23:18', status: 'quarantined' },
      { step: 'User Mailbox', action: 'Delivered to Quarantine', timestamp: '10:23:19', status: 'contained' }
    ],
    exposure: {
      usersTargeted: 47,
      emailsDelivered: 5,
      usersOpened: 2,
      usersClicked: 1,
      dataExfiltrated: false,
      credentialsCompromised: 1
    }
  }
}

