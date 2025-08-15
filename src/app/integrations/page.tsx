"use client";

import Link from 'next/link';
import { InteractiveButton } from '@/components/ascii/InteractiveButton';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen font-mono" style={{backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)'}}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Theme Toggle - Top Right */}
        <div className="flex justify-end mb-6">
          <ThemeToggle />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="terminal-content p-8 mb-6">
            <div className="font-mono text-lg font-bold leading-tight whitespace-pre text-center">
{`███████╗██╗   ██╗███████╗████████╗███████╗███╗   ███╗███████╗
██╔════╝╚██╗ ██╔╝██╔════╝╚══██╔══╝██╔════╝████╗ ████║██╔════╝
███████╗ ╚████╔╝ ███████╗   ██║   █████╗  ██╔████╔██║███████╗
╚════██║  ╚██╔╝  ╚════██║   ██║   ██╔══╝  ██║╚██╔╝██║╚════██║
███████║   ██║   ███████║   ██║   ███████╗██║ ╚═╝ ██║███████║
╚══════╝   ╚═╝   ╚══════╝   ╚═╝   ╚══════╝╚═╝     ╚═╝╚══════╝

INTEGRATIONS & WORKFLOW GUIDE`}
            </div>
          </div>
          <h1 className="text-xl font-bold font-mono mb-4 tracking-wide" style={{color: 'var(--text-primary)'}}>
            CONNECT YOUR BUSINESS TOOLS TO OKOA
          </h1>
          <p className="text-sm font-mono max-w-xl mx-auto" style={{color: 'var(--text-secondary)'}}>
            Step-by-step instructions for integrating Fireflies.ai, Slack, and Box.com with your OKOA processing system
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="terminal-content p-6 text-center">
            <div className="text-4xl mb-4">🔥</div>
            <h3 className="text-sm font-bold font-mono mb-2">FIREFLIES.AI</h3>
            <p className="text-xs font-mono mb-4" style={{color: 'var(--text-secondary)'}}>
              Automatic transcript processing from meetings
            </p>
            <Link href="#fireflies">
              <InteractiveButton variant="secondary" size="sm">
                SETUP GUIDE →
              </InteractiveButton>
            </Link>
          </div>
          
          <div className="terminal-content p-6 text-center">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-sm font-bold font-mono mb-2">SLACK</h3>
            <p className="text-xs font-mono mb-4" style={{color: 'var(--text-secondary)'}}>
              Interactive notifications and approvals
            </p>
            <Link href="#slack">
              <InteractiveButton variant="secondary" size="sm">
                SETUP GUIDE →
              </InteractiveButton>
            </Link>
          </div>
          
          <div className="terminal-content p-6 text-center">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-sm font-bold font-mono mb-2">BOX.COM</h3>
            <p className="text-xs font-mono mb-4" style={{color: 'var(--text-secondary)'}}>
              Document storage and organization
            </p>
            <Link href="#box">
              <InteractiveButton variant="secondary" size="sm">
                SETUP GUIDE →
              </InteractiveButton>
            </Link>
          </div>
        </div>

        {/* Fireflies.ai Integration */}
        <div id="fireflies" className="mb-16">
          <div className="terminal-content p-8">
            <h2 className="text-lg font-bold font-mono mb-6 text-center" style={{borderBottom: '1px solid var(--border-secondary)', paddingBottom: '1rem'}}>
              🔥 FIREFLIES.AI INTEGRATION
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-bold font-mono mb-4">AUTOMATIC SETUP (RECOMMENDED)</h3>
                <div className="space-y-4 text-sm font-mono">
                  <div className="p-4" style={{backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-primary)'}}>
                    <div className="font-bold mb-2">1. FIREFLIES.AI WEBHOOK CONFIGURATION</div>
                    <div className="text-xs" style={{color: 'var(--text-secondary)'}}>
                      • Log in to your Fireflies.ai dashboard<br/>
                      • Go to Integrations → Webhooks<br/>
                      • Add webhook URL: <code>https://okoa-automated-processor.vercel.app/api/webhooks/fireflies</code><br/>
                      • Select events: "transcript.created", "transcript.updated"
                    </div>
                  </div>
                  
                  <div className="p-4" style={{backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-primary)'}}>
                    <div className="font-bold mb-2">2. AUTOMATIC PROCESSING</div>
                    <div className="text-xs" style={{color: 'var(--text-secondary)'}}>
                      • Every meeting transcript is automatically detected<br/>
                      • OKOA sends Slack notifications for approval<br/>
                      • Approved transcripts are processed and filed to deals<br/>
                      • Documents appear in the deal folder within 2-3 minutes
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-bold font-mono mb-4">MANUAL UPLOAD (BACKUP METHOD)</h3>
                <div className="space-y-4 text-sm font-mono">
                  <div className="p-4" style={{backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-secondary)'}}>
                    <div className="font-bold mb-2">FOR WOLFGRAMM ASCENT WALDORF DEAL:</div>
                    <div className="text-xs" style={{color: 'var(--text-secondary)'}}>
                      1. Go to the <Link href="/deals/k576qtmmvp4594zdvqp3qttx0d7np0m1" className="underline" style={{color: 'var(--accent-primary)'}}>Wolfgramm Deal Page</Link><br/>
                      2. Click the "📞 TRANSCRIPTS" tab<br/>
                      3. Fill in meeting details and paste transcript<br/>
                      4. Click "📤 UPLOAD & PROCESS TRANSCRIPT"<br/>
                      5. Documents will appear in 2-3 minutes
                    </div>
                  </div>
                  
                  <div className="p-4" style={{backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-secondary)'}}>
                    <div className="font-bold mb-2">TRANSCRIPT FORMAT:</div>
                    <div className="text-xs font-mono" style={{color: 'var(--text-muted)', backgroundColor: 'var(--bg-code)', padding: '0.5rem', border: '1px solid var(--border-light)'}}>
                      {`[00:01:23] John Doe: Good morning everyone
[00:01:45] Jane Smith: Let's discuss the project
[00:02:10] Mike Johnson: The budget looks good`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slack Integration */}
        <div id="slack" className="mb-16">
          <div className="terminal-content p-8">
            <h2 className="text-lg font-bold font-mono mb-6 text-center" style={{borderBottom: '1px solid var(--border-secondary)', paddingBottom: '1rem'}}>
              💬 SLACK INTEGRATION
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-bold font-mono mb-4">NOTIFICATION SETUP</h3>
                <div className="space-y-4 text-sm font-mono">
                  <div className="p-4" style={{backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-primary)'}}>
                    <div className="font-bold mb-2">WEBHOOK CONFIGURATION</div>
                    <div className="text-xs" style={{color: 'var(--text-secondary)'}}>
                      • Your Slack workspace should already be configured<br/>
                      • Webhook URL: <code>https://hooks.slack.com/services/...</code><br/>
                      • Notifications go to #okoa-processing channel<br/>
                      • Interactive buttons allow one-click approvals
                    </div>
                  </div>
                  
                  <div className="p-4" style={{backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-primary)'}}>
                    <div className="font-bold mb-2">NOTIFICATION TYPES</div>
                    <div className="text-xs" style={{color: 'var(--text-secondary)'}}>
                      • 🔔 New transcript ready for approval<br/>
                      • ⚡ Processing started/completed<br/>
                      • ❌ Processing failures<br/>
                      • 📊 Daily processing summaries
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-bold font-mono mb-4">INTERACTIVE ACTIONS</h3>
                <div className="space-y-4 text-sm font-mono">
                  <div className="p-4" style={{backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-secondary)'}}>
                    <div className="font-bold mb-2">TRANSCRIPT APPROVALS</div>
                    <div className="text-xs" style={{color: 'var(--text-secondary)'}}>
                      • ✅ "Approve & File to Wolfgramm" button<br/>
                      • 📁 "Approve & File to General" button<br/>
                      • 👁️ "View Full Transcript" for review<br/>
                      • ❌ "Reject" to remove from queue
                    </div>
                  </div>
                  
                  <div className="p-4" style={{backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-secondary)'}}>
                    <div className="font-bold mb-2">DOCUMENT PROCESSING</div>
                    <div className="text-xs" style={{color: 'var(--text-secondary)'}}>
                      • ⚡ "Start Processing" for priority handling<br/>
                      • 📁 "View in Box" for document access<br/>
                      • 🔄 Retry failed processing<br/>
                      • 📊 View processing statistics
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Box.com Integration */}
        <div id="box" className="mb-16">
          <div className="terminal-content p-8">
            <h2 className="text-lg font-bold font-mono mb-6 text-center" style={{borderBottom: '1px solid var(--border-secondary)', paddingBottom: '1rem'}}>
              📦 BOX.COM INTEGRATION
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-bold font-mono mb-4">FOLDER STRUCTURE</h3>
                <div className="space-y-4 text-sm font-mono">
                  <div className="p-4" style={{backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-primary)'}}>
                    <div className="font-bold mb-2">AUTOMATIC ORGANIZATION</div>
                    <div className="text-xs font-mono" style={{color: 'var(--text-secondary)', backgroundColor: 'var(--bg-code)', padding: '0.5rem', border: '1px solid var(--border-light)'}}>
                      {`📁 Wolfgramm Ascent Waldorf/
  📄 originals/
    ├─ Wolfgramm_Project_Overview.pdf
    ├─ Park_City_Market_Analysis.pdf
    └─ Financial_Projections_2024-2026.xlsx
  🔍 ocr/
    ├─ [filename]_OCR.txt
    └─ [processed text files]
  📝 plaintext/
    └─ [extracted content]
  ⚡ synthetic/
    └─ [AI analysis summaries]
  🎯 synthdoc/
    └─ Master_SYNTHDOC.txt`}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-bold font-mono mb-4">PROCESSING WORKFLOW</h3>
                <div className="space-y-4 text-sm font-mono">
                  <div className="p-4" style={{backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-secondary)'}}>
                    <div className="font-bold mb-2">DOCUMENT LIFECYCLE</div>
                    <div className="text-xs" style={{color: 'var(--text-secondary)'}}>
                      1. 📤 Original uploaded to Box.com<br/>
                      2. 🔍 OCR processing extracts text<br/>
                      3. 📝 Plain text extraction<br/>
                      4. ⚡ AI synthesis and analysis<br/>
                      5. 🎯 Master document compilation<br/>
                      6. ✅ Available for AI chat queries
                    </div>
                  </div>
                  
                  <div className="p-4" style={{backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-secondary)'}}>
                    <div className="font-bold mb-2">ACCESS & PERMISSIONS</div>
                    <div className="text-xs" style={{color: 'var(--text-secondary)'}}>
                      • All team members have read access<br/>
                      • OKOA system has write permissions<br/>
                      • Documents sync in real-time<br/>
                      • Version history maintained in Box
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Summary */}
        <div className="terminal-content p-8" style={{backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)'}}>
          <h2 className="text-sm font-bold font-mono mb-6 text-center">
            ═══ COMPLETE WORKFLOW EXAMPLE ═══
          </h2>
          <div className="font-mono text-xs leading-normal">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center mb-6">
              <div className="p-4" style={{border: '1px solid var(--border-secondary)'}}>
                <div className="mb-3 text-2xl">🔥</div>
                <div className="font-bold text-sm mb-2">FIREFLIES MEETING</div>
                <div className="text-xs" style={{color: 'var(--text-secondary)'}}>
                  Meeting ends, transcript generated
                </div>
              </div>
              <div className="p-4" style={{border: '1px solid var(--border-secondary)'}}>
                <div className="mb-3 text-2xl">💬</div>
                <div className="font-bold text-sm mb-2">SLACK NOTIFICATION</div>
                <div className="text-xs" style={{color: 'var(--text-secondary)'}}>
                  Approval request sent to team
                </div>
              </div>
              <div className="p-4" style={{border: '1px solid var(--border-secondary)'}}>
                <div className="mb-3 text-2xl">✅</div>
                <div className="font-bold text-sm mb-2">ONE-CLICK APPROVE</div>
                <div className="text-xs" style={{color: 'var(--text-secondary)'}}>
                  File to Wolfgramm deal
                </div>
              </div>
              <div className="p-4" style={{border: '1px solid var(--border-secondary)'}}>
                <div className="mb-3 text-2xl">⚡</div>
                <div className="font-bold text-sm mb-2">AI PROCESSING</div>
                <div className="text-xs" style={{color: 'var(--text-secondary)'}}>
                  Analysis and synthesis
                </div>
              </div>
              <div className="p-4" style={{border: '1px solid var(--border-secondary)'}}>
                <div className="mb-3 text-2xl">📦</div>
                <div className="font-bold text-sm mb-2">BOX FILING</div>
                <div className="text-xs" style={{color: 'var(--text-secondary)'}}>
                  Organized in deal folder
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-xs font-mono mb-4">
                <span style={{color: 'var(--accent-primary)'}}>MEETING</span>
                <span className="mx-2">→</span>
                <span style={{color: 'var(--accent-primary)'}}>NOTIFICATION</span>
                <span className="mx-2">→</span>
                <span style={{color: 'var(--accent-primary)'}}>APPROVAL</span>
                <span className="mx-2">→</span>
                <span style={{color: 'var(--accent-primary)'}}>PROCESSING</span>
                <span className="mx-2">→</span>
                <span style={{color: 'var(--accent-primary)'}}>READY FOR ANALYSIS</span>
              </div>
              <div className="text-xs" style={{color: 'var(--text-muted)'}}>
                Total time: 2-5 minutes from meeting end to document availability
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link href="/">
            <InteractiveButton variant="secondary">
              ← BACK TO OKOA SYSTEM
            </InteractiveButton>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-6" style={{borderTop: '1px solid var(--border-secondary)'}}>
          <p className="text-xs font-mono" style={{color: 'var(--text-muted)'}}>
            OKOA CAPITAL LLC • 2025 • INTEGRATION GUIDE v1.0
          </p>
        </div>
      </div>
    </div>
  );
}