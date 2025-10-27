'use client'

import { Box, Typography, Paper, Button, List, ListItem, ListItemIcon } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Link from 'next/link'
import Image from 'next/image'
import { useIsMobile, getResponsivePadding } from '@/lib/mobileUtils'

export default function CoveragePage() {
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
              Coverage
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              How much of your organization we protect
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
            What is Coverage?
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.8 }}>
            Coverage measures what percentage of your email accounts are actively protected by our security system. 
            Think of it like home insurance - you want all your rooms covered, not just the front door.
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
              What We Monitor:
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.8 }}>
              <strong>Protected Accounts:</strong> Email addresses actively being scanned and protected<br/>
              <strong>Total Accounts:</strong> All email addresses in your organization<br/>
              <strong>Coverage =</strong> (Protected Accounts ÷ Total Accounts) × 100%
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
              Coverage Levels:
            </Typography>
            <List>
              <ListItem sx={{ pl: 0 }}>
                <ListItemIcon><CheckCircleIcon sx={{ color: 'success.main' }} /></ListItemIcon>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  <strong>95%+</strong> - Excellent coverage, virtually everyone is protected
                </Typography>
              </ListItem>
              <ListItem sx={{ pl: 0 }}>
                <ListItemIcon><CheckCircleIcon sx={{ color: 'success.main' }} /></ListItemIcon>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  <strong>85-94%</strong> - Good coverage, most users protected
                </Typography>
              </ListItem>
              <ListItem sx={{ pl: 0 }}>
                <ListItemIcon><CheckCircleIcon sx={{ color: 'warning.main' }} /></ListItemIcon>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  <strong>Below 85%</strong> - Some accounts may be unprotected
                </Typography>
              </ListItem>
            </List>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
              Why Complete Coverage Matters:
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
              Having high coverage means all your employees get the same level of protection. This prevents attackers 
              from finding and targeting unprotected accounts. Complete coverage ensures no one in your organization 
              is left vulnerable.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}

