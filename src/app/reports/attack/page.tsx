'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CircularProgress, List, ListItem, ListItemText, Chip } from '@mui/material';
import AttackMatrix from '@/components/AttackMatrix';
import { getTechniqueMeta, TechniqueMeta } from '@/lib/attackMeta';

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

  useEffect(() => {
    (async () => {
      try {
        const [layerData, metaData] = await Promise.all([
          fetch('/api/attack/layer').then(r => r.json()),
          getTechniqueMeta()
        ]);
        setLayer(layerData);
        setMeta(metaData);
      } catch (error) {
        console.error('Failed to load ATT&CK data:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function onClickTechnique(techId: string) {
    // TODO: Wire to your events list when ready
    window.location.href = `/events?technique=${encodeURIComponent(techId)}`;
  }

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <CircularProgress sx={{ color: '#00a8a8' }} />
        <Typography sx={{ ml: 2 }}>Loading ATT&CK report…</Typography>
      </Box>
    );
  }

  if (!layer || !meta.length) {
    return (
      <Box sx={{ p: 6 }}>
        <Typography color="error">Failed to load ATT&CK data</Typography>
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          MITRE ATT&CK® Report
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Observed techniques mapped to the MITRE ATT&CK framework
        </Typography>
      </Box>

      {/* Matrix */}
      <Card sx={{ 
        mb: 4, 
        p: 3, 
        bgcolor: 'background.paper',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0, 168, 168, 0.1)'
      }}>
        <AttackMatrix layer={layer} meta={meta} onClickTechnique={onClickTechnique} />
      </Card>

      {/* Top Techniques Card */}
      <Card sx={{ 
        p: 3, 
        bgcolor: 'background.paper',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0, 168, 168, 0.1)'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Top Techniques (Last 30 Days)
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

