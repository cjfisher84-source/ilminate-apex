'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertTitle, Box, Chip, CircularProgress, Typography, Card, CardContent, Grid } from '@mui/material';
import { Shield, AlertTriangle, TrendingUp, Info } from 'lucide-react';

interface IOC {
  type: 'url' | 'domain' | 'ip' | 'hash' | 'email';
  value: string;
}

interface EnrichmentResult {
  type: string;
  value: string;
  risk_score: number;
  confidence: number;
  sources: string[];
  first_seen: string | null;
  last_seen: string | null;
  tenants_seen: number;
  categories: string[];
  campaigns: string[];
  malware_families: string[];
}

interface ThreatIntelligenceProps {
  indicators: IOC[];
  tenantId?: string;
  onEnrichmentComplete?: (results: EnrichmentResult[]) => void;
}

/**
 * Threat Intelligence Component
 * 
 * Displays threat intelligence enrichment results for IOCs
 * Integrates with Ilminate TIP (Threat Intelligence Platform)
 */
export default function ThreatIntelligence({
  indicators,
  tenantId,
  onEnrichmentComplete,
}: ThreatIntelligenceProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<EnrichmentResult[]>([]);

  useEffect(() => {
    if (!indicators || indicators.length === 0) {
      setLoading(false);
      return;
    }

    const enrichIndicators = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/intel/enrich', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tenant_id: tenantId,
            indicators,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        setResults(data.results || []);
        
        if (onEnrichmentComplete) {
          onEnrichmentComplete(data.results || []);
        }
      } catch (err: any) {
        console.error('[ThreatIntelligence] Enrichment error:', err);
        setError(err.message || 'Failed to enrich indicators');
      } finally {
        setLoading(false);
      }
    };

    enrichIndicators();
  }, [indicators, tenantId, onEnrichmentComplete]);

  const getRiskColor = (score: number): 'error' | 'warning' | 'info' | 'success' => {
    if (score >= 80) return 'error';
    if (score >= 50) return 'warning';
    if (score > 0) return 'info';
    return 'success';
  };

  const getRiskLabel = (score: number): string => {
    if (score >= 80) return 'Critical';
    if (score >= 50) return 'High';
    if (score > 0) return 'Medium';
    return 'Low';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress size={24} />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Enriching threat intelligence...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="warning" icon={<Info />}>
        <AlertTitle>Threat Intelligence Unavailable</AlertTitle>
        {error}
      </Alert>
    );
  }

  if (results.length === 0) {
    return (
      <Alert severity="info" icon={<Info />}>
        No threat intelligence data available for these indicators.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Shield size={20} />
        Threat Intelligence
      </Typography>
      
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {results.map((result, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {result.type.toUpperCase()}
                  </Typography>
                  <Chip
                    label={`${getRiskLabel(result.risk_score)} (${result.risk_score})`}
                    color={getRiskColor(result.risk_score)}
                    size="small"
                    icon={result.risk_score >= 50 ? <AlertTriangle size={14} /> : undefined}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, wordBreak: 'break-all' }}>
                  {result.value}
                </Typography>

                {result.sources.length > 0 && (
                  <Box mb={1}>
                    <Typography variant="caption" color="text.secondary">
                      Sources:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                      {result.sources.map((source, i) => (
                        <Chip
                          key={i}
                          label={source}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {result.categories.length > 0 && (
                  <Box mb={1}>
                    <Typography variant="caption" color="text.secondary">
                      Categories:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                      {result.categories.map((cat, i) => (
                        <Chip
                          key={i}
                          label={cat}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {result.tenants_seen > 0 && (
                  <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                    Seen by {result.tenants_seen} other tenant{result.tenants_seen !== 1 ? 's' : ''}
                  </Typography>
                )}

                {result.first_seen && (
                  <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                    First seen: {new Date(result.first_seen).toLocaleDateString()}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

