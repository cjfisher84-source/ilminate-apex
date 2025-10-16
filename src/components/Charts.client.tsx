'use client'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Legend, LineChart, Line, PieChart, Pie, Cell, Sankey } from 'recharts'
import { mockTimeline30d, mockCyberScore, mockAIThreats, mockEDRMetrics30d, mockEDREndpointBreakdown, mockEDRThreatTypes, mockGeoThreatMap, mockAIExploitDetection, mockCrossChannelTimeline, mockThreatFamilies, mockPeerComparison } from '@/lib/mock'
import { Box, Typography, Chip } from '@mui/material'
import { useEffect, useState, useRef } from 'react'
import '../../styles/reports.css'

const UNCW_TEAL = '#007070'
const UNCW_GOLD = '#FFD700'
const TEAL_LIGHT = '#4DB8B8'
const GOLD_DARK = '#E6C200'

export function TimelineArea() {
  const data = mockTimeline30d()
  return (
    <div style={{ 
      backgroundColor: '#FFFFFF', 
      borderRadius: 16, 
      padding: 32, 
      border: '2px solid #E0E4E8',
      height: 520,
      boxShadow: '0 4px 16px rgba(0, 112, 112, 0.08)',
      transition: 'all 0.3s ease'
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
        Threat Timeline — last 30 days
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#999' }} angle={-45} textAnchor="end" height={60} />
          <YAxis tick={{ fontSize: 11, fill: '#666' }} width={50} />
          <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '2px solid #007070', borderRadius: 12, padding: 12 }} />
          <Legend wrapperStyle={{ paddingTop: 20 }} />
          <Area type="monotone" dataKey="quarantined" name="Quarantined" stroke={UNCW_TEAL} strokeWidth={3} fill="url(#colorQuarantined)" />
          <Area type="monotone" dataKey="delivered" name="Delivered" stroke={UNCW_GOLD} strokeWidth={3} fill="url(#colorDelivered)" />
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
          <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '2px solid #007070', borderRadius: 12, padding: 12 }} />
          <Legend wrapperStyle={{ paddingTop: 16 }} />
          <Bar dataKey="quarantined" name="Quarantined" fill={UNCW_TEAL} radius={[6, 6, 0, 0]} />
          <Bar dataKey="delivered" name="Delivered" fill={UNCW_GOLD} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function CyberScoreDonut() {
  const score = mockCyberScore()
  const data = [{name:'Score', value:score}, {name:'Gap', value:100-score}]
  
  // Additional cyber metrics to fill the space
  const metrics = [
    { label: 'Protection Rate', value: '94.2%', color: '#10b981' },
    { label: 'Response Time', value: '2.3m', color: UNCW_GOLD },
    { label: 'False Positives', value: '0.8%', color: '#f97316' },
    { label: 'Coverage', value: '99.1%', color: UNCW_TEAL }
  ]
  
  return (
    <div style={{ 
      backgroundColor: '#FFFFFF', 
      borderRadius: 16, 
      padding: 24, 
      border: '2px solid #E0E4E8',
      height: 320,
      position: 'relative',
      boxShadow: '0 4px 16px rgba(0, 112, 112, 0.08)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ 
        marginBottom: 16, 
        color: '#1a1a1a', 
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
              innerRadius="45%" 
              outerRadius="70%" 
              startAngle={90} 
              endAngle={-270}
              cx="50%"
              cy="50%"
            >
              <Cell fill={UNCW_TEAL} />
              <Cell fill="#E0E4E8" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Perfectly Centered Score */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
          width: 'auto',
          height: 'auto'
        }}>
          <div style={{ 
            fontSize: '2rem', 
            fontWeight: 700, 
            color: UNCW_TEAL, 
            lineHeight: 1,
            textAlign: 'center',
            margin: 0,
            padding: 0
          }}>
            {score}
          </div>
          <div style={{ 
            fontSize: '0.8rem', 
            fontWeight: 600, 
            color: '#666',
            textAlign: 'center',
            lineHeight: 1,
            margin: 0,
            padding: 0,
            marginTop: '-2px'
          }}>
            / 100
          </div>
        </div>
      </div>
      
      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, flex: 1 }}>
        {metrics.map((metric, idx) => (
          <div key={idx} style={{
            textAlign: 'center',
            padding: '8px 6px',
            backgroundColor: '#F8FAFB',
            borderRadius: 6,
            border: '1px solid #E0E4E8',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: metric.color, marginBottom: 2 }}>
              {metric.value}
            </div>
            <div style={{ fontSize: '0.6rem', fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
              {metric.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AIThreatsBar() {
  const data = mockAIThreats()
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '2px solid #007070',
          borderRadius: 12,
          padding: 16,
          maxWidth: 300
        }}>
          <div style={{ fontWeight: 700, color: UNCW_TEAL, marginBottom: 8 }}>{data.type}</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>{data.count} incidents</div>
          <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: 8 }}>{data.description}</div>
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
    <div style={{ 
      backgroundColor: '#FFFFFF', 
      borderRadius: 16, 
      padding: 32, 
      border: '2px solid #E0E4E8',
      height: 500,
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
        AI Threats Breakdown
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 80 }}>
          <XAxis dataKey="type" tick={{ fontSize: 11, fill: '#666' }} angle={-20} textAnchor="end" height={80} />
          <YAxis tick={{ fontSize: 11, fill: '#666' }} width={50} label={{ value: 'Incidents', angle: -90, position: 'insideLeft', fill: '#666' }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" fill={UNCW_TEAL} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function EDRMetricsLines() {
  const data = mockEDRMetrics30d()
  return (
    <div style={{ 
      backgroundColor: '#FFFFFF', 
      borderRadius: 16, 
      padding: 32, 
      border: '2px solid #E0E4E8',
      height: 520,
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
        EDR Metrics — last 30 days
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#999' }} angle={-45} textAnchor="end" height={60} />
          <YAxis tick={{ fontSize: 11, fill: '#666' }} width={50} />
          <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '2px solid #007070', borderRadius: 12, padding: 12 }} />
          <Legend wrapperStyle={{ paddingTop: 20 }} />
          <Line type="monotone" dataKey="detections" name="Detections" stroke={UNCW_TEAL} strokeWidth={3} dot={{ fill: UNCW_TEAL, r: 4 }} />
          <Line type="monotone" dataKey="blocked" name="Blocked" stroke={UNCW_GOLD} strokeWidth={3} dot={{ fill: UNCW_GOLD, r: 4 }} />
          <Line type="monotone" dataKey="endpointsOnline" name="Endpoints Online" stroke="#666" strokeWidth={2} dot={{ fill: '#666', r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function EDREndpointStatus() {
  const data = mockEDREndpointBreakdown()
  const total = data.reduce((sum, item) => sum + item.count, 0)
  
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
            outerRadius={120}
            label={(entry) => `${entry.status}: ${entry.count}`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '2px solid #007070', borderRadius: 12, padding: 12 }} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ textAlign: 'center', marginTop: 16, fontSize: '1.1rem', fontWeight: 600, color: '#666' }}>
        Total Endpoints: {total}
      </div>
    </div>
  )
}

export function EDRThreatDetections() {
  const data = mockEDRThreatTypes()
  
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
        EDR Threat Detections
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <XAxis dataKey="type" tick={{ fontSize: 12, fill: '#666' }} />
          <YAxis tick={{ fontSize: 11, fill: '#666' }} width={50} />
          <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '2px solid #007070', borderRadius: 12, padding: 12 }} />
          <Legend wrapperStyle={{ paddingTop: 16 }} />
          <Bar dataKey="detected" name="Detected" fill={UNCW_TEAL} radius={[8, 8, 0, 0]} />
          <Bar dataKey="blocked" name="Blocked" fill={UNCW_GOLD} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function GeoThreatMap() {
  const geoThreats = mockGeoThreatMap()
  
  const severityColors = {
    Critical: '#ef4444',
    High: '#f97316',
    Medium: UNCW_GOLD,
    Low: '#10b981'
  }
  
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
        gap: 12
      }}>
        <div style={{ width: 4, height: 28, backgroundColor: UNCW_TEAL, borderRadius: 2 }}></div>
        Global Threat Origins Map
      </div>
      
      {/* Threat Summary */}
      <Box sx={{ mb: 3, p: 3, bgcolor: '#F8FAFB', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: UNCW_TEAL }}>
          🌍 Threat Origins by Geography
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', mb: 2, lineHeight: 1.6 }}>
          Real-time view of threat origins showing countries attempting to spoof your domain and target your organization.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Chip label={`${geoThreats.length} Countries`} sx={{ bgcolor: UNCW_TEAL, color: 'white', fontWeight: 600 }} />
          <Chip label={`${geoThreats.reduce((sum, t) => sum + t.threatCount, 0).toLocaleString()} Total Threats`} sx={{ bgcolor: '#ef4444', color: 'white', fontWeight: 600 }} />
          <Chip label={`${geoThreats.filter(t => t.severity === 'Critical').length} Critical Sources`} sx={{ bgcolor: '#f97316', color: 'white', fontWeight: 600 }} />
        </Box>
      </Box>
      
      {/* Threat List */}
      <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
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
    </div>
  )
}

export function AIExploitDetectionChart() {
  const data = mockAIExploitDetection()
  const [ready, setReady] = useState(false)
  const slotRef = useRef<HTMLDivElement | null>(null)
  
  // Debug: log container size to verify non-zero
  useEffect(() => {
    if (!slotRef.current) return
    const el = slotRef.current
    const logSize = () => {
      const r = el.getBoundingClientRect()
      console.debug("[AI-Exploit] chart-slot size", { width: r.width, height: r.height })
    }
    const ro = new ResizeObserver(logSize)
    ro.observe(el)
    logSize()
    return () => ro.disconnect()
  }, [])
  
  useEffect(() => setReady(true), [])
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      return (
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '2px solid #007070',
          borderRadius: 12,
          padding: 16,
          maxWidth: 350
        }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: UNCW_TEAL, mb: 1 }}>
            {item.category}
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', mb: 2, lineHeight: 1.6 }}>
            {item.description}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip label={`Detected: ${item.detected}`} size="small" sx={{ bgcolor: '#ef4444', color: 'white', fontWeight: 600, fontSize: '0.7rem' }} />
            <Chip label={`Blocked: ${item.blocked}`} size="small" sx={{ bgcolor: UNCW_TEAL, color: 'white', fontWeight: 600, fontSize: '0.7rem' }} />
            <Chip label={item.severity} size="small" sx={{ 
              bgcolor: item.severity === 'Critical' ? '#ef4444' : item.severity === 'High' ? '#f97316' : '#FFD700',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.7rem'
            }} />
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip label={`Trend: ${item.trend}`} size="small" sx={{ bgcolor: '#8b5cf6', color: 'white', fontWeight: 600, fontSize: '0.7rem' }} />
            <Chip label={`Success: ${item.success_rate}`} size="small" sx={{ bgcolor: '#10b981', color: 'white', fontWeight: 600, fontSize: '0.7rem' }} />
            <Chip label={`Block Time: ${item.avg_block_time}`} size="small" sx={{ bgcolor: '#f97316', color: 'white', fontWeight: 600, fontSize: '0.7rem' }} />
          </Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#666', display: 'block', mb: 0.5 }}>
            Examples:
          </Typography>
          {item.examples.map((ex: string, idx: number) => (
            <Typography key={idx} variant="caption" sx={{ display: 'block', color: '#999', fontStyle: 'italic', mb: 0.5 }}>
              • {ex}
            </Typography>
          ))}
        </div>
      )
    }
    return null
  }
  
  return (
    <div style={{ 
      backgroundColor: '#FFFFFF', 
      borderRadius: 16, 
      padding: 24, 
      border: '2px solid #E0E4E8',
      height: 320,
      boxShadow: '0 4px 16px rgba(0, 112, 112, 0.08)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ 
        marginBottom: 16, 
        color: '#1a1a1a', 
        fontSize: '1.1rem', 
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        <div style={{ width: 3, height: 20, backgroundColor: '#ef4444', borderRadius: 2 }}></div>
        AI Exploit Detection & Prevention
      </div>
      {ready && (
        <div className="chart-slot" ref={slotRef}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }} layout="horizontal">
              <XAxis type="number" tick={{ fontSize: 10, fill: '#666' }} />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 10, fill: '#666' }} width={140} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: 10, fontSize: '12px' }} />
              <Bar dataKey="detected" name="Detected" fill="#ef4444" radius={[0, 4, 4, 0]} />
              <Bar dataKey="blocked" name="Blocked" fill={UNCW_TEAL} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
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
          <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '2px solid #007070', borderRadius: 12, padding: 12 }} />
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
  const data = mockThreatFamilies()
  
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
    <div style={{ 
      backgroundColor: '#FFFFFF', 
      borderRadius: 16, 
      padding: 24, 
      border: '2px solid #E0E4E8',
      height: 420,
      boxShadow: '0 4px 16px rgba(0, 112, 112, 0.08)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ 
        marginBottom: 20, 
        color: '#1a1a1a', 
        fontSize: '1.2rem', 
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        <div style={{ width: 3, height: 20, backgroundColor: '#ef4444', borderRadius: 2 }}></div>
        Threat Family Types
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 10, fill: '#666' }} 
            angle={-45} 
            textAnchor="end" 
            height={80}
            interval={0}
          />
          <YAxis tick={{ fontSize: 11, fill: '#666' }} width={50} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#FFFFFF', 
              border: '2px solid #007070', 
              borderRadius: 12, 
              padding: 12,
              fontSize: '12px'
            }}
            formatter={(value: any, name: string, props: any) => [
              <div key="tooltip">
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{props.payload.name}</div>
                <div style={{ marginBottom: 2 }}>Count: <strong>{value}</strong></div>
                <div style={{ marginBottom: 2 }}>Percentage: <strong>{props.payload.percentage}%</strong></div>
                <div style={{ marginBottom: 2 }}>Severity: <span style={{ color: getSeverityColor(props.payload.severity) }}><strong>{props.payload.severity}</strong></span></div>
                <div style={{ marginBottom: 2 }}>Trend: {getTrendIcon(props.payload.trend)} <strong>{props.payload.trend}</strong></div>
                <div style={{ fontSize: '11px', color: '#666', marginTop: 4 }}>{props.payload.description}</div>
              </div>
            ]}
          />
          <Bar 
            dataKey="count" 
            fill="#ef4444"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// New Peer Comparison Chart
export function PeerComparisonChart() {
  const data = mockPeerComparison()
  
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
      backgroundColor: '#FFFFFF', 
      borderRadius: 16, 
      padding: 24, 
      border: '2px solid #E0E4E8',
      height: 420,
      boxShadow: '0 4px 16px rgba(0, 112, 112, 0.08)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ 
        marginBottom: 20, 
        color: '#1a1a1a', 
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
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
          <XAxis 
            dataKey="metric" 
            tick={{ fontSize: 10, fill: '#666' }} 
            angle={-45} 
            textAnchor="end" 
            height={80}
            interval={0}
          />
          <YAxis tick={{ fontSize: 11, fill: '#666' }} width={50} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#FFFFFF', 
              border: '2px solid #007070', 
              borderRadius: 12, 
              padding: 12,
              fontSize: '12px'
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

