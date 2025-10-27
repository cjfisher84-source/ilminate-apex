'use client'

import { Box, Typography, Paper, Button, List, ListItem, ListItemIcon } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Link from 'next/link'
import Image from 'next/image'
import { useIsMobile, getResponsivePadding } from '@/lib/mobileUtils'

export default function ThreatsBlockedPage() {
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
              Threats Blocked Today
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Total dangerous emails stopped from reaching your inbox
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
            What Does "Threats Blocked" Mean?
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.8 }}>
            This number shows how many dangerous emails we successfully prevented from reaching your inbox today. 
            These are emails that could have contained malware, phishing attempts, or other security risks.
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
              What Gets Counted:
            </Typography>
            <List>
              <ListItem sx={{ pl: 0 }}>
                <ListItemIcon><CheckCircleIcon sx={{ color: 'success.main' }} /></ListItemIcon>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  <strong>Malware:</strong> Viruses, ransomware, or other malicious software
                </Typography>
              </ListItem>
              <ListItem sx={{ pl: 0 }}>
                <ListItemIcon><CheckCircleIcon sx={{ color: 'success.main' }} /></ListItemIcon>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  <strong>Phishing:</strong> Attempts to trick you into revealing passwords or sensitive information
                </Typography>
              </ListItem>
              <ListItem sx={{ pl: 0 }}>
                <ListItemIcon><CheckCircleIcon sx={{ color: 'success.main' }} /></ListItemIcon>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  <strong>Spoofed Emails:</strong> Messages pretending to be from trusted sources
                </Typography>
              </ListItem>
              <ListItem sx={{ pl: 0 }}>
                <ListItemIcon><CheckCircleIcon sx={{ color: 'success.main' }} /></ListItemIcon>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  <strong>Suspicious Links:</strong> Dangerous websites or downloads
                </Typography>
              </ListItem>
            </List>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
              Why This Number Matters:
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.8 }}>
              Every blocked threat is a potential attack avoided. This number gives you a clear view of how much 
              your organization is being targeted and how effectively our security system is protecting you.
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
              What Happens to Blocked Threats?
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
              Blocked emails are automatically quarantined for review. You can always check the quarantine folder 
              if you need to see what was blocked. Our system learns from each threat to improve future protection.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}

