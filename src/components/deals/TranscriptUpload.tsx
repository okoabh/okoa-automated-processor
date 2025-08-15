"use client";

import React, { useState } from 'react';
import { InteractiveButton } from '@/components/ascii/InteractiveButton';

interface TranscriptUploadProps {
  dealId: string;
  dealName: string;
}

export function TranscriptUpload({ dealId, dealName }: TranscriptUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [transcriptText, setTranscriptText] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [participants, setParticipants] = useState('');

  const handleUpload = async () => {
    if (!transcriptText.trim() || !meetingTitle.trim()) return;

    setIsUploading(true);
    
    try {
      // Simulate Fireflies.ai webhook payload
      const mockTranscript = {
        id: `manual_${Date.now()}`,
        title: meetingTitle,
        date: meetingDate || new Date().toISOString(),
        duration: Math.floor(transcriptText.length / 10), // Rough estimate
        participants: participants.split(',').map(p => ({ 
          name: p.trim(),
          email: `${p.trim().toLowerCase().replace(/\s+/g, '.')}@example.com`
        })),
        summary: transcriptText.substring(0, 200) + '...',
        transcript_text: transcriptText,
        meeting_url: '',
        source: 'manual_upload'
      };

      // Send to processing endpoint
      const response = await fetch('/api/fireflies/pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: mockTranscript,
          dealId: dealId,
          autoApprove: true // Skip Slack approval for manual uploads
        })
      });

      if (response.ok) {
        alert('✅ Transcript uploaded and processing started!');
        setTranscriptText('');
        setMeetingTitle('');
        setMeetingDate('');
        setParticipants('');
      } else {
        alert('❌ Upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)'}} className="border p-6">
      
      {/* Header */}
      <div className="terminal-header text-center">
        ═══ FIREFLIES.AI TRANSCRIPT UPLOAD ═══
      </div>

      <div className="space-y-4">
        
        {/* Meeting Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-okoa-fg-primary dark:text-japanese-paper-warm font-mono mb-2">
              MEETING TITLE
            </label>
            <input
              type="text"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              placeholder="e.g., Wolfgramm Project Review Call"
              className="w-full p-3 border-thin border-okoa-fg-primary dark:border-japanese-neutral-warm-gray bg-okoa-bg-primary dark:bg-japanese-ink-charcoal text-okoa-fg-primary dark:text-japanese-paper-warm font-mono text-sm focus:outline-none focus:border-okoa-interactive-primary transition-colors duration-normal"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-okoa-fg-primary dark:text-japanese-paper-warm font-mono mb-2">
              MEETING DATE
            </label>
            <input
              type="date"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              className="w-full p-3 border-thin border-okoa-fg-primary dark:border-japanese-neutral-warm-gray bg-okoa-bg-primary dark:bg-japanese-ink-charcoal text-okoa-fg-primary dark:text-japanese-paper-warm font-mono text-sm focus:outline-none focus:border-okoa-interactive-primary transition-colors duration-normal"
            />
          </div>
        </div>

        {/* Participants */}
        <div>
          <label className="block text-xs font-bold text-okoa-fg-primary dark:text-japanese-paper-warm font-mono mb-2">
            PARTICIPANTS (comma-separated)
          </label>
          <input
            type="text"
            value={participants}
            onChange={(e) => setParticipants(e.target.value)}
            placeholder="John Doe, Jane Smith, Mike Johnson"
            className="w-full p-3 border-thin border-okoa-fg-primary dark:border-japanese-neutral-warm-gray bg-okoa-bg-primary dark:bg-japanese-ink-charcoal text-okoa-fg-primary dark:text-japanese-paper-warm font-mono text-sm focus:outline-none focus:border-okoa-interactive-primary transition-colors duration-normal"
          />
        </div>

        {/* Transcript Text */}
        <div>
          <label className="block text-xs font-bold text-okoa-fg-primary dark:text-japanese-paper-warm font-mono mb-2">
            TRANSCRIPT CONTENT
          </label>
          <textarea
            value={transcriptText}
            onChange={(e) => setTranscriptText(e.target.value)}
            placeholder="Paste your meeting transcript here...

Example:
[00:01:23] John Doe: Good morning everyone, let's discuss the Wolfgramm project status.
[00:01:45] Jane Smith: The construction is progressing well, we're at about 51% completion.
[00:02:10] Mike Johnson: The budget looks on track, we've spent $36.3M of the $74.6M total..."
            rows={12}
            className="w-full p-3 border-thin border-okoa-fg-primary dark:border-japanese-neutral-warm-gray bg-okoa-bg-primary dark:bg-japanese-ink-charcoal text-okoa-fg-primary dark:text-japanese-paper-warm font-mono text-sm focus:outline-none focus:border-okoa-interactive-primary transition-colors duration-normal resize-vertical"
          />
          <div className="text-xs text-okoa-fg-secondary dark:text-japanese-neutral-warm-gray font-mono mt-1">
            {transcriptText.length} characters • Will be processed by OKOA AI agents
          </div>
        </div>

        {/* Upload Button */}
        <div className="flex space-x-4 pt-4">
          <InteractiveButton
            onClick={handleUpload}
            variant="primary"
            disabled={isUploading || !transcriptText.trim() || !meetingTitle.trim()}
            className="flex-1"
          >
            {isUploading ? '⏳ PROCESSING...' : '📤 UPLOAD & PROCESS TRANSCRIPT'}
          </InteractiveButton>
        </div>

        {/* Instructions */}
        <div style={{backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)'}} className="p-6 border" style={{...{backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)'}, borderColor: 'var(--border-primary)'}}>
          <h4 className="font-bold text-sm mb-4 font-mono">📋 TRANSCRIPT UPLOAD INSTRUCTIONS:</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h5 className="font-bold text-xs mb-2 font-mono" style={{color: 'var(--accent-primary)'}}>FIREFLIES.AI USERS:</h5>
              <div className="text-xs font-mono space-y-2" style={{color: 'var(--text-secondary)'}}>
                <div>• Automatic webhook already configured</div>
                <div>• Transcripts flow directly to Slack for approval</div>
                <div>• Use one-click "File to Wolfgramm" button</div>
                <div>• Documents appear here within 2-3 minutes</div>
                <div className="mt-2 p-2" style={{backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-light)'}}>
                  <strong>Webhook URL:</strong><br/>
                  <code className="text-xs">https://okoa-automated-processor.vercel.app/api/webhooks/fireflies</code>
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="font-bold text-xs mb-2 font-mono" style={{color: 'var(--accent-primary)'}}>MANUAL UPLOAD:</h5>
              <div className="text-xs font-mono space-y-2" style={{color: 'var(--text-secondary)'}}>
                <div>• Use form above for manual transcript entry</div>
                <div>• Include timestamps for better analysis</div>
                <div>• Add all meeting participants</div>
                <div>• Processing takes 2-3 minutes</div>
                <div className="mt-2 p-2" style={{backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-light)'}}>
                  <strong>Format Example:</strong><br/>
                  <code className="text-xs">[00:01:23] John: Budget discussion...</code>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4" style={{backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-primary)'}}>
            <h5 className="font-bold text-xs mb-2 font-mono">PROCESSING WORKFLOW:</h5>
            <div className="text-xs font-mono space-y-1" style={{color: 'var(--text-secondary)'}}>
              <div>1. 📝 Transcript uploaded to {dealName}</div>
              <div>2. 🔍 OCR and text extraction</div>
              <div>3. 🤖 AI agents analyze content for key insights</div>
              <div>4. 📊 Financial data and risks are extracted</div>
              <div>5. ⚡ Synthetic summary generated</div>
              <div>6. 🎯 Master SYNTHDOC updated</div>
              <div>7. 💬 AI chat context updated with new information</div>
              <div>8. ✅ Available immediately for questioning</div>
            </div>
          </div>
          
          <div className="mt-4 p-3 text-center" style={{backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--accent-primary)'}}>
            <div className="text-xs font-mono font-bold" style={{color: 'var(--accent-primary)'}}>
              🔧 Need help with Fireflies.ai or Slack setup?
            </div>
            <div className="text-xs font-mono mt-1" style={{color: 'var(--text-secondary)'}}>
              Visit our <a href="/integrations" className="underline" style={{color: 'var(--accent-primary)'}}>Integration Guide</a> for step-by-step instructions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}