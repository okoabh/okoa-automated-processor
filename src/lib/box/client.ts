import BoxSDK from 'box-node-sdk';
import type { BoxWebhookEvent } from '../../types';

export class BoxClient {
  private sdk: BoxSDK;
  private client: any;
  private initialized: boolean = false;
  
  constructor() {
    const clientId = process.env.BOX_CLIENT_ID;
    const clientSecret = process.env.BOX_CLIENT_SECRET;
    const enterpriseId = process.env.BOX_ENTERPRISE_ID;
    
    if (!clientId || !clientSecret || !enterpriseId) {
      console.warn('Box.com configuration missing. Box features will be disabled.');
      return;
    }
    
    try {
      this.sdk = BoxSDK.getPreconfiguredInstance({
        clientID: clientId,
        clientSecret: clientSecret,
        enterpriseID: enterpriseId,
        boxAppSettings: {
          clientID: clientId,
          clientSecret: clientSecret,
          appAuth: {
            keyID: process.env.BOX_KEY_ID || '',
            privateKey: process.env.BOX_PRIVATE_KEY || '',
            passphrase: process.env.BOX_PASSPHRASE || '',
          }
        }
      });
    } catch (error) {
      console.warn('Box SDK initialization failed:', error);
    }
  }
  
  async initialize(): Promise<void> {
    if (this.initialized) return;
    if (!this.sdk) {
      console.warn('Box SDK not initialized, skipping');
      return;
    }
    
    try {
      this.client = this.sdk.getAppAuthClient('enterprise');
      
      // Test connection
      const user = await this.client.users.get('me');
      console.log(`Connected to Box.com as: ${user.name} (${user.login})`);
      
      this.initialized = true;
    } catch (error) {
      console.warn('Failed to initialize Box client:', error);
      // Don't throw - just disable Box features
    }
  }
  
  async uploadFile(filePath: string, filename: string, parentFolderId: string = '0'): Promise<any> {
    await this.initialize();
    
    try {
      const uploadedFile = await this.client.files.uploadFile(parentFolderId, filename, filePath);
      console.log(`File uploaded to Box.com: ${filename} (ID: ${uploadedFile.id})`);
      return uploadedFile;
    } catch (error) {
      console.error('Box file upload failed:', error);
      throw error;
    }
  }
  
  async downloadFile(fileId: string): Promise<Buffer> {
    await this.initialize();
    
    try {
      const stream = await this.client.files.getReadStream(fileId);
      
      return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        
        stream.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });
        
        stream.on('end', () => {
          resolve(Buffer.concat(chunks));
        });
        
        stream.on('error', (error: Error) => {
          reject(error);
        });
      });
    } catch (error) {
      console.error('Box file download failed:', error);
      throw error;
    }
  }
  
  async getFileInfo(fileId: string): Promise<any> {
    await this.initialize();
    
    try {
      return await this.client.files.get(fileId);
    } catch (error) {
      console.error('Failed to get Box file info:', error);
      throw error;
    }
  }
  
  async createFolder(name: string, parentFolderId: string = '0'): Promise<any> {
    await this.initialize();
    
    try {
      const folder = await this.client.folders.create(parentFolderId, name);
      console.log(`Folder created in Box.com: ${name} (ID: ${folder.id})`);
      return folder;
    } catch (error) {
      console.error('Box folder creation failed:', error);
      throw error;
    }
  }
  
  async getFolderItems(folderId: string): Promise<any[]> {
    await this.initialize();
    
    try {
      const items = await this.client.folders.getItems(folderId);
      return items.entries;
    } catch (error) {
      console.error('Failed to get Box folder items:', error);
      throw error;
    }
  }
  
  async setupWebhook(targetUrl: string, folderId: string): Promise<any> {
    await this.initialize();
    
    try {
      const webhook = await this.client.webhooks.create(folderId, 'folder', targetUrl, [
        'FILE.UPLOADED',
        'FILE.COPIED',
        'FILE.MOVED'
      ]);
      
      console.log(`Webhook created for folder ${folderId}: ${webhook.id}`);
      return webhook;
    } catch (error) {
      console.error('Failed to create Box webhook:', error);
      throw error;
    }
  }
  
  async listWebhooks(): Promise<any[]> {
    await this.initialize();
    
    try {
      const webhooks = await this.client.webhooks.getAll();
      return webhooks.entries;
    } catch (error) {
      console.error('Failed to list Box webhooks:', error);
      throw error;
    }
  }
  
  async deleteWebhook(webhookId: string): Promise<void> {
    await this.initialize();
    
    try {
      await this.client.webhooks.delete(webhookId);
      console.log(`Webhook deleted: ${webhookId}`);
    } catch (error) {
      console.error('Failed to delete Box webhook:', error);
      throw error;
    }
  }
  
  // Verify webhook signature for security
  static verifyWebhookSignature(payload: string, signature: string, signatureKey?: string): boolean {
    if (!signatureKey) {
      signatureKey = process.env.BOX_WEBHOOK_SIGNATURE_KEY;
    }
    
    if (!signatureKey) {
      console.warn('BOX_WEBHOOK_SIGNATURE_KEY not set - webhook signature verification disabled');
      return true; // Allow in development
    }
    
    const crypto = require('crypto');
    const computedSignature = crypto
      .createHmac('sha256', signatureKey)
      .update(payload)
      .digest('base64');
    
    return computedSignature === signature;
  }
  
  // Process folder structure for OKOA organization
  async setupOKOAFolderStructure(baseFolderId: string = '0'): Promise<{ [key: string]: string }> {
    await this.initialize();
    
    const folders = {
      'OKOA_Processing': '',
      'OKOA_Inbox': '',
      'OKOA_Processed': '',
      'OKOA_Failed': '',
      'OKOA_Archive': ''
    };
    
    try {
      for (const folderName of Object.keys(folders)) {
        const folder = await this.createFolder(folderName, baseFolderId);
        folders[folderName as keyof typeof folders] = folder.id;
      }
      
      console.log('OKOA folder structure created:', folders);
      return folders;
    } catch (error) {
      console.error('Failed to create OKOA folder structure:', error);
      throw error;
    }
  }
  
  // Move processed files to appropriate folders
  async moveFileToProcessedFolder(fileId: string, targetFolderId: string): Promise<any> {
    await this.initialize();
    
    try {
      const movedFile = await this.client.files.move(fileId, targetFolderId);
      console.log(`File moved to processed folder: ${fileId} -> ${targetFolderId}`);
      return movedFile;
    } catch (error) {
      console.error('Failed to move file to processed folder:', error);
      throw error;
    }
  }
  
  // Get file download URL for processing
  async getFileDownloadUrl(fileId: string): Promise<string> {
    await this.initialize();
    
    try {
      const downloadUrl = await this.client.files.getDownloadURL(fileId);
      return downloadUrl;
    } catch (error) {
      console.error('Failed to get file download URL:', error);
      throw error;
    }
  }
  
  // Search for files by name or content
  async searchFiles(query: string, folderId?: string): Promise<any[]> {
    await this.initialize();
    
    try {
      const searchOptions: any = {
        query,
        content_types: ['name', 'description', 'file_content'],
        type: 'file'
      };
      
      if (folderId) {
        searchOptions.ancestor_folder_ids = [folderId];
      }
      
      const results = await this.client.search.query(searchOptions);
      return results.entries;
    } catch (error) {
      console.error('Box file search failed:', error);
      throw error;
    }
  }
}