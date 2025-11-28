'use client'
import { Box, Typography, Button, Paper, useTheme } from '@mui/material'
import Link from 'next/link'
import Image from 'next/image'
import { useIsMobile, getResponsivePadding, getResponsiveFontSize, getResponsiveImageSize } from '@/lib/mobileUtils'
import { EDRThreatDetections } from '@/components/Charts.client'

const UNCW_TEAL = '#007070'
const UNCW_GOLD = '#f59e0b'

export default function EDRThreatsPage() {
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
                EDR <span style={{ color: UNCW_GOLD }}>Threat Detections</span>
              </Typography>
              <Typography variant="subtitle1" sx={{
                margin: 0,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                fontWeight: 500,
                fontSize: isMobile ? '0.9rem' : '1rem',
                lineHeight: 1.75,
                color: '#94a3b8',
              }}>
                Threat Breakdown by Type
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

        {/* Threat Types Overview */}
        <Paper sx={{ p: isMobile ? 2 : 4, mb: 4, bgcolor: 'background.paper', border: `2px solid ${UNCW_GOLD}` }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: UNCW_GOLD }}>
            Types of Threats Your EDR Stops
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, color: 'text.secondary' }}>
            Your EDR system detects and blocks multiple types of malicious activity. Here's what each category means:
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 2
          }}>
            <Box sx={{ p: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', borderRadius: 2, border: '1px solid #ef4444' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#ef4444' }}>🔒 Ransomware</Typography>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                Encrypts your files and demands payment to unlock them. Can spread across your entire network if not stopped.
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                EDR blocks encryption attempts and isolates infected devices automatically.
              </Typography>
            </Box>
            <Box sx={{ p: 2, bgcolor: 'rgba(245, 158, 11, 0.1)', borderRadius: 2, border: '1px solid #f59e0b' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#f59e0b' }}>🐴 Trojans</Typography>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                Malware disguised as legitimate software. Can steal passwords, install backdoors, and give attackers remote access.
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                EDR detects trojan signatures and suspicious execution patterns to stop them before they activate.
              </Typography>
            </Box>
            <Box sx={{ p: 2, bgcolor: 'rgba(0, 168, 168, 0.1)', borderRadius: 2, border: '1px solid #00a8a8' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#00a8a8' }}>🤔 Suspicious Behavior</Typography>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                Unusual system activity that might indicate a breach—unauthorized data access, unusual network connections, or abnormal file operations.
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                EDR uses AI to identify anomalous behavior patterns and alerts on potential threats.
              </Typography>
            </Box>
            <Box sx={{ p: 2, bgcolor: 'rgba(0, 112, 112, 0.1)', borderRadius: 2, border: '1px solid #007070' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#007070' }}>💥 Exploit Attempts</Typography>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                Attackers try to exploit software vulnerabilities to gain unauthorized access to your systems and data.
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                EDR prevents exploits by monitoring system calls and blocking known attack techniques.
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Why Detection Rate Matters */}
        <Paper sx={{ p: isMobile ? 2 : 4, mb: 4, bgcolor: 'background.paper', border: `2px solid ${UNCW_TEAL}` }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: UNCW_TEAL }}>
            Understanding Detection vs Blocked
          </Typography>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ p: 2, bgcolor: 'rgba(0, 168, 168, 0.1)', borderRadius: 2, mb: 2, border: '1px solid #00a8a8' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#00a8a8' }}>
                🟦 Detected Threats
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                These are threats that EDR identified on your endpoints. Detection happens when the system recognizes 
                malicious files, suspicious behavior, or attack patterns.
              </Typography>
            </Box>
            <Box sx={{ p: 2, bgcolor: 'rgba(245, 158, 11, 0.1)', borderRadius: 2, border: '1px solid #f59e0b' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#f59e0b' }}>
                🟨 Blocked Threats
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                These are threats that were not only detected but also automatically stopped before they could cause damage. 
                High blocked rates mean your EDR is working effectively.
              </Typography>
            </Box>
          </Box>
          <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
            <strong style={{ color: 'text.primary' }}>Goal:</strong> Block as close to 100% of detected threats as possible. 
            A high detection rate with a low block rate indicates there may be vulnerabilities in your protection that need attention.
          </Typography>
        </Paper>

        {/* Live Threats Chart */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
            Your Recent Threat Detections
          </Typography>
          <EDRThreatDetections />
        </Box>

        {/* Key Takeaways */}
        <Paper sx={{ p: isMobile ? 2 : 4, bgcolor: 'background.paper', border: `2px solid ${theme.palette.divider}` }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
            What You Should Watch For
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8, color: 'text.secondary' }}>
            Regular monitoring of threat detections helps you understand your security landscape:
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <li>If <strong style={{ color: 'text.primary' }}>ransomware detections increase</strong>, you may be targeted by an active campaign</li>
            <li>If <strong style={{ color: 'text.primary' }}>trojan counts are high</strong>, attackers may be attempting to establish persistent access</li>
            <li>If <strong style={{ color: 'text.primary' }}>suspicious behavior spikes</strong>, there may be an active intrusion in progress</li>
            <li>If <strong style={{ color: 'text.primary' }}>block rate is 100%</strong>, your EDR is catching threats before they succeed</li>
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
            Remember: Detection and blocking are working in your favor. The goal isn't zero detections—it's blocking 
            every threat that gets detected.
          </Typography>
        </Paper>
      </Box>
    </Box>
  )
}

