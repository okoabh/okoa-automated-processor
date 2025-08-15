/**
 * OKOA Document Processing Agent
 * 
 * This agent performs two primary functions:
 * 1. Plain Text Extraction - Creates accurate 1:1 transcription of documents to plain text
 * 2. Synthetic Document Creation - Analyzes and summarizes documents into structured YAML format
 * 
 * Context: OKOA Capital LLC - Private investment firm specializing in real estate debt,
 * private equity, private credit, special situations, and alternative non-listed assets.
 */

import { Anthropic } from '@anthropic-ai/sdk';

interface DDCategory {
  code: string; // CC format (2 digits)
  name: string;
  items: DDItem[];
}

interface DDItem {
  code: string; // II format (2 digits)  
  name: string;
  description: string;
}

interface ProcessingResult {
  plainText?: string;
  syntheticDocument?: string;
  metadata: {
    documentType: string;
    category: string;
    ddCode?: string; // CC.II format
    processingType: 'plain-text-extraction' | 'synthetic-summary' | 'both';
    estimatedDataUsed: boolean;
    calculatedDataUsed: boolean;
    processingNotes: string[];
    originalFileName: string;
    processedFileName: string;
    timestamp: string;
  };
}

// OKOA Due Diligence Framework Categories
const DD_FRAMEWORK: DDCategory[] = [
  {
    code: '01',
    name: 'Investment Summary & Overview',
    items: [
      { code: '01', name: 'Executive Summary', description: 'High-level investment overview and thesis' },
      { code: '02', name: 'Investment Highlights', description: 'Key value propositions and strengths' },
      { code: '03', name: 'Risk Summary', description: 'Primary risks and mitigation strategies' }
    ]
  },
  {
    code: '02', 
    name: 'Investment Structure & Terms',
    items: [
      { code: '01', name: 'Investment Amount & Structure', description: 'Capital commitment and investment vehicle details' },
      { code: '02', name: 'Return Expectations', description: 'Target returns, distributions, and exit timeline' },
      { code: '03', name: 'Fee Structure', description: 'Management fees, carried interest, and expenses' }
    ]
  },
  {
    code: '30',
    name: 'Communications & Documentation',
    items: [
      { code: '01', name: 'Meeting Notes & Communications', description: 'Correspondence, meeting minutes, and verbal commitments' },
      { code: '02', name: 'Presentation Materials', description: 'Investor presentations and marketing materials' },
      { code: '03', name: 'Due Diligence Reports', description: 'Third-party reports and analysis' }
    ]
  }
  // Additional categories would be added here...
];

export class DocumentProcessingAgent {
  private anthropic: Anthropic;
  private systemPrompt: string;

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({ apiKey });
    this.systemPrompt = this.buildSystemPrompt();
  }

  private buildSystemPrompt(): string {
    return `
You are the OKOA Document Processing Agent, designed to work with business documents for OKOA Capital LLC, a private investment firm specializing in real estate debt, private equity, private credit, special situations, and alternative non-listed assets.

You have two primary functions:

## FUNCTION 1: PLAIN TEXT EXTRACTION
Convert any business document into accurate plain text while preserving all meaningful content:

### Text Processing:
- Create 1:1 transcription with maximum accuracy
- Maintain document structure and formatting context
- Preserve all numerical data, dates, names, and specifics

### Visual Elements (Charts, Graphs, Tables):
- Convert clearly labeled data into plain text tables
- For unlabeled visual data: 
  * Examine the graph type and understand how it works
  * Estimate data points based on visual elements and context
  * **CLEARLY MARK ALL ESTIMATES**: "**[ESTIMATED FROM VISUAL DATA - NOT VERIFIED]**"
  * Avoid using estimated data in calculations unless absolutely necessary
  * When using estimated data in calculations, clearly note: "**[CALCULATION USES ESTIMATED DATA]**"

### Images & Non-Data Visuals:
- Create short placeholders: "[IMAGE: Description of what is shown]"

### Accuracy Requirements:
- Double-check all transcribed data
- Use very low temperature/creativity - focus on reproduction, not analysis
- Maintain precision over interpretation

## FUNCTION 2: SYNTHETIC DOCUMENT CREATION
Analyze plain text documents and create structured YAML summaries that preserve necessary detail while removing unnecessary content:

### Analysis Process:
1. **Document Classification**: Determine document type and domain
2. **Importance Assessment**: Identify what details are necessary based on document type
3. **Schema Selection**: Choose appropriate structure for the document type
4. **Detail Extraction**: Capture all necessary information per expert standards

### Document Types & Standards:
- **Legal Agreements**: Terms, counterparties, dates, key provisions, execution status, jurisdiction, critical boilerplate
- **Financial Documents**: Key figures, methodologies, assumptions, conclusions, data sources
- **Communication Records**: Participants, decisions, commitments, action items, context
- **Investment Documents**: Structure, returns, risks, fees, terms, performance data

### Output Format (YAML):
\`\`\`yaml
metadata:
  original_filename: ""
  document_type: ""
  dd_category: ""
  dd_code: ""  # CC.II format
  processing_date: ""
  estimated_data_used: false
  calculated_data_used: false

document_summary:
  title: ""
  brief_description: ""
  key_elements: []

detailed_content:
  # Structure varies by document type
  
processing_notes:
  included_elements: []
  excluded_elements: []
  data_quality_notes: []
  estimation_notes: []  # If any estimated data was used
\`\`\`

### File Naming Convention:
- Format: CC.II_[original_filename]_synth_yyyy.mm.dd.txt
- CC = Due diligence category (2 digits)
- II = Due diligence item (2 digits)

### Data Integrity:
- **Mark all estimated/calculated data clearly**
- **Explain all calculations**
- **Reference original document and metadata**
- **Note what was excluded and why**

Remember: You are serving institutional investment professionals who require accuracy, completeness, and clear identification of any data quality issues.
`;
  }

  /**
   * Process document for plain text extraction
   */
  async extractPlainText(
    documentContent: string, 
    documentType?: string,
    originalFileName?: string
  ): Promise<ProcessingResult> {
    const prompt = `
Please extract this document to plain text following the PLAIN TEXT EXTRACTION guidelines.

Document Type: ${documentType || 'Unknown'}
Original Filename: ${originalFileName || 'Unknown'}

Document Content:
${documentContent}

Focus on:
1. Accurate 1:1 transcription
2. Preserving all data and structure
3. Converting visual elements to text tables where possible
4. Clearly marking any estimated data from visuals
5. Creating placeholders for non-data images

Provide only the plain text extraction.
`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-latest',
        max_tokens: 8000,
        temperature: 0.1, // Very low for precision
        messages: [
          { role: 'user', content: prompt }
        ],
        system: this.systemPrompt
      });

      const plainText = response.content[0].type === 'text' ? response.content[0].text : '';
      
      return {
        plainText,
        metadata: {
          documentType: documentType || 'unknown',
          category: 'extracted',
          processingType: 'plain-text-extraction',
          estimatedDataUsed: plainText.includes('[ESTIMATED FROM VISUAL DATA]'),
          calculatedDataUsed: plainText.includes('[CALCULATION USES ESTIMATED DATA]'),
          processingNotes: ['Plain text extraction completed'],
          originalFileName: originalFileName || 'unknown',
          processedFileName: this.generatePlainTextFileName(originalFileName),
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      throw new Error(`Plain text extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create synthetic document summary
   */
  async createSyntheticDocument(
    plainTextContent: string,
    originalFileName?: string
  ): Promise<ProcessingResult> {
    const prompt = `
Please create a synthetic document summary following the SYNTHETIC DOCUMENT CREATION guidelines.

Original Filename: ${originalFileName || 'Unknown'}

Plain Text Content:
${plainTextContent}

Requirements:
1. Determine the document type and appropriate DD category
2. Create structured YAML output with all necessary details
3. Use appropriate DD code (CC.II format) from the framework
4. Mark any estimated/calculated data clearly
5. Explain what was included vs excluded
6. Follow institutional investment standards for completeness

Provide the complete YAML synthetic document.
`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-latest',
        max_tokens: 8000,
        temperature: 0.3, // Moderate temperature for analysis
        messages: [
          { role: 'user', content: prompt }
        ],
        system: this.systemPrompt
      });

      const syntheticDocument = response.content[0].type === 'text' ? response.content[0].text : '';
      
      // Extract DD code and category from the synthetic document
      const ddCodeMatch = syntheticDocument.match(/dd_code:\s*"?(\d{2}\.\d{2})"?/);
      const ddCode = ddCodeMatch ? ddCodeMatch[1] : undefined;
      const category = this.determineCategoryFromDDCode(ddCode);
      
      return {
        syntheticDocument,
        metadata: {
          documentType: this.extractDocumentType(syntheticDocument),
          category: category || 'general',
          ddCode,
          processingType: 'synthetic-summary',
          estimatedDataUsed: syntheticDocument.includes('estimated_data_used: true'),
          calculatedDataUsed: syntheticDocument.includes('calculated_data_used: true'),
          processingNotes: ['Synthetic document created'],
          originalFileName: originalFileName || 'unknown',
          processedFileName: this.generateSyntheticFileName(originalFileName, ddCode),
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      throw new Error(`Synthetic document creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process document with both extraction and synthetic summary
   */
  async processDocument(
    documentContent: string,
    documentType?: string,
    originalFileName?: string
  ): Promise<ProcessingResult> {
    // First extract plain text
    const extractionResult = await this.extractPlainText(documentContent, documentType, originalFileName);
    
    // Then create synthetic document from plain text
    const syntheticResult = await this.createSyntheticDocument(extractionResult.plainText!, originalFileName);
    
    return {
      plainText: extractionResult.plainText,
      syntheticDocument: syntheticResult.syntheticDocument,
      metadata: {
        ...syntheticResult.metadata,
        processingType: 'both',
        estimatedDataUsed: extractionResult.metadata.estimatedDataUsed || syntheticResult.metadata.estimatedDataUsed,
        calculatedDataUsed: extractionResult.metadata.calculatedDataUsed || syntheticResult.metadata.calculatedDataUsed,
        processingNotes: [...extractionResult.metadata.processingNotes, ...syntheticResult.metadata.processingNotes]
      }
    };
  }

  private generatePlainTextFileName(originalFileName?: string): string {
    const base = originalFileName ? originalFileName.replace(/\.[^/.]+$/, "") : 'document';
    const date = new Date().toISOString().split('T')[0];
    return `${base}_plaintext_${date}.txt`;
  }

  private generateSyntheticFileName(originalFileName?: string, ddCode?: string): string {
    const base = originalFileName ? originalFileName.replace(/\.[^/.]+$/, "") : 'document';
    const date = new Date().toISOString().split('T')[0];
    const prefix = ddCode || '99.99';
    return `${prefix}_${base}_synth_${date}.txt`;
  }

  private determineCategoryFromDDCode(ddCode?: string): string | undefined {
    if (!ddCode) return undefined;
    const categoryCode = ddCode.split('.')[0];
    const category = DD_FRAMEWORK.find(cat => cat.code === categoryCode);
    return category?.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  }

  private extractDocumentType(syntheticDocument: string): string {
    const typeMatch = syntheticDocument.match(/document_type:\s*"?([^"\n]+)"?/);
    return typeMatch ? typeMatch[1] : 'unknown';
  }
}

// Default instance using environment variable
export const documentProcessor = new DocumentProcessingAgent(process.env.ANTHROPIC_API_KEY || '');

export default DocumentProcessingAgent;