#!/usr/bin/env node

const { ConvexHttpClient } = require('convex/browser');

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || 'https://veracious-impala-280.convex.cloud');

async function setupDemoData() {
  try {
    console.log('🏗️ Setting up demo data...');

    // Create Wolfgramm Ascent Waldorf deal
    console.log('📁 Creating Wolfgramm Ascent Waldorf deal...');
    
    const dealId = await convex.mutation('deals:create', {
      name: 'Wolfgramm Ascent Waldorf',
      description: 'Real estate development project - residential and commercial mixed-use development',
      dealType: 'real-estate',
      status: 'ACTIVE',
      metadata: {
        projectType: 'Mixed-use development',
        location: 'Waldorf, MD',
        phase: 'Due diligence',
        dealSize: 'Large scale residential/commercial',
        priority: 'High'
      }
    });

    console.log('✅ Created deal:', dealId);
    console.log('🎉 Demo data setup complete!');
    
    return dealId;
  } catch (error) {
    console.error('❌ Error setting up demo data:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  setupDemoData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { setupDemoData };