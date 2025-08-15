// Script to organize Wolfgramm deal documents into proper structure
const fs = require('fs');
const path = require('path');

const WOLFGRAMM_FOLDER_ID = 'k576qtmmvp4594zdvqp3qttx0d7np0m1';

// Read the main Wolfgramm document
const wolfgrammDocPath = '/Users/bradleyheitmann/Wolfgramm_Deals_AllDocs.txt';
const wolfgrammContent = fs.readFileSync(wolfgrammDocPath, 'utf-8');

// Extract key sections for organization
const sections = {
  appraisal: {
    title: 'Ascent Park City Appraisal Report',
    content: wolfgrammContent.substring(0, 15000), // First part of document
    type: 'original',
    category: 'Appraisal'
  },
  
  // Create a synthetic summary document
  synthdoc: {
    title: 'Wolfgramm_Ascent_Waldorf_Master_SYNTHDOC',
    content: `# ╔══════════════════════════════════════════════════════════════════════════════════╗
# ║   ██████╗ ██╗  ██╗ ██████╗  █████╗      ██╗      █████╗ ██████╗ ███████╗    ║
# ║  ██╔═══██╗██║ ██╔╝██╔═══██╗██╔══██╗     ██║     ██╔══██╗██╔══██╗██╔════╝    ║
# ║  ██║   ██║█████╔╝ ██║   ██║███████║     ██║     ███████║██████╔╝███████╗    ║
# ║  ██║   ██║██╔═██╗ ██║   ██║██╔══██║     ██║     ██╔══██║██╔══██╗╚════██║    ║
# ║  ╚██████╔╝██║  ██╗╚██████╔╝██║  ██║     ███████╗██║  ██║██████╔╝███████║    ║
# ║   ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝     ╚══════╝╚═╝  ╚═╝╚═════╝ ╚══════╝    ║
# ╠══════════════════════════════════════════════════════════════════════════════════╣
# ║              WOLFGRAMM ASCENT WALDORF - MASTER SYNTHESIS DOCUMENT              ║
# ║                           OKOA LABS ENHANCED EDITION                           ║
# ╚══════════════════════════════════════════════════════════════════════════════════╝

DEAL_CLASSIFICATION: "Hospitality/Resort Development - Condo Hotel"
PROPERTY_LOCATION: "4080 Cooper Lane, Park City, Summit County, UT 84098"
DEAL_STATUS: "Development Phase - Construction in Progress"
OWNER_ENTITY: "Wolfgramm Capital LLC"
CLIENT_ENTITY: "OKOA Capital, LLC"

## EXECUTIVE SUMMARY

### Property Overview
- 120-room Tapestry Collection by Hilton hotel
- 2.24-acre site in Park City, Utah
- Condo hotel structure: 61 units third-party owned, 59 retained by ownership
- 4-story full-service facility with restaurant, pool, meeting space

### Valuation Summary
- As Is Market Value (Nov 1, 2023): $43,800,000 ($365,000/key)
- Prospective Value Upon Completion (Nov 1, 2024): $69,000,000 ($575,000/key)  
- Prospective Value Upon Stabilization (Nov 1, 2026): $78,000,000 ($650,000/key)
- Gross Condo Proceeds Estimate: $25,500,000 ($213,000/key)

### Financial Structure
- Total Development Budget: $74,589,341 ($621,578/key)
- Land Acquisition Cost: $14,000,000 ($116,667/key)
- Spent to Date: $36,298,082 (51% of total cost)
- Remaining to Spend: $38,291,259 (49% of total cost)

### Risk Assessment
- CONSTRUCTION RISK: Medium - 51% complete, timeline dependent
- MARKET RISK: Low-Medium - Park City resort market stability
- OPERATIONAL RISK: Medium - Condo hotel management complexity
- FINANCING RISK: Assessment pending - requires additional analysis

### Due Diligence Notes
- Brand affiliation: Tapestry Collection by Hilton (franchise agreement reviewed)
- Pre-sales: 68 units sold with deposits, 7 may not close
- Management structure: Market-based 4.00% management fee assumed
- Construction timeline: Completion targeted November 1, 2024

### OKOA Capital Investment Considerations
- Strong resort market fundamentals in Park City
- Established brand partnership reduces market risk  
- Condo hotel structure provides diversified revenue streams
- Development timing and execution remain key risk factors

DOCUMENT_GENERATED: ${new Date().toISOString()}
ANALYSIS_AGENT: "MIDNIGHT_ATLAS_PRISM_v1.1_RE_EDITION"
OKOA_REFERENCE: "WOLFGRAMM_ASCENT_WALDORF_2025"`,
    type: 'synthdoc',
    category: 'Master Synthesis'
  },
  
  // Plain text extraction
  plaintext: {
    title: 'Wolfgramm_Ascent_Waldorf_Plain_Text_Extract',
    content: wolfgrammContent.replace(/[^\w\s\.\,\$\-\(\)]/g, ' '), // Clean up special characters
    type: 'plaintext',
    category: 'Text Extraction'
  }
};

// Create API calls to organize documents
Object.entries(sections).forEach(async ([key, doc]) => {
  const payload = {
    action: 'organize_document',
    documentPath: `processed/${doc.title}.txt`,
    documentType: doc.type,
    documentContent: doc.content,
    metadata: {
      category: doc.category,
      dealName: 'Wolfgramm Ascent Waldorf',
      processedAt: Date.now()
    }
  };
  
  console.log(`Organizing ${doc.title}...`);
  // This would be called via API in production
});

console.log('Document organization structure prepared for Wolfgramm Ascent Waldorf deal');