'use client'
import { Box, Typography, Button, Paper, useTheme } from '@mui/material'
import Link from 'next/link'
import Image from 'next/image'
import { useIsMobile, getResponsivePadding, getResponsiveFontSize, getResponsiveImageSize } from '@/lib/mobileUtils'
import { EDREndpointStatus } from '@/components/Charts.client'

const UNCW_TEAL = '#007070'
const UNCW_GOLD = '#f59e0b'

export default function EDREndpointStatusPage() {
  const theme = useTheme()
  const isMobile = useIsMobile()

  const containerPadding = getResponsivePadding(isMobile)
  const logoSize = getResponsiveImageSize(isMobile, 100)

  return (
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Image
              src="/ilminate-logo.png"
              alt="Ilminate Logo"
              width={logoSize}
              height={logoSize}
              priority
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 112, 112, 0.3))' }}
            />
            <Box>
              <Typography variant="h3" sx={{
                margin: 0,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                fontWeight: 700,
                fontSize: isMobile ? '2rem' : '3rem',
                lineHeight: 1.167,
                color: '#f1f5f9',
                marginBottom: 1
              }}>
                EDR <span style={{ color: UNCW_TEAL }}>Endpoint Status</span>
              </Typography>
              <Typography variant="subtitle1" sx={{
                margin: 0,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                fontWeight: 500,
                fontSize: isMobile ? '0.9rem' : '1rem',
                lineHeight: 1.75,
                color: '#94a3b8',
              }}>
                Real-time Device Protection Status
              </Typography>
            </Box>
          </Box>
          <Link href="/" passHref legacyBehavior>
            <Button
              variant="outlined"
              component="a"
              size={isMobile ? 'medium' : 'large'}
              color="primary"
              sx={{
                borderColor: UNCW_TEAL,
                color: UNCW_TEAL,
                fontWeight: 600,
                fontSize: isMobile ? '0.95rem' : '1.1rem',
                px: isMobile ? 2 : 4,
                py: isMobile ? 1.2 : 1.5,
                whiteSpace: 'nowrap',
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

        {/* What is Endpoint Status? */}
        <Paper sx={{ p: isMobile ? 2 : 4, mb: 4, bgcolor: 'background.paper', border: `2px solid ${UNCW_TEAL}` }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: UNCW_TEAL }}>
            What Is Endpoint Status?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, color: 'text.secondary' }}>
            Endpoint status shows the protection state of all devices (computers, laptops, servers, mobile devices) on your network. 
            Each endpoint has one of these statuses:
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 2
          }}>
            <Box sx={{ p: 2, bgcolor: 'rgba(16, 185, 129, 0.1)', borderRadius: 2, border: '1px solid #10b981' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#10b981' }}>✅ Protected</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Device is online, has EDR running, and is being monitored in real-time. Full protection is active.
              </Typography>
            </Box>
            <Box sx={{ p: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', borderRadius: 2, border: '1px solid #ef4444' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#ef4444' }}>🚨 Vulnerable</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Device is at risk—EDR may be outdated, disabled, or has detected a security issue. Immediate action needed.
              </Typography>
            </Box>
            <Box sx={{ p: 2, bgcolor: 'rgba(255, 215, 0, 0.1)', borderRadius: 2, border: '1px solid #FFD700' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#FFD700' }}>🔄 Updating</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                EDR software is being updated to the latest version. Device is temporarily at reduced protection during update.
              </Typography>
            </Box>
            <Box sx={{ p: 2, bgcolor: 'rgba(156, 163, 175, 0.1)', borderRadius: 2, border: '1px solid #9ca3af' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#9ca3af' }}>⚫ Offline</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Device is powered off, disconnected, or unreachable. No monitoring is possible until device comes online.
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Why Endpoint Monitoring Matters */}
        <Paper sx={{ p: isMobile ? 2 : 4, mb: 4, bgcolor: 'background.paper', border: `2px solid ${UNCW_GOLD}` }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: UNCW_GOLD }}>
            Why Monitoring Every Endpoint Is Critical
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, color: 'text.secondary' }}>
            Every device on your network is a potential entry point for attackers. A single unprotected endpoint can compromise 
            your entire organization:
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 3 }}>
            <li><strong style={{ color: 'text.primary' }}>Lateral Movement:</strong> Once inside one device, attackers try to spread to others on your network</li>
            <li><strong style={{ color: 'text.primary' }}>Data Theft:</strong> Vulnerable endpoints give attackers access to sensitive files and databases</li>
            <li><strong style={{ color: 'text.primary' }}>Ransomware Spread:</strong> One infected device can encrypt files on all connected systems</li>
            <li><strong style={{ color: 'text.primary' }}>Compliance Violations:</strong> Unprotected devices fail security regulations and standards</li>
          </Box>
          <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
            <strong style={{ color: 'text.primary' }}>Best Practice:</strong> Keep all endpoints protected at all times. Address vulnerable and offline 
            devices immediately to maintain your security posture.
          </Typography>
        </Paper>

        {/* Live Status Chart */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
            Your Current Endpoint Status
          </Typography>
          <EDREndpointStatus />
        </Box>

        {/* Action Items */}
        <Paper sx={{ p: isMobile ? 2 : 4, bgcolor: 'background.paper', border: `2px solid ${theme.palette.divider}` }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
            What You Should Do
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8, color: 'text.secondary' }}>
            Monitor your endpoint status regularly and take action:
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <li>Prioritize fixing <strong style={{ color: '#ef4444' }}>vulnerable</strong> endpoints immediately—they're actively at risk</li>
            <li>Bring <strong style={{ color: '#9ca3af' }}>offline</strong> devices back online to restore protection</li>
            <li>Let <strong style={{ color: '#FFD700' }}>updating</strong> devices finish their updates before using them</li>
            <li>Aim for 100% devices in the <strong style={{ color: '#10b981' }}>protected</strong> state for maximum security</li>
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}

