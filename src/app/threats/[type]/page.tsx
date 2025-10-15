'use client'
import { Box, Typography, Card, CardContent, Button, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, BarChart, Bar } from 'recharts'
import { ThreatInteractionMap } from '@/components/Charts.client'

const UNCW_TEAL = '#007070'
const UNCW_GOLD = '#FFD700'

// Mock threat-specific data generators
function mockThreatTimeline(type: string) {
  const days = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push({
      date: d.toISOString().slice(5, 10),
      detected: Math.floor(20 + Math.random() * 80),
      blocked: Math.floor(15 + Math.random() * 70),
      reported: Math.floor(5 + Math.random() * 30)
    })
  }
  return days
}

function mockThreatExamples(type: string) {
  const examples = {
    phish: [
      { subject: 'Urgent: Verify your account', sender: 'security@paypa1-verify.com', score: 95 },
      { subject: 'Important billing update', sender: 'billing@microsoft-secure.net', score: 88 },
      { subject: 'Your package delivery failed', sender: 'noreply@fedex-tracking.co', score: 92 },
    ],
    malware: [
      { subject: 'Invoice #47382', sender: 'accounting@supplier-inc.com', score: 97 },
      { subject: 'Updated contract document', sender: 'legal@partner-firm.net', score: 94 },
      { subject: 'Q4 Financial Report.pdf', sender: 'cfo@company-internal.com', score: 91 },
    ],
    spam: [
      { subject: 'Exclusive offer just for you!', sender: 'deals@marketing-blast.com', score: 78 },
      { subject: 'You won a prize!', sender: 'winner@lottery-claim.net', score: 82 },
      { subject: 'Limited time discount', sender: 'sales@promo-deals.co', score: 75 },
    ],
    bec: [
      { subject: 'Wire transfer request - URGENT', sender: 'ceo@company.com.secure.net', score: 98 },
      { subject: 'Update payment details', sender: 'finance.director@company-portal.com', score: 96 },
      { subject: 'Confidential: Change of banking info', sender: 'executive@company-mail.net', score: 99 },
    ],
    ato: [
      { subject: 'Sent from my iPhone', sender: 'legitimate.user@company.com', score: 93 },
      { subject: 'Re: Project update', sender: 'john.doe@company.com', score: 90 },
      { subject: 'Please review attached', sender: 'trusted.colleague@company.com', score: 95 },
    ]
  }
  return examples[type as keyof typeof examples] || examples.phish
}

const THREAT_INFO: Record<string, { title: string; description: string; color: string; indicators: string[]; mitigation: string[] }> = {
  phish: {
    title: 'Phishing Attacks',
    description: 'Deceptive messages designed to steal credentials, financial information, or sensitive data through social engineering techniques.',
    color: UNCW_TEAL,
    indicators: [
      'Suspicious sender domains (typosquatting, lookalike domains)',
      'Urgent or threatening language',
      'Requests for credentials or sensitive information',
      'Mismatched or suspicious URLs',
      'Poor grammar or formatting inconsistencies'
    ],
    mitigation: [
      'User security awareness training',
      'Email authentication (SPF, DKIM, DMARC)',
      'URL filtering and sandboxing',
      'Multi-factor authentication (MFA)',
      'Regular phishing simulation exercises'
    ]
  },
  malware: {
    title: 'Malware Threats',
    description: 'Malicious software delivered via attachments or links that can infect endpoints, steal data, or establish persistent access.',
    color: '#ef4444',
    indicators: [
      'Suspicious file attachments (executables, macros, archives)',
      'Known malicious file hashes',
      'Obfuscated or packed executables',
      'Malicious URLs or download links',
      'Unexpected or unusual attachment types'
    ],
    mitigation: [
      'Advanced endpoint protection (EDR/XDR)',
      'Attachment sandboxing and detonation',
      'File type filtering and blocking',
      'Regular system patching',
      'Application whitelisting'
    ]
  },
  spam: {
    title: 'Spam Messages',
    description: 'Bulk unsolicited messages that clutter inboxes and often serve as cover for more sophisticated threats.',
    color: '#9ca3af',
    indicators: [
      'High volume from single source',
      'Generic or mass-mailed content',
      'Suspicious marketing claims',
      'Unsubscribe mechanisms that don\'t work',
      'Spoofed or forged sender addresses'
    ],
    mitigation: [
      'Reputation-based filtering',
      'Content analysis and pattern matching',
      'Rate limiting and throttling',
      'Sender authentication verification',
      'User-reported spam feedback loops'
    ]
  },
  bec: {
    title: 'Business Email Compromise',
    description: 'Sophisticated social engineering attacks targeting businesses for financial fraud, often impersonating executives or vendors.',
    color: '#f97316',
    indicators: [
      'Executive impersonation attempts',
      'Urgent payment or wire transfer requests',
      'Last-minute changes to payment details',
      'Requests to bypass normal procedures',
      'Display name spoofing'
    ],
    mitigation: [
      'Multi-step financial verification procedures',
      'Out-of-band confirmation for payment changes',
      'Executive impersonation detection',
      'Display name analysis',
      'Regular security training for finance teams'
    ]
  },
  ato: {
    title: 'Account Takeover',
    description: 'Attackers use stolen credentials to access legitimate accounts and conduct malicious activities while appearing as the legitimate user.',
    color: '#8b5cf6',
    indicators: [
      'Login from unusual locations or devices',
      'Abnormal email activity patterns',
      'Forwarding rules to external addresses',
      'Mass email deletion or modification',
      'Changes to account settings'
    ],
    mitigation: [
      'Multi-factor authentication (MFA) enforcement',
      'Anomaly detection and behavioral analysis',
      'IP and device reputation checking',
      'Session monitoring and timeout policies',
      'Automated suspicious activity alerts'
    ]
  }
}

export default function ThreatDetailPage() {
  const params = useParams()
  const type = params?.type as string || 'phish'
  const info = THREAT_INFO[type] || THREAT_INFO.phish
  const timeline = mockThreatTimeline(type)
  const examples = mockThreatExamples(type)

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F5F7FA', p: 4 }}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          pb: 3,
          borderBottom: '2px solid #007070'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Image 
                      src="/ilminate-logo.png" 
                      alt="Ilminate Logo" 
                      width={100} 
                      height={100}
                      priority
                      style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 112, 112, 0.3))' }}
                    />
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5, color: '#1a1a1a' }}>
                {info.title}
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#666', fontWeight: 500 }}>
                Detailed Threat Analysis & Metrics
              </Typography>
            </Box>
          </Box>
          <Link href="/" passHref legacyBehavior>
            <Button 
              variant="outlined" 
              component="a" 
              size="large"
              sx={{ 
                borderColor: '#007070',
                color: '#007070',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                '&:hover': { 
                  borderColor: '#005555',
                  bgcolor: 'rgba(0, 112, 112, 0.05)'
                }
              }}
            >
              ← Dashboard
            </Button>
          </Link>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Threat Overview */}
          <Card sx={{ bgcolor: '#FFFFFF', border: '2px solid #E0E4E8', boxShadow: '0 4px 16px rgba(0, 112, 112, 0.08)' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: info.color }}>
                Threat Overview
              </Typography>
              <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.8 }}>
                {info.description}
              </Typography>
            </CardContent>
          </Card>

          {/* 30-Day Trend */}
          <Card sx={{ bgcolor: '#FFFFFF', border: '2px solid #E0E4E8', boxShadow: '0 4px 16px rgba(0, 112, 112, 0.08)' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#1a1a1a' }}>
                30-Day Trend Analysis
              </Typography>
              <div style={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeline} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#666' }} angle={-45} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 11, fill: '#666' }} width={50} />
                    <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '2px solid #007070', borderRadius: 12, padding: 12 }} />
                    <Legend wrapperStyle={{ paddingTop: 20 }} />
                    <Line type="monotone" dataKey="detected" name="Detected" stroke={UNCW_TEAL} strokeWidth={3} dot={{ fill: UNCW_TEAL, r: 4 }} />
                    <Line type="monotone" dataKey="blocked" name="Blocked" stroke={UNCW_GOLD} strokeWidth={3} dot={{ fill: UNCW_GOLD, r: 4 }} />
                    <Line type="monotone" dataKey="reported" name="User Reported" stroke="#666" strokeWidth={2} dot={{ fill: '#666', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Key Indicators & Mitigation */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Card sx={{ bgcolor: '#FFFFFF', border: '2px solid #E0E4E8', boxShadow: '0 4px 16px rgba(0, 112, 112, 0.08)' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: UNCW_TEAL }}>
                  Key Indicators
                </Typography>
                <Box component="ul" sx={{ pl: 3, m: 0, color: '#666', lineHeight: 2 }}>
                  {info.indicators.map((indicator, idx) => (
                    <li key={idx} style={{ marginBottom: 8 }}>
                      <Typography variant="body2">{indicator}</Typography>
                    </li>
                  ))}
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ bgcolor: '#FFFFFF', border: '2px solid #E0E4E8', boxShadow: '0 4px 16px rgba(0, 112, 112, 0.08)' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: UNCW_GOLD }}>
                  Mitigation Strategies
                </Typography>
                <Box component="ul" sx={{ pl: 3, m: 0, color: '#666', lineHeight: 2 }}>
                  {info.mitigation.map((strategy, idx) => (
                    <li key={idx} style={{ marginBottom: 8 }}>
                      <Typography variant="body2">{strategy}</Typography>
                    </li>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Recent Examples */}
          <Card sx={{ bgcolor: '#FFFFFF', border: '2px solid #E0E4E8', boxShadow: '0 4px 16px rgba(0, 112, 112, 0.08)' }}>
            <Box sx={{ p: 3, borderBottom: '2px solid #007070', bgcolor: '#F8FAFB' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                Recent Examples (Last 7 Days)
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F8FAFB' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Subject</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Sender</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Threat Score</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {examples.map((ex, idx) => (
                    <TableRow key={idx} sx={{ '&:hover': { bgcolor: '#F8FAFB' } }}>
                      <TableCell sx={{ color: '#1a1a1a', fontWeight: 500 }}>{ex.subject}</TableCell>
                      <TableCell sx={{ color: '#666', fontFamily: 'monospace', fontSize: '0.85rem' }}>{ex.sender}</TableCell>
                      <TableCell>
                        <Chip 
                          label={ex.score} 
                          size="small"
                          sx={{ 
                            bgcolor: ex.score >= 90 ? '#ef4444' : ex.score >= 80 ? '#f97316' : '#FFD700',
                            color: 'white',
                            fontWeight: 700
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip label="Quarantined" size="small" sx={{ bgcolor: UNCW_TEAL, color: 'white', fontWeight: 600 }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>

          {/* Interaction Map */}
          <ThreatInteractionMap campaignId={`${type}-latest`} />
        </Box>
      </Box>
    </Box>
  )
}

