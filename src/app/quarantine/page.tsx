'use client'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { 
  Box, 
  Typography, 
  Paper, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useTheme,
  CircularProgress,
  Alert,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Divider,
  Autocomplete,
  Tooltip,
  Stack
} from '@mui/material'
import Link from 'next/link'
import { 
  Close as CloseIcon,
  AttachFile as AttachFileIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HelpOutline as HelpOutlineIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Block as BlockIcon,
  Security as SecurityIcon,
  Link as LinkIcon,
  Code as CodeIcon,
  Description as DescriptionIcon
} from '@mui/icons-material'
import NavigationBar from '@/components/NavigationBar'
import { useIsMobile, getResponsivePadding } from '@/lib/mobileUtils'
import type { QuarantinedMessage } from '@/lib/mock'

/**
 * Get customer ID from cookies or Cognito token
 */
function useCustomerId(): string | null {
  const [customerId, setCustomerId] = useState<string | null>(null)
  
  useEffect(() => {
    // Method 1: Check apex_user_display cookie
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = decodeURIComponent(value)
      return acc
    }, {} as Record<string, string>)

    const userDisplay = cookies['apex_user_display']
    if (userDisplay) {
      try {
        const info = JSON.parse(userDisplay)
        if (info.customerId) {
          setCustomerId(info.customerId)
          return
        }
      } catch (e) {
        // Invalid cookie
      }
    }

    // Method 2: Extract from Cognito token
    const cognitoPrefix = 'CognitoIdentityServiceProvider.1uoiq3h1afgo6799gie48vmlcj'
    const idTokenCookie = Object.keys(cookies).find(key => 
      key.startsWith(cognitoPrefix) && key.endsWith('.idToken')
    )
    
    if (idTokenCookie && cookies[idTokenCookie]) {
      try {
        const token = cookies[idTokenCookie]
        const parts = token.split('.')
        if (parts.length === 3) {
          // Browser-compatible base64 decoding
          const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          )
          const payload = JSON.parse(jsonPayload)
          const email = payload.email || payload['cognito:username']
          
          if (email) {
            // Map admin emails to ilminate.com
            const adminEmails = [
              'cjfisher84@googlemail.com',
              'cfisher@ilminate.com',
              'admin@ilminate.com',
            ]
            
            const emailLower = email.toLowerCase()
            if (adminEmails.some(adminEmail => emailLower === adminEmail.toLowerCase())) {
              setCustomerId('ilminate.com')
              return
            }
            
            // Extract domain from email
            const emailParts = email.split('@')
            if (emailParts.length === 2) {
              setCustomerId(emailParts[1].toLowerCase())
            }
          }
        }
      } catch (e) {
        console.error('Failed to parse Cognito token:', e)
      }
    }
  }, [])
  
  return customerId
}

// Extended interface for enhanced features
interface EnhancedQuarantinedMessage extends QuarantinedMessage {
  // Additional fields that may come from API
  senderDomain?: string
  recipientDomain?: string
  messageSize?: number
  direction?: 'inbound' | 'outbound' | 'internal'
  classification?: 'phishing' | 'malware' | 'spam' | 'bec' | 'user-reported'
  dmarcResult?: 'pass' | 'fail' | 'none'
  spfResult?: 'pass' | 'fail' | 'none'
  dkimResult?: 'pass' | 'fail' | 'none'
  urls?: Array<{ url: string; verdict: 'clean' | 'suspicious' | 'malicious' }>
  attachmentHashes?: Array<{ name: string; sha256: string; verdict: 'clean' | 'suspicious' | 'malicious' }>
  aiIntentScore?: number
  relationshipScore?: number
  isVipTarget?: boolean
  policyMatches?: string[]
  whyQuarantined?: string // Plain English explanation
  rawHeaders?: string
  htmlBody?: string
  textBody?: string
}

export default function QuarantinePage() {
  const theme = useTheme()
  const isMobile = useIsMobile()
  const containerPadding = getResponsivePadding(isMobile)
  const customerId = useCustomerId()

  // State
  const [messages, setMessages] = useState<EnhancedQuarantinedMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<EnhancedQuarantinedMessage | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [previewTab, setPreviewTab] = useState(0) // 0=HTML, 1=Text, 2=Raw
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState('ALL')
  const [daysFilter, setDaysFilter] = useState('30')
  const [classificationFilter, setClassificationFilter] = useState('ALL')
  const [dispositionFilter, setDispositionFilter] = useState('quarantined')
  const [senderDomainFilter, setSenderDomainFilter] = useState('')
  const [showFilters, setShowFilters] = useState(!isMobile)

  // Fetch messages
  const fetchMessages = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (severityFilter !== 'ALL') params.append('severity', severityFilter)
      if (searchTerm) params.append('search', searchTerm)
      params.append('days', daysFilter)
      
      const headers: HeadersInit = {}
      if (customerId) {
        headers['x-customer-id'] = customerId
      }
      
      const res = await fetch(`/api/quarantine/list?${params.toString()}`, {
        headers
      })
      const data = await res.json()
      
      if (data.success) {
        // Enhance messages with computed fields
        const enhanced = data.data.map((msg: any) => {
          const senderEmail = msg.senderEmail || ''
          const recipient = msg.recipients?.[0] || ''
          
          return {
            ...msg,
            id: msg.messageId || msg.id,
            quarantineDate: msg.quarantineTimestamp ? new Date(msg.quarantineTimestamp) : new Date(),
            senderDomain: senderEmail.split('@')[1] || '',
            recipientDomain: recipient.split('@')[1] || '',
            // Generate "why quarantined" explanation from detection reasons
            whyQuarantined: generateWhyQuarantined(msg.detectionReasons || [], msg),
            // Default values for optional fields
            direction: 'inbound' as const,
            classification: inferClassification(msg.detectionReasons || []),
            dmarcResult: 'none' as const,
            spfResult: 'none' as const,
            dkimResult: 'none' as const,
            urls: [],
            attachmentHashes: [],
            aiIntentScore: msg.riskScore || 0,
            relationshipScore: 50,
            isVipTarget: false,
            policyMatches: msg.detectionReasons || [],
          }
        })
        setMessages(enhanced)
      }
    } catch (error) {
      console.error('Failed to fetch quarantine messages:', error)
    } finally {
      setLoading(false)
    }
  }

  // Generate plain-English explanation
  const generateWhyQuarantined = (reasons: string[], msg: any): string => {
    if (reasons.length === 0) {
      return `This email was quarantined due to a high risk score (${msg.riskScore || 0}/100).`
    }
    
    const reasonTexts: string[] = []
    
    if (reasons.some(r => r.toLowerCase().includes('impersonat'))) {
      reasonTexts.push('the sender is attempting to impersonate a known contact')
    }
    if (reasons.some(r => r.toLowerCase().includes('domain'))) {
      reasonTexts.push('the sender domain is suspicious or newly registered')
    }
    if (reasons.some(r => r.toLowerCase().includes('link') || r.toLowerCase().includes('url'))) {
      reasonTexts.push('the email contains suspicious links')
    }
    if (reasons.some(r => r.toLowerCase().includes('attachment'))) {
      reasonTexts.push('the email contains potentially dangerous attachments')
    }
    if (reasons.some(r => r.toLowerCase().includes('dmarc'))) {
      reasonTexts.push('DMARC authentication failed')
    }
    if (reasons.some(r => r.toLowerCase().includes('spf'))) {
      reasonTexts.push('SPF authentication failed')
    }
    if (reasons.some(r => r.toLowerCase().includes('dkim'))) {
      reasonTexts.push('DKIM authentication failed')
    }
    
    if (reasonTexts.length === 0) {
      return `This email was quarantined because: ${reasons.join(', ')}`
    }
    
    return `This email was quarantined because ${reasonTexts.join(', ')}.`
  }

  // Infer classification from detection reasons
  const inferClassification = (reasons: string[]): 'phishing' | 'malware' | 'spam' | 'bec' | 'user-reported' => {
    const reasonStr = reasons.join(' ').toLowerCase()
    if (reasonStr.includes('phish')) return 'phishing'
    if (reasonStr.includes('malware') || reasonStr.includes('virus')) return 'malware'
    if (reasonStr.includes('bec') || reasonStr.includes('impersonat')) return 'bec'
    if (reasonStr.includes('spam')) return 'spam'
    return 'phishing' // Default
  }

  // Initial load
  useEffect(() => {
    if (customerId) {
      fetchMessages()
    }
  }, [severityFilter, daysFilter, customerId])

  // Handle search with debounce
  useEffect(() => {
    if (!customerId) return
    
    const timer = setTimeout(() => {
      if (searchTerm !== undefined) {
        fetchMessages()
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm, customerId])

  // Filter messages based on all filters
  const filteredMessages = useMemo(() => {
    return messages.filter(msg => {
      // Classification filter
      if (classificationFilter !== 'ALL' && msg.classification !== classificationFilter) {
        return false
      }
      
      // Disposition filter
      if (dispositionFilter !== 'ALL' && msg.status !== dispositionFilter) {
        return false
      }
      
      // Sender domain filter
      if (senderDomainFilter && !msg.senderDomain?.toLowerCase().includes(senderDomainFilter.toLowerCase())) {
        return false
      }
      
      return true
    })
  }, [messages, classificationFilter, dispositionFilter, senderDomainFilter])

  // Toggle row expansion
  const toggleRowExpansion = (messageId: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      if (next.has(messageId)) {
        next.delete(messageId)
      } else {
        next.add(messageId)
      }
      return next
    })
  }

  // Selection helpers
  const toggleSelect = (messageId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(messageId)) {
        next.delete(messageId)
      } else {
        next.add(messageId)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredMessages.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredMessages.map(m => m.messageId)))
    }
  }

  // Bulk actions
  const handleBulkRelease = async () => {
    if (selectedIds.size === 0) return
    
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (customerId) {
        headers['x-customer-id'] = customerId
      }
      
      const res = await fetch('/api/quarantine/release', {
        method: 'POST',
        headers,
        body: JSON.stringify({ messageIds: Array.from(selectedIds) }),
      })
      
      if (res.ok) {
        await fetchMessages()
        setSelectedIds(new Set())
        alert(`Released ${selectedIds.size} message(s)`)
      }
    } catch (error) {
      console.error('Bulk release error:', error)
      alert('Failed to release messages')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Delete ${selectedIds.size} message(s)?`)) return
    
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (customerId) {
        headers['x-customer-id'] = customerId
      }
      
      const res = await fetch('/api/quarantine/delete', {
        method: 'POST',
        headers,
        body: JSON.stringify({ messageIds: Array.from(selectedIds) }),
      })
      
      if (res.ok) {
        await fetchMessages()
        setSelectedIds(new Set())
        alert(`Deleted ${selectedIds.size} message(s)`)
      }
    } catch (error) {
      console.error('Bulk delete error:', error)
      alert('Failed to delete messages')
    }
  }

  // Single message actions
  const handleRelease = async (message: EnhancedQuarantinedMessage) => {
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (customerId) {
        headers['x-customer-id'] = customerId
      }
      
      const res = await fetch('/api/quarantine/release', {
        method: 'POST',
        headers,
        body: JSON.stringify({ messageId: message.messageId }),
      })
      
      if (res.ok) {
        await fetchMessages()
        setDialogOpen(false)
        alert('Message released')
      }
    } catch (error) {
      console.error('Release error:', error)
      alert('Failed to release message')
    }
  }

  const handleDelete = async (message: EnhancedQuarantinedMessage) => {
    if (!confirm(`Delete "${message.subject}"?`)) return
    
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (customerId) {
        headers['x-customer-id'] = customerId
      }
      
      const res = await fetch('/api/quarantine/delete', {
        method: 'POST',
        headers,
        body: JSON.stringify({ messageId: message.messageId }),
      })
      
      if (res.ok) {
        await fetchMessages()
        setDialogOpen(false)
        alert('Message deleted')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete message')
    }
  }

  // View message details
  const handleViewMessage = (message: EnhancedQuarantinedMessage) => {
    setSelectedMessage(message)
    setDialogOpen(true)
  }

  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false)
    setTimeout(() => setSelectedMessage(null), 200)
  }

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return '#ef4444'
      case 'HIGH': return '#f97316'
      case 'MEDIUM': return '#eab308'
      case 'LOW': return '#22c55e'
      default: return theme.palette.text.secondary
    }
  }

  // Format date
  const formatDate = (date: Date | number) => {
    const d = date instanceof Date ? date : new Date(date)
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Extract domain from email
  const extractDomain = (email: string): string => {
    const match = email.match(/@(.+)/)
    return match ? match[1] : email
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: containerPadding }}>
      <Box sx={{ maxWidth: '1600px', mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'center',
          flexDirection: isMobile ? 'column' : 'row',
          mb: 3,
          gap: isMobile ? 2 : 0
        }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Quarantined Messages
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              View and manage messages that have been quarantined based on threat detection
            </Typography>
          </Box>
          <Link href="/" passHref legacyBehavior>
            <Button 
              variant="outlined" 
              component="a" 
              size={isMobile ? 'medium' : 'large'}
              color="primary"
              fullWidth={isMobile}
              sx={{ 
                px: isMobile ? 3 : 4,
                py: isMobile ? 1.2 : 1.5,
                fontSize: isMobile ? '1rem' : '1.1rem',
                fontWeight: 600
              }}
            >
              ← Dashboard
            </Button>
          </Link>
        </Box>

        {/* Navigation Bar */}
        <NavigationBar />

        <Box sx={{ display: 'flex', gap: 3, flexDirection: isMobile ? 'column' : 'row' }}>
          {/* Left Sidebar Filters */}
          {showFilters && (
            <Paper sx={{ 
              p: 2, 
              width: isMobile ? '100%' : 280,
              border: 1, 
              borderColor: 'divider',
              position: isMobile ? 'relative' : 'sticky',
              top: 20,
              maxHeight: isMobile ? 'none' : 'calc(100vh - 100px)',
              overflowY: 'auto'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                  Filters
                </Typography>
                {isMobile && (
                  <IconButton size="small" onClick={() => setShowFilters(false)}>
                    <CloseIcon />
                  </IconButton>
                )}
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Date Range */}
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                    Date Range
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={daysFilter}
                    onChange={(e) => setDaysFilter(e.target.value)}
                  >
                    <MenuItem value="1">Last 24 hours</MenuItem>
                    <MenuItem value="7">Last 7 days</MenuItem>
                    <MenuItem value="30">Last 30 days</MenuItem>
                    <MenuItem value="90">Last 90 days</MenuItem>
                    <MenuItem value="365">Last year</MenuItem>
                  </TextField>
                </Box>

                {/* Severity */}
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                    Threat Level
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                  >
                    <MenuItem value="ALL">All</MenuItem>
                    <MenuItem value="CRITICAL">Critical</MenuItem>
                    <MenuItem value="HIGH">High</MenuItem>
                    <MenuItem value="MEDIUM">Medium</MenuItem>
                    <MenuItem value="LOW">Low</MenuItem>
                  </TextField>
                </Box>

                {/* Classification */}
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                    Classification
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={classificationFilter}
                    onChange={(e) => setClassificationFilter(e.target.value)}
                  >
                    <MenuItem value="ALL">All</MenuItem>
                    <MenuItem value="phishing">Phishing</MenuItem>
                    <MenuItem value="malware">Malware</MenuItem>
                    <MenuItem value="spam">Spam</MenuItem>
                    <MenuItem value="bec">BEC</MenuItem>
                    <MenuItem value="user-reported">User Reported</MenuItem>
                  </TextField>
                </Box>

                {/* Disposition */}
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                    Status
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={dispositionFilter}
                    onChange={(e) => setDispositionFilter(e.target.value)}
                  >
                    <MenuItem value="quarantined">Quarantined</MenuItem>
                    <MenuItem value="released">Released</MenuItem>
                    <MenuItem value="deleted">Deleted</MenuItem>
                    <MenuItem value="ALL">All</MenuItem>
                  </TextField>
                </Box>

                {/* Sender Domain */}
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                    Sender Domain
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="e.g., gmail.com"
                    value={senderDomainFilter}
                    onChange={(e) => setSenderDomainFilter(e.target.value)}
                  />
                </Box>
              </Box>
            </Paper>
          )}

          {/* Main Content */}
          <Box sx={{ flex: 1 }}>
            {/* Global Search Bar */}
            <Paper sx={{ p: 2, mb: 2, border: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                {!showFilters && (
                  <IconButton 
                    onClick={() => setShowFilters(true)}
                    sx={{ color: 'primary.main' }}
                  >
                    <FilterIcon />
                  </IconButton>
                )}
                <TextField
                  fullWidth
                  placeholder="Search by sender, recipient, subject, domain, message ID, file name, IP, threat name, URL, SHA256..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  sx={{ flex: 1, minWidth: 300 }}
                />
                <Chip 
                  label={`${filteredMessages.length} message${filteredMessages.length === 1 ? '' : 's'}`}
                  sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'primary.contrastText',
                    fontWeight: 600
                  }}
                />
              </Box>
            </Paper>

            {/* Bulk Actions */}
            {selectedIds.size > 0 && (
              <Paper sx={{ p: 2, mb: 2, border: 1, borderColor: 'divider', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedIds.size} message{selectedIds.size === 1 ? '' : 's'} selected
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="secondary"
                      onClick={handleBulkRelease}
                      startIcon={<SendIcon />}
                    >
                      Release
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      sx={{ bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' } }}
                      onClick={handleBulkDelete}
                      startIcon={<DeleteIcon />}
                    >
                      Delete
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      sx={{ bgcolor: 'background.paper', color: 'text.primary' }}
                      startIcon={<DownloadIcon />}
                    >
                      Export CSV
                    </Button>
                  </Box>
                </Box>
              </Paper>
            )}

            {/* Messages Table */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : filteredMessages.length === 0 ? (
              <Alert severity="info">
                No quarantined messages found for the selected filters.
              </Alert>
            ) : (
              <TableContainer component={Paper} sx={{ border: 1, borderColor: 'divider' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'background.default' }}>
                      <TableCell padding="checkbox" sx={{ width: 48 }}>
                        <Checkbox
                          checked={selectedIds.size === filteredMessages.length && filteredMessages.length > 0}
                          indeterminate={selectedIds.size > 0 && selectedIds.size < filteredMessages.length}
                          onChange={toggleSelectAll}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', width: 60 }}>
                        Risk
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        Sender
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        Recipient
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        Subject
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        Classification
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        Reason
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        Date/Time
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', width: 120 }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredMessages.map((message) => {
                      const isExpanded = expandedRows.has(message.messageId)
                      const isSelected = selectedIds.has(message.messageId)
                      const recipient = message.recipients?.[0] || 'Unknown'

                      return (
                        <>
                          <TableRow 
                            key={message.messageId}
                            sx={{ 
                              '&:hover': { bgcolor: 'background.default' },
                              cursor: 'pointer',
                              bgcolor: isSelected ? 'action.selected' : 'transparent'
                            }}
                            onClick={() => toggleRowExpansion(message.messageId)}
                          >
                            <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={isSelected}
                                onChange={() => toggleSelect(message.messageId)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                  sx={{
                                    width: 4,
                                    height: 32,
                                    bgcolor: getSeverityColor(message.severity),
                                    borderRadius: 1
                                  }}
                                />
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                  {message.severity}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {message.sender}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                  {extractDomain(message.senderEmail)}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {recipient}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                  {extractDomain(recipient)}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {message.hasAttachments && (
                                  <AttachFileIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                )}
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    maxWidth: 300,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {message.subject}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={message.classification || 'phishing'}
                                size="small"
                                sx={{
                                  bgcolor: 'background.paper',
                                  border: 1,
                                  borderColor: 'divider',
                                  fontSize: '0.7rem'
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" sx={{ 
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}>
                                {message.detectionReasons?.slice(0, 2).join(', ') || 'No reason'}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.875rem' }}>
                              {formatDate(message.quarantineDate)}
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                  onClick={() => handleViewMessage(message)}
                                  sx={{ minWidth: 'auto', px: 1 }}
                                >
                                  View
                                </Button>
                                <IconButton
                                  size="small"
                                  onClick={() => toggleRowExpansion(message.messageId)}
                                >
                                  {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                          
                          {/* Expanded Row Details */}
                          {isExpanded && (
                            <TableRow>
                              <TableCell colSpan={9} sx={{ py: 2, bgcolor: 'background.paper' }}>
                                <Box sx={{ pl: 4 }}>
                                  {/* Why Quarantined */}
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                                      Why This Email Was Quarantined
                                    </Typography>
                                    <Paper sx={{ p: 2, bgcolor: 'background.default', border: 1, borderColor: 'divider' }}>
                                      <Typography variant="body2">
                                        {message.whyQuarantined || 'This email was quarantined based on threat detection analysis.'}
                                      </Typography>
                                    </Paper>
                                  </Box>

                                  {/* Quick Actions */}
                                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="primary"
                                      startIcon={<SendIcon />}
                                      onClick={() => handleRelease(message)}
                                    >
                                      Release
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="error"
                                      startIcon={<DeleteIcon />}
                                      onClick={() => handleDelete(message)}
                                    >
                                      Delete
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      startIcon={<BlockIcon />}
                                    >
                                      Block Sender
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      startIcon={<DownloadIcon />}
                                    >
                                      Download
                                    </Button>
                                  </Box>

                                  {/* Detection Reasons */}
                                  {message.detectionReasons && message.detectionReasons.length > 0 && (
                                    <Box sx={{ mb: 2 }}>
                                      <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                                        Detection Reasons
                                      </Typography>
                                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {message.detectionReasons.map((reason, idx) => (
                                          <Chip
                                            key={idx}
                                            label={reason}
                                            size="small"
                                            sx={{ fontSize: '0.7rem' }}
                                          />
                                        ))}
                                      </Box>
                                    </Box>
                                  )}
                                </Box>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Box>

        {/* Enhanced Message Detail Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="lg"
          fullWidth
          fullScreen={isMobile}
        >
          {selectedMessage && (
            <>
              <DialogTitle sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderBottom: 2,
                borderColor: 'primary.main',
                pb: 2
              }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {selectedMessage.subject}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={`${selectedMessage.severity} - ${selectedMessage.riskScore}/100`}
                      size="small"
                      sx={{
                        bgcolor: getSeverityColor(selectedMessage.severity),
                        color: 'white',
                        fontWeight: 700
                      }}
                    />
                    <Chip
                      label={selectedMessage.classification || 'phishing'}
                      size="small"
                    />
                    {selectedMessage.isVipTarget && (
                      <Chip
                        label="VIP Target"
                        size="small"
                        sx={{ bgcolor: 'error.main', color: 'white' }}
                      />
                    )}
                  </Box>
                </Box>
                <IconButton onClick={handleCloseDialog}>
                  <CloseIcon />
                </IconButton>
              </DialogTitle>

              <DialogContent sx={{ pt: 3 }}>
                {/* Why Quarantined - Most Important */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                    Why This Email Was Quarantined
                  </Typography>
                  <Paper sx={{ 
                    p: 2.5, 
                    bgcolor: 'background.default', 
                    border: 2,
                    borderColor: 'primary.main',
                    borderRadius: 2
                  }}>
                    <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                      {selectedMessage.whyQuarantined || 'This email was quarantined based on threat detection analysis.'}
                    </Typography>
                  </Paper>
                </Box>

                {/* Message Information */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    Message Information
                  </Typography>
                  <Box sx={{ mt: 1, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>From:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {selectedMessage.sender} &lt;{selectedMessage.senderEmail}&gt;
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Domain: {selectedMessage.senderDomain || extractDomain(selectedMessage.senderEmail)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>To:</Typography>
                      <Typography variant="body1">
                        {selectedMessage.recipients?.join(', ') || 'Unknown'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Subject:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {selectedMessage.subject}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Quarantined:</Typography>
                      <Typography variant="body2">
                        {formatDate(selectedMessage.quarantineDate)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Message ID:</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {selectedMessage.messageId}
                      </Typography>
                    </Box>
                    {selectedMessage.messageSize && (
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Size:</Typography>
                        <Typography variant="body2">
                          {(selectedMessage.messageSize / 1024).toFixed(1)} KB
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Technical Details Accordion */}
                <Accordion sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Technical Details
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                      {/* Authentication Results */}
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                          Authentication
                        </Typography>
                        <Stack spacing={1}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption">SPF:</Typography>
                            <Chip
                              label={selectedMessage.spfResult || 'none'}
                              size="small"
                              sx={{
                                bgcolor: selectedMessage.spfResult === 'pass' ? 'success.main' : 
                                         selectedMessage.spfResult === 'fail' ? 'error.main' : 'grey.700',
                                color: 'white',
                                fontSize: '0.7rem'
                              }}
                            />
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption">DKIM:</Typography>
                            <Chip
                              label={selectedMessage.dkimResult || 'none'}
                              size="small"
                              sx={{
                                bgcolor: selectedMessage.dkimResult === 'pass' ? 'success.main' : 
                                         selectedMessage.dkimResult === 'fail' ? 'error.main' : 'grey.700',
                                color: 'white',
                                fontSize: '0.7rem'
                              }}
                            />
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption">DMARC:</Typography>
                            <Chip
                              label={selectedMessage.dmarcResult || 'none'}
                              size="small"
                              sx={{
                                bgcolor: selectedMessage.dmarcResult === 'pass' ? 'success.main' : 
                                         selectedMessage.dmarcResult === 'fail' ? 'error.main' : 'grey.700',
                                color: 'white',
                                fontSize: '0.7rem'
                              }}
                            />
                          </Box>
                        </Stack>
                      </Box>

                      {/* AI Scores */}
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                          AI Analysis
                        </Typography>
                        <Stack spacing={1}>
                          <Box>
                            <Typography variant="caption">Phishing Intent:</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ flex: 1, height: 8, bgcolor: 'background.paper', borderRadius: 1, overflow: 'hidden' }}>
                                <Box sx={{ 
                                  height: '100%', 
                                  width: `${selectedMessage.aiIntentScore || 0}%`,
                                  bgcolor: selectedMessage.aiIntentScore && selectedMessage.aiIntentScore > 70 ? 'error.main' : 
                                           selectedMessage.aiIntentScore && selectedMessage.aiIntentScore > 40 ? 'warning.main' : 'success.main'
                                }} />
                              </Box>
                              <Typography variant="caption">{selectedMessage.aiIntentScore || 0}/100</Typography>
                            </Box>
                          </Box>
                          <Box>
                            <Typography variant="caption">Relationship Score:</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ flex: 1, height: 8, bgcolor: 'background.paper', borderRadius: 1, overflow: 'hidden' }}>
                                <Box sx={{ 
                                  height: '100%', 
                                  width: `${selectedMessage.relationshipScore || 50}%`,
                                  bgcolor: selectedMessage.relationshipScore && selectedMessage.relationshipScore < 30 ? 'error.main' : 
                                           selectedMessage.relationshipScore && selectedMessage.relationshipScore < 60 ? 'warning.main' : 'success.main'
                                }} />
                              </Box>
                              <Typography variant="caption">{selectedMessage.relationshipScore || 50}/100</Typography>
                            </Box>
                          </Box>
                        </Stack>
                      </Box>

                      {/* Policy Matches */}
                      {selectedMessage.policyMatches && selectedMessage.policyMatches.length > 0 && (
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                            Policy Matches
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selectedMessage.policyMatches.map((policy, idx) => (
                              <Chip
                                key={idx}
                                label={policy}
                                size="small"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </AccordionDetails>
                </Accordion>

                {/* Detection Reasons */}
                {selectedMessage.detectionReasons && selectedMessage.detectionReasons.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      Detection Reasons
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {selectedMessage.detectionReasons.map((reason, index) => (
                        <Box 
                          key={index}
                          sx={{ 
                            p: 1.5, 
                            bgcolor: 'background.default', 
                            borderRadius: 2,
                            border: 1,
                            borderColor: 'divider'
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            • {reason}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* URLs */}
                {selectedMessage.urls && selectedMessage.urls.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      URLs in Message ({selectedMessage.urls.length})
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {selectedMessage.urls.map((urlItem, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            p: 1.5,
                            bgcolor: 'background.default',
                            borderRadius: 1,
                            border: 1,
                            borderColor: 'divider',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all' }}>
                            {urlItem.url}
                          </Typography>
                          <Chip
                            label={urlItem.verdict}
                            size="small"
                            sx={{
                              bgcolor: urlItem.verdict === 'malicious' ? 'error.main' :
                                       urlItem.verdict === 'suspicious' ? 'warning.main' : 'success.main',
                              color: 'white',
                              fontSize: '0.7rem'
                            }}
                          />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Email Preview Tabs */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, mb: 1, display: 'block' }}>
                    Email Preview
                  </Typography>
                  <Tabs value={previewTab} onChange={(_, v) => setPreviewTab(v)} sx={{ mb: 2 }}>
                    <Tab label="HTML" icon={<DescriptionIcon />} iconPosition="start" />
                    <Tab label="Plain Text" icon={<CodeIcon />} iconPosition="start" />
                    <Tab label="Raw Source" icon={<CodeIcon />} iconPosition="start" />
                  </Tabs>
                  <Paper sx={{ 
                    p: 2, 
                    bgcolor: 'background.default',
                    border: 1,
                    borderColor: 'divider',
                    minHeight: 200,
                    maxHeight: 400,
                    overflow: 'auto'
                  }}>
                    {previewTab === 0 && (
                      <Box
                        dangerouslySetInnerHTML={{ __html: selectedMessage.htmlBody || selectedMessage.bodyPreview || 'No HTML content available' }}
                        sx={{
                          '& img': { display: 'none' }, // Block remote images
                          '& a': { color: 'primary.main' }
                        }}
                      />
                    )}
                    {previewTab === 1 && (
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                        {selectedMessage.textBody || selectedMessage.bodyPreview || 'No plain text content available'}
                      </Typography>
                    )}
                    {previewTab === 2 && (
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {selectedMessage.rawHeaders || 'No raw headers available'}
                      </Typography>
                    )}
                  </Paper>
                </Box>

                {/* Attachments */}
                {selectedMessage.hasAttachments && selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      Attachments ({selectedMessage.attachments.length})
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {selectedMessage.attachments.map((attachment, index) => {
                        const hash = selectedMessage.attachmentHashes?.[index]
                        return (
                          <Box 
                            key={index}
                            sx={{ 
                              p: 1.5, 
                              bgcolor: 'background.default', 
                              borderRadius: 2,
                              border: 1,
                              borderColor: 'divider',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            }}
                          >
                            <AttachFileIcon sx={{ color: 'primary.main' }} />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {attachment.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {(attachment.size / 1024).toFixed(1)} KB • {attachment.contentType}
                              </Typography>
                              {hash && (
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace', display: 'block' }}>
                                  SHA256: {hash.sha256}
                                </Typography>
                              )}
                            </Box>
                            {hash && (
                              <Chip
                                label={hash.verdict}
                                size="small"
                                sx={{
                                  bgcolor: hash.verdict === 'malicious' ? 'error.main' :
                                           hash.verdict === 'suspicious' ? 'warning.main' : 'success.main',
                                  color: 'white',
                                  fontWeight: 700
                                }}
                              />
                            )}
                            {attachment.name.match(/\.(exe|bat|cmd|scr|vbs|js)$/i) && (
                              <Chip 
                                label="DANGEROUS" 
                                size="small" 
                                sx={{ bgcolor: '#ef4444', color: 'white', fontWeight: 700 }}
                              />
                            )}
                          </Box>
                        )
                      })}
                    </Box>
                  </Box>
                )}
              </DialogContent>

              <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider', flexWrap: 'wrap', gap: 1 }}>
                <Button onClick={handleCloseDialog}>
                  Close
                </Button>
                <Button 
                  variant="outlined"
                  startIcon={<BlockIcon />}
                >
                  Block Sender
                </Button>
                <Button 
                  variant="outlined"
                  startIcon={<BlockIcon />}
                >
                  Block Domain
                </Button>
                <Button 
                  variant="outlined" 
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDelete(selectedMessage)}
                >
                  Delete
                </Button>
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<SendIcon />}
                  onClick={() => handleRelease(selectedMessage)}
                >
                  Release to Recipient
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </Box>
  )
}

