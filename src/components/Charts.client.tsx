'use client'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { mockTimeline30d, mockCyberScore, mockAIThreats, mockEDRMetrics30d } from '@/lib/mock'

const COLORS = ['#006666','#39b3b3','#66ffff','#00ffd1']

export function TimelineArea() {
  const data = mockTimeline30d()
  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700" style={{ height: 520 }}>
      <div className="mb-2 text-slate-300">Threat Timeline — last 30 days</div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} hide />
          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} width={40} />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
          <Legend />
          <Area type="monotone" dataKey="total" name="Total" stroke="#66ffff" fill="#0f3a3a" fillOpacity={0.4} />
          <Area type="monotone" dataKey="quarantined" name="Quarantined" stroke="#006666" fill="#003f3f" fillOpacity={0.6} />
          <Area type="monotone" dataKey="delivered" name="Delivered" stroke="#39b3b3" fill="#1b4d4d" fillOpacity={0.5} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function QuarantineDeliveredBars() {
  const data = mockTimeline30d().map(d=>({date:d.date, quarantined:d.quarantined, delivered:d.delivered}))
  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700" style={{ height: 420 }}>
      <div className="mb-2 text-slate-300">Quarantined vs Delivered — last 30 days</div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} hide />
          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} width={40} />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
          <Legend />
          <Bar dataKey="quarantined" name="Quarantined" fill="#006666" />
          <Bar dataKey="delivered" name="Delivered" fill="#39b3b3" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function CyberScoreDonut() {
  const score = mockCyberScore()
  const data = [{name:'Score', value:score}, {name:'Gap', value:100-score}]
  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 relative" style={{ height: 420 }}>
      <div className="mb-2 text-slate-300">Overall Cyber Score</div>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius="60%" outerRadius="85%" startAngle={90} endAngle={-270}>
            <Cell fill="#00ffd1" />
            <Cell fill="#1d2630" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-5xl font-semibold text-white">{score}</div>
      </div>
    </div>
  )
}

export function AIThreatsBar() {
  const data = mockAIThreats()
  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700" style={{ height: 420 }}>
      <div className="mb-2 text-slate-300">AI Threats Breakdown</div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <XAxis dataKey="type" tick={{ fontSize: 12, fill: '#94a3b8' }} />
          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} width={40} />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
          <Bar dataKey="count" fill="#66ffff" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function EDRMetricsLines() {
  const data = mockEDRMetrics30d()
  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700" style={{ height: 520 }}>
      <div className="mb-2 text-slate-300">EDR Metrics — last 30 days</div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} hide />
          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} width={44} />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
          <Legend />
          <Line type="monotone" dataKey="detections" name="Detections" stroke="#66ffff" dot={false} />
          <Line type="monotone" dataKey="blocked" name="Blocked" stroke="#00ffd1" dot={false} />
          <Line type="monotone" dataKey="endpointsOnline" name="Endpoints Online" stroke="#39b3b3" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

