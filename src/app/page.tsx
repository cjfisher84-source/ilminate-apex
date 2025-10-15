'use client'
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material'
import Link from 'next/link'
import CategoryCard from '@/components/CategoryCard'
import { TimelineArea, QuarantineDeliveredBars, CyberScoreDonut, AIThreatsBar, EDRMetricsLines } from '@/components/Charts.client'
import { mockCategoryCounts, GLOSSARY, mockDomainAbuse } from '@/lib/mock'

export default function Home() {
  const cats = mockCategoryCounts()
  const abuse = mockDomainAbuse()

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0b0f14', color: 'white', p: 4 }}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              Ilminate <span style={{ color: '#006666' }}>APEX</span>
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Advanced Protection & Exposure Intelligence
            </Typography>
          </Box>
          <Link href="/triage" passHref legacyBehavior>
            <Button variant="contained" component="a" sx={{ bgcolor: '#006666', '&:hover': { bgcolor: '#004d4d' } }}>
              Triage
            </Button>
          </Link>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Top categories with cyber score */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' },
            gap: 2 
          }}>
            <CategoryCard label="Phish" value={cats.Phish} description={GLOSSARY.Phish} />
            <CategoryCard label="Malware" value={cats.Malware} description={GLOSSARY.Malware} />
            <CategoryCard label="Spam" value={cats.Spam} description={GLOSSARY.Spam} />
            <CategoryCard label="BEC" value={cats.BEC} description={GLOSSARY.BEC} />
            <CategoryCard label="ATO" value={cats.ATO} description={GLOSSARY.ATO} />
            <CyberScoreDonut />
          </Box>

          {/* Timeline */}
          <TimelineArea />

          {/* Quarantined vs Delivered */}
          <QuarantineDeliveredBars />

          {/* Domain / Brand Abuse (DMARC value) */}
          <TableContainer component={Paper} sx={{ bgcolor: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(71, 85, 105, 0.5)' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(71, 85, 105, 0.5)' }}>
              <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Domain / Brand Abuse — showing the value of DMARC
              </Typography>
            </Box>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Impersonating Domain
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    First Seen
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Messages
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    DMARC Alignment
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {abuse.map((r, idx) => (
                  <TableRow key={idx} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell sx={{ color: 'white' }}>{r.domain}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{r.firstSeen}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{r.messages.toLocaleString()}</TableCell>
                    <TableCell sx={{ color: r.dmarcAligned === 'Aligned' ? '#10b981' : '#ef4444' }}>
                      {r.dmarcAligned}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* AI Threats */}
          <AIThreatsBar />

          {/* EDR Metrics */}
          <EDRMetricsLines />
        </Box>
      </Box>
    </Box>
  )
}

