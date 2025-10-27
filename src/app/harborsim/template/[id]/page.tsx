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

  const fetchTemplate = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/harborsim/v1/templates/${id}`)
      if (!response.ok) throw new Error('Failed to fetch template')
      const data = await response.json()
      setTemplate(data.template || data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load template')
      console.error('Error fetching template:', err)
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

