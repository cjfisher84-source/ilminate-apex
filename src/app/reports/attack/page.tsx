'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CircularProgress, List, ListItem, ListItemText, Chip, Button } from '@mui/material';
import Link from 'next/link';
import AttackMatrix from '@/components/AttackMatrix';
import { getTechniqueMeta, TechniqueMeta } from '@/lib/attackMeta';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type Layer = {
  name: string;
  description?: string;
  domain: string;
  techniques: { techniqueID: string; score: number }[];
  gradient?: { colors: string[] };
  legendItems?: { label: string; value: number }[];
};

export default function AttackReport() {
  const [layer, setLayer] = useState<Layer | null>(null);
  const [meta, setMeta] = useState<TechniqueMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    (async () => {
      try {
        console.log('Fetching ATT&CK data...');
        const [layerData, metaData] = await Promise.all([
          fetch('/api/attack/layer', { cache: 'no-store' }).then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
          }),
          getTechniqueMeta()
        ]);
        
        if (mounted) {
          console.log('Data loaded:', { layer: layerData, meta: metaData.length });
          setLayer(layerData);
          setMeta(metaData);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load ATT&CK data:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load');
          setLoading(false);
        }
      }
    })();
    
    return () => { mounted = false; };
  }, []);

  function onClickTechnique(techId: string) {
    // TODO: Wire to your events list when ready
    window.location.href = `/events?technique=${encodeURIComponent(techId)}`;
  }

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        bgcolor: 'background.default'
      }}>
        <CircularProgress sx={{ color: '#00a8a8', mb: 2 }} size={60} />
        <Typography sx={{ color: 'text.primary', fontSize: '1.1rem' }}>
          Loading ATT&CK Matrix...
        </Typography>
      </Box>
    );
  }

  if (error || !layer || !meta.length) {
    return (
      <Box sx={{ 
        p: 6,
        bgcolor: 'background.default',
        minHeight: '100vh'
      }}>
        <Card sx={{ p: 4, bgcolor: 'background.paper', maxWidth: 600, mx: 'auto', mt: 8 }}>
          <Typography variant="h5" sx={{ color: '#DC2626', mb: 2, fontWeight: 700 }}>
            Failed to Load ATT&CK Data
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 2 }}>
            {error || 'Unable to fetch technique data'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 2 }}>
            Try refreshing the page or check the browser console for details.
          </Typography>
        </Card>
      </Box>
    );
  }

  const topTechniques = [...layer.techniques]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3, md: 4 }, 
      bgcolor: 'background.default',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        mb: 4,
        gap: 2
      }}>
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 800, 
              mb: 1,
              background: 'linear-gradient(135deg, #00a8a8 0%, #007070 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            MITRE ATT&CK® Matrix
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1.1rem' }}>
            Real-time threat technique detection and mapping
          </Typography>
        </Box>
        <Link href="/" passHref legacyBehavior>
          <Button 
            variant="outlined" 
            component="a" 
            size="large"
            color="primary"
            sx={{ 
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600
            }}
          >
            ← Dashboard
          </Button>
        </Link>
      </Box>

      {/* Matrix */}
      <Card sx={{ 
        mb: 4, 
        p: { xs: 2, sm: 3 }, 
        bgcolor: 'background.paper',
        borderRadius: 4,
        boxShadow: '0 8px 32px rgba(0, 168, 168, 0.12)',
        border: '1px solid',
        borderColor: 'divider'
      }}>
        <AttackMatrix layer={layer} meta={meta} onClickTechnique={onClickTechnique} />
      </Card>

      {/* Top Techniques Card */}
      <Card sx={{ 
        p: { xs: 2, sm: 3 }, 
        bgcolor: 'background.paper',
        borderRadius: 4,
        boxShadow: '0 8px 32px rgba(0, 168, 168, 0.12)',
        border: '1px solid',
        borderColor: 'divider'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
          🔥 Top Techniques (Last 30 Days)
        </Typography>
        <List dense>
          {topTechniques.map((t, idx) => {
            const techMeta = meta.find(m => m.id === t.techniqueID);
            return (
              <ListItem 
                key={t.techniqueID}
                sx={{ 
                  py: 1.5,
                  borderBottom: idx < topTechniques.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider'
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip 
                        label={`#${idx + 1}`} 
                        size="small"
                        sx={{ 
                          minWidth: '40px',
                          bgcolor: idx === 0 ? '#DC2626' : idx === 1 ? '#F97316' : idx === 2 ? '#FBBF24' : 'rgba(0, 168, 168, 0.2)',
                          color: idx < 3 ? 'white' : 'text.primary',
                          fontWeight: 700
                        }}
                      />
                      <Typography 
                        component="button"
                        onClick={() => onClickTechnique(t.techniqueID)}
                        sx={{ 
                          cursor: 'pointer',
                          textDecoration: 'none',
                          color: '#00a8a8',
                          fontWeight: 600,
                          fontSize: '0.95rem',
                          '&:hover': { textDecoration: 'underline' },
                          border: 'none',
                          background: 'none',
                          p: 0,
                          textAlign: 'left'
                        }}
                      >
                        {t.techniqueID}
                      </Typography>
                      <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary' }}>
                        {techMeta?.name || 'Unknown Technique'}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Chip 
                        label={`${t.score} detections`}
                        size="small"
                        sx={{ 
                          bgcolor: 'rgba(0, 168, 168, 0.1)',
                          color: '#00a8a8',
                          fontWeight: 600,
                          fontSize: '0.75rem'
                        }}
                      />
                      {techMeta?.tactics.map(tactic => (
                        <Chip
                          key={tactic}
                          label={tactic}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(100, 100, 100, 0.1)',
                            fontSize: '0.7rem'
                          }}
                        />
                      ))}
                    </Box>
                  }
                />
              </ListItem>
            );
          })}
        </List>
      </Card>

      {/* Footer Note */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(0, 168, 168, 0.05)', borderRadius: 2 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          📊 <strong>Note:</strong> This report shows automated mapping of observed security events to MITRE ATT&CK techniques. 
          Data aggregates detections from the last 30 days. Click any technique to view related events.
        </Typography>
      </Box>
    </Box>
  );
}

