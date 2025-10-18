'use client'
import { useState } from 'react'
import {
  Card, CardContent, CardActions,
  TextField, Button, MenuItem, Typography,
  Snackbar, Alert, Box, Chip, LinearProgress, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  List, ListItem, ListItemIcon, ListItemText, useTheme
} from '@mui/material'
import {
  Security as SecurityIcon,
  Link as LinkIcon,
  AttachFile as AttachFileIcon,
  PersonSearch as PersonSearchIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material'
import Link from 'next/link'
import Image from 'next/image'
import TriageResults from '@/components/TriageResults'
import { useIsMobile, getResponsivePadding, getResponsiveSpacing, getResponsiveFontSize, getResponsiveImageSize } from '@/lib/mobileUtils'

type Kind = 'False Positive' | 'False Negative' | 'Question'

interface StructuredData {
  classification: string
  riskScore: number
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  indicators: any[]
  checks: string[]
  notes: string
  recommendations: any
}

type SecurityCheck = {
  id: string
  label: string
  icon: any
  color: string
  description: string
  details: string[]
}

const securityChecks: SecurityCheck[] = [
  {
    id: 'spf-dkim-dmarc',
    label: 'SPF/DKIM/DMARC',
    icon: SecurityIcon,
    color: '#007070',
    description: 'Email Authentication Protocols',
    details: [
      'SPF (Sender Policy Framework): Verifies the sending server is authorized to send email on behalf of the domain',
      'DKIM (DomainKeys Identified Mail): Validates the email has not been tampered with in transit using cryptographic signatures',
      'DMARC (Domain-based Message Authentication): Tells receivers how to handle emails that fail SPF/DKIM checks',
      'Checks for alignment between header-from and envelope-from domains',
      'Identifies spoofed or forged email addresses'
    ]
  },
  {
    id: 'suspicious-links',
    label: 'Suspicious Links',
    icon: LinkIcon,
    color: '#FFD700',
    description: 'URL & Link Analysis',
    details: [
      'Scans for malicious, phishing, or compromised URLs',
      'Detects URL shorteners that may hide malicious destinations',
      'Identifies typosquatting and lookalike domains (e.g., g00gle.com vs google.com)',
      'Checks reputation of linked domains and IP addresses',
      'Flags newly registered domains often used in phishing campaigns',
      'Analyzes TLD (top-level domain) risk patterns'
    ]
  },
  {
    id: 'attachment-heuristics',
    label: 'Attachment Heuristics',
    icon: AttachFileIcon,
    color: '#007070',
    description: 'Attachment Threat Detection',
    details: [
      'Detects macro-enabled documents (Excel, Word, PowerPoint) often used for malware delivery',
      'Identifies suspicious archive files (.zip, .rar, .7z) that may contain malware',
      'Flags executable files and scripts (.exe, .js, .vbs, .bat)',
      'Analyzes double extensions used to disguise file types (e.g., invoice.pdf.exe)',
      'Detects password-protected archives used to bypass scanning',
      'Identifies files with anomalous properties or metadata'
    ]
  },
  {
    id: 'sender-reputation',
    label: 'Sender Reputation',
    icon: PersonSearchIcon,
    color: '#FFD700',
    description: 'Sender Identity & History',
    details: [
      'Analyzes sender domain reputation and email history',
      'Detects display name spoofing (CEO name with gmail.com address)',
      'Checks for internal executive impersonation from external domains',
      'Reviews sender\'s historical email patterns and behavior',
      'Flags first-time senders requesting sensitive actions',
      'Identifies free email providers (Gmail, Yahoo, Hotmail) used for business communications'
    ]
  }
]

export default function TriagePage() {
  const theme = useTheme()
  const isMobile = useIsMobile()
  const [kind, setKind] = useState<Kind>('False Positive')
  const [subject, setSubject] = useState('')
  const [sender, setSender] = useState('')
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')
  const [structured, setStructured] = useState<StructuredData | null>(null)
  const [viewMode, setViewMode] = useState<'visual' | 'raw'>('visual')
  const [snack, setSnack] = useState<{open:boolean; msg:string; sev:'success'|'error'|'info'}>({open:false,msg:'',sev:'success'})
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCheck, setSelectedCheck] = useState<SecurityCheck | null>(null)

  const containerPadding = getResponsivePadding(isMobile)
  const headerGap = getResponsiveSpacing(isMobile, 2, 3)
  const logoSize = getResponsiveImageSize(isMobile, 100)
  const disabled = loading || (!subject.trim() && !details.trim())

  async function runTriage() {
    setLoading(true)
    setResult('')
    setStructured(null)
    try {
      const endpoint = process.env.NEXT_PUBLIC_TRIAGE_URL || '/api/triage'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ kind, subject, sender, details })
      })
      if (!res.ok) throw new Error(`Triage API ${res.status}`)
      const data = await res.json()
      setResult(data.summary || 'Completed.')
      if (data.structured) {
        setStructured(data.structured)
      }
      setSnack({ open:true, msg:'Apex triage completed', sev:'success' })
    } catch (e:any) {
      setSnack({ open:true, msg: e?.message || 'Triage failed', sev:'error' })
    } finally {
      setLoading(false)
    }
  }

  function draftEmail() {
    const s = encodeURIComponent(`APEX triage: ${kind} — ${subject || 'no subject'}`)
    const body =
`Requested triage type: ${kind}

Subject: ${subject || 'N/A'}
Sender: ${sender || 'N/A'}

Details:
${details || '(none)'}
`
    const b = encodeURIComponent(body)
    window.location.href = `mailto:triage@ilminate.com?subject=${s}&body=${b}`
  }

  function handleCheckClick(check: SecurityCheck) {
    setSelectedCheck(check)
    setDialogOpen(true)
  }

  function handleDialogClose() {
    setDialogOpen(false)
    setTimeout(() => setSelectedCheck(null), 200)
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: containerPadding }}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        {/* Header with Logo */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'center', 
          mb: isMobile ? 3 : 4,
          pb: isMobile ? 2 : 3,
          borderBottom: 2,
          borderColor: 'primary.main',
          gap: isMobile ? 2 : 0
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: headerGap }}>
            {/* Ilminate Logo */}
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
                  fontSize: getResponsiveFontSize(isMobile, 'h3')
                }}
              >
                Apex AI <span style={{ color: theme.palette.primary.main }}>Triage</span>
              </Typography>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: 'text.secondary', 
                  fontWeight: 500,
                  fontSize: getResponsiveFontSize(isMobile, 'subtitle1')
                }}
              >
                {isMobile ? 'Threat Analysis' : 'Intelligent Threat Analysis & Investigation'}
              </Typography>
            </Box>
          </Box>
          <Link href="/" passHref legacyBehavior>
            <Button 
              variant="outlined" 
              component="a" 
              size={isMobile ? 'medium' : 'large'}
              color="primary"
              fullWidth={isMobile}
              className={isMobile ? 'mobile-touch-target' : ''}
              sx={{ 
                px: isMobile ? 3 : 4,
                py: isMobile ? 1.2 : 1.5,
                fontSize: isMobile ? '1rem' : '1.1rem',
                fontWeight: 600
              }}
            >
              Dashboard
            </Button>
          </Link>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 3,
          width: '100%'
        }}>
          <Box sx={{ 
            flex: { xs: 1, md: '1 1 58%' },
            width: isMobile ? '100%' : 'auto',
            minWidth: 0
          }}>
            <Card sx={{ 
              bgcolor: 'background.paper',
              border: 2,
              borderColor: 'divider',
              boxShadow: 2,
              width: '100%'
            }}>
              {loading && <LinearProgress color="primary" />}
              <CardContent sx={{ display:'grid', gap:2 }}>
              <Typography 
                variant="subtitle2" 
                color="text.secondary"
                sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}
              >
                Report type
              </Typography>
              <TextField
                select fullWidth label="Triage Type"
                value={kind}
                onChange={e=>setKind(e.target.value as Kind)}
                InputProps={{
                  sx: { fontSize: isMobile ? '16px' : 'inherit' }
                }}
              >
                {(['False Positive','False Negative','Question'] as Kind[]).map(k => (
                  <MenuItem key={k} value={k}>{k}</MenuItem>
                ))}
              </TextField>

              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' }, 
                gap: 2 
              }}>
                <TextField 
                  label="Message Subject" 
                  sx={{ flex: { xs: 1, sm: '1 1 66%' } }}
                  value={subject} 
                  onChange={e=>setSubject(e.target.value)}
                  InputProps={{
                    sx: { fontSize: isMobile ? '16px' : 'inherit' }
                  }}
                />
                <TextField 
                  label="Sender" 
                  placeholder="user@domain.com" 
                  sx={{ flex: { xs: 1, sm: '1 1 34%' } }}
                  value={sender} 
                  onChange={e=>setSender(e.target.value)}
                  InputProps={{
                    sx: { fontSize: isMobile ? '16px' : 'inherit' }
                  }}
                />
              </Box>

                <TextField 
                  label="Threat Description" 
                  placeholder="Describe the threat you received. Example: 'We received 10 emails today asking for gift cards. The sender looked like someone we know but we're not sure.' Include timestamps, headers, URLs, etc." 
                  multiline minRows={isMobile ? 4 : 6} fullWidth
                  value={details} 
                  onChange={e=>setDetails(e.target.value)}
                  InputProps={{
                    sx: { fontSize: isMobile ? '16px' : 'inherit' }
                  }}
                />

              <Box>
                <Typography variant="caption" sx={{ display: 'block', mb: 1, color: '#666', fontWeight: 600 }}>
                  Security Checks Performed (click to learn more):
                </Typography>
                <Box sx={{ display:'flex', gap:1, flexWrap:'wrap' }}>
                  {securityChecks.map((check) => {
                    const CheckIcon = check.icon
                    return (
                      <Chip 
                        key={check.id}
                        icon={<CheckIcon sx={{ fontSize: '1.1rem !important' }} />}
                        label={check.label}
                        onClick={() => handleCheckClick(check)}
                        sx={{ 
                          bgcolor: check.color, 
                          color: check.color === '#FFD700' ? '#1a1a1a' : 'white', 
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            opacity: 0.9
                          },
                          '& .MuiChip-icon': {
                            color: check.color === '#FFD700' ? '#1a1a1a' : 'white'
                          }
                        }}
                      />
                    )
                  })}
                </Box>
              </Box>
            </CardContent>
            <CardActions sx={{ 
              p: 2, 
              gap: 1,
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <Button 
                variant="contained" 
                disabled={disabled} 
                onClick={runTriage}
                color="primary"
                fullWidth={isMobile}
                className={isMobile ? 'mobile-touch-target' : ''}
                sx={{
                  fontWeight: 600
                }}
              >
                Run Apex AI Analysis
              </Button>
              <Button 
                variant="outlined" 
                onClick={draftEmail}
                color="secondary"
                fullWidth={isMobile}
                className={isMobile ? 'mobile-touch-target' : ''}
                sx={{
                  fontWeight: 600
                }}
              >
                Email triage@ilminate.com
              </Button>
            </CardActions>
          </Card>
        </Box>

        <Box sx={{ 
          flex: { xs: 1, md: '1 1 42%' },
          width: isMobile ? '100%' : 'auto',
          minWidth: 0
        }}>
          <Card sx={{ 
            bgcolor: 'background.paper',
            border: 2,
            borderColor: 'divider',
            boxShadow: 2,
            width: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                  Analysis Result
                </Typography>
                {structured && (
                  <Tabs 
                    value={viewMode} 
                    onChange={(_, val) => setViewMode(val)}
                    sx={{ minHeight: 32 }}
                  >
                    <Tab label="Visual" value="visual" sx={{ minHeight: 32, py: 0.5, fontSize: '0.85rem' }} />
                    <Tab label="Raw" value="raw" sx={{ minHeight: 32, py: 0.5, fontSize: '0.85rem' }} />
                  </Tabs>
                )}
              </Box>
              
              {!result && !structured && (
                <Box sx={{
                  p: 4,
                  textAlign: 'center',
                  color: 'text.secondary',
                  minHeight: 240,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 2
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Ready to Analyze
                  </Typography>
                  <Typography variant="body2">
                    Fill in the threat details and click "Run Apex AI Analysis" to see results
                  </Typography>
                </Box>
              )}

              {structured && viewMode === 'visual' ? (
                <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
                  <TriageResults structured={structured} />
                </Box>
              ) : result && viewMode === 'raw' ? (
                <Box component="pre" sx={{
                  p: 2, 
                  border: 2, 
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: 'background.default', 
                  overflow: 'auto', 
                  whiteSpace: 'pre-wrap', 
                  minHeight: 240,
                  maxHeight: 600,
                  color: 'text.primary',
                  fontSize: '0.85rem'
                }}>
                  {result}
                </Box>
              ) : null}
            </CardContent>
          </Card>
        </Box>
      </Box>
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={()=>setSnack(s=>({...s, open:false}))}
        anchorOrigin={{ vertical:'bottom', horizontal:'right' }}
      >
        <Alert onClose={()=>setSnack(s=>({...s, open:false}))} severity={snack.sev} variant="filled">
          {snack.msg}
        </Alert>
      </Snackbar>

      {/* Security Check Details Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: 2,
            borderColor: 'primary.main'
          }
        }}
      >
        {selectedCheck && (
          <>
            <DialogTitle sx={{ 
              bgcolor: selectedCheck.color, 
              color: selectedCheck.color === '#FFD700' ? '#1a1a1a' : 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              pr: 1
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {(() => {
                  const CheckIcon = selectedCheck.icon
                  return <CheckIcon sx={{ fontSize: '2rem' }} />
                })()}
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {selectedCheck.label}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ 
                    opacity: 0.9,
                    fontWeight: 500
                  }}>
                    {selectedCheck.description}
                  </Typography>
                </Box>
              </Box>
              <IconButton
                onClick={handleDialogClose}
                sx={{ 
                  color: selectedCheck.color === '#FFD700' ? '#1a1a1a' : 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary', fontWeight: 600 }}>
                What This Check Does:
              </Typography>
              <List sx={{ bgcolor: 'background.default', borderRadius: 2, p: 2 }}>
                {selectedCheck.details.map((detail, idx) => (
                  <ListItem key={idx} sx={{ px: 0, py: 1, alignItems: 'flex-start' }}>
                    <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                      <CheckCircleIcon sx={{ color: 'primary.main', fontSize: '1.3rem' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={detail}
                      primaryTypographyProps={{ 
                        fontSize: '0.95rem',
                        color: 'text.primary',
                        lineHeight: 1.6
                      }}
                    />
                  </ListItem>
                ))}
              </List>
              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <strong>Note:</strong> This check is automatically performed when you run Apex AI Analysis. 
                  The results will show any detected threats or anomalies related to this security area.
                </Typography>
              </Alert>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 2 }}>
              <Button 
                onClick={handleDialogClose}
                variant="contained"
                color="primary"
                sx={{
                  fontWeight: 600,
                  px: 4
                }}
              >
                Got It
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  )
}
