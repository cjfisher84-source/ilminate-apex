'use client'

import { useState, useEffect } from 'react'
import { Box, Typography, Card, CardContent, Button, TextField, Avatar, Chip, Divider } from '@mui/material'
import Link from 'next/link'
import Image from 'next/image'
import { useIsMobile, getResponsivePadding, getResponsiveSpacing, getResponsiveFontSize, getResponsiveImageSize } from '@/lib/mobileUtils'

const UNCW_TEAL = '#007070'

interface UserInfo {
  email: string
  customerId: string
  role: string
}

export default function AccountPage() {
  const isMobile = useIsMobile()
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  
  const containerPadding = getResponsivePadding(isMobile)
  const headerGap = getResponsiveSpacing(isMobile, 2, 3)
  const logoSize = getResponsiveImageSize(isMobile, 100)

  useEffect(() => {
    // Get user info from display cookie
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = decodeURIComponent(value)
      return acc
    }, {} as Record<string, string>)

    const displayCookie = cookies['apex_user_display']
    if (displayCookie) {
      try {
        const info = JSON.parse(displayCookie)
        setUserInfo({
          email: info.email || 'Unknown',
          customerId: info.customerId || 'Unknown',
          role: info.role || 'user'
        })
      } catch (err) {
        console.error('Failed to parse user info:', err)
      }
    }
  }, [])

  const getInitials = (email: string): string => {
    if (!email) return '?'
    const parts = email.split('@')[0].split('.')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return email[0].toUpperCase()
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: containerPadding }}>
      <Box sx={{ maxWidth: '1000px', mx: 'auto' }}>
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
                Account <span style={{ color: UNCW_TEAL }}>Details</span>
              </Typography>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: 'text.secondary', 
                  fontWeight: 500,
                  fontSize: getResponsiveFontSize(isMobile, 'subtitle1')
                }}
              >
                Manage your profile and security settings
              </Typography>
            </Box>
          </Box>
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
        </Box>

        {/* Profile Card */}
        {userInfo && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card sx={{ bgcolor: 'background.paper', border: '2px solid', borderColor: 'divider', boxShadow: 2 }}>
              <Box sx={{ p: 3, borderBottom: '2px solid', borderColor: 'primary.main', bgcolor: 'background.default' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Profile Information
                </Typography>
              </Box>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 4, alignItems: isMobile ? 'center' : 'flex-start' }}>
                  {/* Avatar */}
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      bgcolor: 'primary.main',
                      fontSize: '3rem',
                      fontWeight: 700,
                      boxShadow: '0 4px 20px rgba(0, 168, 168, 0.3)'
                    }}
                  >
                    {getInitials(userInfo.email)}
                  </Avatar>

                  {/* Profile Details */}
                  <Box sx={{ flex: 1, width: isMobile ? '100%' : 'auto' }}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1 }}>
                        EMAIL ADDRESS
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', fontFamily: 'monospace' }}>
                        {userInfo.email}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1 }}>
                        ROLE
                      </Typography>
                      <Chip
                        label={userInfo.role.toUpperCase()}
                        sx={{
                          bgcolor: userInfo.role === 'admin' ? UNCW_TEAL : '#94a3b8',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          px: 2,
                          py: 2.5
                        }}
                      />
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1 }}>
                        ORGANIZATION / TENANT
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: UNCW_TEAL }}>
                        {userInfo.customerId}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Security & Session Info */}
            <Card sx={{ bgcolor: 'background.paper', border: '2px solid', borderColor: 'divider', boxShadow: 2 }}>
              <Box sx={{ p: 3, borderBottom: '2px solid', borderColor: 'primary.main', bgcolor: 'background.default' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Security & Session
                </Typography>
              </Box>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1 }}>
                      AUTHENTICATION METHOD
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      🔐 OAuth 2.0 (Google SSO)
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1 }}>
                      SESSION STATUS
                    </Typography>
                    <Chip 
                      label="Active"
                      sx={{ bgcolor: '#10b981', color: 'white', fontWeight: 700 }}
                    />
                  </Box>

                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1 }}>
                      ACCESS LEVEL
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {userInfo.role === 'admin' ? '👑 Full Access' : '📊 Standard Access'}
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1 }}>
                      SECURITY
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: UNCW_TEAL }}>
                      ✅ MFA Enabled
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ textAlign: 'center' }}>
                  <Link href="/api/auth/logout" passHref legacyBehavior>
                    <Button
                      variant="outlined"
                      component="a"
                      sx={{
                        borderColor: '#ef4444',
                        color: '#ef4444',
                        fontWeight: 600,
                        px: 4,
                        py: 1.5,
                        '&:hover': {
                          borderColor: '#dc2626',
                          bgcolor: 'rgba(239, 68, 68, 0.1)'
                        }
                      }}
                    >
                      🚪 Sign Out
                    </Button>
                  </Link>
                </Box>
              </CardContent>
            </Card>

            {/* Data & Privacy */}
            <Card sx={{ bgcolor: 'background.paper', border: '2px solid', borderColor: 'divider', boxShadow: 2 }}>
              <Box sx={{ p: 3, borderBottom: '2px solid', borderColor: 'primary.main', bgcolor: 'background.default' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Data & Privacy
                </Typography>
              </Box>
              <CardContent sx={{ p: 4 }}>
                <Box component="ul" sx={{ pl: 3, m: 0, color: 'text.secondary', lineHeight: 2.5 }}>
                  <li>
                    <Typography variant="body2">
                      <strong style={{ color: UNCW_TEAL }}>Data Isolation:</strong> Your data is isolated per tenant ({userInfo.customerId})
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong style={{ color: UNCW_TEAL }}>Encryption:</strong> All data encrypted at rest (AES-256) and in transit (TLS 1.3)
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong style={{ color: UNCW_TEAL }}>Compliance:</strong> SOC 2 Type II compliant infrastructure
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong style={{ color: UNCW_TEAL }}>Data Retention:</strong> Threat data retained for 90 days, logs for 365 days
                    </Typography>
                  </li>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {!userInfo && (
          <Card sx={{ bgcolor: 'background.paper', border: '2px solid', borderColor: 'error.main', boxShadow: 2 }}>
            <Box sx={{ p: 3, borderBottom: '2px solid', borderColor: 'error.main', bgcolor: 'rgba(239, 68, 68, 0.05)' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'error.main' }}>
                ⚠️ Unable to Load Account Information
              </Typography>
            </Box>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="body1" sx={{ color: 'text.primary', mb: 3, lineHeight: 1.8 }}>
                Your account information couldn't be loaded. This typically happens when:
              </Typography>
              
              <Box component="ul" sx={{ pl: 3, mb: 3, color: 'text.secondary' }}>
                <li>
                  <Typography variant="body2" sx={{ mb: 1.5 }}>
                    <strong>Your session has expired</strong> - You may need to log in again
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" sx={{ mb: 1.5 }}>
                    <strong>Browser cookies are blocked</strong> - Check your browser settings
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" sx={{ mb: 1.5 }}>
                    <strong>Private/Incognito mode</strong> - Cookies may not persist properly
                  </Typography>
                </li>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
                💡 Quick Fixes
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Link href="/api/auth/logout" passHref legacyBehavior style={{ textDecoration: 'none' }}>
                  <Button 
                    variant="contained" 
                    component="a"
                    fullWidth
                    sx={{
                      bgcolor: UNCW_TEAL,
                      color: 'white',
                      fontWeight: 600,
                      py: 1.5,
                      '&:hover': { bgcolor: '#005555' }
                    }}
                  >
                    🔄 Return to Login & Sign In Again
                  </Button>
                </Link>

                <Link href="/" passHref legacyBehavior style={{ textDecoration: 'none' }}>
                  <Button 
                    variant="outlined" 
                    component="a"
                    fullWidth
                    sx={{
                      borderColor: 'text.secondary',
                      color: 'text.secondary',
                      fontWeight: 600,
                      py: 1.5
                    }}
                  >
                    ← Return to Dashboard
                  </Button>
                </Link>
              </Box>

              <Box sx={{ 
                mt: 4, 
                p: 2, 
                bgcolor: 'rgba(0, 112, 112, 0.05)', 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'primary.main'
              }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1 }}>
                  💬 Need Help?
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  If this problem persists, contact support at <strong style={{ color: UNCW_TEAL }}>support@ilminate.com</strong>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  )
}

