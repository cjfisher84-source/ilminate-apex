'use client'
import { Box, Typography, Card, CardContent, Button, Chip, Grid } from '@mui/material'
import Link from 'next/link'
import Image from 'next/image'
import UserProfile from '@/components/UserProfile'
import NavigationBar from '@/components/NavigationBar'
import { ThreatFamilyTypesChart } from '@/components/Charts.client'
import { useIsMobile, getResponsivePadding, getResponsiveSpacing, getResponsiveFontSize, getResponsiveImageSize } from '@/lib/mobileUtils'

const UNCW_TEAL = '#007070'
const UNCW_GOLD = '#FFD700'

export default function ThreatsPage() {
  const isMobile = useIsMobile()
  const containerPadding = getResponsivePadding(isMobile)
  const headerGap = getResponsiveSpacing(isMobile, 2, 3)
  const logoSize = getResponsiveImageSize(isMobile, 100)

  const threatTypes = [
    { label: 'Phish', slug: 'phish', color: '#ef4444', description: 'Deceptive messages trying to steal credentials or sensitive info.' },
    { label: 'Malware', slug: 'malware', color: '#f97316', description: 'Malicious software via links/attachments that can infect endpoints.' },
    { label: 'Spam', slug: 'spam', color: '#eab308', description: 'Bulk unsolicited messages — often noisy cover for real threats.' },
    { label: 'BEC', slug: 'bec', color: '#8b5cf6', description: 'Business Email Compromise — social engineering for payment fraud.' },
    { label: 'ATO', slug: 'ato', color: '#ec4899', description: 'Account Takeover — attacker uses stolen credentials to act as the user.' },
  ]

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
                Threat <span style={{ color: UNCW_TEAL }}>Analysis</span>
              </Typography>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: 'text.secondary', 
                  fontWeight: 500,
                  fontSize: getResponsiveFontSize(isMobile, 'subtitle1')
                }}
              >
                Comprehensive threat intelligence and family analysis
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', width: isMobile ? '100%' : 'auto' }}>
            <Link href="/" passHref legacyBehavior>
              <Button 
                variant="outlined" 
                component="a" 
                size={isMobile ? 'medium' : 'large'}
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
          {/* Threat Types Grid */}
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                color: 'text.primary', 
                mb: 2,
                fontSize: getResponsiveFontSize(isMobile, 'h4')
              }}
            >
              Threat Categories
            </Typography>
            <Grid container spacing={2}>
              {threatTypes.map((threat) => (
                <Grid item xs={12} sm={6} md={4} key={threat.slug}>
                  <Link href={`/threats/${threat.slug}`} style={{ textDecoration: 'none' }}>
                    <Card sx={{ 
                      bgcolor: 'background.paper', 
                      border: '2px solid',
                      borderColor: 'divider',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      height: '100%',
                      '&:hover': {
                        borderColor: threat.color,
                        transform: 'translateY(-4px)',
                        boxShadow: `0 8px 24px ${threat.color}40`
                      }
                    }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: threat.color }}>
                            {threat.label}
                          </Typography>
                          <Chip 
                            label="View →" 
                            size="small" 
                            sx={{ 
                              bgcolor: threat.color, 
                              color: 'white',
                              fontWeight: 600
                            }} 
                          />
                        </Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                          {threat.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Link>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Threat Family Types Chart */}
          <ThreatFamilyTypesChart />
        </Box>
      </Box>
    </Box>
  )
}

