'use client'
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, useTheme, Chip } from '@mui/material'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import CategoryCard from '@/components/CategoryCard'
import SecurityAssistant from '@/components/SecurityAssistant'
import ImageScanResults from '@/components/ImageScanResults'
import UserProfile from '@/components/UserProfile'
import NavigationBar from '@/components/NavigationBar'
import { TimelineArea, QuarantineDeliveredBars, CyberScoreDonut, AIThreatsBar, EDRMetricsLines, EDREndpointStatus, EDRThreatDetections, AIExploitDetectionChart, CrossChannelTimelineChart, ThreatFamilyTypesChart, PeerComparisonChart } from '@/components/Charts.client'
import { mockCategoryCounts, GLOSSARY, mockDomainAbuse } from '@/lib/mock'
import { useIsMobile, getResponsivePadding, getResponsiveSpacing, getResponsiveFontSize, getResponsiveImageSize } from '@/lib/mobileUtils'
import { getCustomerBranding, isFeatureEnabled } from '@/lib/tenantUtils'

export default function Home() {
  const theme = useTheme()
  const isMobile = useIsMobile()
  
  // Customer ID and branding state
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [branding, setBranding] = useState(getCustomerBranding(null))
  
  // State for real data
  const [cats, setCats] = useState(mockCategoryCounts(customerId))
  const [abuse, setAbuse] = useState(mockDomainAbuse(customerId))
  
  // Fetch real data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stats
        const statsResponse = await fetch('/api/reports/stats', {
          headers: customerId ? { 'x-customer-id': customerId } : {}
        })
        
        if (statsResponse.ok) {
          const statsResult = await statsResponse.json()
          if (statsResult.success && statsResult.data?.categoryCounts) {
            // Convert category counts array back to object format
            const categoryCountsObj: Record<string, number> = {}
            statsResult.data.categoryCounts.forEach((item: any) => {
              categoryCountsObj[item.category] = item.count
            })
            setCats(categoryCountsObj as any)
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        // Keep using mock data on error
      }
    }

    if (customerId) {
      fetchData()
    }
  }, [customerId])
  
  const containerPadding = getResponsivePadding(isMobile)
  const headerGap = getResponsiveSpacing(isMobile, 2, 3)
  const sectionGap = getResponsiveSpacing(isMobile, 3, 4)
  const logoSize = getResponsiveImageSize(isMobile, 100)
  const customerLogoSize = getResponsiveImageSize(isMobile, 60)
  
  // Extract customer ID from user cookie
  useEffect(() => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = decodeURIComponent(value)
      return acc
    }, {} as Record<string, string>)

    const userDisplay = cookies['apex_user_display']
    if (userDisplay) {
      try {
        const info = JSON.parse(userDisplay)
        setCustomerId(info.customerId)
        setBranding(getCustomerBranding(info.customerId))
      } catch (e) {
        console.error('Failed to parse user display cookie', e)
      }
    }
  }, [])

  // Don't force scroll behavior - let browser handle it naturally
  // useEffect(() => {
  //   if (window.scrollY > 0) {
  //     window.scrollTo({ top: 0, behavior: 'smooth' })
  //   }
  // }, [])

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
        {/* Co-Branded Header */}
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
          {/* LEFT: Platform Branding (Ilminate) */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: headerGap }}>
            <Image 
              src="/ilminate-logo.png" 
              alt="Ilminate Logo" 
              width={isMobile ? 80 : logoSize} 
              height={isMobile ? 80 : logoSize}
              priority
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 112, 112, 0.3))' }}
            />
            <Box>
              <Typography 
                variant={isMobile ? 'h5' : 'h4'}
                sx={{ 
                  fontWeight: 700, 
                  mb: 0.5, 
                  color: 'text.primary',
                  fontSize: getResponsiveFontSize(isMobile, 'h4')
                }}
              >
                Ilminate <span style={{ color: theme.palette.primary.main }}>APEX</span>
              </Typography>
              {!isMobile && (
                <Typography 
                  variant="body2"
                  sx={{ 
                    color: 'text.secondary', 
                    fontWeight: 500
                  }}
                >
                  Advanced Protection & Exposure Intelligence
                </Typography>
              )}
            </Box>
          </Box>

          {/* RIGHT: Customer Branding + User Menu */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: isMobile ? 2 : 3,
            flexDirection: isMobile ? 'row' : 'row'
          }}>
            {/* Customer Logo & Name (if customer is identified) */}
            {customerId && customerId !== 'default' && branding.customerId !== 'default' && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                pr: isMobile ? 0 : 3,
                borderRight: isMobile ? 'none' : '1px solid',
                borderColor: 'divider'
              }}>
                <Box sx={{
                  bgcolor: 'white',
                  borderRadius: 2,
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  border: '1px solid',
                  borderColor: 'rgba(0, 0, 0, 0.08)'
                }}>
                  <Image 
                    src={branding.logo.primary}
                    alt={branding.logo.alt}
                    width={isMobile ? 50 : 70}
                    height={isMobile ? 50 : 70}
                    priority
                  />
                </Box>
                <Box sx={{ textAlign: isMobile ? 'left' : 'right' }}>
                  <Typography 
                    variant="h6"
                    sx={{ 
                      fontWeight: 600, 
                      color: 'text.primary',
                      fontSize: isMobile ? '0.95rem' : '1.2rem'
                    }}
                  >
                    {branding.companyName}
                  </Typography>
                  {!isMobile && (
                    <Chip
                      label={customerId}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        bgcolor: branding.theme?.primaryColor || 'rgba(0, 112, 112, 0.1)',
                        color: branding.theme?.primaryColor ? 'white' : 'primary.main',
                        mt: 0.5
                      }}
                    />
                  )}
                </Box>
              </Box>
            )}
            
            <UserProfile />
          </Box>
        </Box>

        {/* Navigation Bar */}
        <NavigationBar />

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
          <Box
            sx={{
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                '& > div > div:first-of-type h4': {
                  color: 'primary.main'
                }
              }
            }}
            onClick={() => window.location.href = '/threats/image-scan'}
          >
            <ImageScanResults />
          </Box>

          {/* MITRE ATT&CK Matrix Highlight */}
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

          {/* Security Performance Section - Redesigned */}
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
                Real-time security metrics and AI-powered insights
              </Typography>
            </Box>

            {/* Main Performance Grid */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
              gap: 3,
              mb: 3
            }}>
              {/* Left: Score & Key Metrics */}
              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 3
              }}>
                {/* Cyber Security Score - Enhanced */}
                <Link href="/metrics/security-score" style={{ textDecoration: 'none', display: 'block' }}>
                  <Paper sx={{ 
                    p: 3,
                    bgcolor: 'background.paper',
                    border: '2px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(0, 112, 112, 0.2)'
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #007070 0%, #00a8a8 50%, #007070 100%)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 3s ease-in-out infinite',
                      '@keyframes shimmer': {
                        '0%': { backgroundPosition: '200% 0' },
                        '100%': { backgroundPosition: '-200% 0' }
                      }
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        Security Score
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label="Live" 
                          size="small" 
                          sx={{ 
                            bgcolor: '#22c55e',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            animation: 'pulse 2s ease-in-out infinite',
                            '@keyframes pulse': {
                              '0%, 100%': { opacity: 1 },
                              '50%': { opacity: 0.7 }
                            }
                          }} 
                        />
                        {!isMobile && (
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                            View details →
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <CyberScoreDonut />
                  </Paper>
                </Link>

                {/* Real-Time Metrics Grid */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Link href="/metrics/threats-blocked" style={{ textDecoration: 'none' }}>
                    <Paper sx={{ 
                      p: 2.5,
                      bgcolor: 'background.paper',
                      border: '2px solid',
                      borderColor: 'divider',
                      borderRadius: 3,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        borderColor: '#22c55e',
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(34, 197, 94, 0.2)',
                        '& .threat-icon': {
                          transform: 'scale(1.1) rotate(5deg)'
                        }
                      }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Box className="threat-icon" sx={{ 
                          fontSize: '2rem',
                          transition: 'transform 0.3s ease'
                        }}>
                          🛡️
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem', mb: 0.5 }}>
                            Threats Blocked Today
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 800, color: '#22c55e', lineHeight: 1 }}>
                            {cats.Phish + cats.Malware + cats.Spam + cats.BEC + cats.ATO}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        mt: 1.5,
                        pt: 1.5,
                        borderTop: '1px solid',
                        borderColor: 'divider'
                      }}>
                        <Box sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          bgcolor: '#22c55e',
                          animation: 'pulse 2s ease-in-out infinite'
                        }} />
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                          Active protection enabled
                        </Typography>
                      </Box>
                    </Paper>
                  </Link>

                  <Link href="/metrics/last-incident" style={{ textDecoration: 'none' }}>
                    <Paper sx={{ 
                      p: 2.5,
                      bgcolor: 'background.paper',
                      border: '2px solid',
                      borderColor: 'divider',
                      borderRadius: 3,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#f59e0b',
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(245, 158, 11, 0.2)'
                      }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ fontSize: '2rem' }}>⚡</Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem', mb: 0.5 }}>
                            Last Incident
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1 }}>
                            {(cats.Phish + cats.Malware + cats.Spam + cats.BEC + cats.ATO) > 0 ? '2h ago' : 'No incidents'}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Link>
                </Box>
              </Box>

              {/* Right: Security Assistant */}
              <SecurityAssistant />
            </Box>

            {/* Performance Metrics Row */}
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 2
            }}>
              <Link href="/metrics/protection-rate" style={{ textDecoration: 'none' }}>
                <Paper sx={{ 
                  p: 2.5,
                  bgcolor: 'background.paper',
                  border: '2px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  '&:hover': {
                    borderColor: '#007070',
                    bgcolor: 'rgba(0, 112, 112, 0.05)',
                    transform: 'translateY(-2px)',
                    '& .metric-value': {
                      color: '#007070'
                    }
                  }
                }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', mb: 1, display: 'block' }}>
                    Protection Rate
                  </Typography>
                  <Typography className="metric-value" variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5, transition: 'color 0.3s ease' }}>
                    94.2%
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ fontSize: '0.7rem' }}>📈</Box>
                    <Typography variant="caption" sx={{ color: '#22c55e', fontSize: '0.65rem' }}>
                      +2.1% vs last week
                    </Typography>
                  </Box>
                </Paper>
              </Link>

              <Link href="/metrics/response-time" style={{ textDecoration: 'none' }}>
                <Paper sx={{ 
                  p: 2.5,
                  bgcolor: 'background.paper',
                  border: '2px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#007070',
                    bgcolor: 'rgba(0, 112, 112, 0.05)',
                    transform: 'translateY(-2px)',
                    '& .metric-value': {
                      color: '#007070'
                    }
                  }
                }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', mb: 1, display: 'block' }}>
                    Response Time
                  </Typography>
                  <Typography className="metric-value" variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5, transition: 'color 0.3s ease' }}>
                    2.3m
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ fontSize: '0.7rem' }}>⚡</Box>
                    <Typography variant="caption" sx={{ color: '#22c55e', fontSize: '0.65rem' }}>
                      Industry leading
                    </Typography>
                  </Box>
                </Paper>
              </Link>

              <Link href="/metrics/false-positives" style={{ textDecoration: 'none' }}>
                <Paper sx={{ 
                  p: 2.5,
                  bgcolor: 'background.paper',
                  border: '2px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#007070',
                    bgcolor: 'rgba(0, 112, 112, 0.05)',
                    transform: 'translateY(-2px)',
                    '& .metric-value': {
                      color: '#007070'
                    }
                  }
                }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', mb: 1, display: 'block' }}>
                    False Positives
                  </Typography>
                  <Typography className="metric-value" variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5, transition: 'color 0.3s ease' }}>
                    0.8%
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ fontSize: '0.7rem' }}>✅</Box>
                    <Typography variant="caption" sx={{ color: '#22c55e', fontSize: '0.65rem' }}>
                      Excellent accuracy
                    </Typography>
                  </Box>
                </Paper>
              </Link>

              <Link href="/metrics/coverage" style={{ textDecoration: 'none' }}>
                <Paper sx={{ 
                  p: 2.5,
                  bgcolor: 'background.paper',
                  border: '2px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#007070',
                    bgcolor: 'rgba(0, 112, 112, 0.05)',
                    transform: 'translateY(-2px)',
                    '& .metric-value': {
                      color: '#007070'
                    }
                  }
                }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', mb: 1, display: 'block' }}>
                    Coverage
                  </Typography>
                  <Typography className="metric-value" variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5, transition: 'color 0.3s ease' }}>
                    99.1%
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ fontSize: '0.7rem' }}>🌐</Box>
                    <Typography variant="caption" sx={{ color: '#22c55e', fontSize: '0.65rem' }}>
                      Full coverage
                    </Typography>
                  </Box>
                </Paper>
              </Link>
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
          <Link href="/dmarc" style={{ textDecoration: 'none', display: 'block' }}>
            <Box className={isMobile ? 'mobile-table-wrapper' : ''}>
              <TableContainer component={Paper} sx={{ 
                bgcolor: 'background.paper', 
                border: 2,
                borderColor: 'divider',
                borderRadius: 3,
                boxShadow: 2,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(0, 112, 112, 0.2)'
                }
              }}>
                <Box sx={{ p: isMobile ? 1.5 : 2, borderBottom: 2, borderColor: 'primary.main', bgcolor: 'background.default', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                  {!isMobile && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                      View all domains →
                    </Typography>
                  )}
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
          </Link>

          {/* AI Threats */}
          <AIThreatsBar />

          {/* AI Exploit Detection */}
          <AIExploitDetectionChart />

          {/* EDR Section - Only show if enabled for customer */}
          {isFeatureEnabled(customerId, 'edr') && (
            <>
              {/* EDR Section Header */}
              <Link href="/edr/metrics" style={{ textDecoration: 'none', display: 'block' }}>
                <Box sx={{ 
                  mt: isMobile ? 2 : 4, 
                  mb: 2,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    '& h4': {
                      color: 'primary.main'
                    }
                  }
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 700, 
                          color: 'text.primary', 
                          mb: 1,
                          fontSize: getResponsiveFontSize(isMobile, 'h4'),
                          transition: 'color 0.3s ease'
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
                    {!isMobile && (
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', mt: 1 }}>
                        View details →
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Link>

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
            </>
          )}
        </Box>
      </Box>
    </Box>
    </>
  )
}

