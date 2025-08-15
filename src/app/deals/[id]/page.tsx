"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { InteractiveButton } from '@/components/ascii/InteractiveButton';
import { FinancialAnalysis } from '@/components/deals/FinancialAnalysis';
import Link from 'next/link';

interface Document {
  _id: string;
  name: string;
  type: 'original' | 'ocr' | 'plaintext' | 'synthetic' | 'synthdoc' | 'chat';
  path?: string;
  content?: string;
  status: string;
  createdAt: number;
}

interface Folder {
  _id: string;
  name: string;
  status: string;
  createdAt: number;
  documentCount: number;
  boxFolderId?: string;
}

interface ChatMessage {
  type: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export default function DealPage() {
  const params = useParams();
  const dealId = params.id as string;
  
  const [folder, setFolder] = useState<Folder | null>(null);
  const [documents, setDocuments] = useState<{
    original: Document[];
    ocr: Document[];
    plaintext: Document[];
    synthetic: Document[];
    synthdoc: Document[];
  }>({
    original: [],
    ocr: [],
    plaintext: [],
    synthetic: [],
    synthdoc: []
  });
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'documents' | 'financial' | 'chat'>('documents');

  useEffect(() => {
    if (dealId) {
      loadDealData();
    }
  }, [dealId]);

  const loadDealData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/deals/${dealId}`);
      if (response.ok) {
        const data = await response.json();
        setFolder(data.folder);
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error('Failed to load deal data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!currentMessage.trim() || isChatLoading) return;

    const userMessage: ChatMessage = {
      type: 'user',
      content: currentMessage,
      timestamp: Date.now()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsChatLoading(true);

    try {
      const response = await fetch(`/api/deals/${dealId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: currentMessage,
          context: documents
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage: ChatMessage = {
          type: 'assistant',
          content: data.response,
          timestamp: Date.now()
        };
        setChatMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        type: 'assistant',
        content: 'Sorry, I encountered an error processing your request.',
        timestamp: Date.now()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-okoa-bg-primary text-okoa-fg-primary font-mono">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="text-sm font-mono">LOADING DEAL DATA...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="min-h-screen bg-okoa-bg-primary text-okoa-fg-primary font-mono">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="text-sm font-mono text-okoa-fg-primary mb-4">DEAL NOT FOUND</div>
            <Link href="/folders">
              <InteractiveButton variant="secondary">
                ← BACK TO FOLDERS
              </InteractiveButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalDocs = documents.original.length + documents.ocr.length + 
                   documents.plaintext.length + documents.synthetic.length + 
                   documents.synthdoc.length;

  return (
    <div className="min-h-screen bg-okoa-bg-primary text-okoa-fg-primary font-mono">
      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="border-b border-okoa-fg-secondary pb-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold font-mono mb-2">
                📁 {folder.name.toUpperCase()}
              </h1>
              <p className="text-sm text-okoa-fg-secondary font-mono">
                Deal documents and AI analysis interface
              </p>
            </div>
            
            <div className="flex space-x-4">
              <Link href="/folders">
                <InteractiveButton variant="secondary">
                  ← BACK TO FOLDERS
                </InteractiveButton>
              </Link>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-8">
          <InteractiveButton
            onClick={() => setActiveTab('documents')}
            variant={activeTab === 'documents' ? 'primary' : 'secondary'}
          >
            📄 DOCUMENTS ({totalDocs})
          </InteractiveButton>
          <InteractiveButton
            onClick={() => setActiveTab('financial')}
            variant={activeTab === 'financial' ? 'primary' : 'secondary'}
          >
            💰 FINANCIAL
          </InteractiveButton>
          <InteractiveButton
            onClick={() => setActiveTab('chat')}
            variant={activeTab === 'chat' ? 'primary' : 'secondary'}
          >
            🤖 AI ANALYSIS
          </InteractiveButton>
        </div>

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Original Files */}
            <div className="bg-okoa-bg-secondary border-thin border-okoa-fg-primary p-4">
              <h3 className="text-sm font-bold font-mono mb-3 text-okoa-fg-primary">
                📄 ORIGINAL FILES ({documents.original.length})
              </h3>
              <div className="space-y-2 text-xs font-mono">
                {documents.original.length === 0 ? (
                  <div className="text-okoa-fg-secondary">No original files found</div>
                ) : (
                  documents.original.map(doc => (
                    <div key={doc._id} className="flex justify-between items-center py-1 border-b border-okoa-fg-secondary border-opacity-20">
                      <span>{doc.name}</span>
                      <span className="text-okoa-fg-secondary">{doc.status}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* OCR Files */}
            <div className="bg-okoa-bg-secondary border-thin border-okoa-fg-primary p-4">
              <h3 className="text-sm font-bold font-mono mb-3 text-okoa-fg-primary">
                🔍 OCR PROCESSED ({documents.ocr.length})
              </h3>
              <div className="space-y-2 text-xs font-mono">
                {documents.ocr.length === 0 ? (
                  <div className="text-okoa-fg-secondary">No OCR files found</div>
                ) : (
                  documents.ocr.map(doc => (
                    <div key={doc._id} className="flex justify-between items-center py-1 border-b border-okoa-fg-secondary border-opacity-20">
                      <span>{doc.name}</span>
                      <span className="text-okoa-fg-secondary">{doc.status}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Plain Text Extractions */}
            <div className="bg-okoa-bg-secondary border-thin border-okoa-fg-primary p-4">
              <h3 className="text-sm font-bold font-mono mb-3 text-okoa-fg-primary">
                📝 PLAIN TEXT ({documents.plaintext.length})
              </h3>
              <div className="space-y-2 text-xs font-mono">
                {documents.plaintext.length === 0 ? (
                  <div className="text-okoa-fg-secondary">No plain text extractions found</div>
                ) : (
                  documents.plaintext.map(doc => (
                    <div key={doc._id} className="flex justify-between items-center py-1 border-b border-okoa-fg-secondary border-opacity-20">
                      <span>{doc.name}</span>
                      <span className="text-okoa-fg-secondary">{doc.status}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Synthetic Summaries */}
            <div className="bg-okoa-bg-secondary border-thin border-okoa-fg-primary p-4">
              <h3 className="text-sm font-bold font-mono mb-3 text-okoa-fg-primary">
                ⚡ SYNTHETIC SUMMARIES ({documents.synthetic.length})
              </h3>
              <div className="space-y-2 text-xs font-mono">
                {documents.synthetic.length === 0 ? (
                  <div className="text-okoa-fg-secondary">No synthetic summaries found</div>
                ) : (
                  documents.synthetic.map(doc => (
                    <div key={doc._id} className="flex justify-between items-center py-1 border-b border-okoa-fg-secondary border-opacity-20">
                      <span>{doc.name}</span>
                      <span className="text-okoa-fg-secondary">{doc.status}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Master Synthdoc */}
            <div className="lg:col-span-2 bg-japanese-ink-sumi text-japanese-ink-light border-thin border-japanese-ink-sumi p-4">
              <h3 className="text-sm font-bold font-mono mb-3">
                🎯 MASTER SYNTHDOC ({documents.synthdoc.length})
              </h3>
              <div className="space-y-2 text-xs font-mono">
                {documents.synthdoc.length === 0 ? (
                  <div className="text-japanese-neutral-warm-gray">No master synthdoc found</div>
                ) : (
                  documents.synthdoc.map(doc => (
                    <div key={doc._id} className="flex justify-between items-center py-1 border-b border-japanese-neutral-warm-gray border-opacity-20">
                      <span>{doc.name}</span>
                      <span className="text-japanese-neutral-warm-gray">{doc.status}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Financial Tab */}
        {activeTab === 'financial' && (
          <div>
            {/* Wolfgramm Deal Financial Data */}
            {folder?.name.toLowerCase().includes('wolfgramm') ? (
              <FinancialAnalysis 
                dealData={{
                  totalValue: 43800000, // As-is value from appraisal
                  keyCount: 120,
                  totalBudget: 74589341,
                  spentAmount: 36298082,
                  projectedValue: 78000000, // Stabilized value
                  timeHorizon: 3 // Years to stabilization
                }}
              />
            ) : (
              <div className="bg-okoa-bg-secondary dark:bg-japanese-ink-sumi border-thin border-okoa-fg-primary dark:border-japanese-neutral-warm-gray p-8 text-center">
                <div className="text-2xl mb-4">📊</div>
                <h3 className="text-sm font-bold font-mono mb-2 text-okoa-fg-primary dark:text-japanese-paper-warm">
                  FINANCIAL ANALYSIS
                </h3>
                <p className="text-xs text-okoa-fg-secondary dark:text-japanese-neutral-warm-gray font-mono">
                  Financial analysis will be available once deal documents are processed
                </p>
              </div>
            )}
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="max-w-4xl mx-auto">
            
            {/* Agent Header */}
            <div className="bg-japanese-ink-sumi text-japanese-ink-light border-thin border-japanese-ink-sumi p-4 mb-6">
              <div className="font-mono text-sm text-center">
                🤖 MIDNIGHT ATLAS PRISM v1.1 - REAL ESTATE ANALYSIS AGENT
              </div>
              <div className="text-xs text-japanese-neutral-warm-gray text-center mt-2">
                Institutional-grade real estate analysis • Financial modeling • Risk assessment
              </div>
            </div>

            {/* Chat Messages */}
            <div className="bg-okoa-bg-secondary border-thin border-okoa-fg-primary p-4 mb-4 min-h-[400px] max-h-[500px] overflow-y-auto">
              {chatMessages.length === 0 ? (
                <div className="text-center text-okoa-fg-secondary font-mono text-sm py-8">
                  <div className="mb-4">💬</div>
                  <div>Start a conversation with the AI agent</div>
                  <div className="text-xs mt-2">Ask about document analysis, risk assessment, financial modeling, or deal structure</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`p-3 ${msg.type === 'user' ? 'bg-okoa-bg-primary text-okoa-fg-primary' : 'bg-japanese-ink-sumi text-japanese-ink-light'} border border-okoa-fg-secondary border-opacity-30`}>
                      <div className="text-xs font-mono mb-1 opacity-70">
                        {msg.type === 'user' ? '👤 USER' : '🤖 MIDNIGHT ATLAS PRISM'}
                      </div>
                      <div className="text-sm font-mono whitespace-pre-wrap">
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="p-3 bg-japanese-ink-sumi text-japanese-ink-light border border-okoa-fg-secondary border-opacity-30">
                      <div className="text-xs font-mono mb-1 opacity-70">🤖 MIDNIGHT ATLAS PRISM</div>
                      <div className="text-sm font-mono animate-pulse">Analyzing...</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="bg-okoa-bg-secondary border-thin border-okoa-fg-primary p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Ask about the deal documents, financial analysis, risk factors..."
                  className="flex-1 p-3 border-thin border-okoa-fg-primary bg-okoa-bg-primary text-okoa-fg-primary font-mono text-sm focus:outline-none focus:border-okoa-interactive-primary"
                  disabled={isChatLoading}
                />
                <InteractiveButton
                  onClick={sendChatMessage}
                  variant="primary"
                  disabled={!currentMessage.trim() || isChatLoading}
                >
                  {isChatLoading ? 'ANALYZING...' : 'SEND →'}
                </InteractiveButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}