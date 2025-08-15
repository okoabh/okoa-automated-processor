#!/usr/bin/env node

/**
 * CodeRabbit Auto-Fix Monitor
 * Automatically detects CodeRabbit reviews and triggers Claude Code fixes
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class CodeRabbitMonitor {
  constructor() {
    this.lastCheck = Date.now();
    this.reviewHistory = new Set();
  }

  /**
   * Monitor for new CodeRabbit reviews on all open PRs
   */
  async monitorReviews() {
    try {
      console.log('🔍 Checking for new CodeRabbit reviews...');
      
      // Get all open PRs
      const prList = execSync('gh pr list --json number,title,updatedAt', { encoding: 'utf8' });
      const prs = JSON.parse(prList);
      
      for (const pr of prs) {
        await this.checkPRForCodeRabbitReview(pr.number);
      }
      
    } catch (error) {
      console.error('❌ Error monitoring reviews:', error.message);
    }
  }

  /**
   * Check specific PR for CodeRabbit reviews
   */
  async checkPRForCodeRabbitReview(prNumber) {
    try {
      // Get PR comments
      const comments = execSync(`gh pr view ${prNumber} --json comments`, { encoding: 'utf8' });
      const prData = JSON.parse(comments);
      
      // Find CodeRabbit comments
      const coderabbitComments = prData.comments?.filter(comment => 
        comment.author.login === 'coderabbitai'
      ) || [];
      
      // Check for new reviews
      for (const comment of coderabbitComments) {
        const reviewId = `${prNumber}-${comment.id}`;
        
        if (!this.reviewHistory.has(reviewId)) {
          this.reviewHistory.add(reviewId);
          console.log(`🤖 New CodeRabbit review found on PR #${prNumber}`);
          
          // Trigger Claude Code auto-fix
          await this.triggerClaudeFix(prNumber, comment);
        }
      }
      
    } catch (error) {
      console.error(`❌ Error checking PR #${prNumber}:`, error.message);
    }
  }

  /**
   * Trigger Claude Code to analyze and fix CodeRabbit suggestions
   */
  async triggerClaudeFix(prNumber, comment) {
    const triggerData = {
      pr: prNumber,
      timestamp: Date.now(),
      comment: {
        id: comment.id,
        body: comment.body,
        createdAt: comment.createdAt
      },
      suggestions: this.extractSuggestions(comment.body),
      autoFixEnabled: true
    };

    // Write trigger file for Claude monitoring
    const triggerPath = path.join(process.cwd(), '.coderabbit-triggers', `pr-${prNumber}-${Date.now()}.json`);
    
    // Ensure directory exists
    const triggerDir = path.dirname(triggerPath);
    if (!fs.existsSync(triggerDir)) {
      fs.mkdirSync(triggerDir, { recursive: true });
    }
    
    fs.writeFileSync(triggerPath, JSON.stringify(triggerData, null, 2));
    console.log(`📝 Created trigger file: ${triggerPath}`);
    
    // Also create a simple flag file that Claude monitors
    fs.writeFileSync('.coderabbit-pending.json', JSON.stringify({
      pr: prNumber,
      timestamp: Date.now(),
      action: 'auto_fix_requested'
    }));
    
    console.log('🔔 Claude Code notification sent for auto-fix');
  }

  /**
   * Extract actionable suggestions from CodeRabbit comment
   */
  extractSuggestions(commentBody) {
    const suggestions = [];
    
    // Look for common CodeRabbit suggestion patterns
    const patterns = [
      /```suggestion\s*\n([\s\S]*?)\n```/g,
      /Apply this diff:([\s\S]*?)(?:\n\n|\n$)/g,
      /Consider using:([\s\S]*?)(?:\n\n|\n$)/g,
      /Replace with:([\s\S]*?)(?:\n\n|\n$)/g
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(commentBody)) !== null) {
        suggestions.push({
          type: 'code_change',
          content: match[1].trim(),
          confidence: 'high'
        });
      }
    });
    
    // Look for security warnings
    if (commentBody.toLowerCase().includes('security')) {
      suggestions.push({
        type: 'security_issue',
        content: commentBody,
        confidence: 'critical',
        requiresReview: true
      });
    }
    
    return suggestions;
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring(intervalMs = 30000) { // Check every 30 seconds
    console.log('🚀 Starting CodeRabbit auto-fix monitor...');
    console.log(`⏱️  Checking every ${intervalMs/1000} seconds`);
    
    // Initial check
    this.monitorReviews();
    
    // Set up interval
    setInterval(() => {
      this.monitorReviews();
    }, intervalMs);
  }
}

// Start monitoring if run directly
if (require.main === module) {
  const monitor = new CodeRabbitMonitor();
  monitor.startMonitoring();
}

module.exports = CodeRabbitMonitor;