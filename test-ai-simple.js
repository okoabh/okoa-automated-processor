#!/usr/bin/env node

/**
 * Simple AI Agent Test - Direct API Testing
 */

const { ClaudeProvider } = require('./src/lib/llm/providers/claude.ts');

async function testAIAgentDirectly() {
  console.log('🧪 Testing AI Agent (Claude Provider) Directly...\n');
  
  try {
    // Test environment
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('❌ ANTHROPIC_API_KEY not found in environment');
      return;
    }
    
    console.log('✅ ANTHROPIC_API_KEY found');
    
    // Initialize Claude Provider
    const claude = new ClaudeProvider();
    console.log('✅ ClaudeProvider initialized');
    
    // Test availability
    console.log('🔍 Checking Claude API availability...');
    const available = await claude.checkAvailability();
    console.log(`${available ? '✅' : '❌'} Claude API ${available ? 'available' : 'unavailable'}`);
    
    if (!available) {
      console.log('❌ Cannot test AI agent - Claude API unavailable');
      return;
    }
    
    // Test generateResponse method
    console.log('\n💬 Testing generateResponse method...');
    const testPrompt = 'What are the key financial metrics for real estate investment analysis?';
    
    const response = await claude.generateResponse({
      systemPrompt: 'You are a real estate analysis expert. Provide concise, professional advice.',
      userPrompt: testPrompt,
      maxTokens: 500,
      temperature: 0.7
    });
    
    console.log('✅ AI Response received:');
    console.log('📊 Tokens:', response.usage.totalTokens);
    console.log('💰 Cost:', `$${response.cost.toFixed(6)}`);
    console.log('⏱️  Time:', `${response.processingTime}ms`);
    console.log('🤖 Model:', response.model);
    console.log('\n📝 Response Preview:');
    console.log(response.content.substring(0, 200) + '...');
    
    console.log('\n🎉 AI Agent is working correctly!');
    
  } catch (error) {
    console.error('❌ AI Agent test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testAIAgentDirectly().catch(console.error);