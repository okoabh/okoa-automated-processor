#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Read environment variables from .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
const envVars = {};

envFile.split('\n').forEach(line => {
  if (line && !line.startsWith('#') && line.includes('=')) {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=');
    envVars[key.trim()] = value.trim();
  }
});

// Critical environment variables for deployment
const criticalVars = [
  'NEXT_PUBLIC_CONVEX_URL',
  'CONVEX_DEPLOYMENT',
  'ANTHROPIC_API_KEY',
  'FIREFLIES_API_KEY',
  'SLACK_WEBHOOK_URL'
];

console.log('🚀 Setting up Vercel environment variables...');

// Add each critical environment variable
criticalVars.forEach(varName => {
  if (envVars[varName] && envVars[varName] !== 'your_api_key_here') {
    try {
      console.log(`Setting ${varName}...`);
      execSync(`echo "${envVars[varName]}" | vercel env add ${varName} production`, { stdio: 'inherit' });
    } catch (error) {
      console.warn(`⚠️ Failed to set ${varName}:`, error.message);
    }
  } else {
    console.warn(`⚠️ ${varName} not found or not configured`);
  }
});

console.log('✅ Environment setup complete!');
console.log('🚀 Deploying to production...');

try {
  execSync('vercel --prod --yes', { stdio: 'inherit' });
  console.log('🎉 Deployment complete!');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
}