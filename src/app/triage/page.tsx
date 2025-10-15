'use client'
import { useState } from 'react'
import {
  Grid, Card, CardContent, CardActions,
  TextField, Button, MenuItem, Typography,
  Snackbar, Alert, Box, Chip, LinearProgress
} from '@mui/material'

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
    <Box sx={{ display:'flex', flexDirection:'column', gap:3, p:3 }}>
      <Typography variant="h6">Apex AI — Triage</Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Card>
            {loading && <LinearProgress />}
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

              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <TextField label="Message Subject" fullWidth value={subject} onChange={e=>setSubject(e.target.value)} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField label="Sender" placeholder="user@domain.com" fullWidth value={sender} onChange={e=>setSender(e.target.value)} />
                </Grid>
              </Grid>

              <TextField
                label="Details"
                placeholder="Explain why this is FP/FN or provide context. Include timestamps, headers, URLs, etc."
                multiline minRows={6} fullWidth
                value={details} onChange={e=>setDetails(e.target.value)}
              />

              <Box sx={{ display:'flex', gap:1, flexWrap:'wrap' }}>
                <Chip label="SPF/DKIM/DMARC" />
                <Chip label="Suspicious Links" />
                <Chip label="Attachment Heuristics" />
                <Chip label="Sender Reputation" />
              </Box>
            </CardContent>
            <CardActions sx={{ p:2, gap:1 }}>
              <Button variant="contained" color="primary" disabled={disabled} onClick={runTriage}>
                Run Apex AI Analysis
              </Button>
              <Button variant="outlined" onClick={draftEmail}>
                Email triage@ilminate.com
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb:1 }}>Result</Typography>
              <Box component="pre" sx={{
                p:2, border:'1px solid #1d2630', borderRadius:1,
                bgcolor: 'background.default', overflow:'auto', whiteSpace:'pre-wrap', minHeight: 240
              }}>
                {result || 'Run the analysis to see a summary.'}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
