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
    // Try to get user info from the display cookie
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = decodeURIComponent(value)
      return acc
    }, {} as Record<string, string>)

    console.log('UserProfile: Looking for apex_user_display cookie')

    // Look for the user display cookie
    const displayCookie = cookies['apex_user_display']

    if (displayCookie) {
      try {
        const info = JSON.parse(displayCookie)
        console.log('UserProfile: Loaded user info:', info)
        
        setUserInfo({
          email: info.email || 'Unknown User',
          customerId: info.customerId || 'Unknown',
          role: info.role || 'user'
        })
      } catch (err) {
        console.error('UserProfile: Failed to parse user display cookie:', err)
      }
    } else {
      console.warn('UserProfile: No apex_user_display cookie found - user may not be logged in via OAuth')
    }
  }, [])

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
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

  // Fallback: Show simple logout button if we can't load user info
  if (!userInfo) {
    return (
      <Link href="/api/auth/logout" passHref legacyBehavior>
        <Button 
          variant="outlined" 
          component="a"
          sx={{ 
            borderColor: 'primary.main',
            color: 'primary.main',
            px: 3,
            py: 1.2,
            fontSize: '1rem',
            fontWeight: 600,
            '&:hover': { 
              borderColor: '#005555',
              bgcolor: 'rgba(0, 112, 112, 0.05)'
            }
          }}
        >
          Logout
        </Button>
      </Link>
    )
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

        {/* Quick Actions */}
        <Link href="/" passHref style={{ textDecoration: 'none', color: 'inherit' }}>
          <MenuItem
            onClick={handleClose}
            sx={{
              py: 1.5,
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <Box sx={{ mr: 2, fontSize: '1.2rem' }}>🏠</Box>
            <Typography variant="body2">Dashboard</Typography>
          </MenuItem>
        </Link>

        <Link href="/triage" passHref style={{ textDecoration: 'none', color: 'inherit' }}>
          <MenuItem
            onClick={handleClose}
            sx={{
              py: 1.5,
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <Box sx={{ mr: 2, fontSize: '1.2rem' }}>🔍</Box>
            <Typography variant="body2">AI Triage</Typography>
          </MenuItem>
        </Link>

        <Link href="/investigations" passHref style={{ textDecoration: 'none', color: 'inherit' }}>
          <MenuItem
            onClick={handleClose}
            sx={{
              py: 1.5,
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <Box sx={{ mr: 2, fontSize: '1.2rem' }}>🕵️</Box>
            <Typography variant="body2">Investigations</Typography>
          </MenuItem>
        </Link>

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

