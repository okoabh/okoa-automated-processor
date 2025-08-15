"use client";

import React, { useState, useEffect } from 'react';
import { InteractiveButton } from '@/components/ascii/InteractiveButton';

interface ChatMessage {
  type: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface AISidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  dealId?: string;
  dealName?: string;
  context?: any;
}

export function AISidebar({ isOpen, onToggle, dealId, dealName, context }: AISidebarProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agentStatus, setAgentStatus] = useState<string>('');

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      type: 'user',
      content: currentMessage,
      timestamp: Date.now()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    // Show progressive status updates
    const statusMessages = [
      "I'm accessing the deal documents...",
      "Analyzing financial metrics and risk factors...",
      "Cross-referencing market data...",
      "Formulating comprehensive response..."
    ];

    let statusIndex = 0;
    const statusInterval = setInterval(() => {
      if (statusIndex < statusMessages.length) {
        setAgentStatus(statusMessages[statusIndex]);
        statusIndex++;
      }
    }, 1500);

    try {
      const response = await fetch(`/api/deals/${dealId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: currentMessage,
          context: context
        })
      });

      clearInterval(statusInterval);
      setAgentStatus('');

      if (response.ok) {
        const data = await response.json();
        const aiMessage: ChatMessage = {
          type: 'assistant',
          content: data.response,
          timestamp: Date.now()
        };
        setChatMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      clearInterval(statusInterval);
      setAgentStatus('');
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        type: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: Date.now()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 transition-opacity duration-300"
          style={{backgroundColor: 'rgba(0, 0, 0, 0.3)'}}
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed right-0 top-0 h-full w-96 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{backgroundColor: 'var(--bg-primary)', borderLeft: '2px solid var(--border-primary)'}}
      >
        {/* Header */}
        <div className="terminal-header flex items-center justify-between p-4" style={{borderBottom: '1px solid var(--border-primary)'}}>
          <div>
            <div className="font-mono text-sm font-bold" style={{color: 'var(--text-primary)'}}>
              🤖 MIDNIGHT ATLAS PRISM
            </div>
            <div className="font-mono text-xs" style={{color: 'var(--text-secondary)'}}>
              Real Estate Analysis Agent v1.1
            </div>
          </div>
          <InteractiveButton onClick={onToggle} variant="secondary" size="sm">
            ✕
          </InteractiveButton>
        </div>

        {/* Agent Status */}
        {(isLoading || agentStatus) && (
          <div className="p-3" style={{backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)'}}>
            <div className="flex items-center space-x-2">
              <div className="animate-spin text-sm">⚡</div>
              <div className="font-mono text-xs" style={{color: 'var(--accent-primary)'}}>
                {agentStatus || "Processing your request..."}
              </div>
            </div>
          </div>
        )}

        {/* Deal Context */}
        {dealName && (
          <div className="p-3" style={{backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-light)'}}>
            <div className="font-mono text-xs font-bold" style={{color: 'var(--text-primary)'}}>
              ANALYZING: {dealName.toUpperCase()}
            </div>
            <div className="font-mono text-xs" style={{color: 'var(--text-secondary)'}}>
              Context loaded • Financial data • Market analysis • Risk metrics
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">💬</div>
              <div className="font-mono text-sm" style={{color: 'var(--text-secondary)'}}>
                Ask me about deal analysis, financial metrics, risk assessment, or market positioning.
              </div>
            </div>
          ) : (
            chatMessages.map((msg, idx) => (
              <div key={idx} className="space-y-2">
                <div className="font-mono text-xs" style={{color: 'var(--text-muted)'}}>
                  {msg.type === 'user' ? '👤 YOU' : '🤖 MIDNIGHT ATLAS PRISM'}
                </div>
                <div 
                  className="p-3 font-mono text-sm rounded"
                  style={{
                    backgroundColor: msg.type === 'user' ? 'var(--bg-hover)' : 'var(--bg-tertiary)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}

          {/* Thinking Indicator */}
          {isLoading && (
            <div className="space-y-2">
              <div className="font-mono text-xs" style={{color: 'var(--text-muted)'}}>
                🤖 MIDNIGHT ATLAS PRISM
              </div>
              <div 
                className="p-3 font-mono text-sm rounded"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)'
                }}
              >
                <div className="animate-pulse">
                  {agentStatus || "Analyzing your question..."}
                </div>
                <div className="text-xs mt-1 opacity-60">
                  Accessing documents • Running calculations • Preparing insights
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4" style={{borderTop: '1px solid var(--border-primary)'}}>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about financial analysis, risks, opportunities..."
                className="flex-1 p-2 font-mono text-sm border rounded focus:outline-none"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  borderColor: currentMessage.trim() ? 'var(--accent-primary)' : 'var(--border-primary)'
                }}
                disabled={isLoading}
              />
              <InteractiveButton
                onClick={sendMessage}
                variant="primary"
                size="sm"
                disabled={!currentMessage.trim() || isLoading}
              >
                {isLoading ? '⚡' : '→'}
              </InteractiveButton>
            </div>
            
            {/* Quick Questions */}
            <div className="flex flex-wrap gap-1">
              {[
                "What are the key risks?",
                "Financial summary?",
                "Market analysis?",
                "ROI projections?"
              ].map((question) => (
                <button
                  key={question}
                  onClick={() => setCurrentMessage(question)}
                  className="px-2 py-1 font-mono text-xs rounded border hover:opacity-80 transition-opacity"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                    borderColor: 'var(--border-light)'
                  }}
                  disabled={isLoading}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Floating AI Button
export function AIFloatingButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-30 p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
      style={{
        backgroundColor: 'var(--accent-primary)',
        color: 'var(--text-inverse)',
        border: '2px solid var(--border-primary)'
      }}
    >
      <div className="flex items-center space-x-2">
        <div className="text-lg">🤖</div>
        <div className="font-mono text-sm font-bold">AI AGENT</div>
      </div>
    </button>
  );
}