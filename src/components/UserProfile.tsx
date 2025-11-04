'use client'

import { useState, useEffect } from 'react'
import { Box, Button, Menu, MenuItem, Typography, Avatar, Divider, Chip } from '@mui/material'
import Link from 'next/link'

interface UserInfo {
  email: string
  customerId: string
  role: string
}

export default function UserProfile() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const open = Boolean(anchorEl)

  useEffect(() => {
    // Try to get user info from cookies
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)

    // Look for Cognito ID token cookie
    const idTokenKey = Object.keys(cookies).find(key => 
      key.includes('CognitoIdentityServiceProvider') && key.endsWith('.idToken')
    )

    if (idTokenKey) {
      try {
        const token = cookies[idTokenKey]
        const payload = parseJWT(token)
        
        setUserInfo({
          email: payload?.email || payload?.['cognito:username'] || 'Unknown User',
          customerId: extractDomain(payload?.email || ''),
          role: payload?.['custom:role'] || 'User'
        })
      } catch (err) {
        console.error('Failed to parse user info:', err)
      }
    }
  }, [])

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const parseJWT = (token: string): any => {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) return null
      const payload = parts[1]
      const decoded = atob(payload)
      return JSON.parse(decoded)
    } catch {
      return null
    }
  }

  const extractDomain = (email: string): string => {
    const parts = email.split('@')
    return parts.length === 2 ? parts[1] : 'Unknown'
  }

  const getInitials = (email: string): string => {
    if (!email) return '?'
    const parts = email.split('@')[0].split('.')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return email[0].toUpperCase()
  }

  const getRoleColor = (role: string): string => {
    if (role === 'admin') return '#00a8a8'
    return '#94a3b8'
  }

  if (!userInfo) {
    return null
  }

  return (
    <>
      <Button
        onClick={handleClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1,
          borderRadius: 2,
          textTransform: 'none',
          bgcolor: 'rgba(0, 112, 112, 0.05)',
          border: '1px solid',
          borderColor: 'primary.main',
          '&:hover': {
            bgcolor: 'rgba(0, 112, 112, 0.1)',
          }
        }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: 'primary.main',
            fontSize: '0.875rem',
            fontWeight: 700
          }}
        >
          {getInitials(userInfo.email)}
        </Avatar>
        <Box sx={{ textAlign: 'left', display: { xs: 'none', md: 'block' } }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              lineHeight: 1.2
            }}
          >
            {userInfo.email.split('@')[0]}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.7rem'
            }}
          >
            {userInfo.customerId}
          </Typography>
        </Box>
        <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>▼</Box>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 280,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
          }
        }}
      >
        {/* User Info Header */}
        <Box sx={{ px: 2, py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: 'primary.main',
                fontSize: '1.25rem',
                fontWeight: 700
              }}
            >
              {getInitials(userInfo.email)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {userInfo.email}
              </Typography>
              <Chip
                label={userInfo.role}
                size="small"
                sx={{
                  mt: 0.5,
                  height: 20,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  bgcolor: getRoleColor(userInfo.role),
                  color: 'white'
                }}
              />
            </Box>
          </Box>
          <Box
            sx={{
              mt: 1.5,
              p: 1.5,
              bgcolor: 'background.default',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
              Environment
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
              {userInfo.customerId}
            </Typography>
          </Box>
        </Box>

        <Divider />

        {/* Menu Items */}
        <MenuItem
          onClick={handleClose}
          sx={{
            py: 1.5,
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <Box sx={{ mr: 2, fontSize: '1.2rem' }}>👤</Box>
          <Typography variant="body2">Account Settings</Typography>
        </MenuItem>

        <MenuItem
          onClick={handleClose}
          sx={{
            py: 1.5,
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <Box sx={{ mr: 2, fontSize: '1.2rem' }}>🔔</Box>
          <Typography variant="body2">Notifications</Typography>
        </MenuItem>

        <Divider />

        <Link href="/api/auth/logout" passHref style={{ textDecoration: 'none' }}>
          <MenuItem
            sx={{
              py: 1.5,
              color: '#ef4444',
              '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' }
            }}
          >
            <Box sx={{ mr: 2, fontSize: '1.2rem' }}>🚪</Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Logout
            </Typography>
          </MenuItem>
        </Link>
      </Menu>
    </>
  )
}

