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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Ilminate Logo */}
            <Box sx={{
              width: 80,
              height: 80,
              bgcolor: '#007070',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '2.5rem',
              color: 'white',
              boxShadow: '0 4px 12px rgba(0, 112, 112, 0.3)'
            }}>
              IL
            </Box>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5, color: '#1a1a1a' }}>
                Ilminate <span style={{ color: '#007070' }}>APEX</span>
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#666', fontWeight: 500 }}>
                Advanced Protection & Exposure Intelligence
              </Typography>
            </Box>
          </Box>
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

          {/* EDR Metrics */}
          <EDRMetricsLines />
        </Box>
      </Box>
    </Box>
  )
}

