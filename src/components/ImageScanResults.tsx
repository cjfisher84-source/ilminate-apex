'use client'
import { useState, useEffect } from 'react'
import { Box, Typography, Paper, Tooltip, Card, CardContent, Chip, Collapse, useTheme } from '@mui/material'
import { useIsMobile, getResponsiveFontSize } from '@/lib/mobileUtils'
import type { ImageScanStats } from '@/app/api/image-scan/route'

/**
 * ImageScanResults Component
 * 
 * Displays QR code and image scanning results from ilminate-agent
 * Shows:
 * - Total emails scanned with QR codes/images
 * - Malicious QR codes detected (quishing)
 * - Offensive or impersonation images
 * - Hidden links in images
 */

export default function ImageScanResults() {
  const theme = useTheme()
  const isMobile = useIsMobile()
  const [data, setData] = useState<ImageScanStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/image-scan')
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Error fetching image scan data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading || !data) {
    return null
  }

  const StatCard = ({ 
    label, 
    value, 
    color, 
    icon, 
    description 
  }: { 
    label: string
    value: number
    color: string
    icon: string
    description: string
  }) => (
    <Tooltip title={description} arrow placement="top">
      <Card sx={{ 
        bgcolor: 'background.paper',
        border: 2,
        borderColor: 'divider',
        height: '100%',
        transition: 'all 0.3s ease',
        '&:hover': { 
          borderColor: color,
          boxShadow: `0 4px 20px ${color}30`,
          transform: 'translateY(-4px)'
        }
      }}>
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                textTransform: 'uppercase', 
                color: 'text.secondary', 
                fontWeight: 600, 
                letterSpacing: 1,
                fontSize: isMobile ? '0.65rem' : '0.75rem'
              }}
            >
              {label}
            </Typography>
            <Box sx={{ fontSize: isMobile ? '1.2rem' : '1.5rem' }}>
              {icon}
            </Box>
          </Box>
          <Typography 
            variant={isMobile ? 'h5' : 'h4'} 
            sx={{ 
              fontWeight: 700, 
              color: value > 0 ? color : 'text.primary',
              mb: 0.5
            }}
          >
            {value.toLocaleString()}
          </Typography>
          {value > 0 && (
            <Chip 
              label="DETECTED" 
              size="small" 
              sx={{ 
                bgcolor: `${color}20`,
                color: color,
                fontWeight: 700,
                fontSize: '0.65rem',
                height: isMobile ? 18 : 20
              }} 
            />
          )}
        </CardContent>
      </Card>
    </Tooltip>
  )

  return (
    <Box>
      {/* Section Header */}
      <Box sx={{ mb: isMobile ? 2 : 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              color: 'text.primary',
              fontSize: getResponsiveFontSize(isMobile, 'h4')
            }}
          >
            Advanced Image Detection
          </Typography>
          <Chip 
            label="NEW" 
            size="small" 
            sx={{ 
              bgcolor: 'rgba(0, 168, 168, 0.15)',
              color: '#00a8a8',
              fontWeight: 800,
              fontSize: '0.65rem',
              height: 22
            }} 
          />
        </Box>
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'text.secondary',
            fontSize: getResponsiveFontSize(isMobile, 'body1')
          }}
        >
          QR code phishing (quishing) and image-based threats detected across your environment
        </Typography>
      </Box>

      {/* Main Stats Grid */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: 'repeat(2, 1fr)', 
          sm: 'repeat(3, 1fr)', 
          md: 'repeat(3, 1fr)', 
          lg: 'repeat(6, 1fr)' 
        },
        gap: 2,
        mb: 2
      }}>
        <StatCard
          label="Total Scans"
          value={data.total_scans_24h}
          color={theme.palette.primary.main}
          icon="🔍"
          description="Total emails scanned for images and QR codes in the last 24 hours"
        />
        <StatCard
          label="QR Codes"
          value={data.qr_codes_detected}
          color="#007070"
          icon="📱"
          description="QR codes detected in email attachments"
        />
        <StatCard
          label="Malicious QR"
          value={data.malicious_qr_codes}
          color={theme.palette.error.main}
          icon="⚠️"
          description="Quishing attacks: QR codes linking to malicious sites"
        />
        <StatCard
          label="Logo Fraud"
          value={data.logo_impersonations}
          color={theme.palette.warning.main}
          icon="🎭"
          description="Brand logo impersonation detected (PayPal, Microsoft, etc.)"
        />
        <StatCard
          label="Hidden Links"
          value={data.hidden_links}
          color="#ff6b6b"
          icon="🔗"
          description="Images with hidden clickable areas redirecting to malicious pages"
        />
        <StatCard
          label="Screenshots"
          value={data.screenshot_phishing}
          color="#9c27b0"
          icon="🖼️"
          description="Screenshot phishing: fake login pages sent as images"
        />
      </Box>

      {/* Detailed Info Section */}
      <Paper sx={{ 
        bgcolor: 'background.paper',
        border: 2,
        borderColor: 'divider',
        borderRadius: 3,
        overflow: 'hidden'
      }}>
        <Box 
          onClick={() => setExpanded(!expanded)}
          sx={{ 
            p: isMobile ? 1.5 : 2, 
            borderBottom: 2, 
            borderColor: 'primary.main', 
            bgcolor: 'background.default',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            '&:hover': {
              bgcolor: 'rgba(0, 112, 112, 0.05)'
            }
          }}
        >
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: 'text.primary', 
              fontWeight: 600,
              fontSize: isMobile ? '0.95rem' : '1rem'
            }}
          >
            📊 Detection Breakdown
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'primary.main',
              fontWeight: 700,
              fontSize: isMobile ? '0.7rem' : '0.8rem'
            }}
          >
            {expanded ? '▼ Hide Details' : '▶ Show Details'}
          </Typography>
        </Box>
        
        <Collapse in={expanded}>
          <Box sx={{ p: isMobile ? 2 : 3 }}>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 2
            }}>
              {/* QR Code Threats Section */}
              <Box>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'rgba(244, 67, 54, 0.05)',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'rgba(244, 67, 54, 0.2)'
                }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: 'error.main' }}>
                    ⚠️ Malicious QR Codes (Quishing)
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.6 }}>
                    QR code phishing attacks detected. These QR codes redirect users to malicious sites designed to steal credentials or install malware.
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {data.recent_threats.qr_threats.slice(0, 2).map((threat, idx) => (
                      <Box 
                        key={idx}
                        sx={{ 
                          p: 1.5, 
                          bgcolor: 'background.paper',
                          borderRadius: 1.5,
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                          {new Date(threat.timestamp).toLocaleTimeString()} • Risk: {Math.round(threat.threat_score * 100)}%
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5, mb: 0.5 }}>
                          {threat.subject}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'error.main',
                            fontFamily: 'monospace',
                            fontSize: '0.65rem',
                            display: 'block',
                            mb: 0.5
                          }}
                        >
                          🔗 {threat.qr_url}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {threat.indicators.slice(0, 2).map((indicator, i) => (
                            <Chip 
                              key={i}
                              label={indicator}
                              size="small"
                              sx={{ 
                                fontSize: '0.6rem',
                                height: 18,
                                bgcolor: 'rgba(244, 67, 54, 0.1)',
                                color: 'error.main'
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>

              {/* Image Threats Section */}
              <Box>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'rgba(255, 152, 0, 0.05)',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'rgba(255, 152, 0, 0.2)'
                }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: 'warning.main' }}>
                    🎭 Image-Based Threats
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.6 }}>
                    Logo impersonation, screenshot phishing, and hidden malicious links detected in image attachments.
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {data.recent_threats.image_threats.slice(0, 2).map((threat, idx) => (
                      <Box 
                        key={idx}
                        sx={{ 
                          p: 1.5, 
                          bgcolor: 'background.paper',
                          borderRadius: 1.5,
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                          {new Date(threat.timestamp).toLocaleTimeString()} • Risk: {Math.round(threat.threat_score * 100)}%
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5, mb: 0.5 }}>
                          {threat.subject}
                        </Typography>
                        {threat.brand && (
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'warning.main',
                              fontSize: '0.7rem',
                              display: 'block',
                              mb: 0.5
                            }}
                          >
                            🎭 Impersonating: {threat.brand}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          <Chip 
                            label={threat.threat_type.replace(/_/g, ' ').toUpperCase()}
                            size="small"
                            sx={{ 
                              fontSize: '0.6rem',
                              height: 18,
                              bgcolor: 'rgba(255, 152, 0, 0.1)',
                              color: 'warning.main',
                              fontWeight: 700
                            }}
                          />
                          {threat.indicators.slice(0, 1).map((indicator, i) => (
                            <Chip 
                              key={i}
                              label={indicator}
                              size="small"
                              sx={{ 
                                fontSize: '0.6rem',
                                height: 18,
                                bgcolor: 'rgba(255, 152, 0, 0.1)',
                                color: 'warning.main'
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Detection Methods Info */}
            <Box sx={{ 
              mt: 3, 
              p: 2, 
              bgcolor: 'rgba(0, 168, 168, 0.05)',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'rgba(0, 168, 168, 0.2)'
            }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, color: 'primary.main' }}>
                🔬 Detection Technology
              </Typography>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                gap: 2
              }}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.75rem' }}>
                    QR Code Detection
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.7rem' }}>
                    pyzbar + YOLOv8 AI
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.75rem' }}>
                    Logo Detection
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.7rem' }}>
                    CLIP Vision AI
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.75rem' }}>
                    Text Extraction
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.7rem' }}>
                    Tesseract OCR
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.75rem' }}>
                    Screenshot Detection
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.7rem' }}>
                    Heuristic Analysis
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Collapse>
      </Paper>
    </Box>
  )
}

