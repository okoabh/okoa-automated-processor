// Script to populate Wolfgramm Ascent Waldorf deal with documents
const { ConvexHttpClient } = require('convex/browser');

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

const WOLFGRAMM_DEAL_ID = 'k576qtmmvp4594zdvqp3qttx0d7np0m1';

const documents = [
  // Original Files
  {
    name: 'Wolfgramm_Project_Overview.pdf',
    type: 'original',
    status: 'COMPLETED',
    path: '/deals/wolfgramm/originals/Wolfgramm_Project_Overview.pdf'
  },
  {
    name: 'Park_City_Market_Analysis.pdf',
    type: 'original',
    status: 'COMPLETED',
    path: '/deals/wolfgramm/originals/Park_City_Market_Analysis.pdf'
  },
  {
    name: 'Financial_Projections_2024-2026.xlsx',
    type: 'original',
    status: 'COMPLETED',
    path: '/deals/wolfgramm/originals/Financial_Projections_2024-2026.xlsx'
  },
  
  // OCR Processed Files
  {
    name: 'Wolfgramm_Project_Overview_OCR.txt',
    type: 'ocr',
    status: 'COMPLETED',
    path: '/deals/wolfgramm/ocr/Wolfgramm_Project_Overview_OCR.txt'
  },
  {
    name: 'Park_City_Market_Analysis_OCR.txt',
    type: 'ocr', 
    status: 'COMPLETED',
    path: '/deals/wolfgramm/ocr/Park_City_Market_Analysis_OCR.txt'
  },
  
  // Plain Text Extractions
  {
    name: 'Wolfgramm_Overview_Extract.txt',
    type: 'plaintext',
    status: 'COMPLETED',
    path: '/deals/wolfgramm/plaintext/Wolfgramm_Overview_Extract.txt',
    content: `WOLFGRAMM ASCENT WALDORF PROJECT - EXECUTIVE SUMMARY
    
Location: Park City, Utah
Property Type: 120-room Tapestry Collection by Hilton
Development Status: 51% complete
Total Investment: $74.6M ($621k per key)
Current Valuation: $43.8M (as-is), $78M (stabilized)

Key Financial Metrics:
- Total Development Cost: $74,589,341
- Amount Spent to Date: $36,298,082 (51%)
- Remaining Budget: $38,291,259 (49%)
- Revenue Model: Condo hotel with mixed ownership
- Target Completion: November 2024
- Stabilization Target: November 2026

Market Position:
- Park City hospitality market leader
- Tapestry Collection brand premium positioning
- Ski resort proximity advantage
- Year-round revenue potential`
  },
  
  // Synthetic Summary Documents  
  {
    name: 'Wolfgramm_AI_Analysis_Summary.md',
    type: 'synthetic',
    status: 'COMPLETED',
    path: '/deals/wolfgramm/synthetic/Wolfgramm_AI_Analysis_Summary.md',
    content: `# WOLFGRAMM ASCENT WALDORF - AI ANALYSIS SUMMARY

## INVESTMENT OVERVIEW
- **Property**: 120-room Tapestry Collection by Hilton
- **Location**: Park City, Utah  
- **Development Stage**: 51% complete
- **Total Investment**: $74.6M
- **Current Valuation**: $43.8M as-is / $78M stabilized

## RISK ASSESSMENT
- **Construction Risk**: MEDIUM - 49% construction remaining
- **Market Risk**: LOW - Strong Park City hospitality market
- **Financial Risk**: MEDIUM - $38.3M remaining capital requirement

## KEY OPPORTUNITIES
- Premium brand positioning with Tapestry Collection
- Park City market growth trajectory
- Mixed-use condo hotel revenue model
- Year-round operational potential

## RECOMMENDATION
Proceed with caution - monitor construction progress and market conditions closely.`
  },
  
  // Master Synthesis Document
  {
    name: 'Wolfgramm_Ascent_Waldorf_Master_SYNTHDOC.txt',
    type: 'synthdoc',
    status: 'COMPLETED',
    path: '/deals/wolfgramm/synthdoc/Wolfgramm_Ascent_Waldorf_Master_SYNTHDOC.txt',
    content: `╔══════════════════════════════════════════════════════════════╗
║                    OKOA CAPITAL LLC                          ║
║              MASTER SYNTHESIS DOCUMENT                       ║
║           WOLFGRAMM ASCENT WALDORF PROJECT                   ║
╚══════════════════════════════════════════════════════════════╝

EXECUTIVE SUMMARY
═══════════════════════════════════════════════════════════════
Property: 120-room Tapestry Collection by Hilton
Location: Park City, Utah
Development Status: 51% complete (November 2024)
Total Investment: $74,589,341
Current Valuation: $43.8M as-is / $78M stabilized

FINANCIAL ANALYSIS
═══════════════════════════════════════════════════════════════
Development Cost Breakdown:
- Total Budget: $74,589,341 ($621k per key)
- Spent to Date: $36,298,082 (51% completion)
- Remaining: $38,291,259 (49% remaining)

Valuation Metrics:
- As-Is Value: $43,800,000 ($365k per key)
- Stabilized Value: $78,000,000 ($650k per key)
- Value Creation Potential: $34.2M (78% upside)

MARKET POSITIONING
═══════════════════════════════════════════════════════════════
- Park City hospitality market leader
- Tapestry Collection premium brand positioning
- Ski resort proximity advantage
- Year-round revenue streams (winter ski / summer outdoor)
- Condo hotel model with individual unit sales

RISK ASSESSMENT
═══════════════════════════════════════════════════════════════
Construction Risk: MEDIUM
- 49% construction remaining ($38.3M)
- November 2024 completion target
- Market cycle timing considerations

Market Risk: LOW-MEDIUM  
- Strong Park City fundamentals
- Proven hospitality demand
- Premium brand positioning

Financial Risk: MEDIUM
- Significant remaining capital requirement
- Pre-sale unit dependency (93 units sold, 7 remaining)
- Market absorption timeline

STRATEGIC CONSIDERATIONS
═══════════════════════════════════════════════════════════════
Strengths:
+ Established Park City location
+ Premium Tapestry Collection brand
+ 51% construction progress
+ Strong pre-sale performance (93/100 units)

Concerns:
- $38.3M remaining capital requirement  
- Construction completion risk
- Market timing for final 7 units
- 3-year stabilization timeline

OKOA CAPITAL RECOMMENDATION
═══════════════════════════════════════════════════════════════
PROCEED WITH ENHANCED DUE DILIGENCE

The Wolfgramm Ascent Waldorf project presents a compelling 
opportunity with strong fundamentals but requires careful 
monitoring of construction progress and market conditions.

Key monitoring metrics:
- Construction milestone achievement
- Remaining unit pre-sales (7 units)
- Park City market absorption rates
- Interest rate environment impact

Document prepared by: OKOA AI Analysis System
Analysis Date: August 15, 2025
Classification: CONFIDENTIAL - OKOA CAPITAL LLC`
  }
];

async function populateWolfgrammDeal() {
  console.log('🏗️ Populating Wolfgramm Ascent Waldorf deal documents...');
  
  try {
    // Import the API functions
    const { api } = require('../convex/_generated/api');
    
    for (const doc of documents) {
      console.log(`📄 Creating document: ${doc.name}`);
      
      const documentData = {
        // Required fields according to schema
        filename: doc.name,
        originalFilename: doc.name,
        filePath: doc.path,
        fileSize: doc.content?.length || 1024,
        status: doc.status,
        createdAt: Date.now(),
        // Optional fields
        category: doc.type,
        documentType: doc.type,
        metadata: {
          category: doc.type,
          dealName: 'Wolfgramm Ascent Waldorf',
          type: doc.type,
          folderId: WOLFGRAMM_DEAL_ID
        }
      };
      
      if (doc.content) {
        documentData.content = doc.content;
      }
      
      const created = await convex.mutation(api.documents.createDocument, {
        folderId: WOLFGRAMM_DEAL_ID,
        name: doc.name,
        type: doc.type,
        path: doc.path,
        content: doc.content,
        status: doc.status.toLowerCase(),
        metadata: {
          category: doc.type,
          dealName: 'Wolfgramm Ascent Waldorf',
          type: doc.type
        }
      });
      console.log(`✅ Created: ${created._id}`);
    }
    
    console.log('🎯 Wolfgramm deal populated successfully!');
    
  } catch (error) {
    console.error('❌ Error populating Wolfgramm deal:', error);
  }
}

// Run the population script
if (require.main === module) {
  populateWolfgrammDeal();
}

module.exports = { populateWolfgrammDeal };