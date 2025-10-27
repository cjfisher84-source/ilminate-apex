'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Box, Typography, Paper, Card, CardContent, Chip, Divider, Button, List, ListItem, ListItemText, CircularProgress } from '@mui/material'
import { getTechniqueMeta, TechniqueMeta } from '@/lib/attackMeta'

function EventsContent() {
  const searchParams = useSearchParams()
  const technique = searchParams?.get('technique')
  const [techniqueData, setTechniqueData] = useState<any>(null)
  const [meta, setMeta] = useState<TechniqueMeta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!technique) return
    
    // Fetch technique details from ATT&CK API
    fetch(`/api/attack/map?technique=${technique}`)
      .then(res => res.json())
      .then(data => {
        setTechniqueData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching technique data:', err)
        setLoading(false)
      })

    // Load meta data
    getTechniqueMeta().then(setMeta)
  }, [technique])

  const getTechniqueInfo = (techId: string): TechniqueMeta | null => {
    return meta.find(m => m.techniqueID === techId) || null
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    )
  }

  const techInfo = technique ? getTechniqueInfo(technique) : null

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', p: 4 }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Image src="/ilminate-logo.png" alt="Ilminate Logo" width={60} height={60} />
            </Link>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                Threat Details
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                MITRE ATT&CK Technique Analysis
              </Typography>
            </Box>
            <Link href="/reports/attack" passHref legacyBehavior>
              <Button
                variant="outlined"
                component="a"
                sx={{ borderColor: 'primary.main', color: 'primary.main' }}
              >
                ← Back to ATT&CK Matrix
              </Button>
            </Link>
          </Box>
        </Box>

        {techInfo ? (
          <Paper sx={{ bgcolor: 'background.paper', border: '2px solid', borderColor: 'divider', p: 4 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700 }}>
                {techInfo.tactic} → {techInfo.subTactic || 'N/A'}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mt: 1 }}>
                {technique}
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary', mt: 1 }}>
                {techInfo.techniqueName}
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
                Description
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                {techInfo.description || 'No description available for this technique.'}
              </Typography>
            </Box>

            {techInfo.useCase && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
                  Use Case
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                  {techInfo.useCase}
                </Typography>
              </Box>
            )}

            {techInfo.examples && techInfo.examples.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
                  Examples
                </Typography>
                <List>
                  {techInfo.examples.map((example: string, idx: number) => (
                    <ListItem key={idx} sx={{ pl: 0 }}>
                      <ListItemText 
                        primary={example}
                        primaryTypographyProps={{ color: 'text.secondary' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {techniqueData && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
                  Detected Events
                </Typography>
                <Card sx={{ bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                  <CardContent>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {techniqueData.count || 0} security events detected using this technique in the last 30 days.
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip label={`Tactic: ${techInfo.tactic}`} color="primary" />
              <Chip label={`Domain: ${techInfo.domain}`} color="secondary" />
            </Box>
          </Paper>
        ) : (
          <Paper sx={{ bgcolor: 'background.paper', border: '2px solid', borderColor: 'divider', p: 4 }}>
            <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
              No threat data available
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {technique ? `Technique ID "${technique}" not found.` : 'No technique specified.'}
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  )
}

export default function EventsPage() {
  return (
    <Suspense fallback={
      <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    }>
      <EventsContent />
    </Suspense>
  )
}

