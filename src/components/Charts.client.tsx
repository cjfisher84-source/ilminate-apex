'use client'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Legend, LineChart, Line, PieChart, Pie, Cell, Sankey } from 'recharts'
import { mockTimeline30d, mockCyberScore, mockAIThreats, mockEDRMetrics30d, mockEDREndpointBreakdown, mockEDRThreatTypes, mockGeoThreatMap, mockAIExploitDetection, mockCrossChannelTimeline, mockThreatFamilies, mockPeerComparison } from '@/lib/mock'
import { Box, Typography, Chip, useTheme, Button } from '@mui/material'
import { useEffect, useState, useRef, useMemo } from 'react'
import { useIsMobile, getResponsiveChartHeight } from '@/lib/mobileUtils'
import { log } from '@/utils/log'
import dynamic from 'next/dynamic'
import '../../styles/reports.css'

/**
 * Get customer ID from cookie for chart data
 */
function useCustomerId(): string | null {
  const [customerId, setCustomerId] = useState<string | null>(null)
  
  useEffect(() => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = decodeURIComponent(value)
      return acc
    }, {} as Record<string, string>)

    const userDisplay = cookies['apex_user_display']
    if (userDisplay) {
      try {
        const info = JSON.parse(userDisplay)
        setCustomerId(info.customerId)
      } catch (e) {
        // Invalid cookie
      }
    }
  }, [])
  
  return customerId
}

// Load ThreatMap client-side only (D3 requires browser APIs)
const ThreatMap = dynamic(() => import('./ThreatMap'), { ssr: false })

const UNCW_TEAL = '#007070'
const UNCW_GOLD = '#FFD700'
const TEAL_LIGHT = '#4DB8B8'
const GOLD_DARK = '#E6C200'

export function TimelineArea() {
  const isMobile = useIsMobile()
  const theme = useTheme()
  const customerId = useCustomerId()
  const data = mockTimeline30d(customerId)
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
  const customerId = useCustomerId()
  const scoreValue = mockCyberScore(customerId)
  const score = scoreValue ?? 0 // Default to 0 if null (customer with no data yet)
  const data = [{name:'Score', value:score}, {name:'Gap', value:100-score}]
  
  useEffect(() => {
    log.chart('CyberScoreDonut mounted', { score, theme: theme.palette.mode })
  }, [score, theme.palette.mode])
  
  // Additional cyber metrics to fill the space
  const metrics = [
    { label: 'Protection Rate', value: '94.2%', color: '#10b981', href: '/metrics/protection-rate', tooltip: 'Percentage of dangerous emails successfully blocked from your inbox' },
    { label: 'Response Time', value: '2.3m', color: UNCW_GOLD, href: '/metrics/response-time', tooltip: 'Average time to detect and respond to security threats' },
    { label: 'False Positives', value: '0.8%', color: '#f97316', href: '/metrics/false-positives', tooltip: 'Legitimate emails incorrectly flagged as suspicious' },
    { label: 'Coverage', value: '99.1%', color: UNCW_TEAL, href: '/metrics/coverage', tooltip: 'Percentage of your organization monitored for threats' }
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
        color: theme.palette.primary.main, 
        fontSize: '1.1rem', 
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        <div style={{ width: 3, height: 20, backgroundColor: theme.palette.primary.main, borderRadius: 2 }}></div>
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
          <a
            key={idx}
            href={metric.href}
            style={{
              textAlign: 'center',
              padding: '8px 6px',
              backgroundColor: theme.palette.background.default,
              borderRadius: 6,
              border: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title={metric.tooltip}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.palette.action.hover
              e.currentTarget.style.borderColor = metric.color
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = `0 2px 8px ${metric.color}40`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.palette.background.default
              e.currentTarget.style.borderColor = theme.palette.divider
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div style={{ fontSize: '1rem', fontWeight: 700, color: metric.color, marginBottom: 2 }}>
              {metric.value}
            </div>
            <div style={{ fontSize: '0.6rem', fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
              {metric.label}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

export function AIThreatsBar() {
  const isMobile = useIsMobile()
  const theme = useTheme()
  const customerId = useCustomerId()
  const data = mockAIThreats(customerId)
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
  
  const totalDetections = data.reduce((sum, d) => sum + d.detections, 0)
  const totalBlocked = data.reduce((sum, d) => sum + d.blocked, 0)
  const avgEndpoints = Math.round(data.reduce((sum, d) => sum + d.endpointsOnline, 0) / data.length)
  
  return (
    <a 
      href="/edr/metrics"
      style={{ 
        textDecoration: 'none',
        display: 'block',
        position: 'relative',
        zIndex: 1
      }}
      title="View detailed EDR metrics including detections, blocked threats, and endpoint status over time"
    >
      <div 
        className={isMobile ? 'mobile-chart-container' : ''}
        style={{ 
          backgroundColor: theme.palette.background.paper, 
          borderRadius: 16, 
          padding: isMobile ? 16 : 32, 
          border: `2px solid ${theme.palette.divider}`,
          height: chartHeight,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = UNCW_TEAL
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 168, 168, 0.3)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = theme.palette.divider
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div style={{ 
          marginBottom: isMobile ? 16 : 24, 
          color: theme.palette.text.primary, 
          fontSize: isMobile ? '1.1rem' : '1.3rem', 
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: isMobile ? 8 : 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12 }}>
            <div style={{ width: 4, height: isMobile ? 20 : 28, backgroundColor: UNCW_TEAL, borderRadius: 2 }}></div>
            {isMobile ? 'EDR Metrics (30d)' : 'EDR Metrics — last 30 days'}
          </div>
          {!isMobile && (
            <div style={{ fontSize: '0.85rem', color: theme.palette.text.secondary }}>
              Click to view details →
            </div>
          )}
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
        {!isMobile && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-around', 
            marginTop: 16, 
            paddingTop: 16, 
            borderTop: `1px solid ${theme.palette.divider}`,
            fontSize: '0.9rem',
            color: theme.palette.text.secondary
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '1.2rem', color: UNCW_TEAL }}>{totalDetections}</div>
              <div>Total Detections</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '1.2rem', color: UNCW_GOLD }}>{totalBlocked}</div>
              <div>Blocked</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '1.2rem', color: theme.palette.text.secondary }}>{avgEndpoints}</div>
              <div>Avg Endpoints</div>
            </div>
          </div>
        )}
      </div>
    </a>
  )
}

export function EDREndpointStatus() {
  const isMobile = useIsMobile()
  const theme = useTheme()
  const data = mockEDREndpointBreakdown()
  const total = data.reduce((sum, item) => sum + item.count, 0)
  const protectedCount = data.find(d => d.status === 'Protected')?.count || 0
  const vulnerableCount = data.find(d => d.status === 'Vulnerable')?.count || 0
  const chartHeight = getResponsiveChartHeight(isMobile, 420)
  
  useEffect(() => {
    log.chart('EDREndpointStatus mounted', { isMobile, theme: theme.palette.mode, total })
  }, [isMobile, theme.palette.mode, total])
  
  return (
    <a 
      href="/edr/endpoints"
      style={{ 
        textDecoration: 'none',
        display: 'block',
        position: 'relative',
        zIndex: 1
      }}
      title="View endpoint protection status including vulnerable systems that need attention"
    >
      <div 
        className={isMobile ? 'mobile-chart-container' : ''}
        style={{ 
          backgroundColor: theme.palette.background.paper, 
          borderRadius: 16, 
          padding: isMobile ? 16 : 32, 
          border: `2px solid ${theme.palette.divider}`,
          height: chartHeight,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = UNCW_TEAL
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 168, 168, 0.3)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = theme.palette.divider
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div style={{ 
          marginBottom: isMobile ? 16 : 24, 
          color: theme.palette.text.primary, 
          fontSize: isMobile ? '1.1rem' : '1.3rem', 
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: isMobile ? 8 : 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12 }}>
            <div style={{ width: 4, height: isMobile ? 20 : 28, backgroundColor: UNCW_TEAL, borderRadius: 2 }}></div>
            EDR Endpoint Status
          </div>
          {!isMobile && (
            <div style={{ fontSize: '0.85rem', color: theme.palette.text.secondary }}>
              View details →
            </div>
          )}
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
        <div style={{ 
          textAlign: 'center', 
          marginTop: isMobile ? 8 : 16, 
          fontSize: isMobile ? '0.95rem' : '1.1rem', 
          fontWeight: 600, 
          color: theme.palette.text.secondary,
          display: 'flex',
          justifyContent: 'space-around',
          gap: 16
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#10b981' }}>{protectedCount}</div>
            <div style={{ fontSize: '0.85rem' }}>Protected</div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#ef4444' }}>{vulnerableCount}</div>
            <div style={{ fontSize: '0.85rem' }}>Vulnerable</div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.2rem', color: theme.palette.text.secondary }}>{total}</div>
            <div style={{ fontSize: '0.85rem' }}>Total</div>
          </div>
        </div>
      </div>
    </a>
  )
}

export function EDRThreatDetections() {
  const theme = useTheme()
  const data = mockEDRThreatTypes()
  const totalDetected = data.reduce((sum, d) => sum + d.detected, 0)
  const totalBlocked = data.reduce((sum, d) => sum + d.blocked, 0)
  const blockRate = totalDetected > 0 ? Math.round((totalBlocked / totalDetected) * 100) : 0
  
  useEffect(() => {
    log.chart('EDRThreatDetections mounted', { theme: theme.palette.mode })
  }, [theme.palette.mode])
  
  return (
    <a 
      href="/edr/threats"
      style={{ 
        textDecoration: 'none',
        display: 'block',
        position: 'relative',
        zIndex: 1
      }}
      title="View detailed threat detection breakdown by type including ransomware, trojans, and suspicious behavior"
    >
      <div style={{ 
        backgroundColor: theme.palette.background.paper, 
        borderRadius: 16, 
        padding: 32, 
        border: `2px solid ${theme.palette.divider}`,
        height: 420,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = UNCW_GOLD
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(245, 158, 11, 0.3)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = theme.palette.divider
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.3)'
      }}
      >
        <div style={{ 
          marginBottom: 24, 
          color: theme.palette.text.primary, 
          fontSize: '1.3rem', 
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 4, height: 28, backgroundColor: UNCW_GOLD, borderRadius: 2 }}></div>
            EDR Threat Detections
          </div>
          <div style={{ fontSize: '0.85rem', color: theme.palette.text.secondary }}>
            View details →
          </div>
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
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-around', 
          marginTop: 16, 
          paddingTop: 16, 
          borderTop: `1px solid ${theme.palette.divider}`,
          fontSize: '0.9rem',
          color: theme.palette.text.secondary
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '1.2rem', color: UNCW_TEAL }}>{totalDetected}</div>
            <div>Total Detected</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '1.2rem', color: UNCW_GOLD }}>{totalBlocked}</div>
            <div>Blocked</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#10b981' }}>{blockRate}%</div>
            <div>Block Rate</div>
          </div>
        </div>
      </div>
    </a>
  )
}

export function GeoThreatMap() {
  const [showList, setShowList] = useState(false)
  const geoThreats = mockGeoThreatMap()
  const theme = useTheme()
  
  const severityColors = {
    Critical: '#ef4444',
    High: '#f97316',
    Medium: UNCW_GOLD
  }
  
  return (
    <div style={{ 
      backgroundColor: theme.palette.background.paper, 
      borderRadius: 16, 
      padding: 32, 
      border: `2px solid ${theme.palette.divider}`,
      boxShadow: '0 4px 16px rgba(0, 112, 112, 0.08)',
      minHeight: 400
    }}>
      <div style={{ 
        marginBottom: 24, 
        color: theme.palette.text.primary, 
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
      <Box sx={{ mb: 3, p: 3, bgcolor: theme.palette.mode === 'dark' ? '#0f172a' : '#F8FAFB', borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: UNCW_TEAL }}>
          🌍 Threat Origins by Geography
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2, lineHeight: 1.6 }}>
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
          {/* D3 Interactive World Map */}
          <Box sx={{ mb: 3 }}>
            <ThreatMap threats={geoThreats} />
          </Box>
        </>
      ) : (
        /* Threat List */
        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
        {geoThreats.map((threat, idx) => (
          <Box key={idx} sx={{ 
            p: 2, 
            mb: 2, 
            border: `1px solid ${theme.palette.divider}`, 
            borderRadius: 2,
            bgcolor: theme.palette.background.default,
            '&:hover': { bgcolor: theme.palette.action.hover }
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
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
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1, fontSize: '0.85rem' }}>
              <strong>Domain:</strong> {threat.domain}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1, fontSize: '0.85rem' }}>
              <strong>Threat Types:</strong> {threat.threatTypes.join(', ')}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '0.8rem', lineHeight: 1.4 }}>
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
  const customerId = useCustomerId()
  const data = mockAIExploitDetection(customerId)
  
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
  const customerId = useCustomerId()
  const data = mockThreatFamilies(customerId)
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
  const customerId = useCustomerId()
  const data = mockPeerComparison(customerId)
  
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

