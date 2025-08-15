/**
 * Fireflies.ai API Integration
 * Handles meeting transcript retrieval and webhook processing
 */

interface FirefliesTranscript {
  id: string;
  title: string;
  meeting_url?: string;
  transcript: string;
  summary?: string;
  action_items?: string[];
  keywords?: string[];
  date: string;
  duration: number;
  participants: Array<{
    name: string;
    email?: string;
  }>;
}

interface FirefliesWebhookPayload {
  event_type: 'transcript.created' | 'transcript.updated' | 'transcript.deleted';
  transcript: {
    id: string;
    title: string;
    date: string;
    meeting_url?: string;
  };
}

export class FirefliesClient {
  private apiKey: string;
  private graphqlEndpoint = 'https://api.fireflies.ai/graphql';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Execute GraphQL query against Fireflies API
   */
  private async executeQuery(query: string, variables?: Record<string, any>) {
    const response = await fetch(this.graphqlEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`Fireflies API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      throw new Error(`GraphQL error: ${JSON.stringify(data.errors)}`);
    }

    return data.data;
  }

  /**
   * Get transcript by ID with full details
   */
  async getTranscript(transcriptId: string): Promise<FirefliesTranscript | null> {
    const query = `
      query GetTranscript($transcriptId: String!) {
        transcript(id: $transcriptId) {
          id
          title
          meeting_url
          transcript
          summary
          action_items
          keywords
          date
          duration
          participants {
            name
            email
          }
        }
      }
    `;

    try {
      const data = await this.executeQuery(query, { transcriptId });
      return data.transcript;
    } catch (error) {
      console.error('Error fetching transcript:', error);
      return null;
    }
  }

  /**
   * Search for transcripts by title or content
   */
  async searchTranscripts(searchTerm: string, limit: number = 20): Promise<FirefliesTranscript[]> {
    const query = `
      query SearchTranscripts($searchTerm: String!, $limit: Int!) {
        transcripts(search: $searchTerm, limit: $limit) {
          id
          title
          meeting_url
          date
          duration
          summary
          participants {
            name
            email
          }
        }
      }
    `;

    try {
      const data = await this.executeQuery(query, { searchTerm, limit });
      return data.transcripts || [];
    } catch (error) {
      console.error('Error searching transcripts:', error);
      return [];
    }
  }

  /**
   * Get recent transcripts
   */
  async getRecentTranscripts(limit: number = 50): Promise<FirefliesTranscript[]> {
    const query = `
      query GetRecentTranscripts($limit: Int!) {
        transcripts(limit: $limit, orderBy: DATE_DESC) {
          id
          title
          meeting_url
          date
          duration
          summary
          keywords
          action_items
          participants {
            name
            email
          }
        }
      }
    `;

    try {
      const data = await this.executeQuery(query, { limit });
      return data.transcripts || [];
    } catch (error) {
      console.error('Error fetching recent transcripts:', error);
      return [];
    }
  }

  /**
   * Verify webhook signature for security
   */
  static verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    const crypto = require('crypto');
    const expectedSignature = 'sha256=' + crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Process webhook payload and extract relevant information
   */
  static processWebhookPayload(payload: FirefliesWebhookPayload) {
    return {
      eventType: payload.event_type,
      transcriptId: payload.transcript.id,
      title: payload.transcript.title,
      date: payload.transcript.date,
      meetingUrl: payload.transcript.meeting_url,
    };
  }

  /**
   * Create a plain text file from transcript data
   */
  static formatTranscriptAsPlainText(transcript: FirefliesTranscript): string {
    const date = new Date(transcript.date).toLocaleDateString();
    const duration = Math.round(transcript.duration / 60); // Convert to minutes

    let content = `MEETING TRANSCRIPT\n`;
    content += `==================\n\n`;
    content += `Title: ${transcript.title}\n`;
    content += `Date: ${date}\n`;
    content += `Duration: ${duration} minutes\n`;
    
    if (transcript.meeting_url) {
      content += `Meeting URL: ${transcript.meeting_url}\n`;
    }

    content += `\nParticipants:\n`;
    transcript.participants.forEach(participant => {
      content += `- ${participant.name}${participant.email ? ` (${participant.email})` : ''}\n`;
    });

    if (transcript.summary) {
      content += `\nSUMMARY:\n`;
      content += `${transcript.summary}\n`;
    }

    if (transcript.action_items && transcript.action_items.length > 0) {
      content += `\nACTION ITEMS:\n`;
      transcript.action_items.forEach((item, index) => {
        content += `${index + 1}. ${item}\n`;
      });
    }

    if (transcript.keywords && transcript.keywords.length > 0) {
      content += `\nKEY TOPICS:\n`;
      content += `${transcript.keywords.join(', ')}\n`;
    }

    content += `\nFULL TRANSCRIPT:\n`;
    content += `================\n\n`;
    content += transcript.transcript;

    return content;
  }

  /**
   * Generate synthetic communications summary for OKOA system
   */
  static generateSynthCommsSummary(transcript: FirefliesTranscript, dealName?: string): string {
    const date = new Date(transcript.date).toISOString().split('T')[0];
    
    let summary = `# SYNTHETIC COMMUNICATIONS SUMMARY\n`;
    summary += `## Meeting: ${transcript.title}\n`;
    summary += `## Date: ${date}\n`;
    
    if (dealName) {
      summary += `## Deal: ${dealName}\n`;
    }
    
    summary += `## Duration: ${Math.round(transcript.duration / 60)} minutes\n\n`;
    
    summary += `### PARTICIPANTS:\n`;
    transcript.participants.forEach(p => {
      summary += `- ${p.name}${p.email ? ` (${p.email})` : ''}\n`;
    });
    
    if (transcript.summary) {
      summary += `\n### EXECUTIVE SUMMARY:\n${transcript.summary}\n`;
    }
    
    if (transcript.action_items && transcript.action_items.length > 0) {
      summary += `\n### ACTION ITEMS:\n`;
      transcript.action_items.forEach((item, i) => {
        summary += `${i + 1}. ${item}\n`;
      });
    }
    
    if (transcript.keywords && transcript.keywords.length > 0) {
      summary += `\n### KEY TOPICS DISCUSSED:\n${transcript.keywords.join(', ')}\n`;
    }
    
    summary += `\n### SOURCE:\n`;
    summary += `- Transcript ID: ${transcript.id}\n`;
    summary += `- Generated: ${new Date().toISOString()}\n`;
    summary += `- Source: Fireflies.ai meeting transcript\n`;
    
    if (transcript.meeting_url) {
      summary += `- Meeting URL: ${transcript.meeting_url}\n`;
    }
    
    return summary;
  }
}

// Default instance using environment variable
export const fireflies = new FirefliesClient(process.env.FIREFLIES_API_KEY || '');

export default FirefliesClient;