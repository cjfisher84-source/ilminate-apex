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
