'use client'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { mockTimeline30d, mockCyberScore, mockAIThreats, mockEDRMetrics30d } from '@/lib/mock'

const UNCW_TEAL = '#007070'
const UNCW_GOLD = '#FFD700'
const TEAL_LIGHT = '#4DB8B8'
const GOLD_DARK = '#E6C200'

export function TimelineArea() {
  const data = mockTimeline30d()
  return (
    <div style={{ 
      backgroundColor: '#FFFFFF', 
      borderRadius: 12, 
      padding: 24, 
      border: '2px solid #E0E4E8',
      height: 520,
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }}>
      <div style={{ marginBottom: 16, color: '#1a1a1a', fontSize: '1.1rem', fontWeight: 600 }}>
        Threat Timeline — last 30 days
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#666' }} hide />
          <YAxis tick={{ fontSize: 10, fill: '#666' }} width={40} />
          <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '2px solid #007070', borderRadius: 8 }} />
          <Legend />
          <Area type="monotone" dataKey="total" name="Total" stroke="#666" fill="#E0E4E8" />
          <Area type="monotone" dataKey="quarantined" name="Quarantined" stroke={UNCW_TEAL} fill={UNCW_TEAL} fillOpacity={0.3} />
          <Area type="monotone" dataKey="delivered" name="Delivered" stroke={UNCW_GOLD} fill={UNCW_GOLD} fillOpacity={0.3} />
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
      borderRadius: 12, 
      padding: 24, 
      border: '2px solid #E0E4E8',
      height: 420,
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }}>
      <div style={{ marginBottom: 16, color: '#1a1a1a', fontSize: '1.1rem', fontWeight: 600 }}>
        Quarantined vs Delivered — last 30 days
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#666' }} hide />
          <YAxis tick={{ fontSize: 10, fill: '#666' }} width={40} />
          <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '2px solid #007070', borderRadius: 8 }} />
          <Legend />
          <Bar dataKey="quarantined" name="Quarantined" fill={UNCW_TEAL} />
          <Bar dataKey="delivered" name="Delivered" fill={UNCW_GOLD} />
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
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none'
      }}>
        <div style={{ fontSize: '3.5rem', fontWeight: 700, color: UNCW_TEAL }}>{score}</div>
      </div>
    </div>
  )
}

export function AIThreatsBar() {
  const data = mockAIThreats()
  return (
    <div style={{ 
      backgroundColor: '#FFFFFF', 
      borderRadius: 12, 
      padding: 24, 
      border: '2px solid #E0E4E8',
      height: 420,
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }}>
      <div style={{ marginBottom: 16, color: '#1a1a1a', fontSize: '1.1rem', fontWeight: 600 }}>
        AI Threats Breakdown
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <XAxis dataKey="type" tick={{ fontSize: 12, fill: '#666' }} />
          <YAxis tick={{ fontSize: 10, fill: '#666' }} width={40} />
          <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '2px solid #007070', borderRadius: 8 }} />
          <Bar dataKey="count" fill={UNCW_TEAL} />
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
      borderRadius: 12, 
      padding: 24, 
      border: '2px solid #E0E4E8',
      height: 520,
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }}>
      <div style={{ marginBottom: 16, color: '#1a1a1a', fontSize: '1.1rem', fontWeight: 600 }}>
        EDR Metrics — last 30 days
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#666' }} hide />
          <YAxis tick={{ fontSize: 10, fill: '#666' }} width={44} />
          <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '2px solid #007070', borderRadius: 8 }} />
          <Legend />
          <Line type="monotone" dataKey="detections" name="Detections" stroke={UNCW_TEAL} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="blocked" name="Blocked" stroke={UNCW_GOLD} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="endpointsOnline" name="Endpoints Online" stroke="#666" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

