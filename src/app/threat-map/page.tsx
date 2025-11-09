'use client'

import { Box, Typography, Container, useTheme, Paper, Button } from '@mui/material'
import Link from 'next/link'
import { ThreatHeatmapChart } from '@/components/Charts.client'
import { ArrowBack } from '@mui/icons-material'

export default function ThreatMapPage() {
  const theme = useTheme()

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#0b1020',
      py: 4
    }}>
      <Container maxWidth="xl">
        {/* Header with back button */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link href="/" passHref legacyBehavior>
            <Button
              component="a"
              startIcon={<ArrowBack />}
              sx={{
                color: '#007070',
                '&:hover': {
                  bgcolor: 'rgba(0, 112, 112, 0.1)'
                }
              }}
            >
              Back to Dashboard
            </Button>
          </Link>
        </Box>

        {/* Page Title */}
        <Paper sx={{
          bgcolor: theme.palette.background.paper,
          borderRadius: 3,
          p: 4,
          mb: 4,
          border: `2px solid ${theme.palette.divider}`,
          boxShadow: '0 4px 16px rgba(0, 112, 112, 0.08)'
        }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800, 
              color: theme.palette.text.primary,
              mb: 2
            }}
          >
            🌍 Global Threat Heatmap
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: theme.palette.text.secondary,
              lineHeight: 1.6,
              maxWidth: '800px'
            }}
          >
            Visualize global threat distribution with an interactive heatmap. Countries are colored from yellow to red 
            based on combined threat risk (volume × severity). Hover over countries to see detailed threat statistics. 
            Use the controls to toggle country labels and borders for a customized view.
          </Typography>
        </Paper>

        {/* Threat Heatmap */}
        <Box>
          <ThreatHeatmapChart />
        </Box>

        {/* Info Cards */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' },
          gap: 3,
          mt: 4
        }}>
          <Paper sx={{ 
            p: 3, 
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`
          }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#007070' }}>
              📊 Data Source
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.6 }}>
              Currently displaying mock threat data for demonstration. Replace the MOCK_DATA object in the 
              ThreatHeatmap component with real-time data from your threat intelligence pipeline.
            </Typography>
          </Paper>

          <Paper sx={{ 
            p: 3, 
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`
          }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#007070' }}>
              🎨 Color Scale
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.6 }}>
              The heatmap uses a yellow-to-red gradient (YlOrRd) where warmer colors indicate higher threat scores. 
              Score is calculated as: threat count × severity level (1-5).
            </Typography>
          </Paper>

          <Paper sx={{ 
            p: 3, 
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`
          }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#007070' }}>
              🔧 Integration
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.6 }}>
              Built with D3.js and TopoJSON for high-performance rendering. Fully responsive and optimized for both 
              desktop and mobile viewing. Interactive tooltips show detailed threat information on hover.
            </Typography>
          </Paper>
        </Box>

        {/* Technical Details */}
        <Paper sx={{
          bgcolor: theme.palette.background.paper,
          borderRadius: 3,
          p: 4,
          mt: 4,
          border: `2px solid ${theme.palette.divider}`,
          boxShadow: '0 4px 16px rgba(0, 112, 112, 0.08)'
        }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: theme.palette.text.primary }}>
            Technical Implementation
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#007070' }}>
              Component Location
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontFamily: 'monospace', bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
              src/components/ThreatHeatmap.tsx
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#007070' }}>
              Usage Example
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontFamily: 'monospace', bgcolor: '#f5f5f5', p: 2, borderRadius: 1, whiteSpace: 'pre-wrap' }}>
{`import { ThreatHeatmapChart } from '@/components/Charts.client'

export default function MyPage() {
  return <ThreatHeatmapChart />
}`}
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#007070' }}>
              Features
            </Typography>
            <ul style={{ margin: 0, paddingLeft: '20px', color: theme.palette.text.secondary }}>
              <li>Interactive tooltips with threat details</li>
              <li>Toggle country labels and borders</li>
              <li>Responsive design with automatic resizing</li>
              <li>Yellow-to-red gradient color scale</li>
              <li>Mock data with 40+ countries</li>
              <li>Random data generation for unlisted countries</li>
              <li>Natural Earth projection for accurate geography</li>
            </ul>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

