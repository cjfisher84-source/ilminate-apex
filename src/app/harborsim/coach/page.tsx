'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Box, Typography, Paper, Button, Alert, List, ListItem, ListItemText, Divider } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import WarningIcon from '@mui/icons-material/Warning'

function HarborSimCoachContent() {
  const searchParams = useSearchParams()
  const sim = searchParams?.get('sim')
  const token = searchParams?.get('token')
  const [coached, setCoached] = useState(false)

  const handleCoached = () => {
    setCoached(true)
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#030712', color: '#f3f4f6', p: 4 }}>
      <Box sx={{ maxWidth: '900px', mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 3 }}>
          <Link href="/harborsim" style={{ textDecoration: 'none' }}>
            <Image src="/logo.png" alt="Logo" width={60} height={60} />
          </Link>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#f3f4f6', mb: 0.5 }}>
              Security Awareness Training
            </Typography>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              You clicked on a training email link
            </Typography>
          </Box>
        </Box>

        {/* Tracking Info */}
        {sim && (
          <Alert severity="info" sx={{ mb: 3, bgcolor: '#1f2937', color: '#7dd3fc', border: '1px solid #374151' }}>
            Campaign: {sim} | Token: {token?.substring(0, 20)}...
          </Alert>
        )}

        {/* Content */}
        {!coached ? (
          <Paper sx={{ bgcolor: '#111827', border: '1px solid #374151', p: 4 }}>
            <Box sx={{ mb: 3 }}>
              <WarningIcon sx={{ fontSize: 60, color: '#f59e0b', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#f3f4f6', mb: 2 }}>
                ⚠️ You clicked a suspicious link!
              </Typography>
              <Typography variant="body1" sx={{ color: '#9ca3af', mb: 3 }}>
                This was a security awareness training exercise to help you identify potential phishing attempts.
              </Typography>
            </Box>

            <Divider sx={{ bgcolor: '#374151', my: 3 }} />

            <Typography variant="h5" sx={{ fontWeight: 600, color: '#f3f4f6', mb: 2 }}>
              What we detected:
            </Typography>
            <List sx={{ bgcolor: '#1f2937', borderRadius: 2, mb: 3 }}>
              <ListItem>
                <ListItemText
                  primary="External Link Clicked"
                  secondary="The link you clicked redirected to an external domain"
                  sx={{ color: '#f3f4f6' }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Potential Risk"
                  secondary="Always verify sender legitimacy before clicking links"
                  sx={{ color: '#f3f4f6' }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Training Opportunity"
                  secondary="This helps you recognize real threats in the future"
                  sx={{ color: '#f3f4f6' }}
                />
              </ListItem>
            </List>

            <Typography variant="h5" sx={{ fontWeight: 600, color: '#f3f4f6', mb: 2 }}>
              Best Practices:
            </Typography>
            <Box component="ul" sx={{ color: '#d1d5db', pl: 3, mb: 3 }}>
              <li>Verify sender email addresses before clicking links</li>
              <li>Hover over links to see the destination URL</li>
              <li>Never enter credentials on unexpected login pages</li>
              <li>Report suspicious emails to your security team</li>
              <li>Look for grammar errors and urgent language</li>
            </Box>

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleCoached}
              sx={{
                bgcolor: '#0d9488',
                color: '#ffffff',
                fontWeight: 600,
                py: 2,
                fontSize: '1.1rem',
                '&:hover': { bgcolor: '#0f766e' }
              }}
            >
              I Understand - Take Me to HarborSim
            </Button>
          </Paper>
        ) : (
          <Paper sx={{ bgcolor: '#111827', border: '1px solid #374151', p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <CheckCircleIcon sx={{ fontSize: 80, color: '#10b981', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#f3f4f6', mb: 2 }}>
                Training Complete!
              </Typography>
              <Typography variant="body1" sx={{ color: '#9ca3af', mb: 4 }}>
                Thank you for completing this security awareness training. You've learned valuable
                skills to protect yourself and your organization from phishing attacks.
              </Typography>
            </Box>

            <Button
              component={Link}
              href="/harborsim"
              variant="contained"
              fullWidth
              size="large"
              sx={{
                bgcolor: '#0d9488',
                color: '#ffffff',
                fontWeight: 600,
                py: 2,
                fontSize: '1.1rem',
                '&:hover': { bgcolor: '#0f766e' }
              }}
            >
              Return to HarborSim Dashboard
            </Button>
          </Paper>
        )}
      </Box>
    </Box>
  )
}

export default function HarborSimCoach() {
  return (
    <Suspense fallback={
      <Box sx={{ minHeight: '100vh', bgcolor: '#030712', color: '#f3f4f6', p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ color: '#9ca3af' }}>Loading...</Typography>
      </Box>
    }>
      <HarborSimCoachContent />
    </Suspense>
  )
}

