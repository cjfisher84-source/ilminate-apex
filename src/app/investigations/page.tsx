'use client'
import { Box, Typography, Card, CardContent, Button, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'
import Link from 'next/link'
import Image from 'next/image'
import { ThreatInteractionMap, CrossChannelTimelineChart } from '@/components/Charts.client'
import { mockCampaigns, mockPathAnalysis, type Campaign } from '@/lib/mock'

const UNCW_TEAL = '#007070'
const UNCW_GOLD = '#FFD700'

export default function InvestigationsPage() {
  const campaigns = mockCampaigns()
  const activeCampaign = campaigns.find(c => c.status === 'active') || campaigns[0]
  const pathData = mockPathAnalysis(activeCampaign.id)

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return '#ef4444'
      case 'contained': return UNCW_GOLD  
      case 'resolved': return '#10b981'
      default: return '#999'
    }
  }

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
              src="/ilminate-logo.svg" 
              alt="Ilminate Logo" 
              width={100} 
              height={100}
              priority
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 112, 112, 0.3))' }}
            />
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5, color: '#1a1a1a' }}>
                Campaign <span style={{ color: UNCW_TEAL }}>Investigations</span>
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#666', fontWeight: 500 }}>
                Cross-Channel Threat Analysis & Investigation
              </Typography>
            </Box>
          </Box>
          <Link href="/" passHref legacyBehavior>
            <Button 
              variant="outlined" 
              component="a" 
              size="large"
              sx={{ 
                borderColor: UNCW_TEAL,
                color: UNCW_TEAL,
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
          {/* Active Campaigns Overview */}
          <Card sx={{ bgcolor: '#FFFFFF', border: '2px solid #E0E4E8', boxShadow: '0 4px 16px rgba(0, 112, 112, 0.08)' }}>
            <Box sx={{ p: 3, borderBottom: '2px solid #007070', bgcolor: '#F8FAFB' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                Active & Recent Campaigns
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F8FAFB' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Campaign Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Channels</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Targets</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Compromised</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id} sx={{ '&:hover': { bgcolor: '#F8FAFB' } }}>
                      <TableCell sx={{ color: '#1a1a1a', fontWeight: 600 }}>{campaign.name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={campaign.threatType}
                          size="small"
                          sx={{ bgcolor: UNCW_TEAL, color: 'white', fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {campaign.channels.map(ch => (
                            <Chip key={ch} label={ch} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#1a1a1a', fontWeight: 600 }}>{campaign.targets}</TableCell>
                      <TableCell>
                        <Chip 
                          label={campaign.interactions.compromised}
                          size="small"
                          sx={{ 
                            bgcolor: campaign.interactions.compromised > 0 ? '#ef4444' : '#10b981',
                            color: 'white',
                            fontWeight: 700
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={campaign.status}
                          size="small"
                          sx={{ bgcolor: getStatusColor(campaign.status), color: 'white', fontWeight: 600 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>

          {/* Featured Campaign Analysis */}
          <Card sx={{ bgcolor: '#FFFFFF', border: '2px solid #E0E4E8', boxShadow: '0 4px 16px rgba(0, 112, 112, 0.08)' }}>
            <Box sx={{ p: 3, borderBottom: '2px solid #007070', bgcolor: '#F8FAFB' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                  Featured Investigation: {activeCampaign.name}
                </Typography>
                <Chip 
                  label={activeCampaign.status.toUpperCase()}
                  sx={{ bgcolor: getStatusColor(activeCampaign.status), color: 'white', fontWeight: 700 }}
                />
              </Box>
            </Box>
            <CardContent sx={{ p: 4 }}>
              {/* Source Analysis */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: UNCW_TEAL, mb: 2 }}>
                  📍 Source Analysis
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                  <Box sx={{ p: 2, bgcolor: '#F8FAFB', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, display: 'block', mb: 0.5 }}>
                      IP ADDRESS
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                      {activeCampaign.source.ip}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, bgcolor: '#F8FAFB', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, display: 'block', mb: 0.5 }}>
                      GEOLOCATION
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {activeCampaign.source.geo}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, bgcolor: '#F8FAFB', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, display: 'block', mb: 0.5 }}>
                      DOMAIN
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      {activeCampaign.source.domain}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Path Visualization */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: UNCW_TEAL, mb: 2 }}>
                  🛤️ Threat Path
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflowX: 'auto', pb: 2 }}>
                  {pathData.path.map((step, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: step.status === 'quarantined' ? '#ef4444' : step.status === 'suspicious' ? UNCW_GOLD : UNCW_TEAL,
                        color: 'white',
                        borderRadius: 2,
                        minWidth: 150,
                        textAlign: 'center'
                      }}>
                        <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, opacity: 0.8 }}>
                          {step.timestamp}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {step.step}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', fontSize: '0.7rem' }}>
                          {step.action}
                        </Typography>
                      </Box>
                      {idx < pathData.path.length - 1 && (
                        <Box sx={{ fontSize: '1.5rem', color: '#999' }}>→</Box>
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Exposure Metrics */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: UNCW_TEAL, mb: 2 }}>
                  💥 Exposure Analysis
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                  <Box sx={{ p: 2, bgcolor: '#F8FAFB', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                      {pathData.exposure.usersTargeted}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                      Users Targeted
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, bgcolor: '#F8FAFB', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: UNCW_GOLD }}>
                      {pathData.exposure.usersOpened}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                      Users Opened
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, bgcolor: '#F8FAFB', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#ef4444' }}>
                      {pathData.exposure.credentialsCompromised}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                      Credentials Compromised
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Threat Interaction Map */}
          <ThreatInteractionMap campaignId={activeCampaign.id} />

          {/* Cross-Channel Timeline */}
          <CrossChannelTimelineChart campaignId={activeCampaign.id} />

          {/* Campaign Summary Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
            <Card sx={{ bgcolor: '#FFFFFF', border: '2px solid #E0E4E8', boxShadow: '0 4px 16px rgba(0, 112, 112, 0.08)' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: UNCW_TEAL }}>
                  What Happened vs What Didn't
                </Typography>
                <Box component="ul" sx={{ pl: 3, m: 0, color: '#666', lineHeight: 2.5 }}>
                  <li>
                    <Typography variant="body2">
                      <strong style={{ color: '#10b981' }}>✓ Quarantined:</strong> {activeCampaign.targets - activeCampaign.interactions.delivered} messages blocked before delivery
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong style={{ color: UNCW_GOLD }}>✓ Reported:</strong> {activeCampaign.interactions.reported} users actively reported suspicious content
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong style={{ color: '#ef4444' }}>✗ Clicked:</strong> {activeCampaign.interactions.clicked} users clicked malicious links
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong style={{ color: '#ef4444' }}>✗ Compromised:</strong> {activeCampaign.interactions.compromised} accounts potentially compromised
                    </Typography>
                  </li>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ bgcolor: '#FFFFFF', border: '2px solid #E0E4E8', boxShadow: '0 4px 16px rgba(0, 112, 112, 0.08)' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: UNCW_GOLD }}>
                  Investigation Insights
                </Typography>
                <Box component="ul" sx={{ pl: 3, m: 0, color: '#666', lineHeight: 2.5 }}>
                  <li>
                    <Typography variant="body2">
                      Campaign leveraged <strong>{activeCampaign.channels.length} channels</strong> for maximum reach
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Attack originated from <strong>{activeCampaign.source.geo}</strong> region
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong>{Math.round((activeCampaign.interactions.reported / activeCampaign.targets) * 100)}%</strong> of users demonstrated security awareness
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong>{Math.round(((activeCampaign.targets - activeCampaign.interactions.compromised) / activeCampaign.targets) * 100)}%</strong> protection effectiveness rate
                    </Typography>
                  </li>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

