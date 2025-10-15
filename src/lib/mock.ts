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

