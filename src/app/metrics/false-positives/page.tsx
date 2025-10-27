'use client'

import { Box, Typography, Paper, Button, List, ListItem, ListItemIcon } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Link from 'next/link'
import Image from 'next/image'
import { useIsMobile, getResponsivePadding } from '@/lib/mobileUtils'

export default function FalsePositivesPage() {
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
              False Positives
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Understanding when legitimate emails are flagged
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
            What are False Positives?
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.8 }}>
            A false positive happens when a completely legitimate email gets flagged as suspicious. Think of it like a fire alarm 
            going off from burnt toast - it's being cautious, but it's not really a problem.
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
              Why Do They Happen?
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.8 }}>
              Our security system is designed to be very cautious. It's better to flag a safe email (that you can review) 
              than to miss a dangerous one. Sometimes legitimate emails have characteristics that look similar to threats.
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
              What's a Good False Positive Rate?
            </Typography>
            <List>
              <ListItem sx={{ pl: 0 }}>
                <ListItemIcon><CheckCircleIcon sx={{ color: 'success.main' }} /></ListItemIcon>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  <strong>Under 1%</strong> - Excellent, very few legitimate emails flagged
                </Typography>
              </ListItem>
              <ListItem sx={{ pl: 0 }}>
                <ListItemIcon><CheckCircleIcon sx={{ color: 'success.main' }} /></ListItemIcon>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  <strong>1-3%</strong> - Good balance between security and convenience
                </Typography>
              </ListItem>
              <ListItem sx={{ pl: 0 }}>
                <ListItemIcon><CheckCircleIcon sx={{ color: 'warning.main' }} /></ListItemIcon>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  <strong>Over 3%</strong> - May need tuning to reduce interruptions
                </Typography>
              </ListItem>
            </List>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
              What You Can Do:
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
              If a legitimate email gets quarantined, you can always release it and add the sender to your safe list. 
              Over time, our AI learns from these corrections and gets better at distinguishing real threats from safe emails.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}

