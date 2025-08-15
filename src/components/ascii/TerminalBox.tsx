"use client";

import React from 'react';

interface TerminalBoxProps {
  title?: string;
  children: React.ReactNode;
  width?: string;
  height?: string;
  className?: string;
  borderStyle?: 'single' | 'double' | 'thick' | 'dashed';
}

const borderChars = {
  single: {
    topLeft: '┌',
    topRight: '┐',
    bottomLeft: '└',
    bottomRight: '┘',
    horizontal: '─',
    vertical: '│'
  },
  double: {
    topLeft: '╔',
    topRight: '╗',
    bottomLeft: '╚',
    bottomRight: '╝',
    horizontal: '═',
    vertical: '║'
  },
  thick: {
    topLeft: '┏',
    topRight: '┓',
    bottomLeft: '┗',
    bottomRight: '┛',
    horizontal: '━',
    vertical: '┃'
  },
  dashed: {
    topLeft: '┌',
    topRight: '┐',
    bottomLeft: '└',
    bottomRight: '┘',
    horizontal: '┄',
    vertical: '┊'
  }
};

export function TerminalBox({ 
  title, 
  children, 
  width = "100%", 
  height = "auto", 
  className = "",
  borderStyle = 'single' 
}: TerminalBoxProps) {
  const chars = borderChars[borderStyle];
  
  return (
    <div 
      className={`font-mono text-sm bg-white text-gray-900 border border-gray-300 ${className}`}
      style={{ width, height }}
    >
      {/* Top border */}
      <div className="flex">
        <span>{chars.topLeft}</span>
        <div className="flex-1 flex">
          {title && (
            <>
              <span className="text-gray-800">
                {chars.horizontal.repeat(2)} {title} {chars.horizontal.repeat(2)}
              </span>
              <span className="flex-1">
                {chars.horizontal.repeat(Math.max(0, 40 - title.length - 8))}
              </span>
            </>
          )}
          {!title && (
            <span className="flex-1">
              {chars.horizontal.repeat(50)}
            </span>
          )}
        </div>
        <span>{chars.topRight}</span>
      </div>

      {/* Content area */}
      <div className="flex">
        <span>{chars.vertical}</span>
        <div className="flex-1 px-2 py-1">
          {children}
        </div>
        <span>{chars.vertical}</span>
      </div>

      {/* Bottom border */}
      <div className="flex">
        <span>{chars.bottomLeft}</span>
        <span className="flex-1">
          {chars.horizontal.repeat(50)}
        </span>
        <span>{chars.bottomRight}</span>
      </div>
    </div>
  );
}