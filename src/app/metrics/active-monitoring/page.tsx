'use client'

import { Box, Typography, Paper, Button, List, ListItem, ListItemIcon } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Link from 'next/link'
import Image from 'next/image'
import { useIsMobile, getResponsivePadding } from '@/lib/mobileUtils'

export default function ActiveMonitoringPage() {
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
              Active Monitoring
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Continuous around-the-clock security protection
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
            What is Active Monitoring?
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.8 }}>
            24/7 monitoring means your email security system never sleeps. Every email, every attachment, and every link 
            is checked around the clock - whether it's 2am on Sunday or the middle of a Tuesday. Think of it as a security guard 
            that never takes a break.
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
              What's Being Monitored:
            </Typography>
            <List>
              <ListItem sx={{ pl: 0 }}>
                <ListItemIcon><CheckCircleIcon sx={{ color: 'success.main' }} /></ListItemIcon>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  <strong>All Incoming Emails:</strong> Every message is scanned before it reaches you
                </Typography>
              </ListItem>
              <ListItem sx={{ pl: 0 }}>
                <ListItemIcon><CheckCircleIcon sx={{ color: 'success.main' }} /></ListItemIcon>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  <strong>Links and Attachments:</strong> Checked for malware and suspicious content
                </Typography>
              </ListItem>
              <ListItem sx={{ pl: 0 }}>
                <ListItemIcon><CheckCircleIcon sx={{ color: 'success.main' }} /></ListItemIcon>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  <strong>Sender Verification:</strong> Checking if emails are really from who they claim
                </Typography>
              </ListItem>
              <ListItem sx={{ pl: 0 }}>
                <ListItemIcon><CheckCircleIcon sx={{ color: 'success.main' }} /></ListItemIcon>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  <strong>Threat Intelligence:</strong> Learning from new attacks happening worldwide
                </Typography>
              </ListItem>
            </List>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
              Why 24/7 Monitoring Matters:
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.8 }}>
              Cyber attackers don't work business hours. They strike at all times, including nights, weekends, and holidays. 
              Our continuous monitoring means you're protected around the clock, catching threats before they can cause harm.
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
              What You Don't Need to Do:
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
              The monitoring happens automatically in the background. You don't need to do anything - the system works 
              silently to protect you while you focus on your work. We only alert you when your attention is needed.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}

