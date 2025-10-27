'use client'
import { useState } from 'react'
import {
  Box, Card, CardContent, Typography, Chip, Alert,
  Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText,
  LinearProgress, Divider
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Block as BlockIcon,
  Info as InfoIcon
} from '@mui/icons-material'

interface ThreatIndicator {
  detected: boolean
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  description: string
}

interface StructuredData {
  classification: string
  riskScore: number
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  indicators: ThreatIndicator[]
  checks: string[]
  notes: string
  recommendations: {
    critical?: string[]
    shortTerm?: string[]
    longTerm?: string[]
    doNot?: string[]
    general?: string[]
  }
}

interface TriageResultsProps {
  structured: StructuredData
}

export default function TriageResults({ structured }: TriageResultsProps) {
  const [expandedChecks, setExpandedChecks] = useState(false)
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return { bg: '#DC2626', text: '#FFF' }
      case 'HIGH': return { bg: '#F59E0B', text: '#FFF' }
      case 'MEDIUM': return { bg: '#3B82F6', text: '#FFF' }
      case 'LOW': return { bg: '#10B981', text: '#FFF' }
      default: return { bg: '#6B7280', text: '#FFF' }
    }
  }
  
  const severityColors = getSeverityColor(structured.severity)
  const riskPercentage = Math.min(structured.riskScore, 100)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Classification Header */}
      <Alert 
        severity={
          structured.severity === 'CRITICAL' || structured.severity === 'HIGH' ? 'error' :
          structured.severity === 'MEDIUM' ? 'warning' : 'info'
        }
        icon={
          structured.severity === 'CRITICAL' || structured.severity === 'HIGH' ? <ErrorIcon /> :
          structured.severity === 'MEDIUM' ? <WarningIcon /> : <InfoIcon />
        }
        sx={{ 
          fontSize: '1.1rem', 
          fontWeight: 600,
          '& .MuiAlert-message': { width: '100%' }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <span>{structured.classification}</span>
          <Chip 
            label={`${structured.severity}`}
            sx={{ 
              bgcolor: severityColors.bg, 
              color: severityColors.text,
              fontWeight: 700,
              fontSize: '0.9rem'
            }}
          />
        </Box>
      </Alert>

      {/* Risk Score */}
      <Card sx={{ bgcolor: 'background.paper', border: 2, borderColor: 'divider' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Risk Score
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: severityColors.bg }}>
              {structured.riskScore}/100
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={riskPercentage} 
            sx={{ 
              height: 12, 
              borderRadius: 2,
              bgcolor: 'divider',
              '& .MuiLinearProgress-bar': { 
                bgcolor: severityColors.bg,
                borderRadius: 2
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Threat Indicators */}
      {structured.indicators && structured.indicators.length > 0 && (
        <Card sx={{ bgcolor: 'background.paper', border: '2px solid #ef4444' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 1 }}>
              <ErrorIcon /> Threat Indicators Detected
            </Typography>
            <List sx={{ p: 0 }}>
              {structured.indicators.map((indicator, idx) => (
                <ListItem 
                  key={idx}
                  sx={{ 
                    bgcolor: 'background.default', 
                    mb: 1, 
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Chip 
                      label={indicator.severity}
                      size="small"
                      sx={{ 
                        bgcolor: getSeverityColor(indicator.severity).bg,
                        color: getSeverityColor(indicator.severity).text,
                        fontWeight: 700,
                        fontSize: '0.75rem'
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      Indicator {idx + 1}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary', pl: 0 }}>
                    {indicator.description}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Recommendations - Critical */}
      {structured.recommendations.critical && structured.recommendations.critical.length > 0 && (
        <Accordion defaultExpanded>
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon />}
            sx={{ 
              bgcolor: 'background.paper',
              borderLeft: '4px solid #DC2626',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <Typography sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, color: '#DC2626' }}>
              <ErrorIcon sx={{ color: '#DC2626' }} /> CRITICAL Actions (Within 1 hour)
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ bgcolor: 'background.default' }}>
            <List dense>
              {structured.recommendations.critical.map((action, idx) => (
                <ListItem key={idx}>
                  <ListItemText 
                    primary={action}
                    primaryTypographyProps={{ fontSize: '0.95rem', color: 'text.primary' }}
                  />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Recommendations - Short Term */}
      {structured.recommendations.shortTerm && structured.recommendations.shortTerm.length > 0 && (
        <Accordion>
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon />}
            sx={{ 
              bgcolor: 'background.paper',
              borderLeft: '4px solid #F59E0B',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <Typography sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, color: '#F59E0B' }}>
              <ScheduleIcon sx={{ color: '#F59E0B' }} /> Short-Term Actions (Within 24 hours)
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ bgcolor: 'background.default' }}>
            <List dense>
              {structured.recommendations.shortTerm.map((action, idx) => (
                <ListItem key={idx}>
                  <ListItemText 
                    primary={action}
                    primaryTypographyProps={{ fontSize: '0.95rem', color: 'text.primary' }}
                  />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Recommendations - Long Term */}
      {structured.recommendations.longTerm && structured.recommendations.longTerm.length > 0 && (
        <Accordion>
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon />}
            sx={{ 
              bgcolor: 'background.paper',
              borderLeft: '4px solid #10B981',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <Typography sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, color: '#10B981' }}>
              <CheckCircleIcon sx={{ color: '#10B981' }} /> Long-Term Improvements
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ bgcolor: 'background.default' }}>
            <List dense>
              {structured.recommendations.longTerm.map((action, idx) => (
                <ListItem key={idx}>
                  <ListItemText 
                    primary={action}
                    primaryTypographyProps={{ fontSize: '0.95rem', color: 'text.primary' }}
                  />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      )}

      {/* DO NOT Actions */}
      {structured.recommendations.doNot && structured.recommendations.doNot.length > 0 && (
        <Card sx={{ bgcolor: 'background.paper', border: '2px solid #DC2626' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#DC2626', display: 'flex', alignItems: 'center', gap: 1 }}>
              <BlockIcon /> DO NOT
            </Typography>
            <List dense sx={{ bgcolor: 'background.default', borderRadius: 1, p: 1 }}>
              {structured.recommendations.doNot.map((action, idx) => (
                <ListItem key={idx}>
                  <ListItemText 
                    primary={`❌ ${action}`}
                    primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: 600, color: '#DC2626' }}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* General Recommendations */}
      {structured.recommendations.general && structured.recommendations.general.length > 0 && (
        <Card sx={{ bgcolor: 'background.paper', border: '2px solid #3B82F6' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#3B82F6', display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon /> Recommendations
            </Typography>
            <List dense sx={{ bgcolor: 'background.default', borderRadius: 1, p: 1 }}>
              {structured.recommendations.general.map((action, idx) => (
                <ListItem key={idx}>
                  <ListItemText 
                    primary={action}
                    primaryTypographyProps={{ fontSize: '0.95rem', color: 'text.primary' }}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Security Checks Performed */}
      <Accordion expanded={expandedChecks} onChange={() => setExpandedChecks(!expandedChecks)}>
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon />}
          sx={{ bgcolor: 'background.default' }}
        >
          <Typography sx={{ fontWeight: 600, color: 'text.secondary' }}>
            Security Checks Performed ({structured.checks.length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List dense>
            {structured.checks.map((check, idx) => (
              <ListItem key={idx}>
                <CheckCircleIcon sx={{ color: 'success.main', mr: 1, fontSize: '1.2rem' }} />
                <ListItemText primary={check} primaryTypographyProps={{ fontSize: '0.9rem' }} />
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

      {/* Notes */}
      {structured.notes && (
        <Card sx={{ bgcolor: 'background.default', border: 1, borderColor: 'divider' }}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.secondary' }}>
              Threat Description
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.primary', whiteSpace: 'pre-wrap' }}>
              {structured.notes}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}







