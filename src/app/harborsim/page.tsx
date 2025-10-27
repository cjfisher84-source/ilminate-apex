'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Box, Typography, Card, CardContent, Button, CircularProgress, Alert } from '@mui/material'

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
      const response = await fetch('/api/harborsim/v1/templates')
      if (!response.ok) throw new Error('Failed to fetch templates')
      const data = await response.json()
      setTemplates(data.templates || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates')
      console.error('Error fetching templates:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#030712', color: '#f3f4f6', p: 4 }}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 3 }}>
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

