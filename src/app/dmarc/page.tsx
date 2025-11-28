'use client'
import { Box, Typography, Card, CardContent, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material'
import Link from 'next/link'
import Image from 'next/image'
import UserProfile from '@/components/UserProfile'
import NavigationBar from '@/components/NavigationBar'
import { mockDomainAbuse } from '@/lib/mock'
import { useIsMobile, getResponsivePadding, getResponsiveSpacing, getResponsiveFontSize, getResponsiveImageSize } from '@/lib/mobileUtils'
import { useTheme } from '@mui/material'
import { useState, useEffect } from 'react'

const UNCW_TEAL = '#007070'
const UNCW_GOLD = '#FFD700'

export default function DmarcPage() {
  const theme = useTheme()
  const isMobile = useIsMobile()
  const containerPadding = getResponsivePadding(isMobile)
  const headerGap = getResponsiveSpacing(isMobile, 2, 3)
  const logoSize = getResponsiveImageSize(isMobile, 100)
  const [abuse, setAbuse] = useState(mockDomainAbuse(null))

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: containerPadding }}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'center', 
          mb: isMobile ? 3 : 4,
          pb: isMobile ? 2 : 3,
          borderBottom: '2px solid',
          borderColor: 'primary.main',
          gap: isMobile ? 2 : 0
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: headerGap }}>
            <Image 
              src="/ilminate-logo.png" 
              alt="Ilminate Logo" 
              width={logoSize} 
              height={logoSize}
              priority
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 112, 112, 0.3))' }}
            />
            <Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 0.5, 
                  color: 'text.primary',
                  fontSize: getResponsiveFontSize(isMobile, 'h3')
                }}
              >
                Domain <span style={{ color: UNCW_TEAL }}>Abuse</span>
              </Typography>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: 'text.secondary', 
                  fontWeight: 500,
                  fontSize: getResponsiveFontSize(isMobile, 'subtitle1')
                }}
              >
                DMARC protection and brand impersonation detection
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', width: isMobile ? '100%' : 'auto' }}>
            <Link href="/" passHref legacyBehavior>
              <Button 
                variant="outlined" 
                component="a" 
                size={isMobile ? 'medium' : 'large'}
                sx={{ 
                  borderColor: UNCW_TEAL,
                  color: UNCW_TEAL,
                  px: isMobile ? 3 : 4,
                  py: isMobile ? 1.2 : 1.5,
                  fontSize: isMobile ? '1rem' : '1.1rem',
                  fontWeight: 600,
                  '&:hover': { 
                    borderColor: '#005555',
                    bgcolor: 'rgba(0, 112, 112, 0.05)'
                  }
                }}
              >
                ← Dashboard
              </Button>
            </Link>
            <UserProfile />
          </Box>
        </Box>

        {/* Navigation Bar */}
        <NavigationBar />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 2.5 : 3 }}>
          {/* DMARC Overview */}
          <Card sx={{ bgcolor: 'background.paper', border: '2px solid', borderColor: 'divider', boxShadow: 2 }}>
            <CardContent sx={{ p: isMobile ? 3 : 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
                What is DMARC?
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.8 }}>
                DMARC (Domain-based Message Authentication, Reporting & Conformance) is an email authentication protocol 
                that helps protect your domain from email spoofing and phishing attacks. This page shows domains that are 
                impersonating your brand and how DMARC helps protect against them.
              </Typography>
            </CardContent>
          </Card>

          {/* Domain Abuse Table */}
          <Box className={isMobile ? 'mobile-table-wrapper' : ''}>
            <TableContainer component={Paper} sx={{ 
              bgcolor: 'background.paper', 
              border: 2,
              borderColor: 'divider',
              borderRadius: 3,
              boxShadow: 2
            }}>
              <Box sx={{ p: isMobile ? 1.5 : 2, borderBottom: 2, borderColor: 'primary.main', bgcolor: 'background.default' }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    color: 'text.primary', 
                    fontWeight: 600,
                    fontSize: isMobile ? '0.95rem' : '1rem'
                  }}
                >
                  Impersonating Domains
                </Typography>
              </Box>
              <Table sx={{ minWidth: isMobile ? 600 : 'auto' }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'background.default' }}>
                    <TableCell sx={{ 
                      color: 'text.secondary', 
                      fontSize: isMobile ? '0.7rem' : '0.75rem', 
                      textTransform: 'uppercase', 
                      fontWeight: 700,
                      padding: isMobile ? '8px' : '16px'
                    }}>
                      Impersonating Domain
                    </TableCell>
                    <TableCell sx={{ 
                      color: 'text.secondary', 
                      fontSize: isMobile ? '0.7rem' : '0.75rem', 
                      textTransform: 'uppercase', 
                      fontWeight: 700,
                      padding: isMobile ? '8px' : '16px'
                    }}>
                      First Seen
                    </TableCell>
                    <TableCell sx={{ 
                      color: 'text.secondary', 
                      fontSize: isMobile ? '0.7rem' : '0.75rem', 
                      textTransform: 'uppercase', 
                      fontWeight: 700,
                      padding: isMobile ? '8px' : '16px'
                    }}>
                      Messages
                    </TableCell>
                    <TableCell sx={{ 
                      color: 'text.secondary', 
                      fontSize: isMobile ? '0.7rem' : '0.75rem', 
                      textTransform: 'uppercase', 
                      fontWeight: 700,
                      padding: isMobile ? '8px' : '16px'
                    }}>
                      DMARC
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {abuse.map((r, idx) => (
                    <TableRow key={idx} sx={{ '&:hover': { bgcolor: 'background.default' }, '&:last-child td': { borderBottom: 0 } }}>
                      <TableCell sx={{ 
                        color: 'text.primary', 
                        fontWeight: 500,
                        padding: isMobile ? '8px' : '16px',
                        fontSize: isMobile ? '0.85rem' : '0.875rem'
                      }}>
                        <Link 
                          href={`/dmarc/${encodeURIComponent(r.domain)}`}
                          style={{ 
                            color: theme.palette.primary.main, 
                            textDecoration: 'none',
                            fontWeight: 600
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                          onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                        >
                          {r.domain}
                        </Link>
                      </TableCell>
                      <TableCell sx={{ 
                        color: 'text.secondary',
                        padding: isMobile ? '8px' : '16px',
                        fontSize: isMobile ? '0.85rem' : '0.875rem'
                      }}>{r.firstSeen}</TableCell>
                      <TableCell sx={{ 
                        color: 'text.primary', 
                        fontWeight: 600,
                        padding: isMobile ? '8px' : '16px',
                        fontSize: isMobile ? '0.85rem' : '0.875rem'
                      }}>{r.messages.toLocaleString()}</TableCell>
                      <TableCell sx={{ 
                        padding: isMobile ? '8px' : '16px',
                        fontSize: isMobile ? '0.85rem' : '0.875rem'
                      }}>
                        <Chip 
                          label={r.dmarcAligned}
                          size="small"
                          sx={{ 
                            bgcolor: r.dmarcAligned === 'Aligned' ? 'success.main' : 'error.main',
                            color: 'white',
                            fontWeight: 700
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

