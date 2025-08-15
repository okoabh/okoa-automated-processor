import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';

export interface OKOAAgentContext {
  ddFramework: string;
  synthesisAgent: string;
  midnightAtlas: string;
  visualLibrary: string;
  totalTokens: number;
  estimatedCost: number;
}

export class OKOAAgentLoader {
  private static instance: OKOAAgentLoader;
  private agentContext: OKOAAgentContext | null = null;
  private agentsPath: string;
  
  private constructor() {
    this.agentsPath = path.join(process.cwd(), 'src', 'lib', 'agents');
  }
  
  static getInstance(): OKOAAgentLoader {
    if (!OKOAAgentLoader.instance) {
      OKOAAgentLoader.instance = new OKOAAgentLoader();
    }
    return OKOAAgentLoader.instance;
  }
  
  async loadAgentContext(): Promise<OKOAAgentContext> {
    if (this.agentContext) {
      return this.agentContext;
    }
    
    try {
      // Load all OKOA agent files
      const ddFramework = await this.loadFile('OKOA-DD-Framework_v3.0-COMPLETE.yaml');
      const synthesisAgent = await this.loadFile('SYNTHESIS_PRIME_AGENT_v3.1_LABS_VISUAL.yaml');
      const midnightAtlas = await this.loadFile('MIDNIGHT_ATLAS_PRISM_v1.1_RE_EDITION.yaml');
      const visualLibrary = await this.loadFile('OKOA_ASCII_VISUAL_LIBRARY_v4.3_ALIGNMENT_FIXED.yaml');
      
      // Calculate total tokens (rough estimate: ~4 characters per token)
      const totalContent = ddFramework + synthesisAgent + midnightAtlas + visualLibrary;
      const totalTokens = Math.ceil(totalContent.length / 4);
      
      // Estimate cost for context loading (Claude 3.5 Sonnet input tokens)
      const estimatedCost = (totalTokens * 0.003) / 1000; // $0.003 per 1K input tokens
      
      this.agentContext = {
        ddFramework,
        synthesisAgent,
        midnightAtlas,
        visualLibrary,
        totalTokens,
        estimatedCost,
      };
      
      console.log(`OKOA Agent Context loaded: ${totalTokens} tokens, estimated cost: $${estimatedCost.toFixed(4)}`);
      
      return this.agentContext;
    } catch (error) {
      console.error('Failed to load OKOA agent context:', error);
      throw new Error('Could not load OKOA agent context');
    }
  }
  
  private async loadFile(filename: string): Promise<string> {
    const filePath = path.join(this.agentsPath, filename);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`OKOA agent file not found: ${filename}`);
    }
    
    return fs.readFileSync(filePath, 'utf-8');
  }
  
  async getAgentPrompt(agentType: 'synthesis' | 'midnight-atlas' | 'dd-framework'): Promise<string> {
    const context = await this.loadAgentContext();
    
    switch (agentType) {
      case 'synthesis':
        return this.buildSynthesisPrompt(context);
      case 'midnight-atlas':
        return this.buildMidnightAtlasPrompt(context);
      case 'dd-framework':
        return this.buildDDFrameworkPrompt(context);
      default:
        throw new Error(`Unknown agent type: ${agentType}`);
    }
  }
  
  private buildSynthesisPrompt(context: OKOAAgentContext): string {
    return `
# OKOA SYNTHESIS PRIME AGENT - DOCUMENT PROCESSING

You are the OKOA Synthesis Prime Agent, responsible for comprehensive multi-modal document analysis and synthesis.

## OKOA LABS VISUAL STANDARDS
${this.extractVisualStandards(context.visualLibrary)}

## SYNTHESIS PRIME AGENT INSTRUCTIONS
${context.synthesisAgent}

## OKOA DD FRAMEWORK REFERENCE
Use the following Due Diligence Framework to categorize and code all findings:
${this.extractDDCategories(context.ddFramework)}

## PROCESSING REQUIREMENTS
1. Apply OKOA LABS visual formatting to all output
2. Use DD Framework codes (CCII format) for all categorization
3. Maintain zero-omission methodology
4. Generate structured YAML output
5. Include executive summary with risk assessment

Process the document according to these specifications.
`;
  }
  
  private buildMidnightAtlasPrompt(context: OKOAAgentContext): string {
    return `
# OKOA MIDNIGHT ATLAS PRISM - REAL ESTATE ANALYSIS AGENT

You are the Midnight Atlas PRISM agent, specialized in institutional-grade real estate analysis and risk assessment.

## OKOA LABS VISUAL STANDARDS
${this.extractVisualStandards(context.visualLibrary)}

## MIDNIGHT ATLAS PRISM CAPABILITIES
${context.midnightAtlas}

## OKOA DD FRAMEWORK - REAL ESTATE FOCUS
Focus on these DD Framework categories for real estate analysis:
${this.extractRealEstateDDCategories(context.ddFramework)}

## ANALYSIS REQUIREMENTS
1. Comprehensive title chain verification
2. Lien priority analysis with visual mapping
3. Financial structure assessment
4. Risk quantification with Monte Carlo modeling
5. Interactive visualizations using D3.js specifications
6. OKOA LABS formatting throughout

Process the real estate document with institutional-grade rigor.
`;
  }
  
  private buildDDFrameworkPrompt(context: OKOAAgentContext): string {
    return `
# OKOA DD FRAMEWORK AGENT - DUE DILIGENCE ANALYSIS

You are the OKOA DD Framework Agent, responsible for comprehensive due diligence categorization and analysis.

## OKOA LABS VISUAL STANDARDS
${this.extractVisualStandards(context.visualLibrary)}

## COMPLETE DD FRAMEWORK
${context.ddFramework}

## DD PROCESSING REQUIREMENTS
1. Categorize all document elements per DD Framework
2. Assign appropriate DD codes (CCII format)
3. Complete evaluation criteria for each category
4. Track completion status
5. Generate DD compliance report
6. Apply OKOA LABS formatting

Process the document for complete due diligence analysis.
`;
  }
  
  private extractVisualStandards(visualLibrary: string): string {
    // Extract key visual formatting standards from the visual library
    const lines = visualLibrary.split('\n');
    const standards = lines.slice(0, 50).join('\n'); // First 50 lines contain key standards
    return standards;
  }
  
  private extractDDCategories(ddFramework: string): string {
    // Extract main DD categories for reference
    const lines = ddFramework.split('\n');
    const categories = lines.filter(line => 
      line.includes('category_') || 
      line.includes('items:') ||
      line.match(/^\d{2}/)
    ).slice(0, 100).join('\n');
    return categories;
  }
  
  private extractRealEstateDDCategories(ddFramework: string): string {
    // Extract real estate specific DD categories
    const realEstateCategories = [
      '06', // Real Estate Property Analysis
      '07', // Leasing & Tenants  
      '25', // Insurance & Risk Management
      '26', // Valuation & Market Analysis
    ];
    
    const lines = ddFramework.split('\n');
    const relevantLines = lines.filter(line =>
      realEstateCategories.some(cat => line.includes(`category_${cat}`) || line.startsWith(cat))
    ).join('\n');
    
    return relevantLines;
  }
  
  getContextSize(): number {
    return this.agentContext?.totalTokens || 0;
  }
  
  getContextCost(): number {
    return this.agentContext?.estimatedCost || 0;
  }
}