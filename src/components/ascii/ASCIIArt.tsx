"use client";

import React, { useEffect, useState } from 'react';

interface ASCIIArtProps {
  text: string;
  font?: string;
  className?: string;
  color?: string;
}

// Predefined ASCII art for common OKOA elements
const presetArt = {
  "OKOA": `
████████████████████████████████████████████████████████████████████████████████
█   ██████╗ ██╗  ██╗ ██████╗  █████╗      ██╗      █████╗ ██████╗ ███████╗   █
█  ██╔═══██╗██║ ██╔╝██╔═══██╗██╔══██╗     ██║     ██╔══██╗██╔══██╗██╔════╝   █
█  ██║   ██║█████╔╝ ██║   ██║███████║     ██║     ███████║██████╔╝███████╗   █
█  ██║   ██║██╔═██╗ ██║   ██║██╔══██║     ██║     ██╔══██║██╔══██╗╚════██║   █
█  ╚██████╔╝██║  ██╗╚██████╔╝██║  ██║     ███████╗██║  ██║██████╔╝███████║   █
█   ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝     ╚══════╝╚═╝  ╚═╝╚═════╝ ╚══════╝   █
████████████████████████████████████████████████████████████████████████████████`,
  
  "PROCESSING": `
██████╗ ██████╗  ██████╗  ██████╗███████╗███████╗███████╗██╗███╗   ██╗ ██████╗ 
██╔══██╗██╔══██╗██╔═══██╗██╔════╝██╔════╝██╔════╝██╔════╝██║████╗  ██║██╔════╝ 
██████╔╝██████╔╝██║   ██║██║     █████╗  ███████╗███████╗██║██╔██╗ ██║██║  ███╗
██╔═══╝ ██╔══██╗██║   ██║██║     ██╔══╝  ╚════██║╚════██║██║██║╚██╗██║██║   ██║
██║     ██║  ██║╚██████╔╝╚██████╗███████╗███████║███████║██║██║ ╚████║╚██████╔╝
╚═╝     ╚═╝  ╚═╝ ╚═════╝  ╚═════╝╚══════╝╚══════╝╚══════╝╚═╝╚═╝  ╚═══╝ ╚═════╝`,

  "AGENT": `
 █████╗  ██████╗ ███████╗███╗   ██╗████████╗
██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝
███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   
██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   
██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   
╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝`,

  "PIPELINE": `
█████████████████████████████████████████████████████████████████████████████████████
█                         OKOA AUTOMATED PROCESSING PIPELINE                         █
█████████████████████████████████████████████████████████████████████████████████████
█                                                                                     █
█  [Box.com] → [Webhook] → [Queue] → [Agent Pool] → [Claude] → [Output] → [Slack]    █
█      ↓           ↓         ↓          ↓            ↓          ↓          ↓        █
█  File Upload  Instant   Processing  Smart Agent   AI         OKOA      Live       █
█  Detection    Trigger   Queue       Selection     Analysis   Format    Updates    █
█                                                                                     █
█  Real-time Dashboard ← Live Metrics ← Cost Tracking ← Token Usage ← Agent Status  █
█                                                                                     █
█████████████████████████████████████████████████████████████████████████████████████`,

  "DASHBOARD": `
███████████████████████████████████████████████████████████████████████
█                         OKOA LIVE DASHBOARD                          █
███████████████████████████████████████████████████████████████████████
█  [●] Agent Pool    [●] Processing Queue    [●] Cost Tracking         █
█  [●] Real-time     [●] Token Metrics       [●] Slack Updates         █
███████████████████████████████████████████████████████████████████████`,

  "TERMINAL": `
██████████████████████████████████████████████████████████████████████████████████████
█ user@okoa-system:~/processing$ ./start-multi-agent-processing.sh                    █
█ ███████████████████████████████████████████████████████████████████████████████████ █
█ █ [✓] Agent Pool: 3 active agents                                                █ █
█ █ [✓] Processing Queue: 12 documents pending                                     █ █
█ █ [✓] Cost Tracking: $4.23 today | Budget: $100/day                             █ █
█ █ [✓] Slack Integration: Connected to #doc-processing                            █ █
█ █                                                                                █ █
█ █ Real-time Status:                                                              █ █
█ █ Agent-001: [████████████████████] Processing invoice_2024.pdf                 █ █
█ █ Agent-002: [███████████████─────] Analyzing contract_final.docx               █ █
█ █ Agent-003: [██████████──────────] Extracting lease_agreement.pdf              █ █
█ ███████████████████████████████████████████████████████████████████████████████████ █
██████████████████████████████████████████████████████████████████████████████████████`
};

export function ASCIIArt({ text, font = "block", className = "", color = "text-gray-900" }: ASCIIArtProps) {
  const [asciiText, setAsciiText] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check if we have a preset for this text
    if (presetArt[text as keyof typeof presetArt]) {
      setAsciiText(presetArt[text as keyof typeof presetArt]);
      return;
    }

    // Fallback to simple block letters for short text
    if (text.length <= 10) {
      generateSimpleASCII(text);
    } else {
      setAsciiText(text); // For longer text, just display as-is
    }
  }, [text]);

  const generateSimpleASCII = (input: string) => {
    // Simple ASCII generation for short text
    const letters: { [key: string]: string[] } = {
      'A': [
        ' ███████ ',
        '██     ██',
        '███████  ',
        '██     ██',
        '██     ██'
      ],
      'B': [
        '███████  ',
        '██     ██',
        '███████  ',
        '██     ██',
        '███████  '
      ],
      'O': [
        ' ███████ ',
        '██     ██',
        '██     ██',
        '██     ██',
        ' ███████ '
      ],
      'K': [
        '██     ██',
        '██   ██  ',
        '██████   ',
        '██   ██  ',
        '██     ██'
      ],
      ' ': [
        '         ',
        '         ',
        '         ',
        '         ',
        '         '
      ]
    };

    const inputUpper = input.toUpperCase();
    const lines = ['', '', '', '', ''];
    
    for (const char of inputUpper) {
      const charPattern = letters[char] || letters[' '];
      for (let i = 0; i < 5; i++) {
        lines[i] += charPattern[i] + ' ';
      }
    }
    
    setAsciiText(lines.join('\n'));
  };

  const animateTypewriter = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const originalText = asciiText;
    setAsciiText("");
    
    let currentLength = 0;
    const interval = setInterval(() => {
      if (currentLength <= originalText.length) {
        setAsciiText(originalText.slice(0, currentLength));
        currentLength += Math.floor(Math.random() * 3) + 1; // Random speed
      } else {
        clearInterval(interval);
        setIsAnimating(false);
      }
    }, 20);
  };

  return (
    <div 
      className={`font-mono whitespace-pre-wrap select-none ${color} ${className}`}
      onClick={animateTypewriter}
      style={{ 
        lineHeight: '1.2',
        cursor: 'pointer',
        userSelect: 'none'
      }}
    >
      {asciiText}
      {isAnimating && <span className="animate-pulse">_</span>}
    </div>
  );
}