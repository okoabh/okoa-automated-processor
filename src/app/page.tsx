"use client";

import Link from 'next/link';
import { InteractiveButton } from '@/components/ascii/InteractiveButton';
import { CreateFolderModal } from '@/components/deals/CreateFolderModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useState } from 'react';

export default function Home() {
  const [showCreateFolder, setShowCreateFolder] = useState(false);

  return (
    <div className="min-h-screen font-mono" style={{backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)'}}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        
        {/* Theme Toggle - Top Right */}
        <div className="flex justify-end mb-6">
          <ThemeToggle />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="terminal-content p-8 mb-6">
            <div className="font-mono text-lg font-bold leading-tight whitespace-pre text-center">
{`██████╗ ██╗  ██╗ ██████╗  █████╗ 
██╔═══██╗██║ ██╔╝██╔═══██╗██╔══██╗
██║   ██║█████╔╝ ██║   ██║███████║
██║   ██║██╔═██╗ ██║   ██║██╔══██║
╚██████╔╝██║  ██╗╚██████╔╝██║  ██║
 ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝

AUTOMATED DOCUMENT PROCESSING SYSTEM`}
            </div>
          </div>
          <h1 className="text-xl font-bold font-mono mb-4 tracking-wide" style={{color: 'var(--text-primary)'}}>
            INSTITUTIONAL-GRADE DOCUMENT PROCESSOR
          </h1>
          <p className="text-sm font-mono max-w-xl mx-auto" style={{color: 'var(--text-secondary)'}}>
            Multi-agent AI processing • Real estate analysis • Structured synthesis
          </p>
        </div>

        {/* Quick Access - Wolfgramm Deal */}
        <div className="mb-8">
          <div className="terminal-content p-4 text-center" style={{backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)'}}>
            <div className="text-lg mb-2">🎯</div>
            <h3 className="text-sm font-bold font-mono mb-2">WOLFGRAMM ASCENT WALDORF DEAL</h3>
            <p className="text-xs font-mono mb-3" style={{color: 'var(--text-secondary)'}}>
              Park City hospitality development • $43.8M valuation • AI analysis ready
            </p>
            <Link href="/deals/k576qtmmvp4594zdvqp3qttx0d7np0m1">
              <InteractiveButton variant="secondary" size="sm">
                ANALYZE DEAL →
              </InteractiveButton>
            </Link>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 desktop:grid-cols-2 gap-6 mb-16">
          <div className="terminal-content p-8 text-center" style={{backgroundColor: 'var(--bg-card)'}}>
            <div className="text-3xl mb-4">📁</div>
            <h2 className="text-sm font-bold font-mono mb-3" style={{color: 'var(--text-primary)'}}>CREATE FOLDER</h2>
            <p className="text-xs font-mono mb-6" style={{color: 'var(--text-secondary)'}}>
              Create a new folder in Box.com for document storage and processing
            </p>
            <InteractiveButton 
              onClick={() => setShowCreateFolder(true)}
              variant="primary"
              className="w-full"
            >
              CREATE NEW FOLDER
            </InteractiveButton>
          </div>

          <div className="terminal-content p-8 text-center" style={{backgroundColor: 'var(--bg-card)'}}>
            <div className="text-3xl mb-4">📄</div>
            <h2 className="text-sm font-bold font-mono mb-3" style={{color: 'var(--text-primary)'}}>MANAGE FOLDERS</h2>
            <p className="text-xs font-mono mb-6" style={{color: 'var(--text-secondary)'}}>
              View existing folders and upload documents for processing
            </p>
            <Link href="/folders">
              <InteractiveButton variant="primary" className="w-full">
                VIEW ALL FOLDERS
              </InteractiveButton>
            </Link>
          </div>
        </div>

        {/* Integrations Guide */}
        <div className="mb-16">
          <div className="terminal-content p-8 text-center" style={{backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)', borderWidth: '2px'}}>
            <div className="text-3xl mb-4">🔧</div>
            <h2 className="text-sm font-bold font-mono mb-3" style={{color: 'var(--text-primary)'}}>INTEGRATION GUIDE</h2>
            <p className="text-xs font-mono mb-6" style={{color: 'var(--text-secondary)'}}>
              Connect Fireflies.ai, Slack, and Box.com • Step-by-step setup instructions • Workflow examples
            </p>
            <Link href="/integrations">
              <InteractiveButton variant="primary">
                VIEW SETUP GUIDE →
              </InteractiveButton>
            </Link>
          </div>
        </div>

        {/* How it Works */}
        <div className="terminal-content p-8" style={{backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)'}}>
          <h2 className="text-sm font-bold font-mono mb-6 text-center">
            ═══ PROCESSING WORKFLOW ═══
          </h2>
          <div className="font-mono text-xs leading-normal">
            <div className="grid grid-cols-1 tablet:grid-cols-3 gap-4 text-center">
              <div className="p-4" style={{border: '1px solid var(--border-secondary)'}}>
                <div className="mb-3 text-2xl">📁</div>
                <div className="font-bold text-sm mb-2">CREATE FOLDER</div>
                <div className="text-xs" style={{color: 'var(--text-secondary)'}}>
                  Box.com workspace setup
                </div>
              </div>
              <div className="p-4" style={{border: '1px solid var(--border-secondary)'}}>
                <div className="mb-3 text-2xl">⚡</div>
                <div className="font-bold text-sm mb-2">AI PROCESSING</div>
                <div className="text-xs" style={{color: 'var(--text-secondary)'}}>
                  Multi-agent analysis pipeline
                </div>
              </div>
              <div className="p-4" style={{border: '1px solid var(--border-secondary)'}}>
                <div className="mb-3 text-2xl">📊</div>
                <div className="font-bold text-sm mb-2">STRUCTURED OUTPUT</div>
                <div className="text-xs" style={{color: 'var(--text-secondary)'}}>
                  Institutional-grade reports
                </div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <div className="text-xs font-mono">
                <span style={{color: 'var(--accent-primary)'}}>UPLOAD</span>
                <span className="mx-2">→</span>
                <span style={{color: 'var(--accent-primary)'}}>OCR</span>
                <span className="mx-2">→</span>
                <span style={{color: 'var(--accent-primary)'}}>CLASSIFY</span>
                <span className="mx-2">→</span>
                <span style={{color: 'var(--accent-primary)'}}>ANALYZE</span>
                <span className="mx-2">→</span>
                <span style={{color: 'var(--accent-primary)'}}>SYNTHESIZE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-6" style={{borderTop: '1px solid var(--border-secondary)'}}>
          <p className="text-xs font-mono" style={{color: 'var(--text-muted)'}}>
            OKOA CAPITAL LLC • 2025 • OKOA LABS ENHANCED EDITION
          </p>
        </div>

        {/* Create Folder Modal */}
        <CreateFolderModal 
          isOpen={showCreateFolder}
          onClose={() => setShowCreateFolder(false)}
          onFolderCreated={(folderId, folderName) => {
            console.log('Folder created:', folderName);
          }}
        />
      </div>
    </div>
  );
}