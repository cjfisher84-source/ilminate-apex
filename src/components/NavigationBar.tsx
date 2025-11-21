'use client'

import { Box, Button } from '@mui/material'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useIsMobile } from '@/lib/mobileUtils'
import { useEffect, useState } from 'react'

export default function NavigationBar() {
  const isMobile = useIsMobile()
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check if user is admin
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = decodeURIComponent(value)
      return acc
    }, {} as Record<string, string>)

    const userDisplay = cookies['apex_user_display']
    if (userDisplay) {
      try {
        const info = JSON.parse(userDisplay)
        const adminEmails = ['cfisher@ilminate.com', 'admin@ilminate.com']
        setIsAdmin(adminEmails.some(email => 
          info.email?.toLowerCase() === email.toLowerCase()
        ))
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, [])

  const navItems = [
    {
      href: '/investigations',
      label: '🔍 Investigations',
      title: 'Deep dive into active and recent security campaigns with timeline analysis'
    },
    {
      href: '/apex-trace',
      label: '🔎 APEX Trace',
      title: 'Super fast message search across email data with advanced filtering'
    },
    {
      href: '/triage',
      label: '⚡ Triage',
      title: 'AI-powered threat analysis and classification for suspicious emails'
    },
    {
      href: '/quarantine',
      label: '🛡️ Quarantine',
      title: 'Review and manage messages held for security review'
    },
    {
      href: '/mailvault',
      label: '🔐 MailVault',
      title: 'Search and retrieve delivered messages from user mailboxes'
    },
    {
      href: '/harborsim',
      label: '📧 HarborSim',
      title: 'Email security training platform with phishing simulation templates'
    },
    {
      href: '/reports/attack',
      label: '🎯 MITRE ATT&CK',
      title: 'View security events mapped to ATT&CK techniques for threat intelligence'
    }
  ]

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/')
  }

  return (
    <Box sx={{ 
      display: 'flex',
      flexWrap: 'wrap',
      gap: isMobile ? 1 : 2,
      justifyContent: 'space-around',
      mb: 3,
      p: isMobile ? 2 : 3,
      bgcolor: 'background.paper',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2
    }}>
      {navItems.map((item) => {
        const active = isActive(item.href)
        
        return (
          <Link key={item.href} href={item.href} passHref legacyBehavior>
            <Button
              component="a"
              variant={active ? 'contained' : 'text'}
              title={item.title}
              sx={{ 
                color: active ? 'white' : 'text.secondary',
                fontSize: isMobile ? '0.9rem' : '1.2rem',
                fontWeight: 600,
                bgcolor: active ? 'primary.main' : 'transparent',
                minWidth: isMobile ? 'auto' : '140px',
                px: isMobile ? 2 : 3,
                py: isMobile ? 1 : 1.5,
                '&:hover': { 
                  color: active ? 'white' : 'primary.main',
                  bgcolor: active ? '#005555' : 'rgba(0, 168, 168, 0.08)'
                }
              }}
            >
              {item.label}
            </Button>
          </Link>
        )
      })}
    </Box>
  )
}

