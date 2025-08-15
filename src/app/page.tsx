"use client";

import Link from 'next/link';
import { InteractiveButton } from '@/components/ascii/InteractiveButton';
import { CreateFolderModal } from '@/components/deals/CreateFolderModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useState } from 'react';

export default function Home() {
  const [showCreateFolder, setShowCreateFolder] = useState(false);

  return (
    <div className="min-h-screen font-mono" style={{backgroundColor: 'var(--figma-cream-lightest)', color: 'var(--figma-text-dark)'}}>
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
          <h1 className="text-xl font-bold font-mono mb-4 tracking-wide" style={{color: 'var(--figma-text-dark)'}}>
            INSTITUTIONAL-GRADE DOCUMENT PROCESSOR
          </h1>
          <p className="text-sm font-mono max-w-xl mx-auto" style={{color: 'var(--figma-gray-medium)'}}>
            Multi-agent AI processing • Real estate analysis • Structured synthesis
          </p>
        </div>

        {/* Quick Access - Wolfgramm Deal */}
        <div className="mb-8">
          <div className="terminal-content p-4 text-center" style={{backgroundColor: 'var(--figma-cream)', color: 'var(--figma-text-dark)', border: '1px solid var(--figma-beige)'}}>
            <div className="text-lg mb-2">🎯</div>
            <h3 className="text-sm font-bold font-mono mb-2">WOLFGRAMM ASCENT WALDORF DEAL</h3>
            <p className="text-xs font-mono mb-3" style={{color: 'var(--figma-gray-medium)'}}>
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
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '64px'}}>
          <div className="terminal-content p-8 text-center" style={{backgroundColor: 'var(--figma-cream-light)', border: '1px solid var(--figma-beige)'}}>
            <div className="text-3xl mb-4">📁</div>
            <h2 className="text-sm font-bold font-mono mb-3" style={{color: 'var(--figma-text-dark)'}}>CREATE FOLDER</h2>
            <p className="text-xs font-mono mb-6" style={{color: 'var(--figma-gray-medium)'}}>
              Create a new folder in Box.com for document storage and processing
            </p>
            <div style={{width: '100%'}}>
              <InteractiveButton 
                onClick={() => setShowCreateFolder(true)}
                variant="primary"
              >
                CREATE NEW FOLDER
              </InteractiveButton>
            </div>
          </div>

          <div className="terminal-content p-8 text-center" style={{backgroundColor: 'var(--figma-cream-light)', border: '1px solid var(--figma-beige)'}}>
            <div className="text-3xl mb-4">📄</div>
            <h2 className="text-sm font-bold font-mono mb-3" style={{color: 'var(--figma-text-dark)'}}>MANAGE FOLDERS</h2>
            <p className="text-xs font-mono mb-6" style={{color: 'var(--figma-gray-medium)'}}>
              View existing folders and upload documents for processing
            </p>
            <div style={{width: '100%'}}>
              <Link href="/folders">
                <InteractiveButton variant="primary">
                  VIEW ALL FOLDERS
                </InteractiveButton>
              </Link>
            </div>
          </div>
        </div>

        {/* Integrations Guide */}
        <div className="mb-16">
          <div className="terminal-content p-8 text-center" style={{backgroundColor: 'var(--figma-cream)', borderColor: 'var(--figma-brown-accent)', borderWidth: '2px'}}>
            <div className="text-3xl mb-4">🔧</div>
            <h2 className="text-sm font-bold font-mono mb-3" style={{color: 'var(--figma-text-dark)'}}>INTEGRATION GUIDE</h2>
            <p className="text-xs font-mono mb-6" style={{color: 'var(--figma-gray-medium)'}}>
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
        <div className="terminal-content p-8" style={{backgroundColor: 'var(--figma-cream)', color: 'var(--figma-text-dark)', border: '1px solid var(--figma-beige)'}}>
          <h2 className="text-sm font-bold font-mono mb-6 text-center">
            ═══ PROCESSING WORKFLOW ═══
          </h2>
          <div className="font-mono text-xs leading-normal">
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', textAlign: 'center'}}>
              <div className="p-4" style={{border: '1px solid var(--figma-beige)', backgroundColor: 'var(--figma-cream-light)'}}>
                <div className="mb-3 text-2xl">📁</div>
                <div className="font-bold text-sm mb-2">CREATE FOLDER</div>
                <div className="text-xs" style={{color: 'var(--figma-gray-medium)'}}>
                  Box.com workspace setup
                </div>
              </div>
              <div className="p-4" style={{border: '1px solid var(--figma-beige)', backgroundColor: 'var(--figma-cream-light)'}}>
                <div className="mb-3 text-2xl">⚡</div>
                <div className="font-bold text-sm mb-2">AI PROCESSING</div>
                <div className="text-xs" style={{color: 'var(--figma-gray-medium)'}}>
                  Multi-agent analysis pipeline
                </div>
              </div>
              <div className="p-4" style={{border: '1px solid var(--figma-beige)', backgroundColor: 'var(--figma-cream-light)'}}>
                <div className="mb-3 text-2xl">📊</div>
                <div className="font-bold text-sm mb-2">STRUCTURED OUTPUT</div>
                <div className="text-xs" style={{color: 'var(--figma-gray-medium)'}}>
                  Institutional-grade reports
                </div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <div className="text-xs font-mono">
                <span style={{color: 'var(--figma-brown-accent)'}}>UPLOAD</span>
                <span className="mx-2">→</span>
                <span style={{color: 'var(--figma-brown-accent)'}}>OCR</span>
                <span className="mx-2">→</span>
                <span style={{color: 'var(--figma-brown-accent)'}}>CLASSIFY</span>
                <span className="mx-2">→</span>
                <span style={{color: 'var(--figma-brown-accent)'}}>ANALYZE</span>
                <span className="mx-2">→</span>
                <span style={{color: 'var(--figma-brown-accent)'}}>SYNTHESIZE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-6" style={{borderTop: '1px solid var(--figma-beige)'}}>
          <p className="text-xs font-mono" style={{color: 'var(--figma-gray)'}}>
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