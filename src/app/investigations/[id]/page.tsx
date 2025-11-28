'use client'
import { Box, Typography, Card, CardContent, Button, Chip, Paper, Tooltip } from '@mui/material'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import UserProfile from '@/components/UserProfile'
import NavigationBar from '@/components/NavigationBar'
import { CrossChannelTimelineChart } from '@/components/Charts.client'
import { mockCampaigns, mockPathAnalysis, type Campaign } from '@/lib/mock'
import { useIsMobile, getResponsivePadding, getResponsiveSpacing, getResponsiveFontSize, getResponsiveImageSize } from '@/lib/mobileUtils'

const UNCW_TEAL = '#007070'
const UNCW_GOLD = '#FFD700'

export default function CampaignDetailPage() {
  const params = useParams()
  const campaignId = params?.id as string
  const isMobile = useIsMobile()
  const campaigns = mockCampaigns()
  const campaign = campaigns.find(c => c.id === campaignId)
  
  const containerPadding = getResponsivePadding(isMobile)
  const headerGap = getResponsiveSpacing(isMobile, 2, 3)
  const logoSize = getResponsiveImageSize(isMobile, 100)

  if (!campaign) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: containerPadding }}>
        <Box sx={{ maxWidth: '1400px', mx: 'auto', textAlign: 'center', py: 8 }}>
          <Typography variant="h4" sx={{ mb: 2, color: 'text.primary' }}>
            Campaign Not Found
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
            The campaign with ID "{campaignId}" could not be found.
          </Typography>
          <Link href="/investigations" passHref legacyBehavior>
            <Button variant="contained" component="a" sx={{ bgcolor: UNCW_TEAL }}>
              ← Back to Investigations
            </Button>
          </Link>
        </Box>
      </Box>
    )
  }

  const pathData = mockPathAnalysis(campaign.id)

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
                {campaign.name}
              </Typography>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: 'text.secondary', 
                  fontWeight: 500,
                  fontSize: getResponsiveFontSize(isMobile, 'subtitle1')
                }}
              >
                Campaign ID: {campaign.id}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', width: isMobile ? '100%' : 'auto' }}>
            <Link href="/investigations" passHref legacyBehavior>
              <Button 
                variant="outlined" 
                component="a" 
                size={isMobile ? 'medium' : 'large'}
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
                ← Back to Investigations
              </Button>
            </Link>
            <UserProfile />
          </Box>
        </Box>

        {/* Navigation Bar */}
        <NavigationBar />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 2.5 : 3 }}>
          {/* Campaign Overview Card */}
          <Card sx={{ bgcolor: 'background.paper', border: '2px solid', borderColor: 'divider', boxShadow: 2 }}>
            <Box sx={{ p: isMobile ? 2 : 3, borderBottom: '2px solid', borderColor: 'primary.main', bgcolor: 'background.default' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 700, 
                    color: 'text.primary',
                    fontSize: isMobile ? '1.25rem' : '1.5rem'
                  }}
                >
                  Campaign Overview
                </Typography>
                <Chip 
                  label={campaign.status.toUpperCase()}
                  sx={{ bgcolor: getStatusColor(campaign.status), color: 'white', fontWeight: 700 }}
                />
              </Box>
            </Box>
            <CardContent sx={{ p: isMobile ? 2 : 4 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, fontWeight: 600 }}>
                    Threat Type
                  </Typography>
                  <Chip 
                    label={campaign.threatType}
                    sx={{ 
                      bgcolor: UNCW_TEAL, 
                      color: 'white', 
                      fontWeight: 600,
                      fontSize: isMobile ? '0.8rem' : '0.9rem'
                    }}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, fontWeight: 600 }}>
                    Campaign Period
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 500 }}>
                    {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, fontWeight: 600 }}>
                    Attack Channels
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {campaign.channels.map(ch => (
                      <Chip 
                        key={ch}
                        label={ch} 
                        size="small" 
                        variant="outlined" 
                        sx={{ 
                          fontSize: '0.7rem',
                          borderColor: 'divider',
                        }} 
                      />
                    ))}
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, fontWeight: 600 }}>
                    Users Targeted
                  </Typography>
                  <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 700 }}>
                    {campaign.targets}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Source Analysis */}
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
                📍 Source Analysis
              </Typography>
            </Box>
            <CardContent sx={{ p: isMobile ? 2 : 4 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                <Tooltip 
                  title={`Click to search APEX Trace for all messages from IP ${campaign.source.ip}`}
                  arrow
                  placement="top"
                >
                  <Link href={`/apex-trace?ip=${campaign.source.ip}`} style={{ textDecoration: 'none' }}>
                    <Paper sx={{ 
                      p: 2.5, 
                      bgcolor: 'background.default', 
                      borderRadius: 3,
                      border: '2px solid',
                      borderColor: 'divider',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: UNCW_TEAL,
                        bgcolor: 'rgba(0, 112, 112, 0.05)',
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(0, 112, 112, 0.2)',
                      }
                    }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase' }}>
                        IP ADDRESS
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'text.primary', fontSize: '1.1rem', mt: 1 }}>
                        {campaign.source.ip}
                      </Typography>
                    </Paper>
                  </Link>
                </Tooltip>

                <Tooltip 
                  title={`Geolocation: ${campaign.source.geo}`}
                  arrow
                  placement="top"
                >
                  <Link href={`/apex-trace?domain=${encodeURIComponent(campaign.source.geo)}`} style={{ textDecoration: 'none' }}>
                    <Paper sx={{ 
                      p: 2.5, 
                      bgcolor: 'background.default', 
                      borderRadius: 3,
                      border: '2px solid',
                      borderColor: 'divider',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: UNCW_TEAL,
                        bgcolor: 'rgba(0, 112, 112, 0.05)',
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(0, 112, 112, 0.2)',
                      }
                    }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase' }}>
                        GEOLOCATION
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1.1rem', mt: 1 }}>
                        {campaign.source.geo}
                      </Typography>
                    </Paper>
                  </Link>
                </Tooltip>

                <Tooltip 
                  title={`Domain: ${campaign.source.domain}`}
                  arrow
                  placement="top"
                >
                  <Link href={`/apex-trace?domain=${encodeURIComponent(campaign.source.domain)}`} style={{ textDecoration: 'none' }}>
                    <Paper sx={{ 
                      p: 2.5, 
                      bgcolor: 'background.default', 
                      borderRadius: 3,
                      border: '2px solid',
                      borderColor: 'divider',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#ef4444',
                        bgcolor: 'rgba(239, 68, 68, 0.05)',
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(239, 68, 68, 0.2)',
                      }
                    }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase' }}>
                        DOMAIN
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#ef4444', wordBreak: 'break-word', mt: 1 }}>
                        {campaign.source.domain}
                      </Typography>
                    </Paper>
                  </Link>
                </Tooltip>
              </Box>
            </CardContent>
          </Card>

          {/* Threat Path Visualization */}
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
                🛤️ Threat Path
              </Typography>
            </Box>
            <CardContent sx={{ p: isMobile ? 2 : 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflowX: 'auto', pb: 2 }}>
                {pathData.path.map((step, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Tooltip 
                      title={`${step.step}: ${step.action} at ${step.timestamp}`}
                      arrow
                      placement="top"
                    >
                      <Link href={`/triage?step=${encodeURIComponent(step.step)}`} style={{ textDecoration: 'none' }}>
                        <Paper sx={{ 
                          p: 2.5, 
                          bgcolor: step.status === 'quarantined' ? '#ef4444' : step.status === 'suspicious' ? UNCW_GOLD : UNCW_TEAL,
                          color: 'white',
                          borderRadius: 3,
                          minWidth: 160,
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05) translateY(-4px)',
                            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)',
                          }
                        }}>
                          <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, opacity: 0.9, fontSize: '0.7rem', mb: 0.5 }}>
                            {step.timestamp}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.95rem', mb: 0.5 }}>
                            {step.step}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block', fontSize: '0.7rem', opacity: 0.9 }}>
                            {step.action}
                          </Typography>
                        </Paper>
                      </Link>
                    </Tooltip>
                    {idx < pathData.path.length - 1 && (
                      <Box sx={{ fontSize: '2rem', color: '#64748b' }}>
                        →
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Exposure Metrics */}
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
                💥 Exposure Analysis
              </Typography>
            </Box>
            <CardContent sx={{ p: isMobile ? 2 : 4 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                <Link href={`/investigations/${campaign.id}/users-targeted`} style={{ textDecoration: 'none' }}>
                  <Paper sx={{ 
                    p: 3, 
                    bgcolor: 'background.default', 
                    borderRadius: 3,
                    textAlign: 'center',
                    border: '2px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: UNCW_TEAL,
                      bgcolor: 'rgba(0, 112, 112, 0.05)',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0, 112, 112, 0.2)',
                    }
                  }}>
                    <Box sx={{ fontSize: '2rem', mb: 1 }}>👥</Box>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
                      {pathData.exposure.usersTargeted}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      Users Targeted
                    </Typography>
                  </Paper>
                </Link>

                <Link href={`/investigations/${campaign.id}/users-opened`} style={{ textDecoration: 'none' }}>
                  <Paper sx={{ 
                    p: 3, 
                    bgcolor: 'background.default', 
                    borderRadius: 3,
                    textAlign: 'center',
                    border: '2px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: UNCW_GOLD,
                      bgcolor: 'rgba(255, 215, 0, 0.05)',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(255, 215, 0, 0.2)',
                    }
                  }}>
                    <Box sx={{ fontSize: '2rem', mb: 1 }}>📧</Box>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: UNCW_GOLD, mb: 1 }}>
                      {pathData.exposure.usersOpened}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      Users Opened
                    </Typography>
                  </Paper>
                </Link>

                <Link href={`/investigations/${campaign.id}/credentials-compromised`} style={{ textDecoration: 'none' }}>
                  <Paper sx={{ 
                    p: 3, 
                    bgcolor: 'background.default', 
                    borderRadius: 3,
                    textAlign: 'center',
                    border: '2px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#ef4444',
                      bgcolor: 'rgba(239, 68, 68, 0.05)',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)',
                    }
                  }}>
                    <Box sx={{ fontSize: '2rem', mb: 1 }}>🔐</Box>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: '#ef4444', mb: 1 }}>
                      {pathData.exposure.credentialsCompromised}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      Credentials Compromised
                    </Typography>
                  </Paper>
                </Link>
              </Box>
            </CardContent>
          </Card>

          {/* Interaction Metrics */}
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
                📊 Interaction Metrics
              </Typography>
            </Box>
            <CardContent sx={{ p: isMobile ? 2 : 4 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }, gap: 2 }}>
                <Paper sx={{ p: 2.5, bgcolor: 'background.default', borderRadius: 3, textAlign: 'center', border: '2px solid', borderColor: 'divider' }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
                    {campaign.interactions.delivered}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase' }}>
                    Delivered
                  </Typography>
                </Paper>
                <Paper sx={{ p: 2.5, bgcolor: 'background.default', borderRadius: 3, textAlign: 'center', border: '2px solid', borderColor: 'divider' }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: UNCW_GOLD, mb: 0.5 }}>
                    {campaign.interactions.opened}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase' }}>
                    Opened
                  </Typography>
                </Paper>
                <Paper sx={{ p: 2.5, bgcolor: 'background.default', borderRadius: 3, textAlign: 'center', border: '2px solid', borderColor: 'divider' }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#f97316', mb: 0.5 }}>
                    {campaign.interactions.clicked}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase' }}>
                    Clicked
                  </Typography>
                </Paper>
                <Paper sx={{ p: 2.5, bgcolor: 'background.default', borderRadius: 3, textAlign: 'center', border: '2px solid', borderColor: 'divider' }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#10b981', mb: 0.5 }}>
                    {campaign.interactions.reported}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase' }}>
                    Reported
                  </Typography>
                </Paper>
                <Paper sx={{ p: 2.5, bgcolor: 'background.default', borderRadius: 3, textAlign: 'center', border: '2px solid', borderColor: campaign.interactions.compromised > 0 ? '#ef4444' : 'divider' }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: campaign.interactions.compromised > 0 ? '#ef4444' : 'text.primary', mb: 0.5 }}>
                    {campaign.interactions.compromised}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase' }}>
                    Compromised
                  </Typography>
                </Paper>
              </Box>
            </CardContent>
          </Card>

          {/* Cross-Channel Timeline */}
          <CrossChannelTimelineChart campaignId={campaign.id} />
        </Box>
      </Box>
    </Box>
  )
}

