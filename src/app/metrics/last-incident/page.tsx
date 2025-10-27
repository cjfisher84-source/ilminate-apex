'use client'

import { Box, Typography, Paper, Button, List, ListItem, ListItemIcon, Alert } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Link from 'next/link'
import Image from 'next/image'
import { useIsMobile, getResponsivePadding } from '@/lib/mobileUtils'

export default function LastIncidentPage() {
  const isMobile = useIsMobile()
  const containerPadding = getResponsivePadding(isMobile)

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', p: containerPadding }}>
      <Box sx={{ maxWidth: '900px', mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 3 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Image src="/ilminate-logo.png" alt="Ilminate Logo" width={60} height={60} />
          </Link>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
              Last Incident
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Time since the most recent security incident
            </Typography>
          </Box>
          <Link href="/" passHref legacyBehavior>
            <Button variant="outlined" component="a" startIcon={<ArrowBackIcon />} sx={{ borderColor: 'primary.main', color: 'primary.main' }}>
              Back to Dashboard
            </Button>
          </Link>
        </Box>

        <Paper sx={{ bgcolor: 'background.paper', border: '2px solid', borderColor: 'divider', p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
            What is Last Incident?
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.8 }}>
            This shows how long ago your last security incident occurred. A longer time since your last incident 
            generally means you're in a good security state with strong protection working effectively.
          </Typography>

          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Your organization went 2 hours without a security incident. This shows active protection is working!
            </Typography>
          </Alert>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
              What Counts as an Incident:
            </Typography>
            <List>
              <ListItem sx={{ pl: 0 }}>
                <ListItemIcon><CheckCircleIcon sx={{ color: 'info.main' }} /></ListItemIcon>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  <strong>Suspicious Email Detected:</strong> A dangerous email that was caught and blocked
                </Typography>
              </ListItem>
              <ListItem sx={{ pl: 0 }}>
                <ListItemIcon><CheckCircleIcon sx={{ color: 'warning.main' }} /></ListItemIcon>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  <strong>Phishing Attempt:</strong> Someone trying to steal credentials or information
                </Typography>
              </ListItem>
              <ListItem sx={{ pl: 0 }}>
                <ListItemIcon><CheckCircleIcon sx={{ color: 'error.main' }} /></ListItemIcon>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  <strong>Malware Detected:</strong> Virus, ransomware, or malicious code in an email
                </Typography>
              </ListItem>
            </List>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
              Understanding the Timeline:
            </Typography>
            <List>
              <ListItem sx={{ pl: 0 }}>
                <ListItemIcon><CheckCircleIcon sx={{ color: 'success.main' }} /></ListItemIcon>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  <strong>Recent (hours/days):</strong> Shows active protection, incidents are being caught quickly
                </Typography>
              </ListItem>
              <ListItem sx={{ pl: 0 }}>
                <ListItemIcon><CheckCircleIcon sx={{ color: 'success.main' }} /></ListItemIcon>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  <strong>Longer time (weeks/months):</strong> Excellent security posture with few incidents
                </Typography>
              </ListItem>
            </List>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
              Remember:
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
              An "incident" doesn't mean you've been compromised - it means our security system detected a threat 
              and stopped it before it could cause harm. The goal is to have all incidents caught and blocked safely.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}

