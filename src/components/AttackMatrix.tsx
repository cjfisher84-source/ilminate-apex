'use client';

import React from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Link from 'next/link';

type TechniqueScore = { techniqueID: string; score: number };
type Layer = { 
  name: string; 
  description?: string; 
  techniques: TechniqueScore[]; 
  gradient?: { colors: string[] } 
};
type TechniqueMeta = { id: string; name: string; tactics: string[] };

const UNCW_TEAL = '#00a8a8';

function scoreToAlpha(score: number, max: number) { 
  if (!max) return 0; 
  const x = Math.min(score / max, 1); 
  return 0.15 + x * 0.85; 
}

export default function AttackMatrix({ 
  layer, 
  meta, 
  onClickTechnique 
}: {
  layer: Layer; 
  meta: TechniqueMeta[]; 
  onClickTechnique?: (techId: string) => void;
}) {
  const theme = useTheme();
  const scoreMap = new Map(layer.techniques.map(t => [t.techniqueID, t.score]));
  const maxScore = Math.max(1, ...layer.techniques.map(t => t.score));
  
  const tacticOrder = [
    'Reconnaissance',
    'Resource Development',
    'Initial Access',
    'Execution',
    'Persistence',
    'Privilege Escalation',
    'Defense Evasion',
    'Credential Access',
    'Discovery',
    'Lateral Movement',
    'Collection',
    'Command & Control',
    'Exfiltration',
    'Impact'
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
        {layer.name}
      </Typography>
      {layer.description && (
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          {layer.description}
        </Typography>
      )}
      
      <Box sx={{ 
        overflowX: 'auto',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.default'
      }}>
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: `220px repeat(${tacticOrder.length}, minmax(100px, 1fr))`,
          minWidth: '1400px'
        }}>
          {/* Header row */}
          <Box sx={{ 
            position: 'sticky',
            left: 0,
            zIndex: 10,
            bgcolor: 'rgba(0, 168, 168, 0.08)',
            p: 2,
            fontWeight: 700,
            borderBottom: '2px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            color: UNCW_TEAL
          }}>
            Technique
          </Box>
          {tacticOrder.map(t => (
            <Box 
              key={t} 
              sx={{ 
                p: 1.5,
                fontSize: '0.75rem',
                fontWeight: 700,
                textAlign: 'center',
                bgcolor: 'rgba(0, 168, 168, 0.08)',
                borderBottom: '2px solid',
                borderLeft: '1px solid',
                borderColor: 'divider',
                color: UNCW_TEAL,
                lineHeight: 1.2
              }}
            >
              {t}
            </Box>
          ))}

          {/* Technique rows */}
          {meta.map(tech => {
            const score = scoreMap.get(tech.id) || 0;
            const alpha = scoreToAlpha(score, maxScore);
            
            return (
              <React.Fragment key={tech.id}>
                <Box sx={{ 
                  position: 'sticky',
                  left: 0,
                  zIndex: 5,
                  bgcolor: 'background.paper',
                  p: 1.5,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5
                }}>
                  <Button
                    onClick={() => onClickTechnique?.(tech.id)}
                    sx={{
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      p: 0,
                      minWidth: 0,
                      textTransform: 'none',
                      '&:hover': {
                        bgcolor: 'transparent',
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    <Box>
                      <Chip 
                        label={tech.id}
                        size="small"
                        sx={{
                          height: '20px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          bgcolor: UNCW_TEAL,
                          color: 'white',
                          mb: 0.5
                        }}
                      />
                      <Typography 
                        sx={{ 
                          fontSize: '0.75rem',
                          color: 'text.secondary',
                          lineHeight: 1.3,
                          fontWeight: 500
                        }}
                      >
                        {tech.name}
                      </Typography>
                    </Box>
                  </Button>
                </Box>
                
                {tacticOrder.map(tac => {
                  const active = tech.tactics.includes(tac);
                  const bgColor = active && score 
                    ? `rgba(0, 168, 168, ${alpha})`
                    : 'transparent';
                  
                  return (
                    <Box 
                      key={tech.id + tac} 
                      sx={{
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        borderLeft: '1px solid',
                        opacity: active ? 1 : 0.15,
                        minHeight: '60px',
                        bgcolor: bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        transition: 'all 0.2s',
                        '&:hover': active && score ? {
                          boxShadow: `inset 0 0 0 2px ${UNCW_TEAL}`,
                          opacity: 1
                        } : {}
                      }}
                      title={active ? `${tech.id}: ${tech.name}\nDetections: ${score}` : ''}
                    >
                      {active && score > 0 && (
                        <Link href={`/events?technique=${tech.id}`} passHref legacyBehavior>
                          <Button
                            component="a"
                            sx={{ 
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              color: alpha > 0.5 ? 'white' : UNCW_TEAL,
                              minWidth: 'auto',
                              p: 0.5,
                              '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.2)',
                                textDecoration: 'underline'
                              }
                            }}
                          >
                            {score}
                          </Button>
                        </Link>
                      )}
                    </Box>
                  );
                })}
              </React.Fragment>
            );
          })}
        </Box>
      </Box>
      
      <Box sx={{ 
        mt: 2, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        flexWrap: 'wrap'
      }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Max detections: <strong>{maxScore}</strong>
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 40, height: 12, bgcolor: 'rgba(0, 168, 168, 0.2)', borderRadius: 1 }} />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Low</Typography>
          <Box sx={{ width: 40, height: 12, bgcolor: 'rgba(0, 168, 168, 0.6)', borderRadius: 1 }} />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Medium</Typography>
          <Box sx={{ width: 40, height: 12, bgcolor: UNCW_TEAL, borderRadius: 1 }} />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>High</Typography>
        </Box>
      </Box>
    </Box>
  );
}

