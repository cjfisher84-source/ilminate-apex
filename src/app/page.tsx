'use client'
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, useTheme } from '@mui/material'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect } from 'react'
import CategoryCard from '@/components/CategoryCard'
import SecurityAssistant from '@/components/SecurityAssistant'
import ImageScanResults from '@/components/ImageScanResults'
import { TimelineArea, QuarantineDeliveredBars, CyberScoreDonut, AIThreatsBar, EDRMetricsLines, EDREndpointStatus, EDRThreatDetections, AIExploitDetectionChart, GeoThreatMap, CrossChannelTimelineChart, ThreatFamilyTypesChart, PeerComparisonChart } from '@/components/Charts.client'
import { mockCategoryCounts, GLOSSARY, mockDomainAbuse } from '@/lib/mock'
import { useIsMobile, getResponsivePadding, getResponsiveSpacing, getResponsiveFontSize, getResponsiveImageSize } from '@/lib/mobileUtils'

export default function Home() {
  const theme = useTheme()
  const isMobile = useIsMobile()
  const cats = mockCategoryCounts()
  const abuse = mockDomainAbuse()
  
  const containerPadding = getResponsivePadding(isMobile)
  const headerGap = getResponsiveSpacing(isMobile, 2, 3)
  const sectionGap = getResponsiveSpacing(isMobile, 3, 4)
  const logoSize = getResponsiveImageSize(isMobile, 100)

  // Scroll to top when dashboard loads (only if coming from another page)
  useEffect(() => {
    // Only scroll to top if we're not already at the top
    // This prevents jarring scroll behavior when already at top
    if (window.scrollY > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [])

  return (
    <>
      <style jsx global>{`
        .security-posture-card,
        .quick-actions-card {
          padding: ${isMobile ? '16px' : '24px'} !important;
          border-radius: 16px !important;
        }
      `}</style>
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default', 
      color: 'text.primary', 
      p: containerPadding,
      width: '100%',
      overflowX: 'hidden'
    }}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto', width: '100%' }}>
        {/* Header with Logo */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'center', 
          mb: isMobile ? 3 : 4,
          pb: isMobile ? 2 : 3,
          borderBottom: 2,
          borderColor: 'primary.main',
          gap: isMobile ? 2 : 0
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: headerGap }}>
            {/* Ilminate Logo */}
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
                Ilminate <span style={{ color: theme.palette.primary.main }}>APEX</span>
              </Typography>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: 'text.secondary', 
                  fontWeight: 500,
                  fontSize: getResponsiveFontSize(isMobile, 'subtitle1')
                }}
              >
                {isMobile ? 'Advanced Protection' : 'Advanced Protection & Exposure Intelligence'}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            gap: isMobile ? 1.5 : 2,
            width: isMobile ? '100%' : 'auto',
            flexDirection: isMobile ? 'column' : 'row',
            flexWrap: isMobile ? 'nowrap' : 'wrap'
          }}>
            <Link href="/investigations" passHref legacyBehavior>
              <Button 
                variant="outlined" 
                component="a" 
                size={isMobile ? 'medium' : 'large'}
                color="primary"
                fullWidth={isMobile}
                className={isMobile ? 'mobile-touch-target' : ''}
                sx={{ 
                  px: isMobile ? 2 : 4,
                  py: isMobile ? 1.2 : 1.5,
                  fontSize: isMobile ? '0.95rem' : '1.1rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}
              >
                Investigations
              </Button>
            </Link>
            <Link href="/triage" passHref legacyBehavior>
              <Button 
                variant="outlined" 
                component="a" 
                size={isMobile ? 'medium' : 'large'}
                color="primary"
                fullWidth={isMobile}
                className={isMobile ? 'mobile-touch-target' : ''}
                sx={{ 
                  px: isMobile ? 2 : 4,
                  py: isMobile ? 1.2 : 1.5,
                  fontSize: isMobile ? '0.95rem' : '1.1rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}
              >
                Triage
              </Button>
            </Link>
            <Link href="/quarantine" passHref legacyBehavior>
              <Button 
                variant="outlined" 
                component="a" 
                size={isMobile ? 'medium' : 'large'}
                color="primary"
                fullWidth={isMobile}
                className={isMobile ? 'mobile-touch-target' : ''}
                sx={{ 
                  px: isMobile ? 2 : 4,
                  py: isMobile ? 1.2 : 1.5,
                  fontSize: isMobile ? '0.95rem' : '1.1rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}
              >
                Quarantine
              </Button>
            </Link>
            <Link href="/apex-trace" passHref legacyBehavior>
              <Button 
                variant="outlined" 
                component="a" 
                size={isMobile ? 'medium' : 'large'}
                color="primary"
                fullWidth={isMobile}
                className={isMobile ? 'mobile-touch-target' : ''}
                sx={{ 
                  px: isMobile ? 2 : 4,
                  py: isMobile ? 1.2 : 1.5,
                  fontSize: isMobile ? '0.95rem' : '1.1rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}
              >
                APEX Trace
              </Button>
            </Link>
            <Link href="/reports/attack" passHref legacyBehavior>
              <Button 
                variant="outlined" 
                component="a" 
                size={isMobile ? 'medium' : 'large'}
                fullWidth={isMobile}
                className={isMobile ? 'mobile-touch-target' : ''}
                sx={{ 
                  px: isMobile ? 2 : 4,
                  py: isMobile ? 1.2 : 1.5,
                  fontSize: isMobile ? '0.95rem' : '1.1rem',
                  fontWeight: 600,
                  borderColor: '#00a8a8',
                  color: '#00a8a8',
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    borderColor: '#007070',
                    bgcolor: 'rgba(0, 168, 168, 0.08)'
                  }
                }}
              >
                {isMobile ? 'ATT&CK' : 'ATT&CK Matrix'}
              </Button>
            </Link>
            <Link href="/harborsim" passHref legacyBehavior>
              <Button 
                variant="outlined" 
                component="a" 
                size={isMobile ? 'medium' : 'large'}
                color="primary"
                fullWidth={isMobile}
                className={isMobile ? 'mobile-touch-target' : ''}
                sx={{ 
                  px: isMobile ? 2 : 4,
                  py: isMobile ? 1.2 : 1.5,
                  fontSize: isMobile ? '0.95rem' : '1.1rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}
              >
                HarborSim
              </Button>
            </Link>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: sectionGap }}>
          {/* Threat Categories Section */}
          <Box>
            <Box sx={{ mb: isMobile ? 2 : 3 }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  color: 'text.primary', 
                  mb: 1,
                  fontSize: getResponsiveFontSize(isMobile, 'h4')
                }}
              >
                Threat Categories
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'text.secondary',
                  fontSize: getResponsiveFontSize(isMobile, 'body1')
                }}
              >
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

          {/* Advanced Image Detection Section */}
          <ImageScanResults />

          {/* New Feature Highlight - ATT&CK Matrix */}
          <Link href="/reports/attack" style={{ textDecoration: 'none' }}>
            <Paper sx={{ 
              p: isMobile ? 2.5 : 4, 
              bgcolor: 'rgba(0, 168, 168, 0.08)',
              border: '2px solid',
              borderColor: '#00a8a8',
              borderRadius: 4,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(0, 168, 168, 0.25)',
                bgcolor: 'rgba(0, 168, 168, 0.12)',
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ 
                  fontSize: isMobile ? '2rem' : '3rem',
                  lineHeight: 1
                }}>
                  🎯
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="overline" sx={{ 
                      color: '#00a8a8', 
                      fontWeight: 800,
                      fontSize: isMobile ? '0.7rem' : '0.8rem',
                      letterSpacing: 1.5
                    }}>
                      ✨ NEW FEATURE
                    </Typography>
                  </Box>
                  <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ 
                    fontWeight: 800, 
                    color: 'text.primary',
                    mb: 0.5
                  }}>
                    MITRE ATT&CK® Matrix
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: 'text.secondary',
                    fontSize: isMobile ? '0.95rem' : '1.1rem',
                    lineHeight: 1.6
                  }}>
                    Real-time threat technique detection and mapping. Visualize adversary tactics across the ATT&CK framework with interactive heatmaps.
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 2 }}>
                {['12+ Detection Rules', 'Real-time Mapping', 'Interactive Matrix', 'Top Techniques'].map(feature => (
                  <Box key={feature} sx={{ 
                    px: 2, 
                    py: 0.75,
                    bgcolor: 'rgba(0, 168, 168, 0.15)',
                    borderRadius: 2,
                    border: '1px solid rgba(0, 168, 168, 0.3)'
                  }}>
                    <Typography variant="caption" sx={{ 
                      color: '#00a8a8', 
                      fontWeight: 700,
                      fontSize: isMobile ? '0.7rem' : '0.75rem'
                    }}>
                      ✓ {feature}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Link>

          {/* Cyber Score Section */}
          <Box>
            <Box sx={{ mb: isMobile ? 2 : 3 }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  color: 'text.primary', 
                  mb: 1,
                  fontSize: getResponsiveFontSize(isMobile, 'h4')
                }}
              >
                Security Performance
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'text.secondary',
                  fontSize: getResponsiveFontSize(isMobile, 'body1')
                }}
              >
                Overall cyber security score and key performance metrics
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
              gap: 3 
            }}>
              <CyberScoreDonut />
              <Box 
                className="security-posture-card"
                sx={{ 
                  backgroundColor: 'background.paper', 
                  border: 2,
                  borderColor: 'divider',
                  height: 320,
                  boxShadow: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 1.5 }}>
                  Security Posture
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.5, fontSize: '0.85rem' }}>
                  Your organization's security posture is being continuously monitored and improved through advanced threat detection and response capabilities.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Threats Blocked Today</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main', fontSize: '1.1rem' }}>1,247</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Active Monitoring</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '1.1rem' }}>24/7</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Last Incident</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'secondary.main', fontSize: '1.1rem' }}>2h ago</Typography>
                  </Box>
                </Box>
              </Box>
              <SecurityAssistant />
            </Box>
          </Box>

          {/* Timeline */}
          <TimelineArea />

          {/* Threat Family Types and Peer Comparison */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3 
          }}>
            <ThreatFamilyTypesChart />
            <PeerComparisonChart />
          </Box>

          {/* Domain / Brand Abuse (DMARC value) */}
          <Box className={isMobile ? 'mobile-table-wrapper' : ''}>
            <TableContainer component={Paper} sx={{ 
              bgcolor: 'background.paper', 
              border: 2,
              borderColor: 'divider',
              borderRadius: 3,
              boxShadow: 2
            }}>
              <Box sx={{ p: isMobile ? 1.5 : 2, borderBottom: 2, borderColor: 'primary.main', bgcolor: 'background.default' }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    color: 'text.primary', 
                    fontWeight: 600,
                    fontSize: isMobile ? '0.95rem' : '1rem'
                  }}
                >
                  Domain / Brand Abuse — {isMobile ? 'DMARC' : 'showing the value of DMARC'}
                </Typography>
              </Box>
              <Table sx={{ minWidth: isMobile ? 600 : 'auto' }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'background.default' }}>
                    <TableCell sx={{ 
                      color: 'text.secondary', 
                      fontSize: isMobile ? '0.7rem' : '0.75rem', 
                      textTransform: 'uppercase', 
                      fontWeight: 700,
                      padding: isMobile ? '8px' : '16px'
                    }}>
                      Impersonating Domain
                    </TableCell>
                    <TableCell sx={{ 
                      color: 'text.secondary', 
                      fontSize: isMobile ? '0.7rem' : '0.75rem', 
                      textTransform: 'uppercase', 
                      fontWeight: 700,
                      padding: isMobile ? '8px' : '16px'
                    }}>
                      First Seen
                    </TableCell>
                    <TableCell sx={{ 
                      color: 'text.secondary', 
                      fontSize: isMobile ? '0.7rem' : '0.75rem', 
                      textTransform: 'uppercase', 
                      fontWeight: 700,
                      padding: isMobile ? '8px' : '16px'
                    }}>
                      Messages
                    </TableCell>
                    <TableCell sx={{ 
                      color: 'text.secondary', 
                      fontSize: isMobile ? '0.7rem' : '0.75rem', 
                      textTransform: 'uppercase', 
                      fontWeight: 700,
                      padding: isMobile ? '8px' : '16px'
                    }}>
                      DMARC
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {abuse.map((r, idx) => (
                    <TableRow key={idx} sx={{ '&:hover': { bgcolor: 'background.default' }, '&:last-child td': { borderBottom: 0 } }}>
                      <TableCell sx={{ 
                        color: 'text.primary', 
                        fontWeight: 500,
                        padding: isMobile ? '8px' : '16px',
                        fontSize: isMobile ? '0.85rem' : '0.875rem'
                      }}>
                        <Link 
                          href={`/dmarc/${encodeURIComponent(r.domain)}`}
                          style={{ 
                            color: theme.palette.primary.main, 
                            textDecoration: 'none',
                            fontWeight: 600
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                          onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                        >
                          {r.domain}
                        </Link>
                      </TableCell>
                      <TableCell sx={{ 
                        color: 'text.secondary',
                        padding: isMobile ? '8px' : '16px',
                        fontSize: isMobile ? '0.85rem' : '0.875rem'
                      }}>{r.firstSeen}</TableCell>
                      <TableCell sx={{ 
                        color: 'text.primary', 
                        fontWeight: 600,
                        padding: isMobile ? '8px' : '16px',
                        fontSize: isMobile ? '0.85rem' : '0.875rem'
                      }}>{r.messages.toLocaleString()}</TableCell>
                      <TableCell sx={{ 
                        color: r.dmarcAligned === 'Aligned' ? 'success.main' : 'error.main',
                        fontWeight: 700,
                        padding: isMobile ? '8px' : '16px',
                        fontSize: isMobile ? '0.85rem' : '0.875rem'
                      }}>
                        {r.dmarcAligned}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* AI Threats */}
          <AIThreatsBar />

          {/* AI Exploit Detection */}
          <AIExploitDetectionChart />

          {/* EDR Section Header */}
          <Box sx={{ mt: isMobile ? 2 : 4, mb: 2 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                color: 'text.primary', 
                mb: 1,
                fontSize: getResponsiveFontSize(isMobile, 'h4')
              }}
            >
              {isMobile ? 'EDR' : 'Endpoint Detection & Response (EDR)'}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'text.secondary',
                fontSize: getResponsiveFontSize(isMobile, 'body1')
              }}
            >
              Real-time endpoint security monitoring{isMobile ? '' : ', threat detection, and automated response across your infrastructure'}
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
    </>
  )
}

