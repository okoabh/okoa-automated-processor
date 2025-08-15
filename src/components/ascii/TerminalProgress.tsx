"use client";

import React, { useState, useEffect } from 'react';

interface TerminalProgressProps {
  label: string;
  progress: number; // 0-100
  showPercentage?: boolean;
  color?: string;
  width?: number;
  animated?: boolean;
  style?: 'blocks' | 'bars' | 'dots' | 'ascii';
}

export function TerminalProgress({
  label,
  progress,
  showPercentage = true,
  color = 'text-green-400',
  width = 30,
  animated = false,
  style = 'blocks'
}: TerminalProgressProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (animated) {
      const interval = setInterval(() => {
        setAnimatedProgress(prev => {
          if (prev < progress) {
            return Math.min(prev + 2, progress);
          }
          return prev;
        });
      }, 50);
      return () => clearInterval(interval);
    } else {
      setAnimatedProgress(progress);
    }
  }, [progress, animated]);

  const renderProgressBar = () => {
    const filledWidth = Math.floor((animatedProgress / 100) * width);
    const emptyWidth = width - filledWidth;

    switch (style) {
      case 'blocks':
        return (
          <>
            <span className={color}>{'█'.repeat(filledWidth)}</span>
            <span className="text-gray-600">{'░'.repeat(emptyWidth)}</span>
          </>
        );
      
      case 'bars':
        return (
          <>
            <span className={color}>{'━'.repeat(filledWidth)}</span>
            <span className="text-gray-600">{'─'.repeat(emptyWidth)}</span>
          </>
        );
      
      case 'dots':
        return (
          <>
            <span className={color}>{'●'.repeat(filledWidth)}</span>
            <span className="text-gray-600">{'○'.repeat(emptyWidth)}</span>
          </>
        );
      
      case 'ascii':
        const segments = ['▏', '▎', '▍', '▌', '▋', '▊', '▉', '█'];
        const fullBlocks = Math.floor(filledWidth);
        const remainder = (animatedProgress / 100) * width - fullBlocks;
        const partialBlock = remainder > 0 ? segments[Math.floor(remainder * 8)] : '';
        
        return (
          <>
            <span className={color}>
              {'█'.repeat(fullBlocks)}
              {partialBlock}
            </span>
            <span className="text-gray-600">
              {'░'.repeat(Math.max(0, emptyWidth - (partialBlock ? 1 : 0)))}
            </span>
          </>
        );
      
      default:
        return (
          <>
            <span className={color}>{'█'.repeat(filledWidth)}</span>
            <span className="text-gray-600">{'░'.repeat(emptyWidth)}</span>
          </>
        );
    }
  };

  return (
    <div className="font-mono text-sm flex items-center space-x-2">
      <span className="text-cyan-300 min-w-0 flex-shrink">{label}:</span>
      <span>[</span>
      {renderProgressBar()}
      <span>]</span>
      {showPercentage && (
        <span className={`${color} min-w-0 text-right`}>
          {Math.round(animatedProgress)}%
        </span>
      )}
    </div>
  );
}

// Specialized loading indicators
export function TerminalSpinner({ label, color = 'text-green-400' }: { label: string, color?: string }) {
  const [frame, setFrame] = useState(0);
  const spinnerChars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(prev => (prev + 1) % spinnerChars.length);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="font-mono text-sm flex items-center space-x-2">
      <span className={`${color} animate-spin`}>{spinnerChars[frame]}</span>
      <span className="text-cyan-300">{label}</span>
    </div>
  );
}

export function TerminalStatus({ 
  status, 
  color,
  icon 
}: { 
  status: string, 
  color?: string,
  icon?: string 
}) {
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online':
      case 'active':
      case 'running':
        return '●';
      case 'processing':
        return '◐';
      case 'warning':
        return '⚠';
      case 'error':
      case 'failed':
        return '✗';
      case 'completed':
      case 'success':
        return '✓';
      default:
        return '○';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online':
      case 'active':
      case 'running':
      case 'completed':
      case 'success':
        return 'text-green-400';
      case 'processing':
        return 'text-yellow-400';
      case 'warning':
        return 'text-orange-400';
      case 'error':
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const statusColor = color || getStatusColor(status);
  const statusIcon = icon || getStatusIcon(status);

  return (
    <div className="font-mono text-sm flex items-center space-x-2">
      <span className={`${statusColor} ${status.toLowerCase() === 'processing' ? 'animate-pulse' : ''}`}>
        {statusIcon}
      </span>
      <span className="text-cyan-300">{status}</span>
    </div>
  );
}