'use client'
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material'
import Link from 'next/link'
import Image from 'next/image'
import CategoryCard from '@/components/CategoryCard'
import { TimelineArea, QuarantineDeliveredBars, CyberScoreDonut, AIThreatsBar, EDRMetricsLines, EDREndpointStatus, EDRThreatDetections, AIExploitDetectionChart } from '@/components/Charts.client'
import { mockCategoryCounts, GLOSSARY, mockDomainAbuse } from '@/lib/mock'

const UNCW_TEAL = '#007070'
const UNCW_GOLD = '#FFD700'

export default function Home() {
  const cats = mockCategoryCounts()
  const abuse = mockDomainAbuse()

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F5F7FA', color: '#1a1a1a', p: 4 }}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        {/* Header with Logo */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          pb: 3,
          borderBottom: '2px solid #007070'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {/* Ilminate Logo */}
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
                Ilminate <span style={{ color: '#007070' }}>APEX</span>
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#666', fontWeight: 500 }}>
                Advanced Protection & Exposure Intelligence
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link href="/investigations" passHref legacyBehavior>
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
                Investigations
              </Button>
            </Link>
            <Link href="/triage" passHref legacyBehavior>
              <Button 
                variant="contained" 
                component="a" 
                size="large"
                sx={{ 
                  bgcolor: '#007070', 
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#005555' },
                  boxShadow: '0 4px 12px rgba(0, 112, 112, 0.3)'
                }}
              >
                Triage
              </Button>
            </Link>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Threat Categories Section */}
          <Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
                Threat Categories
              </Typography>
              <Typography variant="body1" sx={{ color: '#666' }}>
                Overview of threat types detected across your environment
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' },
              gap: 2 
            }}>
              <CategoryCard label="Phish" value={cats.Phish} description={GLOSSARY.Phish} />
              <CategoryCard label="Malware" value={cats.Malware} description={GLOSSARY.Malware} />
              <CategoryCard label="Spam" value={cats.Spam} description={GLOSSARY.Spam} />
              <CategoryCard label="BEC" value={cats.BEC} description={GLOSSARY.BEC} />
              <CategoryCard label="ATO" value={cats.ATO} description={GLOSSARY.ATO} />
            </Box>
          </Box>

          {/* Cyber Score Section */}
          <Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
                Security Performance
              </Typography>
              <Typography variant="body1" sx={{ color: '#666' }}>
                Overall cyber security score and key performance metrics
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
              gap: 3 
            }}>
              <CyberScoreDonut />
              <Box sx={{ 
                backgroundColor: '#FFFFFF', 
                borderRadius: 16, 
                padding: 32, 
                border: '2px solid #E0E4E8',
                height: 420,
                boxShadow: '0 4px 16px rgba(0, 112, 112, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center'
              }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: UNCW_TEAL, mb: 2 }}>
                  Security Posture
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mb: 3, lineHeight: 1.6 }}>
                  Your organization's security posture is being continuously monitored and improved through advanced threat detection and response capabilities.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#F8FAFB', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Threats Blocked Today</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#10b981' }}>1,247</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#F8FAFB', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Active Monitoring</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: UNCW_TEAL }}>24/7</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#F8FAFB', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Last Incident</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: UNCW_GOLD }}>2h ago</Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ 
                backgroundColor: '#FFFFFF', 
                borderRadius: 16, 
                padding: 32, 
                border: '2px solid #E0E4E8',
                height: 420,
                boxShadow: '0 4px 16px rgba(0, 112, 112, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center'
              }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: UNCW_TEAL, mb: 2 }}>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                  <Button 
                    variant="contained" 
                    sx={{ 
                      bgcolor: UNCW_TEAL, 
                      color: 'white',
                      py: 1.5,
                      fontWeight: 600,
                      '&:hover': { bgcolor: '#005555' }
                    }}
                  >
                    View All Threats
                  </Button>
                  <Button 
                    variant="outlined" 
                    sx={{ 
                      borderColor: UNCW_TEAL,
                      color: UNCW_TEAL,
                      py: 1.5,
                      fontWeight: 600,
                      '&:hover': { 
                        borderColor: '#005555',
                        bgcolor: 'rgba(0, 112, 112, 0.05)'
                      }
                    }}
                  >
                    Run Security Scan
                  </Button>
                  <Button 
                    variant="outlined" 
                    sx={{ 
                      borderColor: UNCW_GOLD,
                      color: UNCW_GOLD,
                      py: 1.5,
                      fontWeight: 600,
                      '&:hover': { 
                        borderColor: '#E6C200',
                        bgcolor: 'rgba(255, 215, 0, 0.05)'
                      }
                    }}
                  >
                    Generate Report
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Timeline */}
          <TimelineArea />

          {/* Quarantined vs Delivered */}
          <QuarantineDeliveredBars />

          {/* Domain / Brand Abuse (DMARC value) */}
          <TableContainer component={Paper} sx={{ 
            bgcolor: '#FFFFFF', 
            border: '2px solid #E0E4E8',
            borderRadius: 3,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <Box sx={{ p: 2, borderBottom: '2px solid #007070', bgcolor: '#F8FAFB' }}>
              <Typography variant="subtitle1" sx={{ color: '#1a1a1a', fontWeight: 600 }}>
                Domain / Brand Abuse — showing the value of DMARC
              </Typography>
            </Box>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFB' }}>
                  <TableCell sx={{ color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
                    Impersonating Domain
                  </TableCell>
                  <TableCell sx={{ color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
                    First Seen
                  </TableCell>
                  <TableCell sx={{ color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
                    Messages
                  </TableCell>
                  <TableCell sx={{ color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
                    DMARC Alignment
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {abuse.map((r, idx) => (
                  <TableRow key={idx} sx={{ '&:hover': { bgcolor: '#F8FAFB' }, '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell sx={{ color: '#1a1a1a', fontWeight: 500 }}>{r.domain}</TableCell>
                    <TableCell sx={{ color: '#666' }}>{r.firstSeen}</TableCell>
                    <TableCell sx={{ color: '#1a1a1a', fontWeight: 600 }}>{r.messages.toLocaleString()}</TableCell>
                    <TableCell sx={{ 
                      color: r.dmarcAligned === 'Aligned' ? '#10b981' : '#ef4444',
                      fontWeight: 700
                    }}>
                      {r.dmarcAligned}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* AI Threats */}
          <AIThreatsBar />

          {/* AI Exploit Detection */}
          <AIExploitDetectionChart />

          {/* EDR Section Header */}
          <Box sx={{ mt: 4, mb: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
              Endpoint Detection & Response (EDR)
            </Typography>
            <Typography variant="body1" sx={{ color: '#666' }}>
              Real-time endpoint security monitoring, threat detection, and automated response across your infrastructure
            </Typography>
          </Box>

          {/* EDR Metrics Timeline */}
          <EDRMetricsLines />

          {/* EDR Additional Metrics */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3 
          }}>
            <EDREndpointStatus />
            <EDRThreatDetections />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

