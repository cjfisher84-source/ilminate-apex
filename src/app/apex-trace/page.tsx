'use client'
import { Box, Typography, Button } from '@mui/material'
import { ApexTrace } from '@/components/ApexTrace'
import { useIsMobile } from '@/lib/mobileUtils'

const UNCW_TEAL = '#007070'

export default function ApexTracePage() {
  const isMobile = useIsMobile()

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      padding: isMobile ? 2 : 4,
      width: '100%',
      overflowX: 'hidden'
    }}>
      <Box sx={{
        maxWidth: 1400,
        marginLeft: 'auto',
        marginRight: 'auto'
      }}>
        {/* Header */}
        <Box sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          marginBottom: 4,
          paddingBottom: 3,
          borderBottom: '2px solid',
          borderColor: '#00a8a8',
          gap: 2
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 3
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <img
                alt="Ilminate Logo"
                width={isMobile ? 60 : 100}
                height={isMobile ? 60 : 100}
                style={{
                  filter: 'drop-shadow(0 4px 12px rgba(0, 112, 112, 0.3))'
                }}
                src="/ilminate-logo.png"
              />
              <Box>
                <Typography variant="h3" sx={{
                  margin: 0,
                  fontWeight: 700,
                  fontSize: isMobile ? '2rem' : '3rem',
                  color: '#f1f5f9',
                  marginBottom: 1
                }}>
                  APEX <span style={{ color: UNCW_TEAL }}>Trace</span>
                </Typography>
                <Typography variant="subtitle1" sx={{
                  margin: 0,
                  fontWeight: 500,
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  color: '#94a3b8'
                }}>
                  Super Fast Message Search & Investigation
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Button
            size="large"
            variant="outlined"
            href="/"
            sx={{
              borderColor: '#007070',
              color: '#007070',
              fontWeight: 600,
              '&:hover': {
                borderColor: '#005555',
                backgroundColor: 'rgba(0, 112, 112, 0.05)'
              }
            }}
          >
            ← Dashboard
          </Button>
        </Box>

        {/* APEX Trace Component */}
        <ApexTrace />
      </Box>
    </Box>
  )
}