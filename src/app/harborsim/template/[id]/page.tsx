'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Box, Typography, Paper, Button, CircularProgress, Alert, Chip, Divider } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import SendIcon from '@mui/icons-material/Send'

interface Template {
  id: string
  name: string
  sender_name: string
  sender_email: string
  subject: string
  html_content: string
  text_content: string
  preview: string
  status: string
  created_at: string
  approved: boolean
}

export default function HarborSimDetail() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (id) fetchTemplate()
  }, [id])

  const getMockTemplate = (templateId: string): Template | null => {
    const mockTemplates: Record<string, Template> = {
      '1': {
        id: '1',
        name: 'Phishing Email Template',
        sender_name: 'Security Team',
        sender_email: 'security@company.com',
        subject: 'Urgent: Verify Your Account',
        html_content: '<p>Dear User,</p><p>We have detected suspicious activity on your account. Please <a href="http://evil.com/login">click here</a> to verify your identity immediately.</p><p>Failure to verify within 24 hours will result in account suspension.</p>',
        text_content: 'Dear User,\n\nWe have detected suspicious activity on your account. Please click here to verify your identity immediately.\n\nFailure to verify within 24 hours will result in account suspension.',
        preview: 'This is a training email to help you identify phishing attempts.',
        status: 'draft',
        created_at: new Date().toISOString(),
        approved: false
      },
      '2': {
        id: '2',
        name: 'CEO Impersonation',
        sender_name: 'CEO Name',
        sender_email: 'ceo@company.com',
        subject: 'Urgent Request for Wire Transfer',
        html_content: '<p>Hi,</p><p>I need you to process an urgent wire transfer of $50,000 to our new vendor account. This is confidential and time-sensitive.</p><p>Send to: Bank Account #123456789</p><p>Reply to this email ASAP with confirmation.</p>',
        text_content: 'Hi,\n\nI need you to process an urgent wire transfer of $50,000 to our new vendor account. This is confidential and time-sensitive.\n\nSend to: Bank Account #123456789\n\nReply to this email ASAP with confirmation.',
        preview: 'Train users to recognize executive impersonation attacks.',
        status: 'approved',
        created_at: new Date().toISOString(),
        approved: true
      },
      '3': {
        id: '3',
        name: 'Invoice Scam',
        sender_name: 'Accounting',
        sender_email: 'billing@vendor.com',
        subject: 'Invoice #12345 - Payment Due',
        html_content: '<p>Please find attached invoice #12345 for your review and payment.</p><p>Payment is due within 7 days. Click here to view: <a href="http://invoice-scam.com/pay">Pay Now</a></p>',
        text_content: 'Please find attached invoice #12345 for your review and payment.\n\nPayment is due within 7 days. Click here to view: http://invoice-scam.com/pay',
        preview: 'Teaching users to verify invoices before payment.',
        status: 'draft',
        created_at: new Date().toISOString(),
        approved: false
      }
    }
    return mockTemplates[templateId] || null
  }

  const fetchTemplate = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/harborsim/v1/templates/${id}`)
      
      if (!response.ok) {
        console.warn('API unavailable, using mock data')
        const mockTemplate = getMockTemplate(id)
        if (mockTemplate) {
          setTemplate(mockTemplate)
          setError(null)
          return
        }
        throw new Error('Failed to fetch template')
      }
      
      const data = await response.json()
      if (data.error) {
        // API returned error, fall back to mock
        const mockTemplate = getMockTemplate(id)
        if (mockTemplate) {
          setTemplate(mockTemplate)
          setError(null)
          return
        }
      }
      
      setTemplate(data.template || data)
      setError(null)
    } catch (err) {
      // Try mock data as last resort
      const mockTemplate = getMockTemplate(id)
      if (mockTemplate) {
        setTemplate(mockTemplate)
        setError(null)
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load template')
        console.error('Error fetching template:', err)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!id) return
    try {
      setActionLoading(true)
      const response = await fetch(`/api/harborsim/v1/templates/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      if (!response.ok) throw new Error('Failed to approve template')
      setTemplate(prev => prev ? { ...prev, approved: true, status: 'approved' } : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve template')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSend = async () => {
    if (!id) return
    try {
      setActionLoading(true)
      const response = await fetch(`/api/harborsim/v1/templates/${id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      if (!response.ok) throw new Error('Failed to send campaign')
      alert('Campaign scheduled successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send campaign')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#030712', color: '#f3f4f6', p: 4 }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 3 }}>
          <Link href="/harborsim" style={{ textDecoration: 'none' }}>
            <Image src="/logo.png" alt="Logo" width={60} height={60} />
          </Link>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#f3f4f6', mb: 0.5 }}>
              {template?.name || 'Template Details'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              Template Viewer & Manager
            </Typography>
          </Box>
          <Link href="/harborsim" passHref legacyBehavior>
            <Button
              variant="outlined"
              component="a"
              sx={{ color: '#14b8a6', borderColor: '#14b8a6', '&:hover': { borderColor: '#0d9488', bgcolor: 'rgba(20, 184, 166, 0.1)' } }}
            >
              ← Back to List
            </Button>
          </Link>
        </Box>

        {/* Content */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <CircularProgress sx={{ color: '#14b8a6' }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ bgcolor: '#1f2937', color: '#fca5a5' }}>
            {error}
          </Alert>
        ) : template ? (
          <>
            <Paper sx={{ bgcolor: '#111827', border: '1px solid #374151', p: 4, mb: 3 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ color: '#9ca3af', mb: 1 }}>
                  From
                </Typography>
                <Typography variant="body1" sx={{ color: '#f3f4f6' }}>
                  {template.sender_name} &lt;{template.sender_email}&gt;
                </Typography>
              </Box>
              <Divider sx={{ bgcolor: '#374151', my: 3 }} />
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ color: '#9ca3af', mb: 1 }}>
                  Subject
                </Typography>
                <Typography variant="body1" sx={{ color: '#f3f4f6' }}>
                  {template.subject}
                </Typography>
              </Box>
              <Divider sx={{ bgcolor: '#374151', my: 3 }} />
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ color: '#9ca3af', mb: 1 }}>
                  Status
                </Typography>
                <Chip
                  label={template.status}
                  color={template.approved ? 'success' : 'default'}
                  sx={{ bgcolor: template.approved ? '#10b981' : '#6b7280', color: '#fff' }}
                />
              </Box>
              <Divider sx={{ bgcolor: '#374151', my: 3 }} />
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ color: '#9ca3af', mb: 2 }}>
                  Content
                </Typography>
                {template.html_content ? (
                  <Box
                    sx={{
                      bgcolor: '#1f2937',
                      p: 3,
                      borderRadius: 2,
                      border: '1px solid #374151'
                    }}
                    dangerouslySetInnerHTML={{ __html: template.html_content }}
                  />
                ) : (
                  <Typography variant="body2" sx={{ color: '#d1d5db', whiteSpace: 'pre-wrap' }}>
                    {template.text_content || template.preview}
                  </Typography>
                )}
              </Box>
            </Paper>

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<CheckCircleIcon />}
                onClick={handleApprove}
                disabled={actionLoading || template.approved}
                sx={{
                  bgcolor: '#10b981',
                  color: '#ffffff',
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#059669' },
                  '&:disabled': { bgcolor: '#6b7280' }
                }}
              >
                {template.approved ? 'Approved' : 'Approve Template'}
              </Button>
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={handleSend}
                disabled={actionLoading || !template.approved}
                sx={{
                  bgcolor: '#0d9488',
                  color: '#ffffff',
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#0f766e' },
                  '&:disabled': { bgcolor: '#6b7280' }
                }}
              >
                Schedule Campaign
              </Button>
            </Box>
          </>
        ) : null}
      </Box>
    </Box>
  )
}

