// OKOA ASCII Terminal UI Components Library
// Institutional-grade terminal aesthetics with interactive elements

export { ASCIIArt } from './ASCIIArt';
export { TerminalBox } from './TerminalBox';
export { 
  TerminalProgress, 
  TerminalSpinner, 
  TerminalStatus 
} from './TerminalProgress';
export { 
  TerminalTable,
  AgentStatusTable,
  ProcessingQueueTable,
  CostTrackingTable 
} from './TerminalTable';
export { 
  TerminalInput, 
  TerminalForm, 
  NewDealForm 
} from './TerminalInput';
export {
  InteractiveButton,
  ASCIIMenu,
  InteractiveStatus,
  InteractiveProgressBar
} from './InteractiveButton';

// ASCII Art presets for quick access
export const ASCII_PRESETS = {
  OKOA: 'OKOA',
  PROCESSING: 'PROCESSING',
  AGENT: 'AGENT',
  PIPELINE: 'PIPELINE',
  DASHBOARD: 'DASHBOARD',
  TERMINAL: 'TERMINAL'
} as const;