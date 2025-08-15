#!/usr/bin/env node

/**
 * AI Agent Integration Test
 * Tests the Midnight Atlas PRISM agent functionality end-to-end
 */

const https = require('https');
const crypto = require('crypto');

// Test configuration
const TEST_CONFIG = {
  site: 'https://okoa-automated-processor-rljclec8f-okoa-labs.vercel.app',
  auth: 'Basic ' + Buffer.from('demo:OKOA2024Demo!').toString('base64'),
  wolfgrammDealId: 'k576qtmmvp4594zdvqp3qttx0d7np0m1',
  testMessages: [
    "What are the key financial metrics for this deal?",
    "What are the main risks I should be aware of?", 
    "Give me a summary of the Wolfgramm Ascent Waldorf project",
    "What's the projected ROI and timeline?",
    "Are there any red flags in the documents?"
  ]
};

let testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = {
            status: res.statusCode,
            headers: res.headers,
            data: res.headers['content-type']?.includes('application/json') ? JSON.parse(data) : data
          };
          resolve(response);
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data, parseError: e.message });
        }
      });
    });
    
    req.on('error', reject);
    
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function testAuthenticationBypass() {
  console.log('🔐 Testing authentication...');
  
  const options = {
    hostname: 'okoa-automated-processor-rljclec8f-okoa-labs.vercel.app',
    path: '/',
    method: 'GET',
    headers: {
      'Authorization': TEST_CONFIG.auth
    }
  };
  
  try {
    const response = await makeRequest(options);
    if (response.status === 200) {
      console.log('✅ Authentication working');
      testResults.passed++;
      return true;
    } else {
      console.log('❌ Authentication failed:', response.status);
      testResults.failed++;
      testResults.errors.push(`Auth failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Authentication error:', error.message);
    testResults.failed++;
    testResults.errors.push(`Auth error: ${error.message}`);
    return false;
  }
}

async function testDealApiAccess() {
  console.log('📁 Testing deal API access...');
  
  const options = {
    hostname: 'okoa-automated-processor-rljclec8f-okoa-labs.vercel.app',
    path: `/api/deals/${TEST_CONFIG.wolfgrammDealId}`,
    method: 'GET',
    headers: {
      'Authorization': TEST_CONFIG.auth,
      'Content-Type': 'application/json'
    }
  };
  
  try {
    const response = await makeRequest(options);
    if (response.status === 200 && response.data.folder) {
      console.log('✅ Deal API accessible, folder:', response.data.folder.name);
      console.log('📊 Documents found:', response.data.totalDocuments);
      
      // Log document categories
      const docs = response.data.documents;
      Object.entries(docs).forEach(([category, docList]) => {
        if (docList.length > 0) {
          console.log(`   ${category}: ${docList.length} files`);
        }
      });
      
      testResults.passed++;
      return response.data;
    } else {
      console.log('❌ Deal API failed:', response.status, response.data);
      testResults.failed++;
      testResults.errors.push(`Deal API failed: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.log('❌ Deal API error:', error.message);
    testResults.failed++;
    testResults.errors.push(`Deal API error: ${error.message}`);
    return null;
  }
}

async function testAIAgentResponse(message, context = null) {
  console.log(`🤖 Testing AI agent with message: "${message.substring(0, 50)}..."`);
  
  const options = {
    hostname: 'okoa-automated-processor-rljclec8f-okoa-labs.vercel.app',
    path: `/api/deals/${TEST_CONFIG.wolfgrammDealId}/chat`,
    method: 'POST',
    headers: {
      'Authorization': TEST_CONFIG.auth,
      'Content-Type': 'application/json'
    }
  };
  
  const postData = JSON.stringify({
    message: message,
    context: context
  });
  
  try {
    const startTime = Date.now();
    const response = await makeRequest(options, postData);
    const responseTime = Date.now() - startTime;
    
    if (response.status === 200 && response.data.response) {
      console.log(`✅ AI response received (${responseTime}ms)`);
      console.log(`📝 Response length: ${response.data.response.length} characters`);
      console.log(`🧠 Agent: ${response.data.agent}`);
      
      // Check for key indicators of quality response
      const responseText = response.data.response.toLowerCase();
      const qualityChecks = {
        'mentions_wolfgramm': responseText.includes('wolfgramm'),
        'financial_content': responseText.includes('financial') || responseText.includes('$') || responseText.includes('million'),
        'real_estate_terms': responseText.includes('property') || responseText.includes('real estate') || responseText.includes('investment'),
        'professional_tone': response.data.response.length > 100,
        'structured_response': responseText.includes('analysis') || responseText.includes('assessment')
      };
      
      const qualityScore = Object.values(qualityChecks).filter(Boolean).length;
      console.log(`📊 Quality score: ${qualityScore}/5`);
      
      if (qualityScore >= 3) {
        console.log(`✅ Quality response (${qualityScore}/5 quality indicators)`);
        testResults.passed++;
        return response.data;
      } else {
        console.log(`⚠️  Low quality response (${qualityScore}/5 quality indicators)`);
        console.log('Response preview:', response.data.response.substring(0, 200) + '...');
        testResults.failed++;
        testResults.errors.push(`Low quality AI response for: "${message}"`);
        return response.data;
      }
    } else {
      console.log('❌ AI agent failed:', response.status, response.data);
      testResults.failed++;
      testResults.errors.push(`AI agent failed: ${response.status} - ${JSON.stringify(response.data)}`);
      return null;
    }
  } catch (error) {
    console.log('❌ AI agent error:', error.message);
    testResults.failed++;
    testResults.errors.push(`AI agent error: ${error.message}`);
    return null;
  }
}

async function runComprehensiveTests() {
  console.log('🚀 Starting OKOA AI Agent Comprehensive Test Suite');
  console.log('=' .repeat(60));
  
  // Test 1: Authentication
  const authSuccess = await testAuthenticationBypass();
  if (!authSuccess) {
    console.log('❌ Authentication failed - aborting tests');
    return;
  }
  
  console.log('');
  
  // Test 2: Deal API Access
  const dealData = await testDealApiAccess();
  if (!dealData) {
    console.log('❌ Deal API failed - aborting AI tests');
    return;
  }
  
  console.log('');
  
  // Test 3: AI Agent Response Tests
  console.log('🤖 Testing AI Agent Responses...');
  for (let i = 0; i < TEST_CONFIG.testMessages.length; i++) {
    const message = TEST_CONFIG.testMessages[i];
    console.log(`\n--- Test ${i + 1}/${TEST_CONFIG.testMessages.length} ---`);
    
    const response = await testAIAgentResponse(message, dealData.documents);
    
    // Add delay between requests to avoid rate limiting
    if (i < TEST_CONFIG.testMessages.length - 1) {
      console.log('⏱️  Waiting 2s before next test...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Test Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📋 TEST RESULTS SUMMARY');
  console.log('=' .repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Success Rate: ${Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n🚨 ERRORS:');
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }
  
  if (testResults.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! AI Agent is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Review errors above.');
  }
  
  console.log('\nTest completed at:', new Date().toISOString());
}

// Run the tests
runComprehensiveTests().catch(console.error);