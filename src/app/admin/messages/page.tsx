'use client'

import { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Divider
} from '@mui/material'
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material'
import NavigationBar from '@/components/NavigationBar'
import { useIsMobile, getResponsivePadding } from '@/lib/mobileUtils'

interface SearchResult {
  messageId: string
  subject: string
  senderEmail: string
  recipientEmail: string
  receivedDateTime: string
  hasAttachments: boolean
  isRead: boolean
  mailboxType: string
  preview?: string
  s3Key?: string
  error?: string
  retrieved?: boolean
}

export default function AdminMessagesPage() {
  const isMobile = useIsMobile()
  const padding = getResponsivePadding(isMobile)
  
  // Search state
  const [searchType, setSearchType] = useState<'single' | 'bulk'>('single')
  const [subject, setSubject] = useState('')
  const [messageId, setMessageId] = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [keywords, setKeywords] = useState('')
  const [mailboxType, setMailboxType] = useState<'microsoft365' | 'google_workspace'>('microsoft365')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  
  // Results state
  const [searching, setSearching] = useState(false)
  const [retrieving, setRetrieving] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<SearchResult | null>(null)

  const handleSearch = async () => {
    setSearching(true)
    setError(null)
    setSuccess(null)
    
    try {
      const searchParams: any = {
        mailboxType
      }
      
      if (subject) searchParams.subject = subject
      if (messageId) searchParams.messageId = messageId
      if (senderEmail) searchParams.senderEmail = senderEmail
      if (recipientEmail) searchParams.recipientEmail = recipientEmail
      if (keywords) searchParams.keywords = keywords
      if (dateFrom) searchParams.dateFrom = dateFrom
      if (dateTo) searchParams.dateTo = dateTo
      
      const response = await fetch('/api/admin/messages/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-customer-id': 'ilminate.com', // Admin customer ID
          'x-user-email': 'admin@ilminate.com'
        },
        body: JSON.stringify(searchParams)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSearchResults(data.data || [])
        setSuccess(`Found ${data.count} messages`)
      } else {
        setError(data.error || 'Search failed')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to search messages')
    } finally {
      setSearching(false)
    }
  }

  const handleRetrieve = async (messageIds?: string[]) => {
    const idsToRetrieve = messageIds || Array.from(selectedMessages)
    
    if (idsToRetrieve.length === 0) {
      setError('No messages selected')
      return
    }
    
    setRetrieving(true)
    setError(null)
    setSuccess(null)
    
    try {
      const response = await fetch('/api/admin/messages/retrieve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-customer-id': 'ilminate.com',
          'x-user-email': 'admin@ilminate.com'
        },
        body: JSON.stringify({
          messageIds: idsToRetrieve,
          mailboxType,
          storeInS3: true,
          recipientEmail: recipientEmail || undefined
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Update search results with retrieval status
        const updatedResults = searchResults.map(result => {
          const retrieved = data.data.find((r: any) => r.messageId === result.messageId)
          if (retrieved) {
            return {
              ...result,
              retrieved: retrieved.retrieved !== false,
              s3Key: retrieved.s3Key,
              error: retrieved.error
            }
          }
          return result
        })
        setSearchResults(updatedResults)
        setSuccess(`Retrieved ${data.count} messages`)
        setSelectedMessages(new Set())
      } else {
        setError(data.error || 'Retrieval failed')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve messages')
    } finally {
      setRetrieving(false)
    }
  }

  const handleSelectAll = () => {
    if (selectedMessages.size === searchResults.length) {
      setSelectedMessages(new Set())
    } else {
      setSelectedMessages(new Set(searchResults.map(r => r.messageId)))
    }
  }

  const handleSelectMessage = (messageId: string) => {
    const newSelected = new Set(selectedMessages)
    if (newSelected.has(messageId)) {
      newSelected.delete(messageId)
    } else {
      newSelected.add(messageId)
    }
    setSelectedMessages(newSelected)
  }

  const handleViewDetails = (message: SearchResult) => {
    setSelectedMessage(message)
    setDetailDialogOpen(true)
  }

  return (
    <>
      <NavigationBar />
      <Box sx={{ minHeight: '100vh', bgcolor: '#0f172a', color: '#f1f5f9', pt: 2, pb: 4 }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto', px: padding }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#00a8a8', mb: 1 }}>
            Admin Message Search & Retrieval
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
            Search for delivered messages in user mailboxes and retrieve them for analysis
          </Typography>

          {/* Search Form */}
          <Paper sx={{ bgcolor: '#1e293b', p: 3, mb: 3, border: '1px solid #334155' }}>
            <Stack spacing={2}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#94a3b8' }}>Mailbox Type</InputLabel>
                <Select
                  value={mailboxType}
                  onChange={(e) => setMailboxType(e.target.value as any)}
                  sx={{
                    color: '#f1f5f9',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#334155' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#00a8a8' }
                  }}
                >
                  <MenuItem value="microsoft365">Microsoft 365</MenuItem>
                  <MenuItem value="google_workspace">Google Workspace</MenuItem>
                </Select>
              </FormControl>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  size="small"
                  sx={{
                    '& .MuiInputBase-root': { color: '#f1f5f9' },
                    '& .MuiInputLabel-root': { color: '#94a3b8' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#334155' }
                  }}
                />
                <TextField
                  fullWidth
                  label="Message ID"
                  value={messageId}
                  onChange={(e) => setMessageId(e.target.value)}
                  size="small"
                  sx={{
                    '& .MuiInputBase-root': { color: '#f1f5f9' },
                    '& .MuiInputLabel-root': { color: '#94a3b8' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#334155' }
                  }}
                />
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Sender Email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  size="small"
                  sx={{
                    '& .MuiInputBase-root': { color: '#f1f5f9' },
                    '& .MuiInputLabel-root': { color: '#94a3b8' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#334155' }
                  }}
                />
                <TextField
                  fullWidth
                  label="Recipient Email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  size="small"
                  sx={{
                    '& .MuiInputBase-root': { color: '#f1f5f9' },
                    '& .MuiInputLabel-root': { color: '#94a3b8' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#334155' }
                  }}
                />
              </Stack>

              <TextField
                fullWidth
                label="Keywords (in body)"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                size="small"
                sx={{
                  '& .MuiInputBase-root': { color: '#f1f5f9' },
                  '& .MuiInputLabel-root': { color: '#94a3b8' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#334155' }
                }}
              />

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Date From"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiInputBase-root': { color: '#f1f5f9' },
                    '& .MuiInputLabel-root': { color: '#94a3b8' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#334155' }
                  }}
                />
                <TextField
                  fullWidth
                  label="Date To"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiInputBase-root': { color: '#f1f5f9' },
                    '& .MuiInputLabel-root': { color: '#94a3b8' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#334155' }
                  }}
                />
              </Stack>

              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={searching}
                startIcon={searching ? <CircularProgress size={20} /> : <SearchIcon />}
                sx={{
                  bgcolor: '#00a8a8',
                  '&:hover': { bgcolor: '#007070' },
                  textTransform: 'none'
                }}
              >
                {searching ? 'Searching...' : 'Search Messages'}
              </Button>
            </Stack>
          </Paper>

          {/* Alerts */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          {/* Results */}
          {searchResults.length > 0 && (
            <Paper sx={{ bgcolor: '#1e293b', p: 3, border: '1px solid #334155' }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ color: '#00a8a8', flex: 1 }}>
                  Search Results ({searchResults.length})
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleSelectAll}
                  sx={{
                    borderColor: '#334155',
                    color: '#f1f5f9',
                    '&:hover': { borderColor: '#00a8a8' }
                  }}
                >
                  {selectedMessages.size === searchResults.length ? 'Deselect All' : 'Select All'}
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleRetrieve()}
                  disabled={retrieving || selectedMessages.size === 0}
                  startIcon={retrieving ? <CircularProgress size={16} /> : <DownloadIcon />}
                  sx={{
                    bgcolor: '#00a8a8',
                    '&:hover': { bgcolor: '#007070' },
                    '&.Mui-disabled': { bgcolor: '#334155' }
                  }}
                >
                  {retrieving ? 'Retrieving...' : `Retrieve Selected (${selectedMessages.size})`}
                </Button>
              </Stack>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#94a3b8', borderColor: '#334155' }}>Select</TableCell>
                      <TableCell sx={{ color: '#94a3b8', borderColor: '#334155' }}>Subject</TableCell>
                      <TableCell sx={{ color: '#94a3b8', borderColor: '#334155' }}>Sender</TableCell>
                      <TableCell sx={{ color: '#94a3b8', borderColor: '#334155' }}>Recipient</TableCell>
                      <TableCell sx={{ color: '#94a3b8', borderColor: '#334155' }}>Date</TableCell>
                      <TableCell sx={{ color: '#94a3b8', borderColor: '#334155' }}>Status</TableCell>
                      <TableCell sx={{ color: '#94a3b8', borderColor: '#334155' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {searchResults.map((result) => (
                      <TableRow key={result.messageId}>
                        <TableCell sx={{ borderColor: '#334155' }}>
                          <Checkbox
                            checked={selectedMessages.has(result.messageId)}
                            onChange={() => handleSelectMessage(result.messageId)}
                            sx={{ color: '#00a8a8' }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: '#f1f5f9', borderColor: '#334155' }}>
                          {result.subject || '(No subject)'}
                        </TableCell>
                        <TableCell sx={{ color: '#f1f5f9', borderColor: '#334155' }}>
                          {result.senderEmail}
                        </TableCell>
                        <TableCell sx={{ color: '#f1f5f9', borderColor: '#334155' }}>
                          {result.recipientEmail}
                        </TableCell>
                        <TableCell sx={{ color: '#f1f5f9', borderColor: '#334155' }}>
                          {new Date(result.receivedDateTime).toLocaleDateString()}
                        </TableCell>
                        <TableCell sx={{ borderColor: '#334155' }}>
                          {result.retrieved ? (
                            <Chip
                              icon={<CheckCircleIcon />}
                              label="Retrieved"
                              size="small"
                              sx={{ bgcolor: '#22c55e', color: '#fff' }}
                            />
                          ) : result.error ? (
                            <Chip
                              icon={<ErrorIcon />}
                              label="Error"
                              size="small"
                              sx={{ bgcolor: '#ef4444', color: '#fff' }}
                            />
                          ) : (
                            <Chip
                              label="Not Retrieved"
                              size="small"
                              sx={{ bgcolor: '#334155', color: '#94a3b8' }}
                            />
                          )}
                        </TableCell>
                        <TableCell sx={{ borderColor: '#334155' }}>
                          <Button
                            size="small"
                            onClick={() => handleViewDetails(result)}
                            sx={{ color: '#00a8a8' }}
                          >
                            View
                          </Button>
                          {!result.retrieved && (
                            <Button
                              size="small"
                              onClick={() => handleRetrieve([result.messageId])}
                              disabled={retrieving}
                              sx={{ color: '#00a8a8', ml: 1 }}
                            >
                              Retrieve
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {/* Empty State */}
          {searchResults.length === 0 && !searching && (
            <Paper sx={{ bgcolor: '#1e293b', p: 4, textAlign: 'center', border: '1px solid #334155' }}>
              <EmailIcon sx={{ fontSize: 64, color: '#334155', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#94a3b8', mb: 1 }}>
                No messages found
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Enter search criteria and click "Search Messages" to find delivered messages in user mailboxes
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>

      {/* Message Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1e293b',
            border: '1px solid #334155'
          }
        }}
      >
        <DialogTitle sx={{ color: '#00a8a8', borderBottom: '1px solid #334155' }}>
          Message Details
        </DialogTitle>
        <DialogContent sx={{ color: '#f1f5f9', pt: 2 }}>
          {selectedMessage && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>Message ID</Typography>
                <Typography variant="body2" sx={{ color: '#f1f5f9' }}>{selectedMessage.messageId}</Typography>
              </Box>
              <Divider sx={{ borderColor: '#334155' }} />
              <Box>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>Subject</Typography>
                <Typography variant="body2" sx={{ color: '#f1f5f9' }}>{selectedMessage.subject || '(No subject)'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>Sender</Typography>
                <Typography variant="body2" sx={{ color: '#f1f5f9' }}>{selectedMessage.senderEmail}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>Recipient</Typography>
                <Typography variant="body2" sx={{ color: '#f1f5f9' }}>{selectedMessage.recipientEmail}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>Received</Typography>
                <Typography variant="body2" sx={{ color: '#f1f5f9' }}>
                  {new Date(selectedMessage.receivedDateTime).toLocaleString()}
                </Typography>
              </Box>
              {selectedMessage.s3Key && (
                <Box>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>S3 Location</Typography>
                  <Typography variant="body2" sx={{ color: '#00a8a8' }}>{selectedMessage.s3Key}</Typography>
                </Box>
              )}
              {selectedMessage.error && (
                <Alert severity="error">{selectedMessage.error}</Alert>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #334155' }}>
          <Button onClick={() => setDetailDialogOpen(false)} sx={{ color: '#94a3b8' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

