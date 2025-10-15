'use client'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Legend, LineChart, Line, PieChart, Pie, Cell, Sankey } from 'recharts'
import { mockTimeline30d, mockCyberScore, mockAIThreats, mockEDRMetrics30d, mockEDREndpointBreakdown, mockEDRThreatTypes, mockThreatInteractionMap, mockAIExploitDetection, mockCrossChannelTimeline } from '@/lib/mock'
import { Box, Typography, Chip } from '@mui/material'

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
      padding: 32, 
      border: '2px solid #E0E4E8',
      height: 420,
      position: 'relative',
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
        Cyber Security Score
      </div>
      
      {/* Donut Chart */}
      <div style={{ position: 'relative', height: 200, marginBottom: 24 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius="45%" outerRadius="70%" startAngle={90} endAngle={-270}>
              <Cell fill={UNCW_TEAL} />
              <Cell fill="#E0E4E8" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Centered Score */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          <div style={{ fontSize: '3rem', fontWeight: 700, color: UNCW_TEAL, lineHeight: 1 }}>
            {score}
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: '#666' }}>
            / 100
          </div>
        </div>
      </div>
      
      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {metrics.map((metric, idx) => (
          <div key={idx} style={{
            textAlign: 'center',
            padding: '12px 8px',
            backgroundColor: '#F8FAFB',
            borderRadius: 8,
            border: '1px solid #E0E4E8'
          }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: metric.color, marginBottom: 4 }}>
              {metric.value}
            </div>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
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

export function ThreatInteractionMap({ campaignId }: { campaignId: string }) {
  const interactions = mockThreatInteractionMap(campaignId)
  
  const actionCounts = interactions.reduce((acc, int) => {
    acc[int.action] = (acc[int.action] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const outcomeColors = {
    safe: '#10b981',
    prevented: UNCW_GOLD,
    compromised: '#ef4444'
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
        Threat Interaction Map
      </div>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          {Object.entries(actionCounts).map(([action, count]) => (
            <Box key={action} sx={{ textAlign: 'center' }}>
              <Box sx={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                bgcolor: action === 'reported' ? UNCW_GOLD : action === 'clicked' ? '#ef4444' : UNCW_TEAL,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>{count}</Typography>
                <Typography variant="caption" sx={{ textTransform: 'uppercase', fontSize: '0.65rem' }}>
                  {action}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          {Object.entries(interactions.reduce((acc, int) => {
            acc[int.outcome] = (acc[int.outcome] || 0) + 1
            return acc
          }, {} as Record<string, number>)).map(([outcome, count]) => (
            <Chip 
              key={outcome}
              label={`${outcome.toUpperCase()}: ${count}`}
              sx={{ 
                bgcolor: outcomeColors[outcome as keyof typeof outcomeColors],
                color: 'white',
                fontWeight: 700,
                fontSize: '0.9rem',
                px: 2,
                py: 2.5
              }}
            />
          ))}
        </Box>
      </Box>
      
      <Box sx={{ mt: 3, p: 2, bgcolor: '#F8FAFB', borderRadius: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#666' }}>
          CHANNEL BREAKDOWN
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {Object.entries(interactions.reduce((acc, int) => {
            acc[int.channel] = (acc[int.channel] || 0) + 1
            return acc
          }, {} as Record<string, number>)).map(([channel, count]) => (
            <Chip 
              key={channel}
              label={`${channel}: ${count}`}
              variant="outlined"
              sx={{ borderColor: UNCW_TEAL, color: UNCW_TEAL, fontWeight: 600 }}
            />
          ))}
        </Box>
      </Box>
    </div>
  )
}

export function AIExploitDetectionChart() {
  const data = mockAIExploitDetection()
  
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
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Chip label={`Detected: ${item.detected}`} size="small" sx={{ bgcolor: '#ef4444', color: 'white', fontWeight: 600 }} />
            <Chip label={`Blocked: ${item.blocked}`} size="small" sx={{ bgcolor: UNCW_TEAL, color: 'white', fontWeight: 600 }} />
            <Chip label={item.severity} size="small" sx={{ 
              bgcolor: item.severity === 'Critical' ? '#ef4444' : item.severity === 'High' ? '#f97316' : '#FFD700',
              color: 'white',
              fontWeight: 600
            }} />
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
        <div style={{ width: 4, height: 28, backgroundColor: '#ef4444', borderRadius: 2 }}></div>
        AI Exploit Detection & Prevention
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 100 }} layout="horizontal">
          <XAxis type="number" tick={{ fontSize: 11, fill: '#666' }} />
          <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: '#666' }} width={150} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: 20 }} />
          <Bar dataKey="detected" name="Detected" fill="#ef4444" radius={[0, 8, 8, 0]} />
          <Bar dataKey="blocked" name="Blocked" fill={UNCW_TEAL} radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
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
          <Area type="monotone" dataKey="teams" name="Teams" stroke={UNCW_GOLD} fill="url(#colorTeams)" strokeWidth={2} />
          <Area type="monotone" dataKey="slack" name="Slack" stroke="#8b5cf6" fill="url(#colorSlack)" strokeWidth={2} />
          <Area type="monotone" dataKey="aiAssistant" name="AI Assistant" stroke="#ef4444" fill="url(#colorAI)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

