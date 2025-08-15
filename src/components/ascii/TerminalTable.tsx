"use client";

import React from 'react';

interface Column {
  key: string;
  title: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, record: any) => React.ReactNode;
}

interface TerminalTableProps {
  columns: Column[];
  data: any[];
  title?: string;
  maxWidth?: number;
  striped?: boolean;
  bordered?: boolean;
  className?: string;
}

export function TerminalTable({
  columns,
  data,
  title,
  maxWidth = 120,
  striped = true,
  bordered = true,
  className = ""
}: TerminalTableProps) {
  
  const calculateColumnWidths = () => {
    const totalSpecifiedWidth = columns.reduce((sum, col) => sum + (col.width || 0), 0);
    const unspecifiedColumns = columns.filter(col => !col.width);
    const remainingWidth = maxWidth - totalSpecifiedWidth;
    const defaultWidth = Math.floor(remainingWidth / unspecifiedColumns.length);
    
    return columns.map(col => col.width || defaultWidth);
  };

  const columnWidths = calculateColumnWidths();

  const formatCell = (content: string, width: number, align: 'left' | 'center' | 'right' = 'left') => {
    const str = String(content || '').substring(0, width - 2);
    
    switch (align) {
      case 'center':
        const padding = Math.max(0, width - 2 - str.length);
        const leftPad = Math.floor(padding / 2);
        const rightPad = padding - leftPad;
        return ' ' + ' '.repeat(leftPad) + str + ' '.repeat(rightPad) + ' ';
      case 'right':
        return ' ' + str.padStart(width - 2) + ' ';
      default:
        return ' ' + str.padEnd(width - 2) + ' ';
    }
  };

  const renderBorder = (type: 'top' | 'middle' | 'bottom') => {
    if (!bordered) return null;
    
    const chars = {
      top: { left: '┌', middle: '┬', right: '┐', horizontal: '─' },
      middle: { left: '├', middle: '┼', right: '┤', horizontal: '─' },
      bottom: { left: '└', middle: '┴', right: '┘', horizontal: '─' }
    };
    
    const { left, middle, right, horizontal } = chars[type];
    
    return (
      <div className="flex font-mono text-cyan-300">
        {left}
        {columnWidths.map((width, index) => (
          <React.Fragment key={index}>
            {horizontal.repeat(width)}
            {index < columnWidths.length - 1 ? middle : ''}
          </React.Fragment>
        ))}
        {right}
      </div>
    );
  };

  const renderRow = (record: any, index: number, isHeader = false) => {
    const rowClass = striped && index % 2 === 1 && !isHeader ? 'bg-gray-900' : '';
    const textColor = isHeader ? 'text-yellow-400 font-bold' : 'text-green-400';
    
    return (
      <div key={isHeader ? 'header' : index} className={`flex font-mono ${textColor} ${rowClass}`}>
        {bordered && <span className="text-cyan-300">│</span>}
        {columns.map((column, colIndex) => {
          let content;
          if (isHeader) {
            content = column.title;
          } else {
            content = column.render 
              ? column.render(record[column.key], record)
              : record[column.key];
          }
          
          return (
            <React.Fragment key={column.key}>
              <span>
                {formatCell(
                  typeof content === 'string' || typeof content === 'number' 
                    ? String(content) 
                    : '', 
                  columnWidths[colIndex], 
                  column.align
                )}
              </span>
              {bordered && colIndex < columns.length - 1 && (
                <span className="text-cyan-300">│</span>
              )}
            </React.Fragment>
          );
        })}
        {bordered && <span className="text-cyan-300">│</span>}
      </div>
    );
  };

  return (
    <div className={`font-mono ${className}`}>
      {title && (
        <div className="text-center mb-2 font-bold text-cyan-400">
          {title}
        </div>
      )}
      
      {renderBorder('top')}
      {renderRow({}, 0, true)}
      {renderBorder('middle')}
      
      {data.map((record, index) => renderRow(record, index))}
      
      {renderBorder('bottom')}
      
      <div className="text-xs text-gray-500 mt-1">
        Total: {data.length} records
      </div>
    </div>
  );
}

// Specialized tables for OKOA system
export function AgentStatusTable({ agents }: { agents: any[] }) {
  const columns: Column[] = [
    { key: 'agentId', title: 'Agent ID', width: 12 },
    { key: 'status', title: 'Status', width: 12, align: 'center' },
    { key: 'currentTask', title: 'Current Task', width: 30 },
    { key: 'progress', title: 'Progress', width: 20, align: 'center' },
    { key: 'cost', title: 'Cost', width: 10, align: 'right' }
  ];

  const formattedAgents = agents.map(agent => ({
    ...agent,
    status: `[${agent.status}]`,
    progress: `${Math.round(agent.progress || 0)}%`,
    cost: `$${(agent.totalCost || 0).toFixed(2)}`
  }));

  return (
    <TerminalTable 
      columns={columns} 
      data={formattedAgents} 
      title="═══ AGENT STATUS MONITOR ═══"
      className="text-green-400"
    />
  );
}

export function ProcessingQueueTable({ queue }: { queue: any[] }) {
  const columns: Column[] = [
    { key: 'filename', title: 'Document', width: 25 },
    { key: 'status', title: 'Status', width: 12, align: 'center' },
    { key: 'assignedAgent', title: 'Agent', width: 12 },
    { key: 'progress', title: 'Progress', width: 15 },
    { key: 'eta', title: 'ETA', width: 10, align: 'right' }
  ];

  return (
    <TerminalTable 
      columns={columns} 
      data={queue} 
      title="═══ PROCESSING QUEUE ═══"
      className="text-cyan-400"
    />
  );
}

export function CostTrackingTable({ costs }: { costs: any[] }) {
  const columns: Column[] = [
    { key: 'timestamp', title: 'Time', width: 10 },
    { key: 'document', title: 'Document', width: 20 },
    { key: 'model', title: 'Model', width: 15 },
    { key: 'tokens', title: 'Tokens', width: 8, align: 'right' },
    { key: 'cost', title: 'Cost', width: 8, align: 'right' }
  ];

  return (
    <TerminalTable 
      columns={columns} 
      data={costs} 
      title="═══ COST TRACKING ═══"
      className="text-yellow-400"
    />
  );
}