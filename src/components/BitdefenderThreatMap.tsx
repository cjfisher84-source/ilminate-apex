'use client'

import React, { useState, useEffect } from 'react'
import { Box, Typography, Alert, Button, CircularProgress } from '@mui/material'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import WarningIcon from '@mui/icons-material/Warning'

interface BitdefenderThreatMapProps {
  height?: number
  showFallback?: boolean
}

/**
 * Attempts to embed the Bitdefender live threat map
 * Falls back to link if embedding is blocked by CORS/X-Frame-Options
 */
export default function BitdefenderThreatMap({ 
  height = 600,
  showFallback = true 
}: BitdefenderThreatMapProps) {
  const [embedError, setEmbedError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Set a timeout to detect if iframe fails to load
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  const handleIframeError = () => {
    console.warn('Bitdefender Threat Map embedding blocked (likely X-Frame-Options)')
    setEmbedError(true)
    setIsLoading(false)
  }

  const handleIframeLoad = () => {
    setIsLoading(false)
    setEmbedError(false)
  }

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      {/* Attempt to embed */}
      {!embedError && (
        <Box sx={{ position: 'relative', width: '100%', height }}>
          {isLoading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(11, 16, 32, 0.95)',
                zIndex: 1,
                gap: 2
              }}
            >
              <CircularProgress sx={{ color: '#007070' }} />
              <Typography sx={{ color: '#e8f1ff' }}>
                Loading Bitdefender Threat Map...
              </Typography>
            </Box>
          )}
          
          <iframe
            src="https://threatmap.bitdefender.com/"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: '12px',
              background: '#0b1020'
            }}
            title="Bitdefender Live Threat Map"
            sandbox="allow-scripts allow-same-origin"
            onError={handleIframeError}
            onLoad={handleIframeLoad}
          />
        </Box>
      )}

      {/* Show error/fallback if embedding fails */}
      {(embedError || (showFallback && !isLoading)) && (
        <Box>
          <Alert 
            severity="warning" 
            icon={<WarningIcon />}
            sx={{ mb: 2 }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Unable to embed Bitdefender Threat Map
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
              Bitdefender blocks iframe embedding for security (X-Frame-Options header). 
              Click below to open the live threat map in a new window.
            </Typography>
          </Alert>

          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height,
              background: 'linear-gradient(135deg, #0b1020 0%, #1a2332 100%)',
              borderRadius: '12px',
              border: '2px solid rgba(255,255,255,0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              p: 4,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 32px rgba(0, 112, 112, 0.2)',
                borderColor: 'rgba(0, 112, 112, 0.5)'
              }
            }}
            onClick={() => window.open('https://threatmap.bitdefender.com/', '_blank')}
          >
            {/* Decorative background pattern */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.05,
                background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                borderRadius: '12px'
              }}
            />

            {/* Icon */}
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'rgba(0, 112, 112, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(0, 112, 112, 0.3)'
              }}
            >
              <Typography sx={{ fontSize: '3rem' }}>🌍</Typography>
            </Box>

            {/* Title */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h4"
                sx={{
                  color: '#e8f1ff',
                  fontWeight: 700,
                  mb: 1
                }}
              >
                Bitdefender Live Threat Map
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(232, 241, 255, 0.7)',
                  maxWidth: 500
                }}
              >
                Real-time visualization of cyber attacks, infections, and spam worldwide
              </Typography>
            </Box>

            {/* Features */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              {['Live Attacks', 'Attack Paths', 'Real-time Feed', 'Global Coverage'].map((feature) => (
                <Box
                  key={feature}
                  sx={{
                    px: 2,
                    py: 1,
                    bgcolor: 'rgba(0, 112, 112, 0.15)',
                    borderRadius: 2,
                    border: '1px solid rgba(0, 112, 112, 0.3)'
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#007070',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
                  >
                    ✓ {feature}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Button */}
            <Button
              variant="contained"
              size="large"
              endIcon={<OpenInNewIcon />}
              sx={{
                bgcolor: '#007070',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: '#005555'
                }
              }}
              onClick={(e) => {
                e.stopPropagation()
                window.open('https://threatmap.bitdefender.com/', '_blank')
              }}
            >
              Open Live Threat Map
            </Button>

            <Typography
              variant="caption"
              sx={{
                color: 'rgba(232, 241, 255, 0.5)',
                fontSize: '0.75rem'
              }}
            >
              Powered by Bitdefender
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  )
}

