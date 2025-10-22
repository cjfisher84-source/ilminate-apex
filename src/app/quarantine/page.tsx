'use client'
import { useState, useEffect } from 'react'
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
  Alert
} from '@mui/material'
import Link from 'next/link'
import { 
  Close as CloseIcon,
  AttachFile as AttachFileIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material'
import { useIsMobile, getResponsivePadding } from '@/lib/mobileUtils'
import type { QuarantinedMessage } from '@/lib/mock'

export default function QuarantinePage() {
  const theme = useTheme()
  const isMobile = useIsMobile()
  const containerPadding = getResponsivePadding(isMobile)

  // State
  const [messages, setMessages] = useState<QuarantinedMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<QuarantinedMessage | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState('ALL')
  const [daysFilter, setDaysFilter] = useState('30')

  // Fetch messages
  const fetchMessages = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (severityFilter !== 'ALL') params.append('severity', severityFilter)
      if (searchTerm) params.append('search', searchTerm)
      params.append('days', daysFilter)
      
      const res = await fetch(`/api/quarantine/list?${params.toString()}`)
      const data = await res.json()
      
      if (data.success) {
        setMessages(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch quarantine messages:', error)
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchMessages()
  }, [severityFilter, daysFilter])

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== undefined) {
        fetchMessages()
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // View message details
  const handleViewMessage = (message: QuarantinedMessage) => {
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
  const formatDate = (date: Date) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: containerPadding }}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
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

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3, border: 1, borderColor: 'divider' }}>
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            {/* Search */}
            <TextField
              placeholder="Search subject, sender..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ minWidth: isMobile ? '100%' : 300 }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />

            {/* Severity Filter */}
            <TextField
              select
              label="Severity"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="ALL">All Severities</MenuItem>
              <MenuItem value="CRITICAL">Critical</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="LOW">Low</MenuItem>
            </TextField>

            {/* Days Filter */}
            <TextField
              select
              label="Time Range"
              value={daysFilter}
              onChange={(e) => setDaysFilter(e.target.value)}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="7">Last 7 days</MenuItem>
              <MenuItem value="30">Last 30 days</MenuItem>
              <MenuItem value="90">Last 90 days</MenuItem>
            </TextField>

            {/* Results Count */}
            <Box sx={{ ml: 'auto' }}>
              <Chip 
                label={`${messages.length} messages`}
                sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'primary.contrastText',
                  fontWeight: 600
                }}
              />
            </Box>
          </Box>
        </Paper>

        {/* Messages Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : messages.length === 0 ? (
          <Alert severity="info">
            No quarantined messages found for the selected filters.
          </Alert>
        ) : (
          <TableContainer component={Paper} sx={{ border: 1, borderColor: 'divider' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Severity
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Date
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Sender
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Subject
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Risk
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {messages.map((message) => (
                  <TableRow 
                    key={message.id}
                    sx={{ 
                      '&:hover': { bgcolor: 'background.default' },
                      cursor: 'pointer'
                    }}
                    onClick={() => handleViewMessage(message)}
                  >
                    <TableCell>
                      <Chip
                        label={message.severity}
                        size="small"
                        sx={{
                          bgcolor: getSeverityColor(message.severity),
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.7rem'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>
                      {formatDate(message.quarantineDate)}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {message.sender}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {message.senderEmail}
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
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 700,
                          color: getSeverityColor(message.severity)
                        }}
                      >
                        {message.riskScore}/100
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewMessage(message)
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Message Detail Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="md"
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
                borderColor: 'primary.main'
              }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Quarantined Message Detail
                  </Typography>
                  <Chip
                    label={`${selectedMessage.severity} - ${selectedMessage.riskScore}/100`}
                    size="small"
                    sx={{
                      mt: 1,
                      bgcolor: getSeverityColor(selectedMessage.severity),
                      color: 'white',
                      fontWeight: 700
                    }}
                  />
                </Box>
                <IconButton onClick={handleCloseDialog}>
                  <CloseIcon />
                </IconButton>
              </DialogTitle>

              <DialogContent sx={{ pt: 3 }}>
                {/* Message Info */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    Message Information
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>From:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {selectedMessage.sender} &lt;{selectedMessage.senderEmail}&gt;
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>To:</Typography>
                      <Typography variant="body2">
                        {selectedMessage.recipients.join(', ')}
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
                        {new Date(selectedMessage.quarantineDate).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Threat Indicators */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    Threat Indicators
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

                {/* Message Preview */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    Message Preview
                  </Typography>
                  <Paper sx={{ 
                    mt: 1, 
                    p: 2, 
                    bgcolor: 'background.default',
                    border: 1,
                    borderColor: 'divider'
                  }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {selectedMessage.bodyPreview}
                    </Typography>
                  </Paper>
                </Box>

                {/* Attachments */}
                {selectedMessage.hasAttachments && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      Attachments ({selectedMessage.attachments.length})
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {selectedMessage.attachments.map((attachment, index) => (
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
                          </Box>
                          {attachment.name.match(/\.(exe|bat|cmd|scr|vbs|js)$/i) && (
                            <Chip 
                              label="DANGEROUS" 
                              size="small" 
                              sx={{ bgcolor: '#ef4444', color: 'white', fontWeight: 700 }}
                            />
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </DialogContent>

              <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Button onClick={handleCloseDialog}>
                  Close
                </Button>
                <Button 
                  variant="outlined" 
                  color="error"
                  disabled
                >
                  Delete
                </Button>
                <Button 
                  variant="contained" 
                  color="primary"
                  disabled
                >
                  Release (Coming Soon)
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </Box>
  )
}

