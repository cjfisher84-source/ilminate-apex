'use client'
import { useState, useEffect } from 'react'
import { Box, Typography, TextField, Button, Chip, Card, CardContent, InputAdornment, IconButton, Alert, CircularProgress } from '@mui/material'
import { Search, FilterList, Timeline, Security, Email, Language, Computer } from '@mui/icons-material'
import { useIsMobile } from '@/lib/mobileUtils'

const UNCW_TEAL = '#007070'
const UNCW_GOLD = '#FFD700'

interface SearchResult {
  message_id: string
  sender_email: string
  sender_domain: string
  sender_ip?: string
  recipient_email: string
  subject: string
  content: string
  timestamp: string
  threat_category: string
  apex_action: string
  threat_score: number
  file_attachments?: string[]
  urls?: string[]
}

interface SearchResponse {
  query_time_ms: number
  total_hits: number
  messages: SearchResult[]
  facets: {
    threat_categories: Array<{ name: string; count: number }>
    apex_actions: Array<{ name: string; count: number }>
    sender_domains: Array<{ name: string; count: number }>
  }
}

export function ApexTrace() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState({
    sender: '',
    domain: '',
    ip: '',
    subject: '',
    content: '',
    threat_category: '',
    apex_action: '',
    date_from: '',
    date_to: ''
  })
  
  const isMobile = useIsMobile()

  const performSearch = async (query: string = searchQuery) => {
    setLoading(true)
    setError(null)

    try {
      let searchParams: any = {}
      
      if (showAdvanced) {
        // Advanced search - use all filter parameters
        searchParams = { 
          sender: advancedFilters.sender,
          domain: advancedFilters.domain,
          ip: advancedFilters.ip,
          subject: advancedFilters.subject,
          content: advancedFilters.content,
          threat_category: advancedFilters.threat_category,
          apex_action: advancedFilters.apex_action,
          date_from: advancedFilters.date_from,
          date_to: advancedFilters.date_to
        }
        
        // If there's a main query and no specific subject/content, use it for general search
        if (query && !advancedFilters.subject && !advancedFilters.content) {
          searchParams.general_search = query
        }
      } else {
        // Quick search - detect type and search accordingly
        if (query.includes('@')) {
          searchParams.sender = query
        } else if (query.includes('.') && !query.includes(' ')) {
          searchParams.domain = query
        } else if (/^\d+\.\d+\.\d+\.\d+$/.test(query)) {
          searchParams.ip = query
        } else {
          // Default to subject search for text queries
          searchParams.subject = query
        }
      }

      const response = await fetch('/api/apex-trace/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(searchParams)
      })

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`)
      }

      const results = await response.json()
      setSearchResults(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      setSearchResults(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch()
  }

  const getThreatColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'phishing': return '#ef4444'
      case 'malware': return '#f97316'
      case 'spam': return '#eab308'
      case 'legitimate': return '#22c55e'
      default: return '#6b7280'
    }
  }

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'quarantine': return '#ef4444'
      case 'block': return '#dc2626'
      case 'deliver': return '#22c55e'
      default: return '#6b7280'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <Box sx={{ 
      backgroundColor: 'transparent', 
      padding: 0,
      minHeight: 600
    }}>
      {/* Header */}
      <Box sx={{ 
        marginBottom: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ 
              fontWeight: 700, 
              color: '#f1f5f9',
              fontSize: isMobile ? '1.5rem' : '2rem'
            }}>
              APEX Trace
            </Typography>
            <Typography variant="body1" sx={{ 
              color: '#94a3b8',
              fontSize: isMobile ? '0.9rem' : '1rem'
            }}>
              Super Fast Message Search & Investigation
            </Typography>
          </Box>
        </Box>
        
        <Button
          variant="outlined"
          startIcon={<FilterList />}
          onClick={() => setShowAdvanced(!showAdvanced)}
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
          {showAdvanced ? 'Simple Search' : 'Advanced Search'}
        </Button>
      </Box>

      {/* Search Interface */}
      <Box sx={{ mb: 3 }}>
        <form onSubmit={handleSearch}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
              <TextField
                fullWidth
                placeholder="Search by email, domain, IP, or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: UNCW_TEAL }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        type="submit" 
                        disabled={loading}
                        sx={{ color: UNCW_TEAL }}
                      >
                        {loading ? <CircularProgress size={20} /> : <Search />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: 'white'
                  }
                }}
              />
            </Box>

            {showAdvanced && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Row 1: Sender Email & Domain */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    fullWidth
                    label="Sender Email"
                    placeholder="phisher@malicious.com"
                    value={advancedFilters.sender}
                    onChange={(e) => setAdvancedFilters(prev => ({ ...prev, sender: e.target.value }))}
                    size="small"
                    sx={{ minWidth: 250 }}
                  />
                  <TextField
                    fullWidth
                    label="Sender Domain"
                    placeholder="malicious-domain.com"
                    value={advancedFilters.domain}
                    onChange={(e) => setAdvancedFilters(prev => ({ ...prev, domain: e.target.value }))}
                    size="small"
                    sx={{ minWidth: 250 }}
                  />
                </Box>

                {/* Row 2: IP Address & Subject Line */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    fullWidth
                    label="IP Address"
                    placeholder="192.168.1.100"
                    value={advancedFilters.ip}
                    onChange={(e) => setAdvancedFilters(prev => ({ ...prev, ip: e.target.value }))}
                    size="small"
                    sx={{ minWidth: 250 }}
                  />
                  <TextField
                    fullWidth
                    label="Subject Line"
                    placeholder="Full-text search in subject"
                    value={advancedFilters.subject}
                    onChange={(e) => setAdvancedFilters(prev => ({ ...prev, subject: e.target.value }))}
                    size="small"
                    sx={{ minWidth: 250 }}
                  />
                </Box>

                {/* Row 3: Message Content */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    fullWidth
                    label="Message Content"
                    placeholder="Full-text search in message content"
                    value={advancedFilters.content}
                    onChange={(e) => setAdvancedFilters(prev => ({ ...prev, content: e.target.value }))}
                    size="small"
                    multiline
                    rows={2}
                    sx={{ minWidth: 250 }}
                  />
                </Box>

                {/* Row 4: Date Range */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    fullWidth
                    label="Date From"
                    type="date"
                    value={advancedFilters.date_from}
                    onChange={(e) => setAdvancedFilters(prev => ({ ...prev, date_from: e.target.value }))}
                    size="small"
                    sx={{ minWidth: 200 }}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    fullWidth
                    label="Date To"
                    type="date"
                    value={advancedFilters.date_to}
                    onChange={(e) => setAdvancedFilters(prev => ({ ...prev, date_to: e.target.value }))}
                    size="small"
                    sx={{ minWidth: 200 }}
                    InputLabelProps={{ shrink: true }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 200 }}>
                    <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                      Last 30 days retention
                    </Typography>
                  </Box>
                </Box>

                {/* Row 5: Threat Category & APEX Action */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    fullWidth
                    select
                    label="Threat Category"
                    value={advancedFilters.threat_category}
                    onChange={(e) => setAdvancedFilters(prev => ({ ...prev, threat_category: e.target.value }))}
                    size="small"
                    SelectProps={{ native: true }}
                    sx={{ minWidth: 200 }}
                  >
                    <option value="">All Categories</option>
                    <option value="phishing">Phishing</option>
                    <option value="malware">Malware</option>
                    <option value="spam">Spam</option>
                    <option value="legitimate">Legitimate</option>
                  </TextField>
                  <TextField
                    fullWidth
                    select
                    label="APEX Action"
                    value={advancedFilters.apex_action}
                    onChange={(e) => setAdvancedFilters(prev => ({ ...prev, apex_action: e.target.value }))}
                    size="small"
                    SelectProps={{ native: true }}
                    sx={{ minWidth: 200 }}
                  >
                    <option value="">All Actions</option>
                    <option value="quarantine">Quarantine</option>
                    <option value="deliver">Deliver</option>
                    <option value="block">Block</option>
                  </TextField>
                </Box>
              </Box>
            )}
          </form>
        </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search Results */}
      {searchResults && (
        <Box>
          {/* Results Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3,
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#f1f5f9' }}>
              {searchResults.total_hits.toLocaleString()} Results Found
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              Query time: {searchResults.query_time_ms}ms
            </Typography>
          </Box>

          {/* Messages */}
          <Box sx={{ mb: 4 }}>
            {searchResults.messages.map((message, index) => (
              <Box key={index} sx={{ 
                mb: 3, 
                p: 3,
                bgcolor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: 1,
                '&:hover': { 
                  borderColor: '#007070',
                  transition: 'all 0.3s ease'
                }
              }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    mb: 2,
                    flexWrap: 'wrap',
                    gap: 2
                  }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#f1f5f9', mb: 1 }}>
                        {message.message_id}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                        {formatTimestamp(message.timestamp)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label={message.threat_category}
                        size="small"
                        sx={{ 
                          bgcolor: getThreatColor(message.threat_category),
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                      <Chip 
                        label={message.apex_action}
                        size="small"
                        sx={{ 
                          bgcolor: getActionColor(message.apex_action),
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Email sx={{ fontSize: 16, color: UNCW_TEAL }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#f1f5f9' }}>
                          From: {message.sender_email}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Language sx={{ fontSize: 16, color: UNCW_TEAL }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#f1f5f9' }}>
                          Domain: {message.sender_domain}
                        </Typography>
                      </Box>
                      {message.sender_ip && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Computer sx={{ fontSize: 16, color: UNCW_TEAL }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#f1f5f9' }}>
                            IP: {message.sender_ip}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#f1f5f9', mb: 1 }}>
                        Subject: {message.subject}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#f1f5f9', mb: 1 }}>
                        Content Preview:
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: '#94a3b8',
                        fontStyle: 'italic',
                        maxHeight: 60,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {message.content.substring(0, 150)}...
                      </Typography>
                    </Box>
                  </Box>
                </Box>
            ))}
          </Box>

          {/* Facets */}
          {searchResults.facets && (
            <Box sx={{ bgcolor: '#0f172a', border: '1px solid #334155', p: 3, borderRadius: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#f1f5f9', mb: 3 }}>
                Search Analytics
              </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {searchResults.facets.threat_categories && (
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#f1f5f9' }}>
                        Threat Categories
                      </Typography>
                      {searchResults.facets.threat_categories.map((facet, index) => (
                        <Box key={index} sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          py: 1,
                          borderBottom: '1px solid #334155'
                        }}>
                          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                            {facet.name}
                          </Typography>
                          <Chip 
                            label={facet.count}
                            size="small"
                            sx={{ bgcolor: getThreatColor(facet.name), color: 'white' }}
                          />
                        </Box>
                      ))}
                    </Box>
                  )}
                  
                  {searchResults.facets.apex_actions && (
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#f1f5f9' }}>
                        APEX Actions
                      </Typography>
                      {searchResults.facets.apex_actions.map((facet, index) => (
                        <Box key={index} sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          py: 1,
                          borderBottom: '1px solid #334155'
                        }}>
                          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                            {facet.name}
                          </Typography>
                          <Chip 
                            label={facet.count}
                            size="small"
                            sx={{ bgcolor: getActionColor(facet.name), color: 'white' }}
                          />
                        </Box>
                      ))}
                    </Box>
                  )}
                  
                  {searchResults.facets.sender_domains && (
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#f1f5f9' }}>
                        Top Domains
                      </Typography>
                      {searchResults.facets.sender_domains.slice(0, 5).map((facet, index) => (
                        <Box key={index} sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          py: 1,
                          borderBottom: '1px solid #334155'
                        }}>
                          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                            {facet.name}
                          </Typography>
                          <Chip 
                            label={facet.count}
                            size="small"
                            sx={{ bgcolor: UNCW_TEAL, color: 'white' }}
                          />
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
            </Box>
          )}
        </Box>
      )}

      {/* Empty State */}
      {!searchResults && !loading && (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          color: '#94a3b8'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#f1f5f9' }}>
            APEX Trace Ready
          </Typography>
          <Typography variant="body1">
            Search through millions of messages with sub-100ms performance
          </Typography>
        </Box>
      )}
    </Box>
  )
}
