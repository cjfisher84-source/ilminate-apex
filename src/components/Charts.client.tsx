'use client'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { mockTimeline30d, mockCyberScore, mockAIThreats, mockEDRMetrics30d, mockEDREndpointBreakdown, mockEDRThreatTypes } from '@/lib/mock'

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
  return (
    <div style={{ 
      backgroundColor: '#FFFFFF', 
      borderRadius: 12, 
      padding: 24, 
      border: '2px solid #E0E4E8',
      height: 420,
      position: 'relative',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }}>
      <div style={{ marginBottom: 16, color: '#1a1a1a', fontSize: '1.1rem', fontWeight: 600 }}>
        Overall Cyber Score
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius="60%" outerRadius="85%" startAngle={90} endAngle={-270}>
            <Cell fill={UNCW_TEAL} />
            <Cell fill="#E0E4E8" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none'
      }}>
        <div style={{ fontSize: '4rem', fontWeight: 700, color: UNCW_TEAL, lineHeight: 1 }}>
          {score}
        </div>
        <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#666', marginTop: 8 }}>
          / 100
        </div>
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

