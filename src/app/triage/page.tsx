'use client'
import { useState } from 'react'
import {
  Card, CardContent, CardActions,
  TextField, Button, MenuItem, Typography,
  Snackbar, Alert, Box, Chip, LinearProgress
} from '@mui/material'
import Link from 'next/link'
import Image from 'next/image'

type Kind = 'False Positive' | 'False Negative' | 'Question'

export default function TriagePage() {
  const [kind, setKind] = useState<Kind>('False Positive')
  const [subject, setSubject] = useState('')
  const [sender, setSender] = useState('')
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')
  const [snack, setSnack] = useState<{open:boolean; msg:string; sev:'success'|'error'|'info'}>({open:false,msg:'',sev:'success'})

  const disabled = loading || (!subject.trim() && !details.trim())

  async function runTriage() {
    setLoading(true)
    setResult('')
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

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F5F7FA', p: 4 }}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        {/* Header with Logo */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          pb: 3,
          borderBottom: '2px solid #007070'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {/* Ilminate Logo */}
            <Image 
              src="/ilminate-logo.png" 
              alt="Ilminate Logo" 
              width={100} 
              height={100}
              priority
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 112, 112, 0.3))' }}
            />
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5, color: '#1a1a1a' }}>
                Apex AI <span style={{ color: '#007070' }}>Triage</span>
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#666', fontWeight: 500 }}>
                Intelligent Threat Analysis & Investigation
              </Typography>
            </Box>
          </Box>
          <Link href="/" passHref legacyBehavior>
            <Button 
              variant="outlined" 
              component="a" 
              size="large"
              sx={{ 
                borderColor: '#007070',
                color: '#007070',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                '&:hover': { 
                  borderColor: '#005555',
                  bgcolor: 'rgba(0, 112, 112, 0.05)'
                }
              }}
            >
              Dashboard
            </Button>
          </Link>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 3
        }}>
          <Box sx={{ flex: { xs: 1, md: '1 1 58%' } }}>
            <Card sx={{ 
              bgcolor: '#FFFFFF',
              border: '2px solid #E0E4E8',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              {loading && <LinearProgress sx={{ bgcolor: '#E0E4E8', '& .MuiLinearProgress-bar': { bgcolor: '#007070' } }} />}
              <CardContent sx={{ display:'grid', gap:2 }}>
              <Typography variant="subtitle2" color="text.secondary">Report type</Typography>
              <TextField
                select fullWidth label="Triage Type"
                value={kind}
                onChange={e=>setKind(e.target.value as Kind)}
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
                />
                <TextField 
                  label="Sender" 
                  placeholder="user@domain.com" 
                  sx={{ flex: { xs: 1, sm: '1 1 34%' } }}
                  value={sender} 
                  onChange={e=>setSender(e.target.value)} 
                />
              </Box>

                <TextField 
                  label="Threat Description" 
                  placeholder="Describe the threat you received. Example: 'We received 10 emails today asking for gift cards. The sender looked like someone we know but we're not sure.' Include timestamps, headers, URLs, etc." 
                  multiline minRows={6} fullWidth
                  value={details} onChange={e=>setDetails(e.target.value)} 
                />

              <Box sx={{ display:'flex', gap:1, flexWrap:'wrap' }}>
                <Chip label="SPF/DKIM/DMARC" sx={{ bgcolor: '#007070', color: 'white', fontWeight: 600 }} />
                <Chip label="Suspicious Links" sx={{ bgcolor: '#FFD700', color: '#1a1a1a', fontWeight: 600 }} />
                <Chip label="Attachment Heuristics" sx={{ bgcolor: '#007070', color: 'white', fontWeight: 600 }} />
                <Chip label="Sender Reputation" sx={{ bgcolor: '#FFD700', color: '#1a1a1a', fontWeight: 600 }} />
              </Box>
            </CardContent>
            <CardActions sx={{ p:2, gap:1 }}>
              <Button 
                variant="contained" 
                disabled={disabled} 
                onClick={runTriage}
                sx={{
                  bgcolor: '#007070',
                  color: 'white',
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#005555' },
                  '&:disabled': { bgcolor: '#E0E4E8', color: '#999' }
                }}
              >
                Run Apex AI Analysis
              </Button>
              <Button 
                variant="outlined" 
                onClick={draftEmail}
                sx={{
                  borderColor: '#FFD700',
                  color: '#E6C200',
                  fontWeight: 600,
                  '&:hover': { 
                    borderColor: '#E6C200',
                    bgcolor: 'rgba(255, 215, 0, 0.05)'
                  }
                }}
              >
                Email triage@ilminate.com
              </Button>
            </CardActions>
          </Card>
        </Box>

        <Box sx={{ flex: { xs: 1, md: '1 1 42%' } }}>
          <Card sx={{ 
            bgcolor: '#FFFFFF',
            border: '2px solid #E0E4E8',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb:1, color: '#666', fontWeight: 700, textTransform: 'uppercase' }}>
                Result
              </Typography>
              <Box component="pre" sx={{
                p:2, 
                border:'2px solid #E0E4E8', 
                borderRadius:2,
                bgcolor: '#F8FAFB', 
                overflow:'auto', 
                whiteSpace:'pre-wrap', 
                minHeight: 240,
                color: '#1a1a1a',
                fontSize: '0.9rem'
              }}>
                {result || 'Run the analysis to see a summary.'}
              </Box>
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
    </Box>
  )
}
