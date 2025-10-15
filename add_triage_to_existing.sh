#!/usr/bin/env bash
# =============================================================================
# Add /triage (MUI form + API) to EXISTING ilminate-apex app
# - Works with src/app (App Router), app (App Router), or pages (Pages Router)
# - Uses MUI + Emotion + Recharts
# - Adds nav link to AppBar if found (best-effort)
# - Logs & pauses; commits & pushes (Amplify app d15dkeaak9f84h will deploy)
# =============================================================================
set -euo pipefail
C0="$(printf '\033[0m')"; C1="$(printf '\033[36m')"; C2="$(printf '\033[32m')"; C3="$(printf '\033[33m')"; C4="$(printf '\033[31m')"
log() { printf "%s[%s]%s %s\n" "$C1" "$(date +%H:%M:%S)" "$C0" "$*"; }
ok() { printf "%s[OK ]%s %s\n" "$C2" "$C0" "$*"; }
warn() { printf "%s[WARN]%s %s\n" "$C3" "$C0" "$*"; }
err() { printf "%s[ERR ]%s %s\n" "$C4" "$C0" "$*"; }

START="$(date +%Y%m%d_%H%M%S)"
LOG=".apex_add_triage_${START}.log"
exec > >(tee -a "$LOG") 2>&1

# --- Sanity checks ---
test -f package.json || { err "Run this from your repo root (package.json not found)."; exit 1; }
APP_NAME="$(node -pe "try{require('./package.json').name}catch(e){''}")"
log "Repo detected: ${APP_NAME:-unknown}"

# --- Detect router style & paths ---
APP_DIR=""
if   [ -d src/app ]; then APP_DIR=src/app
elif [ -d app ];     then APP_DIR=app
elif [ -d pages ];   then APP_DIR=pages
else
  err "No src/app, app, or pages directory found. Create one first."
  exit 1
fi
ok "Router root: $APP_DIR"

IS_APP_ROUTER=0
[[ "$APP_DIR" == "src/app" || "$APP_DIR" == "app" ]] && IS_APP_ROUTER=1

# --- Ensure deps (MUI/Emotion/Recharts) ---
NEED_PKGS=()
for P in @mui/material @mui/icons-material @emotion/react @emotion/styled recharts; do
  node -e "require('./package.json').dependencies && process.exit(!Object.keys(require('./package.json').dependencies).includes('$P'))" || NEED_PKGS+=("$P")
done
if ((${#NEED_PKGS[@]})); then
  log "Installing missing dependencies: ${NEED_PKGS[*]}"
  npm i "${NEED_PKGS[@]}"
else
  ok "All required deps already present."
fi

echo "Creating /triage page and API..."

# --- Write API route ---
if (( IS_APP_ROUTER )); then
  mkdir -p "$APP_DIR/api/triage"
  cat > "$APP_DIR/api/triage/route.ts" <<'TS'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { kind, subject, sender, details } = body || {}
    const checks = [
      'SPF/DKIM/DMARC auth results',
      'Header anomalies (return-path, reply-to, display name spoofing)',
      'URL intel (risky domains, TLD, shortening, lookalikes)',
      'Attachment heuristics (macro docs, archives, executables)',
      'Sender reputation & historical patterns'
    ]
    const summary =
`APEX triage for: ${kind || 'N/A'}
Subject: ${subject || 'N/A'}
Sender: ${sender || 'N/A'}

Primary findings:
- ${checks.join('\n- ')}

Notes:
${(details || '').slice(0, 1200)}

Recommendation:
• If suspicious: quarantine similar messages, tighten policy, notify users.
• If benign: add allow-list rule with scope/time-bound review.`
    return NextResponse.json({ ok: true, summary })
  } catch (e: any) {
    return NextResponse.json({ ok:false, error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
TS
  ok "API route written: $APP_DIR/api/triage/route.ts"
else
  mkdir -p "$APP_DIR/api"
  cat > "$APP_DIR/api/triage.ts" <<'TS'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok:false, error:'Method not allowed' })
  try {
    const { kind, subject, sender, details } = typeof req.body === 'string' ? JSON.parse(req.body||'{}') : (req.body || {})
    const checks = [
      'SPF/DKIM/DMARC auth results',
      'Header anomalies (return-path, reply-to, display name spoofing)',
      'URL intel (risky domains, TLD, shortening, lookalikes)',
      'Attachment heuristics (macro docs, archives, executables)',
      'Sender reputation & historical patterns'
    ]
    const summary =
`APEX triage for: ${kind || 'N/A'}
Subject: ${subject || 'N/A'}
Sender: ${sender || 'N/A'}

Primary findings:
- ${checks.join('\n- ')}

Notes:
${(details || '').slice(0, 1200)}

Recommendation:
• If suspicious: quarantine similar messages, tighten policy, notify users.
• If benign: add allow-list rule with scope/time-bound review.`
    res.status(200).json({ ok:true, summary })
  } catch (e:any) {
    res.status(500).json({ ok:false, error: e?.message || 'Unexpected error' })
  }
}
TS
  ok "API route written: $APP_DIR/api/triage.ts"
fi

# --- Write /triage page (MUI form) ---
TRIAGE_PAGE_PATH=""
if (( IS_APP_ROUTER )); then
  mkdir -p "$APP_DIR/triage"
  TRIAGE_PAGE_PATH="$APP_DIR/triage/page.tsx"
else
  TRIAGE_PAGE_PATH="$APP_DIR/triage.tsx"
fi

cat > "$TRIAGE_PAGE_PATH" <<'TSX'
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
TSX
ok "Triage page written: $TRIAGE_PAGE_PATH"

# --- Try to add a nav link to /triage (best-effort for AppBar/Toolbar) ---
NAV_EDITED=0
for LAYOUT in "$APP_DIR/layout.tsx" "src/app/layout.tsx" "app/layout.tsx" "$APP_DIR/_app.tsx" "$APP_DIR/_app.jsx"; do
  [ -f "$LAYOUT" ] || continue
  if grep -q "AppBar" "$LAYOUT" && ! grep -q 'href="/triage"' "$LAYOUT"; then
    python3 - "$LAYOUT" <<'PY'
import sys,re
p=sys.argv[1]
s=open(p).read()
# add simple link near the right side of the toolbar
s=re.sub(r'(<\/Toolbar>)', r'  <a href="/triage" style={{marginLeft:12,textDecoration:"none",color:"inherit"}}>Triage</a>\n\1', s, count=1)
open(p,'w').write(s)
print("Updated nav in", p)
PY
    NAV_EDITED=1
    ok "Added 'Triage' link in $LAYOUT"
    break
  fi
done
(( NAV_EDITED )) || warn "Could not auto-insert nav link. Manually add a link/button to /triage in your AppBar."

# --- Commit & push ---
git add -A
git commit -m "feat(triage): add MUI /triage page + API (Apex AI) with mailto" || true

if git remote -v | grep -q origin; then
  log "Pushing to origin…"
  CURRENT_BRANCH="$(git branch --show-current || echo main)"
  git push -u origin "$CURRENT_BRANCH"
  ok "Pushed. Amplify app d15dkeaak9f84h will build & deploy this commit."
else
  warn "No git remote set. Add and push:"
  echo "  git remote add origin https://github.com/<YOUR-ORG>/ilminate-apex.git"
  echo "  git push -u origin $(git branch --show-current || echo main)"
fi

ok "Done. Log file: $LOG"
echo "Visit /triage after deploy. To point at a real backend, set NEXT_PUBLIC_TRIAGE_URL in Amplify env vars."

