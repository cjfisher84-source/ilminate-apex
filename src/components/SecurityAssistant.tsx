'use client';

import * as React from 'react';
import {
  Box, Card, CardContent, Typography,
  Button, TextField, CircularProgress, Chip, Stack
} from '@mui/material';
import { log } from '@/utils/log';

type Msg = { role: 'user'|'assistant', text: string };

const PRESETS: {label:string, prompt:string, icon:string}[] = [
  { label: 'Investigate top threat', prompt: 'Investigate today\'s top threat. Include impacted users/assets and recommended next steps.', icon: '🔍' },
  { label: 'Improve posture', prompt: 'Recommend prioritized improvements to my security posture based on recent detections and configuration gaps.', icon: '🛡️' },
  { label: 'Monthly risk summary', prompt: 'Summarize our risk trend for the last 30 days with key metrics and notable incidents.', icon: '📄' },
];

export default function SecurityAssistant() {
  const [input, setInput] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [msgs, setMsgs] = React.useState<Msg[]>([
    { role: 'assistant', text: 'Hi! I can investigate threats, suggest posture improvements, and summarize trends. Pick a quick action or ask anything.' }
  ]);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const messagesBoxRef = React.useRef<HTMLDivElement>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);

  // Improved scroll behavior: scroll card to top when assistant responds
  React.useEffect(() => {
    if (msgs.length > 0 && msgs[msgs.length - 1].role === 'assistant' && !busy) {
      // First scroll the card to top of viewport
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Then scroll the messages box to show the latest assistant message from top
        setTimeout(() => {
          if (messagesBoxRef.current) {
            messagesBoxRef.current.scrollTop = messagesBoxRef.current.scrollHeight;
          }
        }, 400);
      }, 100);
    }
  }, [msgs, busy]);

  // Component mount logging
  React.useEffect(() => {
    log.ui('SecurityAssistant mounted', { presetCount: PRESETS.length });
  }, []);

  async function send(promptText: string) {
    if (!promptText.trim()) return;
    
    log.ui('SecurityAssistant query', { prompt: promptText.substring(0, 50) });
    
    const next: Msg = { role: 'user', text: promptText.trim() };
    setMsgs((m) => [...m, next]);
    setInput('');
    setBusy(true);
    
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText }),
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      setMsgs((m) => [...m, { role: 'assistant', text: data.reply ?? 'No response.' }]);
      
      log.ui('SecurityAssistant response received', { responseLength: data.reply?.length || 0 });
    } catch (e: any) {
      log.ui('SecurityAssistant error', { error: e?.message });
      setMsgs((m) => [...m, { role: 'assistant', text: `Sorry—something went wrong (${e?.message || 'error'}).` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card ref={cardRef} sx={{
      backgroundColor: '#1e293b',
      border: '2px solid #334155',
      height: 420, 
      display: 'flex', 
      flexDirection: 'column',
      boxShadow: '0 4px 16px rgba(0,0,0,0.3)', 
      borderRadius: '16px'
    }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#00a8a8', mb: 0.5 }}>
          Security Assistant
        </Typography>
        <Typography variant="body2" sx={{ color: '#94a3b8', mb: 1 }}>
          Ask a question or use a quick command below. The assistant pulls recent threats, posture signals, and trends.
        </Typography>

        {/* Preset chips */}
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {PRESETS.map(p => (
            <Chip
              key={p.label}
              label={`${p.icon} ${p.label}`}
              onClick={() => send(p.prompt)}
              disabled={busy}
              sx={{
                height: 28, 
                color: '#f1f5f9', 
                fontWeight: 600, 
                fontSize: '0.75rem',
                backgroundColor: 'rgba(255,255,255,0.08)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': { 
                  backgroundColor: 'rgba(0,168,168,0.18)',
                  transform: 'translateY(-1px)'
                },
                '&.Mui-disabled': {
                  opacity: 0.5,
                  color: '#94a3b8'
                },
                borderRadius: '16px'
              }}
            />
          ))}
        </Stack>

        {/* Messages */}
        <Box ref={messagesBoxRef} sx={{
          flex: 1, 
          overflow: 'auto', 
          background: '#0f172a',
          border: '1px solid #334155', 
          borderRadius: '8px', 
          p: 1.5
        }}>
          <Stack spacing={1}>
            {msgs.map((m, i) => (
              <Box key={i} sx={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                background: m.role === 'user' ? '#007070' : 'transparent',
                border: m.role === 'assistant' ? '1px solid #334155' : 'none',
                color: '#f1f5f9',
                p: 1, 
                borderRadius: '10px',
              }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {m.text}
                </Typography>
              </Box>
            ))}
            {busy && (
              <Stack direction="row" alignItems="center" spacing={1} sx={{ color: '#94a3b8' }}>
                <CircularProgress size={16} sx={{ color: '#00a8a8' }} />
                <Typography variant="caption">Working…</Typography>
              </Stack>
            )}
            <div ref={messagesEndRef} />
          </Stack>
        </Box>

        {/* Input */}
        <Stack direction="row" spacing={1}>
          <TextField
            fullWidth 
            size="small" 
            placeholder="Ask about threats, posture, or trends…"
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            disabled={busy}
            sx={{
              '& .MuiInputBase-root': { 
                background: '#0f172a', 
                color: '#f1f5f9', 
                borderRadius: '8px',
                '& input': {
                  color: '#f1f5f9'
                }
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#334155'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#00a8a8'
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
          />
          <Button
            variant="contained" 
            disabled={busy || !input.trim()}
            onClick={() => send(input)}
            sx={{
              textTransform: 'none', 
              fontWeight: 600, 
              borderRadius: '8px',
              background: '#00a8a8',
              minWidth: '80px',
              '&:hover': { background: '#007070' },
              '&.Mui-disabled': {
                background: '#334155',
                color: '#64748b'
              }
            }}
          >
            Send
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

