'use client'

import { useState, useEffect, Suspense } from 'react'
import { Box, Button, Card, CardContent, Typography, TextField, Alert, CircularProgress } from '@mui/material'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import './styles.css'

function LoginContent() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tokenInput, setTokenInput] = useState('')

  // Check for any login errors
  useEffect(() => {
    const errorParam = searchParams.get('error')
    
    if (errorParam === 'auth_failed') {
      setError('Authentication failed. Please try again.')
    }
  }, [searchParams])

  // SSO Login handlers
  const handleSSOLogin = (provider: 'Google' | 'AzureADv2') => {
    setLoading(true)
    
    // Use current origin for redirect URI (works in dev and prod)
    const redirectUri = `${window.location.origin}/api/auth/callback`
    
    const cognitoUrl = new URL(
      'https://ilminate-customer-portal-jqo56pdt.auth.us-east-1.amazoncognito.com/oauth2/authorize'
    )
    cognitoUrl.searchParams.set('client_id', '1uoiq3h1afgo6799gie48vmlcj')
    cognitoUrl.searchParams.set('response_type', 'code')
    cognitoUrl.searchParams.set('scope', 'email openid profile')
    cognitoUrl.searchParams.set('redirect_uri', redirectUri)
    cognitoUrl.searchParams.set('identity_provider', provider)
    
    window.location.href = cognitoUrl.toString()
  }

  // Direct token access
  const handleTokenLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tokenInput.trim()) {
      setError('Please enter an access token')
      return
    }
    
    setLoading(true)
    setError('')
    
    // Check for special test accounts
    const token = tokenInput.trim()
    
    // Land Sea Air test account
    if (token === 'lsa-test' || token === 'landseaair') {
      // Set test user cookie for Land Sea Air
      document.cookie = `apex_user_display=${encodeURIComponent(JSON.stringify({
        email: 'test@landseaair-nc.com',
        customerId: 'landseaair-nc.com',
        role: 'customer'
      }))}; path=/; max-age=86400`
      
      window.location.href = '/'
      return
    }
    
    // Standard test token
    if (token === '7885c5de63b9b75428cacee0731b80509590783da34b02dd3373276b75ef8e25') {
      // Set default test user
      document.cookie = `apex_user_display=${encodeURIComponent(JSON.stringify({
        email: 'test@ilminate.com',
        customerId: 'ilminate.com',
        role: 'admin'
      }))}; path=/; max-age=86400`
      
      window.location.href = '/'
      return
    }
    
    // Unknown token - redirect with token parameter for backward compatibility
    window.location.href = `/?k=${encodeURIComponent(token)}`
  }

  return (
    <Box className="login-container">
      {/* Animated background */}
      <div className="login-bg-animation">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
      </div>

      {/* Login Card */}
      <Card className="login-card" sx={{
        maxWidth: 480,
        width: '100%',
        position: 'relative',
        zIndex: 10,
        backgroundColor: '#1e293b',
        border: '2px solid #334155',
        borderRadius: 4,
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
      }}>
        <CardContent sx={{ p: 5 }}>
          {/* Logo and Branding */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Image 
              src="/ilminate-logo.png"
              alt="Ilminate Logo"
              width={120}
              height={120}
              priority
              style={{ 
                filter: 'drop-shadow(0 4px 20px rgba(0, 168, 168, 0.4))',
                marginBottom: '16px'
              }}
            />
            <Typography variant="h3" sx={{ 
              fontWeight: 700, 
              color: '#f1f5f9',
              mb: 1,
              fontSize: '2.5rem'
            }}>
              Ilminate <span style={{ color: '#00a8a8' }}>APEX</span>
            </Typography>
            <Typography variant="subtitle1" sx={{ 
              color: '#94a3b8',
              fontWeight: 500,
              mb: 0.5
            }}>
              Advanced Protection & Exposure Intelligence
            </Typography>
            <Box sx={{ 
              display: 'inline-block',
              px: 2,
              py: 0.5,
              bgcolor: 'rgba(0, 168, 168, 0.1)',
              border: '1px solid #00a8a8',
              borderRadius: '20px',
              mt: 1
            }}>
              <Typography variant="caption" sx={{ 
                color: '#00a8a8',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Secure Portal Access
              </Typography>
            </Box>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* SSO Login Buttons */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            {/* Google Login */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              onClick={() => handleSSOLogin('Google')}
              sx={{
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #00a8a8 0%, #007070 100%)',
                boxShadow: '0 4px 20px rgba(0, 168, 168, 0.3)',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  background: 'linear-gradient(135deg, #007070 0%, #005555 100%)',
                  boxShadow: '0 6px 25px rgba(0, 168, 168, 0.4)',
                  transform: 'translateY(-2px)'
                },
                '&:before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  transition: 'left 0.5s'
                },
                '&:hover:before': {
                  left: '100%'
                }
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                <>
                  <svg style={{ marginRight: '12px' }} width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign in with Google
                </>
              )}
            </Button>

            {/* Microsoft Login */}
            <Button
              fullWidth
              variant="outlined"
              size="large"
              disabled={loading}
              onClick={() => handleSSOLogin('AzureADv2')}
              sx={{
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderColor: '#0078d4',
                color: '#0078d4',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  borderColor: '#005a9e',
                  bgcolor: 'rgba(0, 120, 212, 0.05)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: '#0078d4' }} />
              ) : (
                <>
                  <svg style={{ marginRight: '12px' }} width="20" height="20" viewBox="0 0 24 24" fill="#0078d4">
                    <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"/>
                  </svg>
                  Sign in with Microsoft
                </>
              )}
            </Button>
          </Box>

          {/* Divider */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            my: 3,
            '&:before, &:after': {
              content: '""',
              flex: 1,
              height: '1px',
              backgroundColor: '#334155'
            }
          }}>
            <Typography sx={{ 
              px: 2, 
              color: '#64748b',
              fontSize: '0.875rem',
              fontWeight: 500
            }}>
              OR
            </Typography>
          </Box>

          {/* Token Access */}
          <form onSubmit={handleTokenLogin}>
            <Typography variant="body2" sx={{ 
              color: '#94a3b8', 
              mb: 1.5,
              fontWeight: 500
            }}>
              Direct Token Access
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter your access token"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              disabled={loading}
              sx={{
                mb: 2,
                '& .MuiInputBase-root': {
                  backgroundColor: '#0f172a',
                  color: '#f1f5f9',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem'
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#334155'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#00a8a8'
                },
                '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#00a8a8'
                }
              }}
            />
            <Button
              fullWidth
              type="submit"
              variant="outlined"
              disabled={loading || !tokenInput.trim()}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderColor: '#334155',
                color: '#94a3b8',
                '&:hover': {
                  borderColor: '#00a8a8',
                  color: '#00a8a8',
                  backgroundColor: 'rgba(0, 168, 168, 0.05)'
                }
              }}
            >
              Access with Token
            </Button>
          </form>

          {/* Footer Info */}
          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #334155' }}>
            <Typography variant="caption" sx={{ 
              color: '#64748b',
              display: 'block',
              textAlign: 'center',
              lineHeight: 1.6
            }}>
              🔒 Secured by AWS Cognito & Google OAuth<br/>
              For assistance, contact: <span style={{ color: '#00a8a8', fontWeight: 600 }}>support@ilminate.com</span>
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Footer */}
      <Box sx={{ 
        position: 'absolute',
        bottom: 20,
        textAlign: 'center',
        width: '100%',
        zIndex: 10
      }}>
        <Typography variant="caption" sx={{ color: '#475569' }}>
          © 2025 Ilminate. All rights reserved. | Privacy Policy | Terms of Service
        </Typography>
      </Box>
    </Box>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    }>
      <LoginContent />
    </Suspense>
  )
}

