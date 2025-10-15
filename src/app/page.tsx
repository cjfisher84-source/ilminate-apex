export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-6xl font-bold text-white">
          Ilminate APEX
        </h1>
        <p className="text-xl text-slate-300">
          AI-Powered Cybersecurity Analysis & Triage System
        </p>
        <div className="flex gap-4 justify-center pt-8">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
            <h3 className="text-blue-400 font-semibold mb-2">Threat Analysis</h3>
            <p className="text-slate-400 text-sm">Advanced AI-driven threat detection</p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-6">
            <h3 className="text-purple-400 font-semibold mb-2">Automated Triage</h3>
            <p className="text-slate-400 text-sm">Intelligent case prioritization</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
            <h3 className="text-green-400 font-semibold mb-2">Real-time Monitoring</h3>
            <p className="text-slate-400 text-sm">Continuous security assessment</p>
          </div>
        </div>
      </div>
    </main>
  )
}

