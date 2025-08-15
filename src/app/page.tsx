"use client";

import Link from 'next/link';
import { InteractiveButton } from '@/components/ascii/InteractiveButton';
import { CreateFolderModal } from '@/components/deals/CreateFolderModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useState } from 'react';

export default function Home() {
  const [showCreateFolder, setShowCreateFolder] = useState(false);

  return (
    <div className="min-h-screen bg-okoa-bg-primary dark:bg-japanese-ink-charcoal text-okoa-fg-primary dark:text-japanese-paper-warm font-mono transition-colors duration-normal">
      <div className="max-w-4xl mx-auto px-6 py-12">
        
        {/* Theme Toggle - Top Right */}
        <div className="flex justify-end mb-6">
          <ThemeToggle />
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <div className="bg-okoa-terminal-bg dark:bg-japanese-ink-sumi text-okoa-fg-primary dark:text-japanese-paper-warm p-6 mb-8 border-thin border-okoa-fg-primary dark:border-japanese-neutral-warm-gray shadow-subtle">
            <div className="font-mono text-sm leading-tight whitespace-pre">
{`╔══════════════════════════════════════════════════════════════╗
║   ██████╗ ██╗  ██╗ ██████╗  █████╗      ██╗      █████╗     ║
║  ██╔═══██╗██║ ██╔╝██╔═══██╗██╔══██╗     ██║     ██╔══██╗    ║
║  ██║   ██║█████╔╝ ██║   ██║███████║     ██║     ███████║    ║
║  ██║   ██║██╔═██╗ ██║   ██║██╔══██║     ██║     ██╔══██║    ║
║  ╚██████╔╝██║  ██╗╚██████╔╝██║  ██║     ███████╗██║  ██║    ║
║   ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝     ╚══════╝╚═╝  ╚═╝    ║
╠══════════════════════════════════════════════════════════════╣
║              AUTOMATED DOCUMENT PROCESSING SYSTEM             ║
║                         OKOA LABS ENHANCED                    ║
╚══════════════════════════════════════════════════════════════╝`}
            </div>
          </div>
          <h1 className="text-xl font-bold text-okoa-fg-primary dark:text-japanese-paper-warm font-mono mb-4 tracking-wide">
            INSTITUTIONAL-GRADE DOCUMENT PROCESSOR
          </h1>
          <p className="text-sm text-okoa-fg-secondary dark:text-japanese-neutral-warm-gray font-mono max-w-xl mx-auto">
            Multi-agent AI processing • Real estate analysis • Structured synthesis
          </p>
        </div>

        {/* Quick Access - Wolfgramm Deal */}
        <div className="mb-8">
          <div className="bg-japanese-earth-bamboo dark:bg-japanese-earth-sage text-japanese-paper-warm border-thin border-japanese-earth-bamboo dark:border-japanese-earth-sage p-4 text-center">
            <div className="text-lg mb-2">🎯</div>
            <h3 className="text-sm font-bold font-mono mb-2">WOLFGRAMM ASCENT WALDORF DEAL</h3>
            <p className="text-xs font-mono mb-3 opacity-90">
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
          <div className="bg-okoa-bg-secondary dark:bg-japanese-ink-sumi border-thin border-okoa-fg-primary dark:border-japanese-neutral-warm-gray p-8 text-center shadow-subtle">
            <div className="text-3xl mb-4">📁</div>
            <h2 className="text-sm font-bold font-mono mb-3 text-okoa-fg-primary dark:text-japanese-paper-warm">CREATE FOLDER</h2>
            <p className="text-xs text-okoa-fg-secondary dark:text-japanese-neutral-warm-gray font-mono mb-6">
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

          <div className="bg-okoa-bg-secondary dark:bg-japanese-ink-sumi border-thin border-okoa-fg-primary dark:border-japanese-neutral-warm-gray p-8 text-center shadow-subtle">
            <div className="text-3xl mb-4">📄</div>
            <h2 className="text-sm font-bold font-mono mb-3 text-okoa-fg-primary dark:text-japanese-paper-warm">MANAGE FOLDERS</h2>
            <p className="text-xs text-okoa-fg-secondary dark:text-japanese-neutral-warm-gray font-mono mb-6">
              View existing folders and upload documents for processing
            </p>
            <Link href="/folders">
              <InteractiveButton variant="primary" className="w-full">
                VIEW ALL FOLDERS
              </InteractiveButton>
            </Link>
          </div>
        </div>

        {/* How it Works */}
        <div className="bg-okoa-bg-tertiary dark:bg-japanese-ink-sumi text-okoa-fg-primary dark:text-japanese-paper-warm border-thin border-okoa-fg-secondary dark:border-japanese-neutral-warm-gray p-8 shadow-moderate">
          <h2 className="text-sm font-bold font-mono mb-6 text-center">
            ═══ PROCESSING WORKFLOW ═══
          </h2>
          <div className="font-mono text-xs leading-normal">
            <div className="grid grid-cols-1 tablet:grid-cols-3 gap-4 text-center">
              <div className="border border-okoa-fg-secondary dark:border-japanese-neutral-warm-gray p-4">
                <div className="mb-3 text-2xl">📁</div>
                <div className="font-bold text-sm mb-2">CREATE FOLDER</div>
                <div className="text-okoa-fg-secondary dark:text-japanese-neutral-warm-gray text-xs">
                  Box.com workspace setup
                </div>
              </div>
              <div className="border border-okoa-fg-secondary dark:border-japanese-neutral-warm-gray p-4">
                <div className="mb-3 text-2xl">⚡</div>
                <div className="font-bold text-sm mb-2">AI PROCESSING</div>
                <div className="text-okoa-fg-secondary dark:text-japanese-neutral-warm-gray text-xs">
                  Multi-agent analysis pipeline
                </div>
              </div>
              <div className="border border-okoa-fg-secondary dark:border-japanese-neutral-warm-gray p-4">
                <div className="mb-3 text-2xl">📊</div>
                <div className="font-bold text-sm mb-2">STRUCTURED OUTPUT</div>
                <div className="text-okoa-fg-secondary dark:text-japanese-neutral-warm-gray text-xs">
                  Institutional-grade reports
                </div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <div className="text-xs font-mono">
                <span className="text-okoa-interactive-primary">UPLOAD</span>
                <span className="mx-2">→</span>
                <span className="text-okoa-interactive-primary">OCR</span>
                <span className="mx-2">→</span>
                <span className="text-okoa-interactive-primary">CLASSIFY</span>
                <span className="mx-2">→</span>
                <span className="text-okoa-interactive-primary">ANALYZE</span>
                <span className="mx-2">→</span>
                <span className="text-okoa-interactive-primary">SYNTHESIZE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-6 border-t border-okoa-fg-secondary dark:border-japanese-neutral-warm-gray border-opacity-20">
          <p className="text-okoa-fg-secondary dark:text-japanese-neutral-warm-gray text-xs font-mono">
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