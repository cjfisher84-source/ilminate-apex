'use client'
import { Box, Typography, Card, CardContent, Button, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'
import Link from 'next/link'
import Image from 'next/image'
import { GeoThreatMap, CrossChannelTimelineChart } from '@/components/Charts.client'
import { mockCampaigns, mockPathAnalysis, type Campaign } from '@/lib/mock'
import { useIsMobile, getResponsivePadding, getResponsiveSpacing, getResponsiveFontSize, getResponsiveImageSize } from '@/lib/mobileUtils'

const UNCW_TEAL = '#007070'
const UNCW_GOLD = '#FFD700'

export default function InvestigationsPage() {
  const isMobile = useIsMobile()
  const campaigns = mockCampaigns()
  const activeCampaign = campaigns.find(c => c.status === 'active') || campaigns[0]
  const pathData = mockPathAnalysis(activeCampaign.id)
  
  const containerPadding = getResponsivePadding(isMobile)
  const headerGap = getResponsiveSpacing(isMobile, 2, 3)
  const logoSize = getResponsiveImageSize(isMobile, 100)

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return '#ef4444'
      case 'contained': return UNCW_GOLD  
      case 'resolved': return '#10b981'
      default: return '#999'
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: containerPadding }}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'center', 
          mb: isMobile ? 3 : 4,
          pb: isMobile ? 2 : 3,
          borderBottom: '2px solid',
          borderColor: 'primary.main',
          gap: isMobile ? 2 : 0
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: headerGap }}>
            <Image 
              src="/ilminate-logo.png" 
              alt="Ilminate Logo" 
              width={logoSize} 
              height={logoSize}
              priority
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 112, 112, 0.3))' }}
            />
            <Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 0.5, 
                  color: 'text.primary',
                  fontSize: getResponsiveFontSize(isMobile, 'h3')
                }}
              >
                Campaign <span style={{ color: UNCW_TEAL }}>Investigations</span>
              </Typography>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: 'text.secondary', 
                  fontWeight: 500,
                  fontSize: getResponsiveFontSize(isMobile, 'subtitle1')
                }}
              >
                {isMobile ? 'Threat Analysis' : 'Cross-Channel Threat Analysis & Investigation'}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, width: isMobile ? '100%' : 'auto' }}>
            <Link href="/" passHref legacyBehavior>
              <Button 
                variant="outlined" 
                component="a" 
                size={isMobile ? 'medium' : 'large'}
                fullWidth={isMobile}
                className={isMobile ? 'mobile-touch-target' : ''}
                sx={{ 
                  borderColor: UNCW_TEAL,
                  color: UNCW_TEAL,
                  px: isMobile ? 3 : 4,
                  py: isMobile ? 1.2 : 1.5,
                  fontSize: isMobile ? '1rem' : '1.1rem',
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
            <Link href="/api/auth/logout" passHref legacyBehavior>
              <Button 
                variant="outlined" 
                component="a" 
                size={isMobile ? 'medium' : 'large'}
                fullWidth={isMobile}
                className={isMobile ? 'mobile-touch-target' : ''}
                sx={{ 
                  borderColor: UNCW_TEAL,
                  color: UNCW_TEAL,
                  px: isMobile ? 3 : 4,
                  py: isMobile ? 1.2 : 1.5,
                  fontSize: isMobile ? '1rem' : '1.1rem',
                  fontWeight: 600,
                  '&:hover': { 
                    borderColor: '#005555',
                    bgcolor: 'rgba(0, 112, 112, 0.05)'
                  }
                }}
              >
                Logout
              </Button>
            </Link>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 2.5 : 3 }}>
          {/* Active Campaigns Overview */}
          <Box className={isMobile ? 'mobile-table-wrapper' : ''}>
            <Card sx={{ bgcolor: 'background.paper', border: '2px solid', borderColor: 'divider', boxShadow: 2 }}>
              <Box sx={{ p: isMobile ? 2 : 3, borderBottom: '2px solid', borderColor: 'primary.main', bgcolor: 'background.default' }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 700, 
                    color: 'text.primary',
                    fontSize: isMobile ? '1.25rem' : '1.5rem'
                  }}
                >
                  {isMobile ? 'Campaigns' : 'Active & Recent Campaigns'}
                </Typography>
              </Box>
              <TableContainer>
              <Table sx={{ minWidth: isMobile ? 800 : 'auto' }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'background.default' }}>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: isMobile ? '0.7rem' : '0.75rem', textTransform: 'uppercase', padding: isMobile ? '8px' : '16px' }}>Campaign Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: isMobile ? '0.7rem' : '0.75rem', textTransform: 'uppercase', padding: isMobile ? '8px' : '16px' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: isMobile ? '0.7rem' : '0.75rem', textTransform: 'uppercase', padding: isMobile ? '8px' : '16px' }}>Channels</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: isMobile ? '0.7rem' : '0.75rem', textTransform: 'uppercase', padding: isMobile ? '8px' : '16px' }}>Targets</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: isMobile ? '0.7rem' : '0.75rem', textTransform: 'uppercase', padding: isMobile ? '8px' : '16px' }}>Compromised</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: isMobile ? '0.7rem' : '0.75rem', textTransform: 'uppercase', padding: isMobile ? '8px' : '16px' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                      <TableCell sx={{ color: 'text.primary', fontWeight: 600, fontSize: isMobile ? '0.85rem' : '1rem', padding: isMobile ? '8px' : '16px' }}>{campaign.name}</TableCell>
                      <TableCell sx={{ padding: isMobile ? '8px' : '16px' }}>
                        <Chip 
                          label={campaign.threatType}
                          size="small"
                          sx={{ bgcolor: UNCW_TEAL, color: 'white', fontWeight: 600, fontSize: isMobile ? '0.7rem' : '0.8rem' }}
                        />
                      </TableCell>
                      <TableCell sx={{ padding: isMobile ? '8px' : '16px' }}>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {campaign.channels.map(ch => (
                            <Chip key={ch} label={ch} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: 'text.primary', fontWeight: 600, fontSize: isMobile ? '0.85rem' : '1rem', padding: isMobile ? '8px' : '16px' }}>{campaign.targets}</TableCell>
                      <TableCell sx={{ padding: isMobile ? '8px' : '16px' }}>
                        <Chip 
                          label={campaign.interactions.compromised}
                          size="small"
                          sx={{ 
                            bgcolor: campaign.interactions.compromised > 0 ? '#ef4444' : '#10b981',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: isMobile ? '0.7rem' : '0.8rem'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ padding: isMobile ? '8px' : '16px' }}>
                        <Chip 
                          label={campaign.status}
                          size="small"
                          sx={{ bgcolor: getStatusColor(campaign.status), color: 'white', fontWeight: 600, fontSize: isMobile ? '0.7rem' : '0.8rem' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
          </Box>

          {/* Featured Campaign Analysis */}
          <Card sx={{ bgcolor: 'background.paper', border: '2px solid', borderColor: 'divider', boxShadow: 2 }}>
            <Box sx={{ p: 3, borderBottom: '2px solid', borderColor: 'primary.main', bgcolor: 'background.default' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
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
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700, 
                    color: UNCW_TEAL, 
                    mb: 2,
                    fontSize: isMobile ? '1.1rem' : '1.25rem'
                  }}
                >
                  📍 Source Analysis
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 2 }}>
                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5 }}>
                      IP ADDRESS
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'text.primary' }}>
                      {activeCampaign.source.ip}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5 }}>
                      GEOLOCATION
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {activeCampaign.source.geo}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5 }}>
                      DOMAIN
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.primary' }}>
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
                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {pathData.exposure.usersTargeted}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Users Targeted
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: UNCW_GOLD }}>
                      {pathData.exposure.usersOpened}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Users Opened
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#ef4444' }}>
                      {pathData.exposure.credentialsCompromised}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Credentials Compromised
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Global Threat Origins Map */}
          <GeoThreatMap />

          {/* Cross-Channel Timeline */}
          <CrossChannelTimelineChart campaignId={activeCampaign.id} />

          {/* Campaign Summary Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
            <Card sx={{ bgcolor: 'background.paper', border: '2px solid', borderColor: 'divider', boxShadow: 2 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: UNCW_TEAL }}>
                  What Happened vs What Didn't
                </Typography>
                <Box component="ul" sx={{ pl: 3, m: 0, color: 'text.secondary', lineHeight: 2.5 }}>
                  <li>
                    <Typography variant="body2">
                      <strong style={{ color: '#10b981' }}>🛡️ Successfully Blocked:</strong> {activeCampaign.targets - activeCampaign.interactions.delivered} malicious messages prevented from reaching users
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong style={{ color: UNCW_GOLD }}>👥 Security Awareness:</strong> {activeCampaign.interactions.reported} users demonstrated excellent security awareness by reporting suspicious content
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong style={{ color: '#10b981' }}>📧 Safe Delivery:</strong> {activeCampaign.interactions.delivered - activeCampaign.interactions.clicked} legitimate messages safely delivered to intended recipients
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong style={{ color: '#f97316' }}>⚠️ Requires Attention:</strong> {activeCampaign.interactions.clicked} users clicked suspicious links - immediate security training recommended
                    </Typography>
                  </li>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ bgcolor: 'background.paper', border: '2px solid', borderColor: 'divider', boxShadow: 2 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: UNCW_GOLD }}>
                  Investigation Insights
                </Typography>
                <Box component="ul" sx={{ pl: 3, m: 0, color: 'text.secondary', lineHeight: 2.5 }}>
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

