import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        
        {/* OKOA ASCII Header */}
        <div className="text-center mb-12">
          <div className="font-mono text-sm mb-6 text-blue-400">
            <pre>
{`╔══════════════════════════════════════════════════════════════════════════════════╗
║   ██████╗ ██╗  ██╗ ██████╗  █████╗      ██╗      █████╗ ██████╗ ███████╗    ║
║  ██╔═══██╗██║ ██╔╝██╔═══██╗██╔══██╗     ██║     ██╔══██╗██╔══██╗██╔════╝    ║
║  ██║   ██║█████╔╝ ██║   ██║███████║     ██║     ███████║██████╔╝███████╗    ║
║  ██║   ██║██╔═██╗ ██║   ██║██╔══██║     ██║     ██╔══██║██╔══██╗╚════██║    ║
║  ╚██████╔╝██║  ██╗╚██████╔╝██║  ██║     ███████╗██║  ██║██████╔╝███████║    ║
║   ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝     ╚══════╝╚═╝  ╚═╝╚═════╝ ╚══════╝    ║
╚══════════════════════════════════════════════════════════════════════════════════╝`}
            </pre>
          </div>
          
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Automated Document Processing System
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Institutional-grade multi-agent document analysis with real-time monitoring
          </p>
        </div>

        {/* Key Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          
          {/* Multi-Agent Processing */}
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <div className="text-3xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-3 text-blue-400">Multi-Agent Processing</h3>
            <p className="text-gray-300 text-sm mb-4">
              Intelligent agent pool that scales automatically based on workload. 
              Multiple AI agents process documents simultaneously for maximum efficiency.
            </p>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Auto-scaling agent pool (1-5 agents)</li>
              <li>• Real-time load balancing</li>
              <li>• Cost-optimized scaling decisions</li>
            </ul>
          </div>

          {/* Real-time Monitoring */}
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-3 text-green-400">Real-time Monitoring</h3>
            <p className="text-gray-300 text-sm mb-4">
              Watch documents being processed in real-time with live cost tracking, 
              token usage, and processing queue visualization.
            </p>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Live processing dashboard</li>
              <li>• Token & cost tracking</li>
              <li>• Slack notifications</li>
            </ul>
          </div>

          {/* OKOA Integration */}
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-3 text-purple-400">OKOA Integration</h3>
            <p className="text-gray-300 text-sm mb-4">
              Full integration with OKOA Due Diligence Framework, Synthesis Prime Agent, 
              and Midnight Atlas real estate analysis.
            </p>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• 252 DD items across 30 categories</li>
              <li>• Institutional-grade analysis</li>
              <li>• OKOA LABS visual branding</li>
            </ul>
          </div>
        </div>

        {/* Processing Flow Visualization */}
        <div className="bg-gray-800/30 backdrop-blur rounded-xl p-8 mb-12 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-6 text-center text-blue-400">Automated Processing Flow</h2>
          
          <div className="font-mono text-sm text-center text-gray-300">
            <pre>
{`┌─────────────────────────────────────────────────────────────────────────────────────┐
│                         OKOA AUTOMATED PROCESSING PIPELINE                         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  [Box.com] → [Webhook] → [Queue] → [Agent Pool] → [Claude] → [Output] → [Slack]    │
│      ↓           ↓         ↓          ↓            ↓          ↓          ↓        │
│  File Upload  Instant   Processing  Smart Agent   AI         OKOA      Live       │
│  Detection    Trigger   Queue       Selection     Analysis   Format    Updates    │
│                                                                                     │
│  Real-time Dashboard ← Live Metrics ← Cost Tracking ← Token Usage ← Agent Status  │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘`}
            </pre>
          </div>
        </div>

        {/* System Status & Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          
          {/* Quick Actions */}
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-green-400">🚀 Quick Actions</h3>
            <div className="space-y-3">
              
              <Link 
                href="/dashboard"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-center"
              >
                📊 View Live Dashboard
              </Link>
              
              <Link 
                href="/documents"
                className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-center"
              >
                📄 Browse Documents
              </Link>
              
              <Link 
                href="/agents"
                className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-center"
              >
                🤖 Manage Agents
              </Link>
            </div>
          </div>

          {/* System Info */}
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-yellow-400">⚙️ System Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-green-400 flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  Online
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Version:</span>
                <span className="text-blue-400">v0.1.0-alpha</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Processing Capacity:</span>
                <span className="text-purple-400">1000+ docs/month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Multi-Agent Pool:</span>
                <span className="text-green-400">Auto-scaling (1-5 agents)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Integration:</span>
                <span className="text-blue-400">Box.com + Slack</span>
              </div>
            </div>
          </div>
        </div>

        {/* Processing Statistics Preview */}
        <div className="bg-gray-800/30 backdrop-blur rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-center text-blue-400">Ready for Document Processing</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">$0.85-1.35</div>
              <div className="text-xs text-gray-400">Cost per document</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">&lt;5 min</div>
              <div className="text-xs text-gray-400">Processing time</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">3 Models</div>
              <div className="text-xs text-gray-400">Claude options</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">Real-time</div>
              <div className="text-xs text-gray-400">Live monitoring</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-700">
          <p className="text-gray-400 text-sm">
            © OKOA CAPITAL LLC - 2025 - OKOA LABS ENHANCED EDITION
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Institutional-grade document processing with zero-omission methodology
          </p>
        </div>
      </div>
    </div>
  );
}