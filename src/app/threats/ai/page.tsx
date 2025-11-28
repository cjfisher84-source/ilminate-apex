'use client'
import { Box, Typography, Card, CardContent, Button, Chip, Paper } from '@mui/material'
import Link from 'next/link'
import Image from 'next/image'
import UserProfile from '@/components/UserProfile'
import NavigationBar from '@/components/NavigationBar'
import { AIThreatsBar } from '@/components/Charts.client'
import { mockAIThreats } from '@/lib/mock'
import { useIsMobile, getResponsivePadding, getResponsiveSpacing, getResponsiveFontSize, getResponsiveImageSize } from '@/lib/mobileUtils'
import { useState, useEffect } from 'react'
// Get customer ID from cookie
function useCustomerId(): string | null {
  const [customerId, setCustomerId] = useState<string | null>(null)
  
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
      } catch (e) {
        // Invalid cookie
      }
    }
  }, [])
  
  return customerId
}

const UNCW_TEAL = '#007070'
const UNCW_GOLD = '#FFD700'

export default function AIThreatsPage() {
  const isMobile = useIsMobile()
  const containerPadding = getResponsivePadding(isMobile)
  const headerGap = getResponsiveSpacing(isMobile, 2, 3)
  const logoSize = getResponsiveImageSize(isMobile, 100)
  const customerId = useCustomerId()
  const threats = mockAIThreats(customerId)

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
                AI <span style={{ color: UNCW_TEAL }}>Threats</span>
              </Typography>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: 'text.secondary', 
                  fontWeight: 500,
                  fontSize: getResponsiveFontSize(isMobile, 'subtitle1')
                }}
              >
                AI-generated and AI-targeted security threats
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
          {/* AI Threats Chart */}
          <AIThreatsBar />

          {/* Threat Details */}
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
              Threat Details
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
              {threats.map((threat, idx) => (
                <Card key={idx} sx={{ bgcolor: 'background.paper', border: '2px solid', borderColor: 'divider' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {threat.type}
                      </Typography>
                      <Chip 
                        label={threat.severity}
                        size="small"
                        sx={{ 
                          bgcolor: threat.severity === 'Critical' ? '#ef4444' : threat.severity === 'High' ? '#f97316' : UNCW_GOLD,
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.6 }}>
                      {threat.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip label={`${threat.count} incidents`} size="small" sx={{ bgcolor: UNCW_TEAL, color: 'white', fontWeight: 600 }} />
                      <Chip 
                        label={`Trend: ${threat.trend}`} 
                        size="small" 
                        sx={{ 
                          bgcolor: threat.trend === 'Increasing' ? '#ef4444' : '#10b981',
                          color: 'white',
                          fontWeight: 600
                        }} 
                      />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

