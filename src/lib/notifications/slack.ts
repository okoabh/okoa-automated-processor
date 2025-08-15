import type { SlackNotification } from '../../types';

export class SlackNotifier {
  private webhookUrl: string;
  private botToken?: string;
  private defaultChannelId?: string;
  
  constructor() {
    this.webhookUrl = process.env.SLACK_WEBHOOK_URL || '';
    this.botToken = process.env.SLACK_BOT_TOKEN;
    this.defaultChannelId = process.env.SLACK_CHANNEL_ID;
    
    if (!this.webhookUrl) {
      console.warn('SLACK_WEBHOOK_URL not configured - Slack notifications disabled');
    }
  }
  
  async sendNotification(notification: SlackNotification): Promise<boolean> {
    if (!this.webhookUrl) {
      console.log('Slack notification (disabled):', notification.title);
      return false;
    }
    
    try {
      const slackPayload = this.buildSlackPayload(notification);
      
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slackPayload),
      });
      
      if (!response.ok) {
        throw new Error(`Slack API error: ${response.status} ${response.statusText}`);
      }
      
      console.log(`Slack notification sent: ${notification.title}`);
      return true;
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
      return false;
    }
  }
  
  private buildSlackPayload(notification: SlackNotification) {
    const dashboardUrl = notification.dashboardUrl || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    switch (notification.type) {
      case 'PROCESSING_STARTED':
        return this.buildProcessingStartedMessage(notification, dashboardUrl);
      case 'PROCESSING_COMPLETED':
        return this.buildProcessingCompletedMessage(notification, dashboardUrl);
      case 'PROCESSING_FAILED':
        return this.buildProcessingFailedMessage(notification, dashboardUrl);
      case 'COST_ALERT':
        return this.buildCostAlertMessage(notification, dashboardUrl);
      case 'DAILY_SUMMARY':
        return this.buildDailySummaryMessage(notification, dashboardUrl);
      default:
        return this.buildGenericMessage(notification, dashboardUrl);
    }
  }
  
  private buildProcessingStartedMessage(notification: SlackNotification, dashboardUrl: string) {
    const { data } = notification;
    
    return {
      text: `📊 OKOA Processing Started`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `🚀 *${notification.title}*\n${notification.message}\n\n<${dashboardUrl}/dashboard|View Live Dashboard>`
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*📁 Documents:*\n${data?.documentCount || 1} queued`
            },
            {
              type: "mrkdwn",
              text: `*🤖 Agents:*\n${data?.activeAgents || 1} active`
            },
            {
              type: "mrkdwn",
              text: `*💰 Est. Cost:*\n$${data?.estimatedCost?.toFixed(2) || '0.00'}`
            },
            {
              type: "mrkdwn",
              text: `*⏱️ ETA:*\n${data?.estimatedDuration || '~5 min'}`
            }
          ]
        },
        {
          type: "divider"
        }
      ]
    };
  }
  
  private buildProcessingCompletedMessage(notification: SlackNotification, dashboardUrl: string) {
    const { data } = notification;
    
    return {
      text: `✅ OKOA Processing Complete`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `✅ *${notification.title}*\n${notification.message}\n\n<${dashboardUrl}/documents/${data?.documentId}|View Results> | <${dashboardUrl}/dashboard|Dashboard>`
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*⏱️ Duration:*\n${this.formatDuration(data?.processingTimeMs || 0)}`
            },
            {
              type: "mrkdwn",
              text: `*💰 Cost:*\n$${data?.actualCost?.toFixed(2) || '0.00'}`
            },
            {
              type: "mrkdwn",
              text: `*🎯 Quality:*\n${data?.qualityScore || 'N/A'}%`
            },
            {
              type: "mrkdwn",
              text: `*📊 Tokens:*\n${data?.tokensUsed?.toLocaleString() || 0}`
            }
          ]
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `🤖 Model: ${data?.model || 'Claude 3.5 Sonnet'} | 📝 Type: ${data?.documentType || 'General'}`
            }
          ]
        }
      ]
    };
  }
  
  private buildProcessingFailedMessage(notification: SlackNotification, dashboardUrl: string) {
    const { data } = notification;
    
    return {
      text: `❌ OKOA Processing Failed`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `❌ *${notification.title}*\n${notification.message}\n\n<${dashboardUrl}/dashboard|View Dashboard>`
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*📁 Document:*\n${data?.filename || 'Unknown'}`
            },
            {
              type: "mrkdwn",
              text: `*🔄 Retry Count:*\n${data?.retryCount || 0}/3`
            },
            {
              type: "mrkdwn",
              text: `*⚠️ Error:*\n${data?.errorMessage || 'Unknown error'}`
            },
            {
              type: "mrkdwn",
              text: `*🤖 Agent:*\n${data?.agentId || 'N/A'}`
            }
          ]
        }
      ]
    };
  }
  
  private buildCostAlertMessage(notification: SlackNotification, dashboardUrl: string) {
    const { data } = notification;
    
    return {
      text: `⚠️ OKOA Cost Alert`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `⚠️ *${notification.title}*\n${notification.message}\n\n<${dashboardUrl}/dashboard|View Dashboard>`
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*💰 Current Spend:*\n$${data?.currentCost?.toFixed(2) || '0.00'}`
            },
            {
              type: "mrkdwn",
              text: `*📊 Budget:*\n$${data?.budget?.toFixed(2) || '100.00'}`
            },
            {
              type: "mrkdwn",
              text: `*📈 Usage:*\n${data?.usagePercent || 0}%`
            },
            {
              type: "mrkdwn",
              text: `*⏰ Period:*\n${data?.period || 'Daily'}`
            }
          ]
        }
      ]
    };
  }
  
  private buildDailySummaryMessage(notification: SlackNotification, dashboardUrl: string) {
    const { data } = notification;
    
    return {
      text: `📊 OKOA Daily Summary`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `📊 *${notification.title}*\n${notification.message}\n\n<${dashboardUrl}/dashboard|View Full Analytics>`
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*📄 Documents:*\n${data?.documentsProcessed || 0} processed`
            },
            {
              type: "mrkdwn",
              text: `*💰 Total Cost:*\n$${data?.totalCost?.toFixed(2) || '0.00'}`
            },
            {
              type: "mrkdwn",
              text: `*⚡ Success Rate:*\n${data?.successRate || 0}%`
            },
            {
              type: "mrkdwn",
              text: `*⏱️ Avg. Time:*\n${this.formatDuration(data?.averageProcessingTime || 0)}`
            }
          ]
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `🤖 Most Used Model: ${data?.topModel || 'Claude 3.5 Sonnet'} | 📈 Peak Hour: ${data?.peakHour || 'N/A'}`
            }
          ]
        }
      ]
    };
  }
  
  private buildGenericMessage(notification: SlackNotification, dashboardUrl: string) {
    return {
      text: notification.title,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*${notification.title}*\n${notification.message}\n\n<${dashboardUrl}|View Dashboard>`
          }
        }
      ]
    };
  }
  
  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
    return `${(ms / 3600000).toFixed(1)}h`;
  }
  
  // Test notification
  async sendTestNotification(): Promise<boolean> {
    return await this.sendNotification({
      type: 'PROCESSING_STARTED',
      title: '🧪 OKOA Test Notification',
      message: 'System is connected and ready for document processing!',
      timestamp: Date.now(),
      data: {
        documentCount: 1,
        activeAgents: 1,
        estimatedCost: 0.50,
        estimatedDuration: '~3 min'
      }
    });
  }
  
  // Batch notifications for multiple documents
  async sendBatchNotification(documents: any[], type: 'STARTED' | 'COMPLETED'): Promise<boolean> {
    const totalCost = documents.reduce((sum, doc) => sum + (doc.cost || 0), 0);
    const avgProcessingTime = documents.reduce((sum, doc) => sum + (doc.processingTime || 0), 0) / documents.length;
    
    return await this.sendNotification({
      type: type === 'STARTED' ? 'PROCESSING_STARTED' : 'PROCESSING_COMPLETED',
      title: `${type === 'STARTED' ? '🚀' : '✅'} Batch Processing ${type === 'STARTED' ? 'Started' : 'Complete'}`,
      message: `${documents.length} documents ${type === 'STARTED' ? 'queued for processing' : 'processed successfully'}`,
      timestamp: Date.now(),
      data: {
        documentCount: documents.length,
        totalCost,
        averageProcessingTime: avgProcessingTime,
        documents: documents.map(doc => ({ name: doc.filename, type: doc.documentType }))
      }
    });
  }
}