'use client'
import { Box, Typography, Button, Paper, useTheme } from '@mui/material'
import Link from 'next/link'
import Image from 'next/image'
import { useIsMobile, getResponsivePadding, getResponsiveFontSize, getResponsiveImageSize } from '@/lib/mobileUtils'
import { EDRMetricsLines } from '@/components/Charts.client'

const UNCW_TEAL = '#007070'
const UNCW_GOLD = '#f59e0b'

export default function EDRMetricsPage() {
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
                EDR <span style={{ color: UNCW_TEAL }}>Metrics</span>
              </Typography>
              <Typography variant="subtitle1" sx={{
                margin: 0,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                fontWeight: 500,
                fontSize: isMobile ? '0.9rem' : '1rem',
                lineHeight: 1.75,
                color: '#94a3b8',
              }}>
                30-Day Threat Detection & Response Overview
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

        {/* What is EDR Metrics? */}
        <Paper sx={{ p: isMobile ? 2 : 4, mb: 4, bgcolor: 'background.paper', border: `2px solid ${UNCW_TEAL}` }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: UNCW_TEAL }}>
            What Are EDR Metrics?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, color: 'text.secondary' }}>
            EDR (Endpoint Detection and Response) metrics track security incidents detected on your devices 
            and endpoints over time. These metrics show you:
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 3 }}>
            <li><strong style={{ color: 'text.primary' }}>Detections:</strong> How many threats were identified on your endpoints</li>
            <li><strong style={{ color: 'text.primary' }}>Blocked:</strong> How many threats were automatically stopped before causing harm</li>
            <li><strong style={{ color: 'text.primary' }}>Endpoints Online:</strong> How many devices are being monitored in real-time</li>
          </Box>
        </Paper>

        {/* Why EDR Matters */}
        <Paper sx={{ p: isMobile ? 2 : 4, mb: 4, bgcolor: 'background.paper', border: `2px solid ${UNCW_GOLD}` }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: UNCW_GOLD }}>
            Why EDR Is Critical for Your Security
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, color: 'text.secondary' }}>
            Modern threats don't just come from email—they target your computers, servers, and mobile devices directly. 
            Without EDR protection, you're vulnerable to:
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 2
          }}>
            <Box sx={{ p: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', borderRadius: 2, border: '1px solid #ef4444' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#ef4444' }}>💻 Ransomware</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Malicious software that encrypts your files and demands payment to unlock them. EDR can detect and stop ransomware 
                before it spreads across your network.
              </Typography>
            </Box>
            <Box sx={{ p: 2, bgcolor: 'rgba(245, 158, 11, 0.1)', borderRadius: 2, border: '1px solid #f59e0b' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#f59e0b' }}>🐴 Trojans</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Malware disguised as legitimate software. Trojans can steal credentials, install backdoors, and give attackers 
                remote access to your systems. EDR monitors for suspicious behavior and blocks trojan activity.
              </Typography>
            </Box>
            <Box sx={{ p: 2, bgcolor: 'rgba(0, 168, 168, 0.1)', borderRadius: 2, border: '1px solid #00a8a8' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#00a8a8' }}>🔍 Exploit Attempts</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Attackers try to exploit software vulnerabilities to gain unauthorized access. EDR detects and blocks these attempts, 
                protecting your systems even when software patches haven't been applied yet.
              </Typography>
            </Box>
            <Box sx={{ p: 2, bgcolor: 'rgba(139, 92, 246, 0.1)', borderRadius: 2, border: '1px solid #8b5cf6' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#8b5cf6' }}>🤔 Suspicious Behavior</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Unusual system activity that might indicate a breach, such as unauthorized data access or unusual network connections. 
                EDR monitors behavior patterns and alerts on anomalies.
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Live Metrics Chart */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
            Your EDR Metrics (Last 30 Days)
          </Typography>
          <EDRMetricsLines />
        </Box>

        {/* Key Takeaways */}
        <Paper sx={{ p: isMobile ? 2 : 4, bgcolor: 'background.paper', border: `2px solid ${theme.palette.divider}` }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
            What This Means for You
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8, color: 'text.secondary' }}>
            Your endpoints are protected 24/7 with real-time monitoring. When threats are detected, they're automatically 
            blocked before they can cause damage. Keep an eye on these metrics to ensure your protection remains strong:
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <li>If <strong style={{ color: 'text.primary' }}>detections increase</strong>, you may be targeted by a new attack campaign</li>
            <li>If <strong style={{ color: 'text.primary' }}>blocked rate is high</strong>, your EDR is doing its job effectively</li>
            <li>If <strong style={{ color: 'text.primary' }}>endpoints go offline</strong>, those devices are unprotected and need attention</li>
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}

