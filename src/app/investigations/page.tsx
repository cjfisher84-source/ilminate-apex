'use client'
import { Box, Typography, Card, CardContent, Button, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tooltip } from '@mui/material'
import Link from 'next/link'
import Image from 'next/image'
import UserProfile from '@/components/UserProfile'
import NavigationBar from '@/components/NavigationBar'
import { CrossChannelTimelineChart } from '@/components/Charts.client'
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
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', width: isMobile ? '100%' : 'auto' }}>
            <Link href="/" passHref legacyBehavior>
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
                ← Dashboard
              </Button>
            </Link>
            <UserProfile />
          </Box>
        </Box>

        {/* Navigation Bar */}
        <NavigationBar />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 2.5 : 3 }}>
          {/* Active Campaigns Overview - Interactive */}
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
                    <TableRow 
                      key={campaign.id} 
                      component={Link}
                      href={`/investigations/${campaign.id}`}
                      sx={{ 
                        textDecoration: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': { 
                          bgcolor: 'rgba(0, 112, 112, 0.08)',
                          transform: 'scale(1.01)',
                          '& td': {
                            borderColor: UNCW_TEAL
                          }
                        },
                        '& td': {
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          transition: 'border-color 0.2s ease'
                        }
                      }}
                    >
                      <TableCell sx={{ color: 'text.primary', fontWeight: 600, fontSize: isMobile ? '0.85rem' : '1rem', padding: isMobile ? '8px' : '16px' }}>
                        <Tooltip title={`Click to view detailed investigation for ${campaign.name}. ${campaign.targets} users targeted, ${campaign.interactions.compromised} compromised.`} arrow>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ fontSize: '1.2rem' }}>🔍</Box>
                            <Box>
                              {campaign.name}
                              <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontSize: '0.7rem', mt: 0.25 }}>
                                View details →
                              </Typography>
                            </Box>
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ padding: isMobile ? '8px' : '16px' }}>
                        <Tooltip title={`Threat Type: ${campaign.threatType}. Click to filter all campaigns by this threat type.`} arrow>
                          <Link href={`/investigations?type=${encodeURIComponent(campaign.threatType)}`} onClick={(e) => e.stopPropagation()} style={{ textDecoration: 'none' }}>
                            <Chip 
                              label={campaign.threatType}
                              size="small"
                              sx={{ 
                                bgcolor: UNCW_TEAL, 
                                color: 'white', 
                                fontWeight: 600, 
                                fontSize: isMobile ? '0.7rem' : '0.8rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  bgcolor: '#005555',
                                  transform: 'scale(1.05)'
                                }
                              }}
                            />
                          </Link>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ padding: isMobile ? '8px' : '16px' }}>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {campaign.channels.map(ch => (
                            <Tooltip key={ch} title={`Attack channel: ${ch}. Click to view all campaigns using this channel.`} arrow>
                              <Link href={`/investigations?channel=${encodeURIComponent(ch)}`} onClick={(e) => e.stopPropagation()} style={{ textDecoration: 'none' }}>
                                <Chip 
                                  label={ch} 
                                  size="small" 
                                  variant="outlined" 
                                  sx={{ 
                                    fontSize: '0.7rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    borderColor: 'divider',
                                    '&:hover': {
                                      borderColor: UNCW_TEAL,
                                      bgcolor: 'rgba(0, 112, 112, 0.05)',
                                      transform: 'scale(1.05)'
                                    }
                                  }} 
                                />
                              </Link>
                            </Tooltip>
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: 'text.primary', fontWeight: 600, fontSize: isMobile ? '0.85rem' : '1rem', padding: isMobile ? '8px' : '16px' }}>
                        <Tooltip title={`${campaign.targets} users were targeted by this campaign. Click to view the complete list of targeted users.`} arrow>
                          <Link href={`/investigations/${campaign.id}/users-targeted`} onClick={(e) => e.stopPropagation()} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <Box sx={{ 
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.5,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                color: UNCW_TEAL,
                                transform: 'scale(1.05)'
                              }
                            }}>
                              <Box sx={{ fontSize: '0.9rem' }}>👥</Box>
                              {campaign.targets}
                            </Box>
                          </Link>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ padding: isMobile ? '8px' : '16px' }}>
                        <Tooltip 
                          title={campaign.interactions.compromised > 0 
                            ? `CRITICAL: ${campaign.interactions.compromised} credential(s) compromised. Click for immediate remediation actions.`
                            : `No credentials compromised. Excellent protection rate.`} 
                          arrow
                        >
                          <Link href={`/investigations/${campaign.id}/credentials-compromised`} onClick={(e) => e.stopPropagation()} style={{ textDecoration: 'none' }}>
                            <Chip 
                              label={campaign.interactions.compromised}
                              size="small"
                              sx={{ 
                                bgcolor: campaign.interactions.compromised > 0 ? '#ef4444' : '#10b981',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: isMobile ? '0.7rem' : '0.8rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  transform: 'scale(1.1)',
                                  boxShadow: campaign.interactions.compromised > 0 
                                    ? '0 4px 12px rgba(239, 68, 68, 0.4)'
                                    : '0 4px 12px rgba(16, 185, 129, 0.4)'
                                }
                              }}
                            />
                          </Link>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ padding: isMobile ? '8px' : '16px' }}>
                        <Tooltip 
                          title={`Status: ${campaign.status.toUpperCase()}. ${campaign.status === 'active' ? 'Ongoing threat requiring immediate attention.' : campaign.status === 'contained' ? 'Threat has been contained but monitoring continues.' : 'Threat has been resolved and no longer active.'}`} 
                          arrow
                        >
                          <Chip 
                            label={campaign.status}
                            size="small"
                            sx={{ 
                              bgcolor: getStatusColor(campaign.status), 
                              color: 'white', 
                              fontWeight: 600, 
                              fontSize: isMobile ? '0.7rem' : '0.8rem',
                              cursor: 'default'
                            }}
                          />
                        </Tooltip>
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
              {/* Source Analysis - Interactive */}
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
                  <Tooltip 
                    title={`Click to search APEX Trace for all messages from IP ${activeCampaign.source.ip}. This IP has been flagged in ${activeCampaign.targets} incidents.`}
                    arrow
                    placement="top"
                  >
                    <Link href={`/apex-trace?ip=${activeCampaign.source.ip}`} style={{ textDecoration: 'none' }}>
                      <Paper sx={{ 
                        p: 2.5, 
                        bgcolor: 'background.default', 
                        borderRadius: 3,
                        border: '2px solid',
                        borderColor: 'divider',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          borderColor: UNCW_TEAL,
                          bgcolor: 'rgba(0, 112, 112, 0.05)',
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 24px rgba(0, 112, 112, 0.2)',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            bgcolor: UNCW_TEAL
                          }
                        }
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            IP ADDRESS
                          </Typography>
                          <Box sx={{ fontSize: '0.8rem', opacity: 0.7 }}>🔍</Box>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'text.primary', fontSize: '1.1rem' }}>
                          {activeCampaign.source.ip}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', mt: 0.5, display: 'block' }}>
                          Click to investigate →
                        </Typography>
                      </Paper>
                    </Link>
                  </Tooltip>

                  <Tooltip 
                    title={`Geolocation: ${activeCampaign.source.geo}. This region has been associated with ${activeCampaign.threatType.toLowerCase()} attacks. Click to view threat intelligence.`}
                    arrow
                    placement="top"
                  >
                    <Link href={`/apex-trace?domain=${encodeURIComponent(activeCampaign.source.geo)}`} style={{ textDecoration: 'none' }}>
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
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            bgcolor: UNCW_TEAL
                          }
                        }
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            GEOLOCATION
                          </Typography>
                          <Box sx={{ fontSize: '0.8rem', opacity: 0.7 }}>🌍</Box>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1.1rem' }}>
                          {activeCampaign.source.geo}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', mt: 0.5, display: 'block' }}>
                          View threat intel →
                        </Typography>
                      </Paper>
                    </Link>
                  </Tooltip>

                  <Tooltip 
                    title={`Domain: ${activeCampaign.source.domain}. This domain is impersonating Microsoft and has been flagged as malicious. Click to search all messages from this domain.`}
                    arrow
                    placement="top"
                  >
                    <Link href={`/apex-trace?domain=${encodeURIComponent(activeCampaign.source.domain)}`} style={{ textDecoration: 'none' }}>
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
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            bgcolor: '#ef4444'
                          }
                        }
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            DOMAIN
                          </Typography>
                          <Box sx={{ fontSize: '0.8rem', opacity: 0.7 }}>⚠️</Box>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#ef4444', wordBreak: 'break-word' }}>
                          {activeCampaign.source.domain}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', mt: 0.5, display: 'block' }}>
                          Search messages →
                        </Typography>
                      </Paper>
                    </Link>
                  </Tooltip>
                </Box>
              </Box>

              {/* Path Visualization - Interactive */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: UNCW_TEAL, mb: 2 }}>
                  🛤️ Threat Path
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflowX: 'auto', pb: 2, scrollbarWidth: 'thin' }}>
                  {pathData.path.map((step, idx) => {
                    const stepDescriptions: Record<string, string> = {
                      'Email Gateway': `Message received at ${step.timestamp}. Initial scanning performed by email gateway security filters.`,
                      'Content Filter': `Content analysis completed. Message content scanned for malicious patterns and suspicious keywords.`,
                      'AI Analysis': `AI-powered threat detection analyzed the message. Risk score calculated based on multiple indicators.`,
                      'Policy Check': `Security policies evaluated. Message matched quarantine rules based on threat indicators.`,
                      'User Mailbox': `Message delivered to quarantine folder. User notified of potential threat. Safe from user interaction.`
                    }
                    
                    return (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Tooltip 
                          title={stepDescriptions[step.step] || `Security checkpoint: ${step.step}. ${step.action} at ${step.timestamp}.`}
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
                              border: '2px solid transparent',
                              position: 'relative',
                              overflow: 'hidden',
                              '&:hover': {
                                transform: 'scale(1.05) translateY(-4px)',
                                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)',
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                '&::after': {
                                  content: '""',
                                  position: 'absolute',
                                  top: 0,
                                  left: '-100%',
                                  width: '100%',
                                  height: '100%',
                                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                                  animation: 'shimmer 1.5s ease-in-out',
                                  '@keyframes shimmer': {
                                    '0%': { left: '-100%' },
                                    '100%': { left: '100%' }
                                  }
                                }
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
                              <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
                                <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.8 }}>
                                  Click for details →
                                </Typography>
                              </Box>
                            </Paper>
                          </Link>
                        </Tooltip>
                        {idx < pathData.path.length - 1 && (
                          <Box sx={{ 
                            fontSize: '2rem', 
                            color: '#64748b',
                            animation: idx === pathData.path.length - 2 ? 'pulse 2s ease-in-out infinite' : 'none',
                            '@keyframes pulse': {
                              '0%, 100%': { opacity: 0.5 },
                              '50%': { opacity: 1 }
                            }
                          }}>
                            →
                          </Box>
                        )}
                      </Box>
                    )
                  })}
                </Box>
              </Box>

              {/* Exposure Metrics - Interactive */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: UNCW_TEAL, mb: 2 }}>
                  💥 Exposure Analysis
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                  <Tooltip 
                    title={`${pathData.exposure.usersTargeted} users received this malicious message. Click to view the complete list of targeted users and their risk assessment.`}
                    arrow
                    placement="top"
                  >
                    <Link href={`/investigations/${activeCampaign.id}/users-targeted`} style={{ textDecoration: 'none' }}>
                      <Paper sx={{ 
                        p: 3, 
                        bgcolor: 'background.default', 
                        borderRadius: 3,
                        textAlign: 'center',
                        border: '2px solid',
                        borderColor: 'divider',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        '&:hover': {
                          borderColor: UNCW_TEAL,
                          bgcolor: 'rgba(0, 112, 112, 0.05)',
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 24px rgba(0, 112, 112, 0.2)',
                          '& .exposure-value': {
                            transform: 'scale(1.1)',
                            color: UNCW_TEAL
                          }
                        }
                      }}>
                        <Box sx={{ fontSize: '2rem', mb: 1 }}>👥</Box>
                        <Typography className="exposure-value" variant="h3" sx={{ fontWeight: 800, color: 'text.primary', mb: 1, transition: 'all 0.3s ease' }}>
                          {pathData.exposure.usersTargeted}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Users Targeted
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', mt: 1, display: 'block' }}>
                          View list →
                        </Typography>
                      </Paper>
                    </Link>
                  </Tooltip>

                  <Tooltip 
                    title={`${pathData.exposure.usersOpened} users opened this message. Immediate security awareness training recommended. Click to view user details and send security notifications.`}
                    arrow
                    placement="top"
                  >
                    <Link href={`/investigations/${activeCampaign.id}/users-opened`} style={{ textDecoration: 'none' }}>
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
                          '& .exposure-value': {
                            transform: 'scale(1.1)',
                            color: UNCW_GOLD
                          }
                        }
                      }}>
                        <Box sx={{ fontSize: '2rem', mb: 1 }}>📧</Box>
                        <Typography className="exposure-value" variant="h3" sx={{ fontWeight: 800, color: UNCW_GOLD, mb: 1, transition: 'all 0.3s ease' }}>
                          {pathData.exposure.usersOpened}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Users Opened
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', mt: 1, display: 'block' }}>
                          Take action →
                        </Typography>
                      </Paper>
                    </Link>
                  </Tooltip>

                  <Tooltip 
                    title={`${pathData.exposure.credentialsCompromised} credential(s) potentially compromised. CRITICAL: Immediate password reset required. Click to view compromised accounts and initiate remediation.`}
                    arrow
                    placement="top"
                  >
                    <Link href={`/investigations/${activeCampaign.id}/credentials-compromised`} style={{ textDecoration: 'none' }}>
                      <Paper sx={{ 
                        p: 3, 
                        bgcolor: 'background.default', 
                        borderRadius: 3,
                        textAlign: 'center',
                        border: '2px solid',
                        borderColor: 'divider',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        '&:hover': {
                          borderColor: '#ef4444',
                          bgcolor: 'rgba(239, 68, 68, 0.05)',
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)',
                          '& .exposure-value': {
                            transform: 'scale(1.1)',
                            color: '#ef4444'
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            bgcolor: '#ef4444',
                            animation: 'pulse 1s ease-in-out infinite',
                            '@keyframes pulse': {
                              '0%, 100%': { opacity: 1 },
                              '50%': { opacity: 0.5 }
                            }
                          }
                        }
                      }}>
                        <Box sx={{ fontSize: '2rem', mb: 1 }}>🔐</Box>
                        <Typography className="exposure-value" variant="h3" sx={{ fontWeight: 800, color: '#ef4444', mb: 1, transition: 'all 0.3s ease' }}>
                          {pathData.exposure.credentialsCompromised}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Credentials Compromised
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#ef4444', fontSize: '0.7rem', mt: 1, display: 'block', fontWeight: 700 }}>
                          URGENT: Remediate →
                        </Typography>
                      </Paper>
                    </Link>
                  </Tooltip>
                </Box>
              </Box>
            </CardContent>
          </Card>

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

