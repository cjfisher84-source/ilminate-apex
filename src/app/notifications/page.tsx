'use client'

import { useState, useEffect } from 'react'
import { Box, Typography, Card, CardContent, Button, Chip, Badge, IconButton } from '@mui/material'
import Link from 'next/link'
import Image from 'next/image'
import { useIsMobile, getResponsivePadding, getResponsiveSpacing, getResponsiveFontSize, getResponsiveImageSize } from '@/lib/mobileUtils'

const UNCW_TEAL = '#007070'

interface Notification {
  id: string
  type: 'security' | 'system' | 'alert' | 'info'
  title: string
  message: string
  timestamp: string
  read: boolean
  severity?: 'critical' | 'high' | 'medium' | 'low'
}

// Mock notifications - replace with API call later
const mockNotifications = (): Notification[] => [
  {
    id: 'notif-1',
    type: 'alert',
    title: 'Critical Threat Detected',
    message: 'New BEC campaign targeting executives detected. 5 users potentially compromised.',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    read: false,
    severity: 'critical'
  },
  {
    id: 'notif-2',
    type: 'security',
    title: 'Phishing Campaign Blocked',
    message: '234 malicious emails automatically quarantined in the last hour.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    severity: 'high'
  },
  {
    id: 'notif-3',
    type: 'system',
    title: 'Weekly Security Report Ready',
    message: 'Your weekly threat intelligence summary is now available for review.',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    read: true,
    severity: 'low'
  },
  {
    id: 'notif-4',
    type: 'info',
    title: 'New MITRE Techniques Detected',
    message: 'ATT&CK mapper identified 3 new techniques in recent threats.',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    read: true,
    severity: 'medium'
  },
  {
    id: 'notif-5',
    type: 'security',
    title: 'User Reported Suspicious Email',
    message: '2 users reported potentially malicious emails for AI triage analysis.',
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    read: true,
    severity: 'medium'
  }
]

export default function NotificationsPage() {
  const isMobile = useIsMobile()
  const [notifications, setNotifications] = useState<Notification[]>([])
  
  const containerPadding = getResponsivePadding(isMobile)
  const headerGap = getResponsiveSpacing(isMobile, 2, 3)
  const logoSize = getResponsiveImageSize(isMobile, 100)

  useEffect(() => {
    setNotifications(mockNotifications())
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'security': return '🔒'
      case 'alert': return '⚠️'
      case 'system': return '⚙️'
      case 'info': return 'ℹ️'
      default: return '📢'
    }
  }

  const getSeverityColor = (severity?: string) => {
    switch(severity) {
      case 'critical': return '#ef4444'
      case 'high': return '#f97316'
      case 'medium': return '#FFD700'
      case 'low': return '#10b981'
      default: return '#94a3b8'
    }
  }

  const getTimeAgo = (timestamp: string) => {
    const now = Date.now()
    const then = new Date(timestamp).getTime()
    const diff = now - then
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: containerPadding }}>
      <Box sx={{ maxWidth: '1000px', mx: 'auto' }}>
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
                  fontSize: getResponsiveFontSize(isMobile, 'h3'),
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                Notifications 
                {unreadCount > 0 && (
                  <Badge 
                    badgeContent={unreadCount} 
                    sx={{ 
                      '& .MuiBadge-badge': { 
                        bgcolor: '#ef4444', 
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: 700,
                        minWidth: '32px',
                        height: '32px',
                        borderRadius: '16px'
                      } 
                    }}
                  >
                    <Box sx={{ width: 24 }} />
                  </Badge>
                )}
              </Typography>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: 'text.secondary', 
                  fontWeight: 500,
                  fontSize: getResponsiveFontSize(isMobile, 'subtitle1')
                }}
              >
                Security alerts and system updates
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {unreadCount > 0 && (
              <Button 
                variant="outlined" 
                size={isMobile ? 'medium' : 'large'}
                onClick={markAllAsRead}
                sx={{ 
                  borderColor: UNCW_TEAL,
                  color: UNCW_TEAL,
                  fontWeight: 600,
                  '&:hover': { 
                    borderColor: '#005555',
                    bgcolor: 'rgba(0, 112, 112, 0.05)'
                  }
                }}
              >
                Mark All Read
              </Button>
            )}
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
          </Box>
        </Box>

        {/* Notifications List */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {notifications.map((notif) => (
            <Card 
              key={notif.id} 
              sx={{ 
                bgcolor: notif.read ? 'background.paper' : 'rgba(0, 168, 168, 0.05)', 
                border: '2px solid', 
                borderColor: notif.read ? 'divider' : 'primary.main',
                boxShadow: notif.read ? 1 : 3,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)'
                }
              }}
              onClick={() => !notif.read && markAsRead(notif.id)}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    <Typography sx={{ fontSize: '1.5rem' }}>
                      {getTypeIcon(notif.type)}
                    </Typography>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          {notif.title}
                        </Typography>
                        {!notif.read && (
                          <Chip 
                            label="NEW" 
                            size="small"
                            sx={{ 
                              bgcolor: '#ef4444', 
                              color: 'white', 
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              height: 20
                            }} 
                          />
                        )}
                        {notif.severity && (
                          <Chip 
                            label={notif.severity.toUpperCase()} 
                            size="small"
                            sx={{ 
                              bgcolor: getSeverityColor(notif.severity), 
                              color: 'white', 
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              height: 20
                            }} 
                          />
                        )}
                      </Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                        {notif.message}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                        🕐 {getTimeAgo(notif.timestamp)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}

          {notifications.length === 0 && (
            <Card sx={{ bgcolor: 'background.paper', border: '2px solid', borderColor: 'divider', boxShadow: 2 }}>
              <CardContent sx={{ p: 6, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                  📭 No Notifications
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  You're all caught up! Check back later for updates.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  )
}

