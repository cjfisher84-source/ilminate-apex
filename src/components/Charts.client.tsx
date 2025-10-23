'use client'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Legend, LineChart, Line, PieChart, Pie, Cell, Sankey } from 'recharts'
import { mockTimeline30d, mockCyberScore, mockAIThreats, mockEDRMetrics30d, mockEDREndpointBreakdown, mockEDRThreatTypes, mockGeoThreatMap, mockAIExploitDetection, mockCrossChannelTimeline, mockThreatFamilies, mockPeerComparison } from '@/lib/mock'
import { Box, Typography, Chip, useTheme, Button } from '@mui/material'
import { useEffect, useState, useRef, useMemo } from 'react'
import { useIsMobile, getResponsiveChartHeight } from '@/lib/mobileUtils'
import { log } from '@/utils/log'
import '../../styles/reports.css'

const UNCW_TEAL = '#007070'
const UNCW_GOLD = '#FFD700'
const TEAL_LIGHT = '#4DB8B8'
const GOLD_DARK = '#E6C200'

export function TimelineArea() {
  const isMobile = useIsMobile()
  const theme = useTheme()
  const data = mockTimeline30d()
  const chartHeight = getResponsiveChartHeight(isMobile, 520)
  
  useEffect(() => {
    log.chart('TimelineArea mounted', { isMobile, theme: theme.palette.mode })
  }, [isMobile, theme.palette.mode])
  
  return (
    <div 
      className={isMobile ? 'mobile-chart-container' : ''}
      style={{ 
        backgroundColor: theme.palette.background.paper, 
        borderRadius: 16, 
        padding: isMobile ? 16 : 32, 
        border: `2px solid ${theme.palette.divider}`,
        height: chartHeight,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.3s ease'
      }}>
      <div style={{ 
        marginBottom: isMobile ? 16 : 24, 
        color: theme.palette.text.primary, 
        fontSize: isMobile ? '1.1rem' : '1.3rem', 
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? 8 : 12
      }}>
        <div style={{ width: 4, height: isMobile ? 20 : 28, backgroundColor: UNCW_TEAL, borderRadius: 2 }}></div>
        {isMobile ? 'Threat Timeline (30d)' : 'Threat Timeline — last 30 days'}
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: isMobile ? 5 : 20, left: isMobile ? -20 : 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorQuarantined" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={UNCW_TEAL} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={UNCW_TEAL} stopOpacity={0.05}/>
            </linearGradient>
            <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={UNCW_GOLD} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={UNCW_GOLD} stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: isMobile ? 9 : 11, fill: theme.palette.text.secondary }} 
            angle={-45} 
            textAnchor="end" 
            height={isMobile ? 50 : 60}
            interval={isMobile ? 'preserveStartEnd' : 0}
          />
          <YAxis tick={{ fontSize: isMobile ? 9 : 11, fill: theme.palette.text.secondary }} width={isMobile ? 35 : 50} />
          <Tooltip 
            cursor={false}
            contentStyle={{ backgroundColor: theme.palette.background.paper, border: `2px solid ${UNCW_TEAL}`, borderRadius: 12, padding: 12, fontSize: isMobile ? '0.8rem' : '1rem', color: theme.palette.text.primary }}
            labelStyle={{ color: '#94a3b8' }}
            itemStyle={{ color: '#f1f5f9' }}
          />
          <Legend wrapperStyle={{ paddingTop: isMobile ? 12 : 20, fontSize: isMobile ? '0.8rem' : '1rem' }} />
          <Area type="monotone" dataKey="quarantined" name="Quarantined" stroke={UNCW_TEAL} strokeWidth={isMobile ? 2 : 3} fill="url(#colorQuarantined)" />
          <Area type="monotone" dataKey="delivered" name="Delivered" stroke={UNCW_GOLD} strokeWidth={isMobile ? 2 : 3} fill="url(#colorDelivered)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function QuarantineDeliveredBars() {
  const data = mockTimeline30d().map(d=>({date:d.date, quarantined:d.quarantined, delivered:d.delivered}))
  return (
    <div style={{ 
      backgroundColor: '#FFFFFF', 
      borderRadius: 16, 
      padding: 32, 
      border: '2px solid #E0E4E8',
      height: 420,
      boxShadow: '0 4px 16px rgba(0, 112, 112, 0.08)'
    }}>
      <div style={{ 
        marginBottom: 24, 
        color: '#1a1a1a', 
        fontSize: '1.3rem', 
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <div style={{ width: 4, height: 28, backgroundColor: UNCW_GOLD, borderRadius: 2 }}></div>
        Quarantined vs Delivered — last 30 days
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#999' }} hide />
          <YAxis tick={{ fontSize: 11, fill: '#666' }} width={50} />
          <Tooltip 
            cursor={false}
            contentStyle={{ backgroundColor: '#FFFFFF', border: '2px solid #007070', borderRadius: 12, padding: 12 }}
            labelStyle={{ color: '#94a3b8' }}
            itemStyle={{ color: '#f1f5f9' }}
          />
          <Legend wrapperStyle={{ paddingTop: 16 }} />
          <Bar dataKey="quarantined" name="Quarantined" fill={UNCW_TEAL} radius={[6, 6, 0, 0]} />
          <Bar dataKey="delivered" name="Delivered" fill={UNCW_GOLD} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function CyberScoreDonut() {
  const theme = useTheme()
  const score = mockCyberScore()
  const data = [{name:'Score', value:score}, {name:'Gap', value:100-score}]
  
  useEffect(() => {
    log.chart('CyberScoreDonut mounted', { score, theme: theme.palette.mode })
  }, [score, theme.palette.mode])
  
  // Additional cyber metrics to fill the space
  const metrics = [
    { label: 'Protection Rate', value: '94.2%', color: '#10b981' },
    { label: 'Response Time', value: '2.3m', color: UNCW_GOLD },
    { label: 'False Positives', value: '0.8%', color: '#f97316' },
    { label: 'Coverage', value: '99.1%', color: UNCW_TEAL }
  ]
  
  return (
    <div style={{ 
      backgroundColor: theme.palette.background.paper, 
      borderRadius: 16, 
      padding: 24, 
      border: `2px solid ${theme.palette.divider}`,
      height: 320,
      position: 'relative',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ 
        marginBottom: 16, 
        color: theme.palette.text.primary, 
        fontSize: '1.1rem', 
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        <div style={{ width: 3, height: 20, backgroundColor: UNCW_TEAL, borderRadius: 2 }}></div>
        Cyber Security Score
      </div>
      
      {/* Donut Chart */}
      <div style={{ 
        position: 'relative', 
        height: 140, 
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie 
              data={data} 
              dataKey="value" 
              innerRadius="70%" 
              outerRadius="85%" 
              startAngle={90} 
              endAngle={-270}
              cx="50%"
              cy="50%"
            >
              <Cell fill={UNCW_TEAL} />
              <Cell fill={theme.palette.divider} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Responsive Centered Score - Fixed overlap issue */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
          width: 'auto',
          height: 'auto',
          maxWidth: '60px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ 
            fontSize: '1.1rem',
            fontWeight: 800, 
            color: UNCW_TEAL, 
            lineHeight: 1,
            textAlign: 'center',
            margin: 0,
            padding: 0,
            whiteSpace: 'nowrap'
          }}>
            {score}<span style={{ fontSize: '0.4em', opacity: 0.8, fontWeight: 600 }}>/100</span>
          </div>
        </div>
      </div>
      
      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, flex: 1 }}>
        {metrics.map((metric, idx) => (
          <div key={idx} style={{
            textAlign: 'center',
            padding: '8px 6px',
            backgroundColor: theme.palette.background.default,
            borderRadius: 6,
            border: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: metric.color, marginBottom: 2 }}>
              {metric.value}
            </div>
            <div style={{ fontSize: '0.6rem', fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
              {metric.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AIThreatsBar() {
  const isMobile = useIsMobile()
  const theme = useTheme()
  const data = mockAIThreats()
  const chartHeight = getResponsiveChartHeight(isMobile, 500)
  
  useEffect(() => {
    log.chart('AIThreatsBar mounted', { isMobile, theme: theme.palette.mode })
  }, [isMobile, theme.palette.mode])
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div style={{
          backgroundColor: theme.palette.background.paper,
          border: `2px solid ${UNCW_TEAL}`,
          borderRadius: 12,
          padding: 16,
          maxWidth: 300,
          color: theme.palette.text.primary
        }}>
          <div style={{ fontWeight: 700, color: UNCW_TEAL, marginBottom: 8 }}>{data.type}</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>{data.count} incidents</div>
          <div style={{ fontSize: '0.9rem', color: theme.palette.text.secondary, marginBottom: 8 }}>{data.description}</div>
          <div style={{ display: 'flex', gap: 12, fontSize: '0.85rem' }}>
            <span style={{ fontWeight: 600 }}>Severity: <span style={{ color: data.severity === 'Critical' ? '#ef4444' : data.severity === 'High' ? '#f97316' : '#FFD700' }}>{data.severity}</span></span>
            <span style={{ fontWeight: 600 }}>Trend: <span style={{ color: data.trend === 'Increasing' ? '#ef4444' : '#10b981' }}>{data.trend}</span></span>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div 
      className={isMobile ? 'mobile-chart-container' : ''}
      style={{ 
        backgroundColor: 'transparent', 
        borderRadius: 16, 
        padding: isMobile ? 16 : 32, 
        border: `2px solid ${theme.palette.divider}`,
        height: chartHeight,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
      }}>
      <div style={{ 
        marginBottom: isMobile ? 16 : 24, 
        color: theme.palette.text.primary, 
        fontSize: isMobile ? '1.1rem' : '1.3rem', 
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? 8 : 12
      }}>
        <div style={{ width: 4, height: isMobile ? 20 : 28, backgroundColor: UNCW_TEAL, borderRadius: 2 }}></div>
        AI Threats Breakdown
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          margin={{ top: 10, right: isMobile ? 5 : 20, left: isMobile ? -20 : 0, bottom: isMobile ? 60 : 80 }}
          style={{ backgroundColor: 'transparent' }}
        >
          <XAxis 
            dataKey="type" 
            tick={{ fontSize: isMobile ? 9 : 11, fill: theme.palette.text.secondary }} 
            angle={-20} 
            textAnchor="end" 
            height={isMobile ? 60 : 80}
            interval={0}
          />
          <YAxis 
            tick={{ fontSize: isMobile ? 9 : 11, fill: theme.palette.text.secondary }} 
            width={isMobile ? 35 : 50} 
            label={isMobile ? undefined : { value: 'Incidents', angle: -90, position: 'insideLeft', fill: theme.palette.text.secondary }} 
          />
          <Tooltip 
            cursor={false}
            content={<CustomTooltip />}
            labelStyle={{ color: '#94a3b8' }}
            itemStyle={{ color: '#f1f5f9' }}
          />
          <Bar dataKey="count" fill={UNCW_TEAL} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function EDRMetricsLines() {
  const isMobile = useIsMobile()
  const theme = useTheme()
  const data = mockEDRMetrics30d()
  const chartHeight = getResponsiveChartHeight(isMobile, 520)
  
  useEffect(() => {
    log.chart('EDRMetricsLines mounted', { isMobile, theme: theme.palette.mode })
  }, [isMobile, theme.palette.mode])
  
  return (
    <div 
      className={isMobile ? 'mobile-chart-container' : ''}
      style={{ 
        backgroundColor: theme.palette.background.paper, 
        borderRadius: 16, 
        padding: isMobile ? 16 : 32, 
        border: `2px solid ${theme.palette.divider}`,
        height: chartHeight,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
      }}>
      <div style={{ 
        marginBottom: isMobile ? 16 : 24, 
        color: theme.palette.text.primary, 
        fontSize: isMobile ? '1.1rem' : '1.3rem', 
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? 8 : 12
      }}>
        <div style={{ width: 4, height: isMobile ? 20 : 28, backgroundColor: UNCW_TEAL, borderRadius: 2 }}></div>
        {isMobile ? 'EDR Metrics (30d)' : 'EDR Metrics — last 30 days'}
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: isMobile ? 5 : 20, left: isMobile ? -20 : 0, bottom: 0 }}>
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: isMobile ? 9 : 11, fill: theme.palette.text.secondary }} 
            angle={-45} 
            textAnchor="end" 
            height={isMobile ? 50 : 60}
            interval={isMobile ? 'preserveStartEnd' : 0}
          />
          <YAxis tick={{ fontSize: isMobile ? 9 : 11, fill: theme.palette.text.secondary }} width={isMobile ? 35 : 50} />
          <Tooltip 
            cursor={false}
            contentStyle={{ backgroundColor: theme.palette.background.paper, border: `2px solid ${UNCW_TEAL}`, borderRadius: 12, padding: 12, fontSize: isMobile ? '0.8rem' : '1rem', color: theme.palette.text.primary }}
            labelStyle={{ color: '#94a3b8' }}
            itemStyle={{ color: '#f1f5f9' }}
          />
          <Legend wrapperStyle={{ paddingTop: isMobile ? 12 : 20, fontSize: isMobile ? '0.75rem' : '1rem' }} />
          <Line type="monotone" dataKey="detections" name="Detections" stroke={UNCW_TEAL} strokeWidth={isMobile ? 2 : 3} dot={{ fill: UNCW_TEAL, r: isMobile ? 3 : 4 }} />
          <Line type="monotone" dataKey="blocked" name="Blocked" stroke={UNCW_GOLD} strokeWidth={isMobile ? 2 : 3} dot={{ fill: UNCW_GOLD, r: isMobile ? 3 : 4 }} />
          <Line type="monotone" dataKey="endpointsOnline" name={isMobile ? 'Online' : 'Endpoints Online'} stroke={theme.palette.text.secondary} strokeWidth={isMobile ? 1.5 : 2} dot={{ fill: theme.palette.text.secondary, r: isMobile ? 2 : 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function EDREndpointStatus() {
  const isMobile = useIsMobile()
  const theme = useTheme()
  const data = mockEDREndpointBreakdown()
  const total = data.reduce((sum, item) => sum + item.count, 0)
  const chartHeight = getResponsiveChartHeight(isMobile, 420)
  
  useEffect(() => {
    log.chart('EDREndpointStatus mounted', { isMobile, theme: theme.palette.mode, total })
  }, [isMobile, theme.palette.mode, total])
  
  return (
    <div 
      className={isMobile ? 'mobile-chart-container' : ''}
      style={{ 
        backgroundColor: theme.palette.background.paper, 
        borderRadius: 16, 
        padding: isMobile ? 16 : 32, 
        border: `2px solid ${theme.palette.divider}`,
        height: chartHeight,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
      }}>
      <div style={{ 
        marginBottom: isMobile ? 16 : 24, 
        color: theme.palette.text.primary, 
        fontSize: isMobile ? '1.1rem' : '1.3rem', 
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? 8 : 12
      }}>
        <div style={{ width: 4, height: isMobile ? 20 : 28, backgroundColor: UNCW_TEAL, borderRadius: 2 }}></div>
        EDR Endpoint Status
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie 
            data={data} 
            dataKey="count" 
            nameKey="status"
            cx="50%" 
            cy="50%" 
            outerRadius={isMobile ? 80 : 120}
            label={isMobile ? false : (entry) => `${entry.status}: ${entry.count}`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            cursor={false}
            contentStyle={{ backgroundColor: theme.palette.background.paper, border: `2px solid ${UNCW_TEAL}`, borderRadius: 12, padding: 12, fontSize: isMobile ? '0.8rem' : '1rem', color: theme.palette.text.primary }}
            labelStyle={{ color: '#94a3b8' }}
            itemStyle={{ color: '#f1f5f9' }}
          />
          {isMobile && <Legend wrapperStyle={{ fontSize: '0.75rem' }} />}
        </PieChart>
      </ResponsiveContainer>
      <div style={{ textAlign: 'center', marginTop: isMobile ? 8 : 16, fontSize: isMobile ? '0.95rem' : '1.1rem', fontWeight: 600, color: theme.palette.text.secondary }}>
        Total Endpoints: {total}
      </div>
    </div>
  )
}

export function EDRThreatDetections() {
  const theme = useTheme()
  const data = mockEDRThreatTypes()
  
  useEffect(() => {
    log.chart('EDRThreatDetections mounted', { theme: theme.palette.mode })
  }, [theme.palette.mode])
  
  return (
    <div style={{ 
      backgroundColor: theme.palette.background.paper, 
      borderRadius: 16, 
      padding: 32, 
      border: `2px solid ${theme.palette.divider}`,
      height: 420,
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
    }}>
      <div style={{ 
        marginBottom: 24, 
        color: theme.palette.text.primary, 
        fontSize: '1.3rem', 
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <div style={{ width: 4, height: 28, backgroundColor: UNCW_GOLD, borderRadius: 2 }}></div>
        EDR Threat Detections
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <XAxis dataKey="type" tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
          <YAxis tick={{ fontSize: 11, fill: theme.palette.text.secondary }} width={50} />
          <Tooltip 
            cursor={false}
            contentStyle={{ backgroundColor: theme.palette.background.paper, border: `2px solid ${UNCW_TEAL}`, borderRadius: 12, padding: 12, color: theme.palette.text.primary }}
            labelStyle={{ color: '#94a3b8' }}
            itemStyle={{ color: '#f1f5f9' }}
          />
          <Legend wrapperStyle={{ paddingTop: 16 }} />
          <Bar dataKey="detected" name="Detected" fill={UNCW_TEAL} radius={[8, 8, 0, 0]} />
          <Bar dataKey="blocked" name="Blocked" fill={UNCW_GOLD} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function GeoThreatMap() {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)
  const [showList, setShowList] = useState(false)
  const geoThreats = mockGeoThreatMap()
  
  const severityColors = {
    Critical: '#ef4444',
    High: '#f97316',
    Medium: UNCW_GOLD
  }
  
  // Create lookup map for quick access
  const threatsByCountryCode = useMemo(() => {
    const map: Record<string, typeof geoThreats[0]> = {}
    geoThreats.forEach(threat => {
      map[threat.countryCode] = threat
    })
    return map
  }, [geoThreats])
  
  // Get threat intensity for color calculation
  const maxThreatCount = useMemo(() => 
    Math.max(...geoThreats.map(t => t.threatCount), 1)
  , [geoThreats])
  
  const getCountryColor = (countryCode: string) => {
    const threat = threatsByCountryCode[countryCode]
    if (!threat) return '#E5E7EB'
    
    const intensity = threat.threatCount / maxThreatCount
    
    switch(threat.severity) {
      case 'Critical':
        return `rgba(239, 68, 68, ${0.4 + intensity * 0.6})`
      case 'High':
        return `rgba(249, 115, 22, ${0.4 + intensity * 0.6})`
      case 'Medium':
        return `rgba(${parseInt(UNCW_GOLD.slice(1, 3), 16)}, ${parseInt(UNCW_GOLD.slice(3, 5), 16)}, ${parseInt(UNCW_GOLD.slice(5, 7), 16)}, ${0.4 + intensity * 0.6})`
      default:
        return '#E5E7EB'
    }
  }
  
  const hoveredThreat = hoveredCountry ? threatsByCountryCode[hoveredCountry] : null
  
  return (
    <div style={{ 
      backgroundColor: '#FFFFFF', 
      borderRadius: 16, 
      padding: 32, 
      border: '2px solid #E0E4E8',
      boxShadow: '0 4px 16px rgba(0, 112, 112, 0.08)',
      minHeight: 400
    }}>
      <div style={{ 
        marginBottom: 24, 
        color: '#1a1a1a', 
        fontSize: '1.3rem', 
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 4, height: 28, backgroundColor: UNCW_TEAL, borderRadius: 2 }}></div>
        Global Threat Origins Map
        </div>
        <Button 
          size="small" 
          variant="outlined"
          onClick={() => setShowList(!showList)}
          sx={{ 
            borderColor: UNCW_TEAL,
            color: UNCW_TEAL,
            fontWeight: 600,
            fontSize: '0.75rem',
            '&:hover': {
              borderColor: '#005555',
              bgcolor: 'rgba(0, 112, 112, 0.05)'
            }
          }}
        >
          {showList ? 'Show Map' : 'Show List'}
        </Button>
      </div>
      
      {/* Threat Summary */}
      <Box sx={{ mb: 3, p: 3, bgcolor: '#F8FAFB', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: UNCW_TEAL }}>
          🌍 Threat Origins by Geography
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', mb: 2, lineHeight: 1.6 }}>
          Hover over countries to see threat details. Darker colors indicate higher threat volumes.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Chip label={`${geoThreats.length} Countries`} sx={{ bgcolor: UNCW_TEAL, color: 'white', fontWeight: 600 }} />
          <Chip label={`${geoThreats.reduce((sum, t) => sum + t.threatCount, 0).toLocaleString()} Total Threats`} sx={{ bgcolor: '#ef4444', color: 'white', fontWeight: 600 }} />
          <Chip label={`${geoThreats.filter(t => t.severity === 'Critical').length} Critical Sources`} sx={{ bgcolor: '#f97316', color: 'white', fontWeight: 600 }} />
        </Box>
      </Box>
      
      {!showList ? (
        <>
          {/* Interactive World Map */}
          <Box sx={{ position: 'relative', mb: 3 }}>
            <svg viewBox="0 0 1000 500" style={{ width: '100%', height: 'auto', maxHeight: '500px' }}>
              {/* Simplified world map - major threat source countries */}
              {/* Russia */}
              <path
                d="M 600 100 L 750 100 L 780 150 L 750 180 L 700 170 L 650 180 L 620 150 Z"
                fill={getCountryColor('RU')}
                stroke="#94a3b8"
                strokeWidth="0.5"
                onMouseEnter={() => setHoveredCountry('RU')}
                onMouseLeave={() => setHoveredCountry(null)}
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              />
              {/* China */}
              <path
                d="M 700 180 L 780 180 L 800 220 L 770 240 L 720 230 L 690 210 Z"
                fill={getCountryColor('CN')}
                stroke="#94a3b8"
                strokeWidth="0.5"
                onMouseEnter={() => setHoveredCountry('CN')}
                onMouseLeave={() => setHoveredCountry(null)}
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              />
              {/* India */}
              <path
                d="M 650 220 L 700 220 L 710 260 L 680 280 L 650 260 Z"
                fill={getCountryColor('IN')}
                stroke="#94a3b8"
                strokeWidth="0.5"
                onMouseEnter={() => setHoveredCountry('IN')}
                onMouseLeave={() => setHoveredCountry(null)}
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              />
              {/* Nigeria */}
              <path
                d="M 480 280 L 520 280 L 525 310 L 510 320 L 485 310 Z"
                fill={getCountryColor('NG')}
                stroke="#94a3b8"
                strokeWidth="0.5"
                onMouseEnter={() => setHoveredCountry('NG')}
                onMouseLeave={() => setHoveredCountry(null)}
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              />
              {/* North Korea */}
              <path
                d="M 780 185 L 795 185 L 795 200 L 785 205 L 780 200 Z"
                fill={getCountryColor('KP')}
                stroke="#94a3b8"
                strokeWidth="0.5"
                onMouseEnter={() => setHoveredCountry('KP')}
                onMouseLeave={() => setHoveredCountry(null)}
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              />
              {/* Iran */}
              <path
                d="M 580 200 L 630 200 L 635 230 L 610 240 L 585 230 Z"
                fill={getCountryColor('IR')}
                stroke="#94a3b8"
                strokeWidth="0.5"
                onMouseEnter={() => setHoveredCountry('IR')}
                onMouseLeave={() => setHoveredCountry(null)}
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              />
              {/* Brazil */}
              <path
                d="M 320 320 L 380 320 L 390 370 L 360 390 L 330 370 Z"
                fill={getCountryColor('BR')}
                stroke="#94a3b8"
                strokeWidth="0.5"
                onMouseEnter={() => setHoveredCountry('BR')}
                onMouseLeave={() => setHoveredCountry(null)}
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              />
              {/* United States */}
              <path
                d="M 100 150 L 250 150 L 270 200 L 240 230 L 180 220 L 120 200 Z"
                fill={getCountryColor('US')}
                stroke="#94a3b8"
                strokeWidth="0.5"
                onMouseEnter={() => setHoveredCountry('US')}
                onMouseLeave={() => setHoveredCountry(null)}
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              />
              {/* Ukraine */}
              <path
                d="M 550 160 L 590 160 L 595 185 L 575 195 L 555 185 Z"
                fill={getCountryColor('UA')}
                stroke="#94a3b8"
                strokeWidth="0.5"
                onMouseEnter={() => setHoveredCountry('UA')}
                onMouseLeave={() => setHoveredCountry(null)}
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              />
              {/* Vietnam */}
              <path
                d="M 730 250 L 755 250 L 760 280 L 745 290 L 730 275 Z"
                fill={getCountryColor('VN')}
                stroke="#94a3b8"
                strokeWidth="0.5"
                onMouseEnter={() => setHoveredCountry('VN')}
                onMouseLeave={() => setHoveredCountry(null)}
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              />
              
              {/* Background continents (light gray) */}
              <path d="M 50 100 L 300 100 L 350 250 L 280 300 L 100 280 L 50 200 Z" fill="#f3f4f6" opacity="0.3" />
              <path d="M 420 100 L 850 100 L 900 300 L 800 350 L 500 340 L 420 250 Z" fill="#f3f4f6" opacity="0.3" />
              <path d="M 300 320 L 400 320 L 420 450 L 350 480 L 300 420 Z" fill="#f3f4f6" opacity="0.3" />
            </svg>
            
            {/* Hover Tooltip */}
            {hoveredThreat && (
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                bgcolor: 'rgba(26, 26, 26, 0.95)',
                color: 'white',
                p: 2.5,
                borderRadius: 3,
                minWidth: 280,
                maxWidth: 350,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                border: `2px solid ${severityColors[hoveredThreat.severity]}`,
                zIndex: 1000,
                pointerEvents: 'none'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {hoveredThreat.country}
                  </Typography>
                  <Chip 
                    label={hoveredThreat.severity}
                    size="small"
                    sx={{ 
                      bgcolor: severityColors[hoveredThreat.severity],
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.7rem'
                    }}
                  />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#ef4444', mb: 1 }}>
                  {hoveredThreat.threatCount.toLocaleString()} threats
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, opacity: 0.9, fontSize: '0.85rem' }}>
                  <strong>Types:</strong> {hoveredThreat.threatTypes.join(', ')}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, opacity: 0.9, fontSize: '0.85rem' }}>
                  <strong>Domain:</strong> {hoveredThreat.domain}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', opacity: 0.8, lineHeight: 1.4 }}>
                  {hoveredThreat.description}
                </Typography>
              </Box>
            )}
          </Box>
          
          {/* Legend */}
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', alignItems: 'center', mt: 3, flexWrap: 'wrap' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#666' }}>
              Severity Levels:
            </Typography>
            {Object.entries(severityColors).map(([severity, color]) => (
              <Box key={severity} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 20, height: 20, bgcolor: color, borderRadius: 1, border: '1px solid #ccc' }} />
                <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                  {severity}
                </Typography>
              </Box>
            ))}
          </Box>
        </>
      ) : (
        /* Threat List */
        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
        {geoThreats.map((threat, idx) => (
          <Box key={idx} sx={{ 
            p: 2, 
            mb: 2, 
            border: '1px solid #E0E4E8', 
            borderRadius: 2,
            '&:hover': { bgcolor: '#F8FAFB' }
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                  {threat.country}
                </Typography>
                <Chip 
                  label={threat.severity}
                  size="small"
                  sx={{ 
                    bgcolor: severityColors[threat.severity],
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.7rem'
                  }}
                />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: UNCW_TEAL }}>
                {threat.threatCount}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#666', mb: 1, fontSize: '0.85rem' }}>
              <strong>Domain:</strong> {threat.domain}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mb: 1, fontSize: '0.85rem' }}>
              <strong>Threat Types:</strong> {threat.threatTypes.join(', ')}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem', lineHeight: 1.4 }}>
              {threat.description}
            </Typography>
          </Box>
        ))}
      </Box>
      )}
    </div>
  )
}

export function AIExploitDetectionChart() {
  const theme = useTheme()
  const data = mockAIExploitDetection()
  
  useEffect(() => {
    log.chart('AIExploitDetectionChart mounted', { dataLength: data.length, theme: theme.palette.mode })
  }, [data.length, theme.palette.mode])
  
  return (
    <div style={{ 
      backgroundColor: theme.palette.background.paper, 
      borderRadius: 16, 
      padding: 24, 
      border: `2px solid ${theme.palette.divider}`,
      height: 500,
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ 
        marginBottom: 16, 
        color: theme.palette.text.primary, 
        fontSize: '1.1rem', 
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        <div style={{ width: 3, height: 20, backgroundColor: '#ef4444', borderRadius: 2 }}></div>
        AI Exploit Detection & Prevention
      </div>
      
      {/* 3x2 grid layout - all tiles same size, no scrolling */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: 16, 
        flex: 1,
        height: '100%'
      }}>
        {data.map((item, idx) => (
          <div key={idx} style={{
            backgroundColor: theme.palette.background.default,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 12,
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            minHeight: 0
          }}>
            <div style={{ 
              fontWeight: 700, 
              color: UNCW_TEAL, 
              fontSize: '0.9rem',
              marginBottom: 2
            }}>
              {item.category}
            </div>
            <div style={{ 
              color: theme.palette.text.secondary, 
              fontSize: '0.75rem', 
              lineHeight: 1.3,
              marginBottom: 6,
              flex: 1,
              overflow: 'hidden'
            }}>
              {item.description}
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
              <Chip label={`Detected: ${item.detected}`} size="small" sx={{ bgcolor: '#ef4444', color: 'white', fontWeight: 600, fontSize: '0.6rem', height: 20 }} />
              <Chip label={`Blocked: ${item.blocked}`} size="small" sx={{ bgcolor: UNCW_TEAL, color: 'white', fontWeight: 600, fontSize: '0.6rem', height: 20 }} />
              <Chip label={item.severity} size="small" sx={{ 
                bgcolor: item.severity === 'Critical' ? '#ef4444' : item.severity === 'High' ? '#f97316' : '#FFD700',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.6rem',
                height: 20
              }} />
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
              <Chip label={`${item.trend}`} size="small" sx={{ bgcolor: '#8b5cf6', color: 'white', fontWeight: 600, fontSize: '0.6rem', height: 20 }} />
              <Chip label={`${item.success_rate}`} size="small" sx={{ bgcolor: '#10b981', color: 'white', fontWeight: 600, fontSize: '0.6rem', height: 20 }} />
            </div>
            <div style={{ marginTop: 'auto' }}>
              <div style={{ 
                fontWeight: 600, 
                color: theme.palette.text.secondary, 
                fontSize: '0.65rem',
                marginBottom: 2
              }}>
                Examples:
              </div>
              {item.examples.slice(0, 1).map((ex: string, exIdx: number) => (
                <div key={exIdx} style={{ 
                  color: theme.palette.text.secondary, 
                  fontSize: '0.6rem', 
                  fontStyle: 'italic', 
                  marginBottom: 1,
                  lineHeight: 1.2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  • {ex}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function CrossChannelTimelineChart({ campaignId }: { campaignId: string }) {
  const data = mockCrossChannelTimeline(campaignId)
  
  return (
    <div style={{ 
      backgroundColor: '#FFFFFF', 
      borderRadius: 16, 
      padding: 32, 
      border: '2px solid #E0E4E8',
      height: 420,
      boxShadow: '0 4px 16px rgba(0, 112, 112, 0.08)'
    }}>
      <div style={{ 
        marginBottom: 24, 
        color: '#1a1a1a', 
        fontSize: '1.3rem', 
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <div style={{ width: 4, height: 28, backgroundColor: UNCW_TEAL, borderRadius: 2 }}></div>
        Cross-Channel Threat Activity
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorEmail" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={UNCW_TEAL} stopOpacity={0.5}/>
              <stop offset="95%" stopColor={UNCW_TEAL} stopOpacity={0.05}/>
            </linearGradient>
            <linearGradient id="colorTeams" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={UNCW_GOLD} stopOpacity={0.5}/>
              <stop offset="95%" stopColor={UNCW_GOLD} stopOpacity={0.05}/>
            </linearGradient>
            <linearGradient id="colorSlack" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05}/>
            </linearGradient>
            <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#999' }} />
          <YAxis tick={{ fontSize: 11, fill: '#666' }} width={40} />
          <Tooltip 
            cursor={false}
            contentStyle={{ backgroundColor: '#FFFFFF', border: '2px solid #007070', borderRadius: 12, padding: 12 }}
            labelStyle={{ color: '#94a3b8' }}
            itemStyle={{ color: '#f1f5f9' }}
          />
          <Legend wrapperStyle={{ paddingTop: 16 }} />
          <Area type="monotone" dataKey="email" name="Email" stroke={UNCW_TEAL} fill="url(#colorEmail)" strokeWidth={2} />
          <Area type="monotone" dataKey="aiAssistant" name="AI Assistant" stroke="#ef4444" fill="url(#colorAI)" strokeWidth={2} />
          <Area type="monotone" dataKey="webPortal" name="Web Portal" stroke="#8b5cf6" fill="url(#colorSlack)" strokeWidth={2} />
          <Area type="monotone" dataKey="mobileApp" name="Mobile App" stroke={UNCW_GOLD} fill="url(#colorTeams)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// New Threat Family Types Chart
export function ThreatFamilyTypesChart() {
  const isMobile = useIsMobile()
  const theme = useTheme()
  const data = mockThreatFamilies()
  const chartHeight = getResponsiveChartHeight(isMobile, 420)
  
  useEffect(() => {
    log.chart('ThreatFamilyTypesChart mounted', { isMobile, theme: theme.palette.mode })
  }, [isMobile, theme.palette.mode])
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return '#ef4444'
      case 'High': return '#f97316'
      case 'Medium': return '#eab308'
      case 'Low': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return '↗️'
      case 'decreasing': return '↘️'
      case 'stable': return '→'
      default: return '→'
    }
  }

  return (
    <div 
      className={isMobile ? 'mobile-chart-container' : ''}
      style={{ 
        backgroundColor: theme.palette.background.paper, 
        borderRadius: 16, 
        padding: isMobile ? 16 : 24, 
        border: `2px solid ${theme.palette.divider}`,
        height: chartHeight,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column'
      }}>
      <div style={{ 
        marginBottom: isMobile ? 12 : 20, 
        color: theme.palette.text.primary, 
        fontSize: isMobile ? '1.05rem' : '1.2rem', 
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? 6 : 8
      }}>
        <div style={{ width: 3, height: isMobile ? 16 : 20, backgroundColor: '#ef4444', borderRadius: 2 }}></div>
        Threat Family Types
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          margin={{ top: 10, right: isMobile ? 5 : 20, left: isMobile ? -20 : 0, bottom: isMobile ? 50 : 60 }}
          style={{ backgroundColor: 'transparent' }}
        >
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: isMobile ? 8 : 10, fill: theme.palette.text.secondary }} 
            angle={-45} 
            textAnchor="end" 
            height={isMobile ? 60 : 80}
            interval={0}
          />
          <YAxis tick={{ fontSize: isMobile ? 9 : 11, fill: theme.palette.text.secondary }} width={isMobile ? 35 : 50} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: theme.palette.background.paper, 
              border: `2px solid ${UNCW_TEAL}`, 
              borderRadius: 12, 
              padding: 12,
              fontSize: '12px',
              color: theme.palette.text.primary
            }}
            formatter={(value: any, name: string, props: any) => [
              <div key="tooltip">
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{props.payload.name}</div>
                <div style={{ marginBottom: 2 }}>Count: <strong>{value}</strong></div>
                <div style={{ marginBottom: 2 }}>Percentage: <strong>{props.payload.percentage}%</strong></div>
                <div style={{ marginBottom: 2 }}>Severity: <span style={{ color: getSeverityColor(props.payload.severity) }}><strong>{props.payload.severity}</strong></span></div>
                <div style={{ marginBottom: 2 }}>Trend: {getTrendIcon(props.payload.trend)} <strong>{props.payload.trend}</strong></div>
                <div style={{ fontSize: '11px', color: theme.palette.text.secondary, marginTop: 4 }}>{props.payload.description}</div>
              </div>
            ]}
          />
          <Bar 
            dataKey="count" 
            radius={[4, 4, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getSeverityColor(entry.severity)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// New Peer Comparison Chart
export function PeerComparisonChart() {
  const theme = useTheme()
  const data = mockPeerComparison()
  
  useEffect(() => {
    log.chart('PeerComparisonChart mounted', { theme: theme.palette.mode })
  }, [theme.palette.mode])
  
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'better': return '#10b981'
      case 'worse': return '#ef4444'
      case 'average': return '#eab308'
      default: return '#6b7280'
    }
  }

  const getPercentileColor = (percentile: number) => {
    if (percentile <= 25) return '#10b981' // Excellent (top 25%)
    if (percentile <= 50) return '#eab308' // Good (25-50%)
    if (percentile <= 75) return '#f97316' // Average (50-75%)
    return '#ef4444' // Below average (75%+)
  }

  return (
    <div style={{ 
      backgroundColor: theme.palette.background.paper, 
      borderRadius: 16, 
      padding: 24, 
      border: `2px solid ${theme.palette.divider}`,
      height: 420,
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ 
        marginBottom: 20, 
        color: theme.palette.text.primary, 
        fontSize: '1.2rem', 
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        <div style={{ width: 3, height: 20, backgroundColor: UNCW_TEAL, borderRadius: 2 }}></div>
        Customer vs Peers Comparison
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          margin={{ top: 10, right: 20, left: 0, bottom: 60 }}
          style={{ backgroundColor: 'transparent' }}
        >
          <XAxis 
            dataKey="metric" 
            tick={{ fontSize: 10, fill: theme.palette.text.secondary }} 
            angle={-45} 
            textAnchor="end" 
            height={80}
            interval={0}
          />
          <YAxis tick={{ fontSize: 11, fill: theme.palette.text.secondary }} width={50} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: theme.palette.background.paper, 
              border: `2px solid ${UNCW_TEAL}`, 
              borderRadius: 12, 
              padding: 12,
              fontSize: '12px',
              color: theme.palette.text.primary
            }}
            formatter={(value: any, name: string, props: any) => [
              <div key="tooltip">
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{props.payload.metric}</div>
                <div style={{ marginBottom: 2 }}>Your Org: <strong>{props.payload.customer}</strong></div>
                <div style={{ marginBottom: 2 }}>Industry Peers: <strong>{props.payload.verticalPeers}</strong></div>
                <div style={{ marginBottom: 2 }}>Regional Peers: <strong>{props.payload.regionalPeers}</strong></div>
                <div style={{ marginBottom: 2 }}>Percentile: <span style={{ color: getPercentileColor(props.payload.customerPercentile) }}><strong>{props.payload.customerPercentile}th</strong></span></div>
                <div style={{ marginBottom: 2 }}>Trend: <span style={{ color: getTrendColor(props.payload.trend) }}><strong>{props.payload.trend}</strong></span></div>
              </div>
            ]}
          />
          <Legend wrapperStyle={{ paddingTop: 16 }} />
          <Bar dataKey="customer" name="Your Organization" fill={UNCW_TEAL} radius={[4, 4, 0, 0]} />
          <Bar dataKey="verticalPeers" name="Industry Peers" fill="#f97316" radius={[4, 4, 0, 0]} />
          <Bar dataKey="regionalPeers" name="Regional Peers" fill="#6b7280" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

