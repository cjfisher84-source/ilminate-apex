'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Box, Typography, Card, CardContent, Button, CircularProgress, Alert } from '@mui/material'
import NavigationBar from '@/components/NavigationBar'

interface Template {
  id: string
  name: string
  sender_name: string
  sender_email: string
  subject: string
  preview: string
  status: string
  created_at: string
}

export default function HarborSimList() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Try to fetch from API
      const response = await fetch('/api/harborsim/v1/templates')
      console.log('API Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        
        // If API fails, fall back to mock data
        console.warn('API unavailable, using mock data')
        setTemplates(getMockTemplates())
        return
      }
      
      const data = await response.json()
      console.log('API Response data:', data)
      
      // Handle different response formats
      if (data.templates) {
        setTemplates(data.templates)
      } else if (Array.isArray(data)) {
        setTemplates(data)
      } else if (data.error) {
        // API error - use mock data
        console.warn('API returned error, using mock data:', data.error)
        setTemplates(getMockTemplates())
      } else {
        setTemplates([])
      }
    } catch (err) {
      console.warn('API fetch failed, using mock data:', err)
      setTemplates(getMockTemplates())
    } finally {
      setLoading(false)
    }
  }

  const getMockTemplates = (): Template[] => [
    {
      id: '1',
      name: 'Phishing Email Template',
      sender_name: 'Security Team',
      sender_email: 'security@company.com',
      subject: 'Urgent: Verify Your Account',
      preview: 'This is a training email to help you identify phishing attempts.',
      status: 'draft',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'CEO Impersonation',
      sender_name: 'CEO Name',
      sender_email: 'ceo@company.com',
      subject: 'Urgent Request for Wire Transfer',
      preview: 'Train users to recognize executive impersonation attacks.',
      status: 'approved',
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Invoice Scam',
      sender_name: 'Accounting',
      sender_email: 'billing@vendor.com',
      subject: 'Invoice #12345 - Payment Due',
      preview: 'Teaching users to verify invoices before payment.',
      status: 'draft',
      created_at: new Date().toISOString()
    }
  ]

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#030712', color: '#f3f4f6', p: 4 }}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, gap: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Image src="/logo.png" alt="Logo" width={60} height={60} />
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#f3f4f6', mb: 0.5 }}>
                HarborSim
              </Typography>
              <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                Email Security Training Platform
              </Typography>
            </Box>
          </Box>
          <Link href="/" passHref legacyBehavior>
            <Button
              variant="outlined"
              component="a"
              sx={{
                borderColor: '#14b8a6',
                color: '#14b8a6',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#0d9488',
                  bgcolor: 'rgba(20, 184, 166, 0.1)'
                }
              }}
            >
              ← Return to Dashboard
            </Button>
          </Link>
        </Box>

        {/* Navigation Bar */}
        <NavigationBar />

        {/* What is HarborSim Section */}
        <Paper sx={{ bgcolor: '#111827', border: '1px solid #374151', p: 4, mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#f3f4f6', mb: 3 }}>
            What is HarborSim?
          </Typography>
          <Typography variant="body1" sx={{ color: '#d1d5db', mb: 3, lineHeight: 1.8 }}>
            HarborSim transforms real phishing emails into safe training templates for your security awareness program. 
            When your organization receives actual phishing attacks, HarborSim automatically processes these emails to remove 
            all dangerous elements, personal information, and malicious links. The result is a clean, educational template 
            that looks like the original threat but is completely safe to use for training your team.
          </Typography>
          <Typography variant="body1" sx={{ color: '#d1d5db', mb: 3, lineHeight: 1.8 }}>
            These sanitized templates help employees learn to recognize phishing attempts by showing them real world examples 
            without the risk. When someone clicks a link in a training email, they are redirected to a coaching page that 
            explains what they should have noticed and how to stay safe in the future.
          </Typography>
          <Box sx={{ bgcolor: '#1f2937', p: 3, borderRadius: 2, border: '1px solid #374151', mt: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#14b8a6', mb: 2 }}>
              How it works:
            </Typography>
            <Box component="ul" sx={{ color: '#d1d5db', pl: 3, mb: 0 }}>
              <li style={{ marginBottom: '8px' }}>
                Real phishing emails are automatically captured and processed
              </li>
              <li style={{ marginBottom: '8px' }}>
                All dangerous links, personal information, and malicious content are removed
              </li>
              <li style={{ marginBottom: '8px' }}>
                Safe training templates are created and stored for review
              </li>
              <li style={{ marginBottom: '8px' }}>
                Approved templates can be sent to employees as training exercises
              </li>
              <li style={{ marginBottom: '8px' }}>
                Click tracking provides immediate coaching when links are clicked
              </li>
            </Box>
          </Box>
        </Paper>

        {/* Content */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <CircularProgress sx={{ color: '#14b8a6' }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ bgcolor: '#1f2937', color: '#fca5a5' }}>
            {error}
          </Alert>
        ) : (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 3 
          }}>
            {templates.map((template) => (
              <Card key={template.id} sx={{ bgcolor: '#111827', border: '1px solid #374151', '&:hover': { borderColor: '#14b8a6' } }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: '#f3f4f6', mb: 1 }}>
                    {template.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#9ca3af', mb: 2 }}>
                    {template.sender_name} &lt;{template.sender_email}&gt;
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#d1d5db', mb: 2, fontStyle: 'italic' }}>
                    Subject: {template.subject}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#9ca3af', mb: 2 }}>
                    {template.preview}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mb: 2 }}>
                    Status: {template.status}
                  </Typography>
                  <Button
                    component={Link}
                    href={`/harborsim/template/${template.id}`}
                    variant="contained"
                    fullWidth
                    sx={{
                      bgcolor: '#0d9488',
                      color: '#ffffff',
                      fontWeight: 600,
                      '&:hover': { bgcolor: '#0f766e' }
                    }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  )
}

