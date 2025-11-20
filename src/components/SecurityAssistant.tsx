'use client';

import * as React from 'react';
import {
  Box, Card, CardContent, Typography,
  Button, TextField, CircularProgress, Chip, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton
} from '@mui/material';
import { Close as CloseIcon, OpenInNew as OpenInNewIcon } from '@mui/icons-material';
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
  const messagesBoxRef = React.useRef<HTMLDivElement>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [lastMsgCount, setLastMsgCount] = React.useState(0);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalContent, setModalContent] = React.useState<Msg | null>(null);
  const [hasShownModal, setHasShownModal] = React.useState(false); // Track if modal was already shown
  
  // Function to start a new conversation
  const startNewConversation = () => {
    setMsgs([
      { role: 'assistant', text: 'Hi! I can investigate threats, suggest posture improvements, and summarize trends. Pick a quick action or ask anything.' }
    ]);
    setInput('');
    setModalOpen(false);
    setHasShownModal(false); // Reset modal tracking
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Auto-open modal ONLY for the FIRST long assistant response in a conversation
  // This keeps the chat open for follow-up questions
  React.useEffect(() => {
    // Check if we got a new assistant message
    if (msgs.length > lastMsgCount && msgs[msgs.length - 1].role === 'assistant' && !busy) {
      setLastMsgCount(msgs.length);
      const lastMsg = msgs[msgs.length - 1];
      
      // Only auto-open modal for FIRST long response (not follow-ups)
      // This keeps chat accessible for continuous conversation
      if (lastMsg.text.length > 200 && !hasShownModal) {
        setTimeout(() => {
          setModalContent(lastMsg);
          setModalOpen(true);
          setHasShownModal(true); // Mark that we've shown the modal
        }, 150);
      }
    }
  }, [msgs, busy, lastMsgCount, hasShownModal]);

  // Component mount logging
  React.useEffect(() => {
    log.ui('SecurityAssistant mounted', { presetCount: PRESETS.length });
  }, []);

  async function send(promptText: string) {
    if (!promptText.trim()) return;
    
    log.ui('SecurityAssistant query', { prompt: promptText.substring(0, 50), messageCount: msgs.length });
    
    const next: Msg = { role: 'user', text: promptText.trim() };
    setMsgs((m) => [...m, next]);
    setInput('');
    setBusy(true);
    
    try {
      // Send conversation history (excluding the initial greeting) for context
      // Include all previous messages for proper context
      const conversationHistory = msgs
        .filter((m, i) => i > 0) // Skip initial greeting
        .map(m => ({ 
          role: m.role, 
          text: m.text,
          content: m.text  // Also include 'content' for compatibility
        }));
      
      log.ui('SecurityAssistant sending conversation', { 
        historyLength: conversationHistory.length,
        lastMessage: conversationHistory[conversationHistory.length - 1]?.text?.substring(0, 50)
      });
      
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: promptText,
          messages: conversationHistory
        }),
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      const assistantReply = { role: 'assistant' as const, text: data.reply ?? 'No response.' };
      setMsgs((m) => [...m, assistantReply]);
      
      // Auto-scroll to bottom after new message
      setTimeout(() => {
        messagesBoxRef.current?.scrollTo({
          top: messagesBoxRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
      
      log.ui('SecurityAssistant response received', { 
        responseLength: data.reply?.length || 0,
        conversationLength: conversationHistory.length + 1,
        totalMessages: msgs.length + 1
      });
    } catch (e: any) {
      log.ui('SecurityAssistant error', { error: e?.message });
      setMsgs((m) => [...m, { role: 'assistant', text: `Sorry—something went wrong (${e?.message || 'error'}).` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
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
              <Box 
                key={i} 
                data-role={m.role}
                onClick={() => {
                  // Click assistant messages to view in modal
                  if (m.role === 'assistant' && m.text.length > 100) {
                    setModalContent(m);
                    setModalOpen(true);
                  }
                }}
                sx={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: m.role === 'user' ? '#007070' : 'transparent',
                  border: m.role === 'assistant' ? '1px solid #334155' : 'none',
                  color: '#f1f5f9',
                  p: 1, 
                  borderRadius: '10px',
                  cursor: m.role === 'assistant' && m.text.length > 100 ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  '&:hover': m.role === 'assistant' && m.text.length > 100 ? {
                    borderColor: '#00a8a8',
                    backgroundColor: 'rgba(0, 168, 168, 0.05)'
                  } : {}
                }}
              >
                <Typography 
                  variant="body2" 
                  component="div"
                  sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}
                >
                  {m.text}
                </Typography>
                {m.role === 'assistant' && m.text.length > 200 && (
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#00a8a8', fontSize: '0.7rem' }}>
                    Click to view full response ↗
                  </Typography>
                )}
              </Box>
            ))}
            {busy && (
              <Stack direction="row" alignItems="center" spacing={1} sx={{ color: '#94a3b8' }}>
                <CircularProgress size={16} sx={{ color: '#00a8a8' }} />
                <Typography variant="caption">Working…</Typography>
              </Stack>
            )}
          </Stack>
        </Box>

        {/* Input */}
        <Stack direction="row" spacing={1}>
          <TextField
            inputRef={inputRef}
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

    {/* Full Response Modal - Non-blocking for continuous conversation */}
    <Dialog
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      maxWidth="md"
      fullWidth
      hideBackdrop
      disableEnforceFocus={true} // Allow interaction with chat below
      disableAutoFocus={true} // Don't steal focus from input
      disableScrollLock
      PaperProps={{
        sx: {
          bgcolor: '#1e293b',
          border: '2px solid #00a8a8',
          borderRadius: '16px',
          maxHeight: '80vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: '#0f172a', 
        color: '#00a8a8', 
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #334155'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <OpenInNewIcon sx={{ fontSize: '1.2rem' }} />
          Security Assistant Response
        </Box>
        <IconButton 
          onClick={() => setModalOpen(false)}
          size="small"
          sx={{ color: '#94a3b8', '&:hover': { color: '#00a8a8' } }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ 
        bgcolor: '#1e293b', 
        color: '#f1f5f9',
        p: 3,
        overflowY: 'auto'
      }}>
        {modalContent && (
          <Typography 
            variant="body1" 
            component="div"
            sx={{ 
              whiteSpace: 'pre-wrap', 
              lineHeight: 1.8,
              fontSize: '1rem'
            }}
          >
            {modalContent.text}
          </Typography>
        )}
      </DialogContent>
      
      <DialogActions sx={{ 
        bgcolor: '#0f172a', 
        borderTop: '1px solid #334155',
        p: 2,
        gap: 2
      }}>
        <Button
          onClick={() => setModalOpen(false)}
          variant="outlined"
          sx={{
            borderColor: '#334155',
            color: '#f1f5f9',
            '&:hover': {
              borderColor: '#00a8a8',
              bgcolor: 'rgba(0, 168, 168, 0.1)'
            }
          }}
        >
          Close
        </Button>
        <Button
          onClick={() => {
            setModalOpen(false);
            // Don't clear input - allow user to continue conversation
            // Focus input field after modal closes
            setTimeout(() => {
              inputRef.current?.focus();
            }, 100);
          }}
          variant="contained"
          sx={{
            bgcolor: '#00a8a8',
            '&:hover': { bgcolor: '#007070' }
          }}
        >
          Continue Chat (Chat Stays Open)
        </Button>
        <Button
          onClick={startNewConversation}
          variant="outlined"
          sx={{
            borderColor: '#334155',
            color: '#f1f5f9',
            '&:hover': {
              borderColor: '#00a8a8',
              bgcolor: 'rgba(0, 168, 168, 0.1)'
            }
          }}
        >
          New Conversation
        </Button>
      </DialogActions>
    </Dialog>
  </>
  );
}

