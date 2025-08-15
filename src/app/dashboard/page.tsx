"use client";

import { useQuery } from 'convex/react';
import { useState, useEffect } from 'react';
import { CLAUDE_MODELS } from '../../types';

export default function Dashboard() {
  const [selectedModel, setSelectedModel] = useState('claude-3-5-sonnet-20241022');
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    tokensUsed: 0,
    costAccrued: 0,
    documentsProcessing: 0,
    queueDepth: 0,
    activeAgents: 0
  });

  // Query data from Convex
  const documents = useQuery('documents:list', { limit: 10 });
  const queueOverview = useQuery('processingJobs:getQueueOverview');
  const agentStats = useQuery('agents:getPoolStats');
  const processingStats = useQuery('documents:getProcessingStats');

  // Set up Server-Sent Events for real-time updates
  useEffect(() => {
    const eventSource = new EventSource('/api/stream/processing-updates');
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'METRICS_UPDATE') {
          setRealTimeMetrics({
            tokensUsed: data.tokens || 0,
            costAccrued: data.cost || 0,
            documentsProcessing: data.documentsInQueue || 0,
            queueDepth: data.queueDepth || 0,
            activeAgents: data.activeAgents || 0
          });
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  if (!documents || !queueOverview || !agentStats) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl">Loading OKOA Processing Dashboard...</p>
        </div>
      </div>
    );
  }

  const totalCost = queueOverview.costSummary?.totalCost || 0;
  const dailyBudget = 100; // From env var or config
  const budgetUsed = (totalCost / dailyBudget) * 100;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* OKOA Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="font-mono text-sm">
                <pre className="text-blue-400">
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
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Automated Document Processing System</p>
              <p className="text-xs text-gray-500">Real-time Multi-Agent Processing Dashboard</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Real-time Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          
          {/* Live Processing Status */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Processing Now</p>
                <p className="text-2xl font-bold text-green-400">{queueOverview.processing}</p>
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Queue Depth */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div>
              <p className="text-sm text-gray-400">Queue Depth</p>
              <p className="text-2xl font-bold text-blue-400">{queueOverview.queued}</p>
              <p className="text-xs text-gray-500">documents waiting</p>
            </div>
          </div>

          {/* Active Agents */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div>
              <p className="text-sm text-gray-400">Active Agents</p>
              <p className="text-2xl font-bold text-purple-400">{agentStats.warm + agentStats.processing}</p>
              <p className="text-xs text-gray-500">{agentStats.processing} processing</p>
            </div>
          </div>

          {/* Live Token Count */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div>
              <p className="text-sm text-gray-400">Tokens Used (24h)</p>
              <p className="text-2xl font-bold text-yellow-400">{(queueOverview.costSummary?.totalTokens || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500">input + output</p>
            </div>
          </div>

          {/* Live Cost Meter */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div>
              <p className="text-sm text-gray-400">Cost (24h)</p>
              <p className="text-2xl font-bold text-red-400">${totalCost.toFixed(2)}</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    budgetUsed > 90 ? 'bg-red-500' : budgetUsed > 70 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{budgetUsed.toFixed(1)}% of ${dailyBudget} budget</p>
            </div>
          </div>
        </div>

        {/* Model Selection Panel */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
          <h2 className="text-lg font-semibold mb-4 text-blue-400">🤖 Model Selection & Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CLAUDE_MODELS.map((model) => (
              <div 
                key={model.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedModel === model.id 
                    ? 'border-blue-500 bg-blue-900/20' 
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                onClick={() => setSelectedModel(model.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">{model.name}</h3>
                  <div className={`w-3 h-3 rounded-full ${
                    model.speed === 'Very Fast' ? 'bg-green-400' :
                    model.speed === 'Fast' ? 'bg-yellow-400' : 'bg-red-400'
                  }`}></div>
                </div>
                <p className="text-sm text-gray-400 mb-2">{model.description}</p>
                <div className="flex justify-between text-xs">
                  <span className="text-green-400">${(model.costPer1KTokens.input / 1000).toFixed(4)}/1K in</span>
                  <span className="text-blue-400">{model.quality}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Pool Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          
          {/* Live Agent Pool */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-purple-400">🤖 Live Agent Pool</h2>
            <div className="space-y-3">
              {Array.from({ length: agentStats.warm + agentStats.processing }, (_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      i < agentStats.processing ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'
                    }`}></div>
                    <span className="text-sm">Agent {i + 1}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {i < agentStats.processing ? '🔄 Processing...' : '⚡ Ready'}
                  </div>
                </div>
              ))}
              {agentStats.total === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No agents currently active
                </div>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-600">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Pool Statistics:</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2 text-xs">
                <div>Documents Processed: <span className="text-blue-400">{agentStats.totalDocumentsProcessed}</span></div>
                <div>Avg. Processing: <span className="text-green-400">{(agentStats.averageProcessingTime / 1000).toFixed(1)}s</span></div>
                <div>Total Cost: <span className="text-red-400">${agentStats.totalCost?.toFixed(2) || '0.00'}</span></div>
                <div>Success Rate: <span className="text-purple-400">{processingStats?.successRate?.toFixed(1) || '0'}%</span></div>
              </div>
            </div>
          </div>

          {/* Processing Queue */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-blue-400">📋 Processing Queue</h2>
            
            {/* Queue Summary */}
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div className="bg-gray-700 p-3 rounded">
                <div className="text-yellow-400">⏳ Queued</div>
                <div className="text-xl font-bold">{queueOverview.queued}</div>
              </div>
              <div className="bg-gray-700 p-3 rounded">
                <div className="text-green-400">✅ Completed (24h)</div>
                <div className="text-xl font-bold">{queueOverview.last24Hours?.completed || 0}</div>
              </div>
            </div>

            {/* Recent Documents */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-400">Recent Activity</h3>
              {documents?.slice(0, 5).map((doc) => (
                <div key={doc._id} className="flex items-center justify-between p-2 bg-gray-700 rounded text-sm">
                  <div className="truncate flex-1">
                    <span className="text-white">{doc.originalFilename}</span>
                  </div>
                  <div className="ml-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      doc.status === 'COMPLETED' ? 'bg-green-600 text-green-100' :
                      doc.status === 'PROCESSING' ? 'bg-blue-600 text-blue-100 animate-pulse' :
                      doc.status === 'FAILED' ? 'bg-red-600 text-red-100' :
                      'bg-yellow-600 text-yellow-100'
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Analytics */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-green-400">📊 Performance Analytics (24h)</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{queueOverview.last24Hours?.total || 0}</div>
              <div className="text-sm text-gray-400">Total Processed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{((queueOverview.last24Hours?.averageProcessingTime || 0) / 1000 / 60).toFixed(1)}m</div>
              <div className="text-sm text-gray-400">Avg. Processing Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{(queueOverview.costSummary?.averageCostPerDocument || 0).toFixed(2)}</div>
              <div className="text-sm text-gray-400">Avg. Cost/Document</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{processingStats?.successRate?.toFixed(1) || 0}%</div>
              <div className="text-sm text-gray-400">Success Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}