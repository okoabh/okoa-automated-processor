import jwt from 'jsonwebtoken';
import crypto from 'crypto';

interface BoxConfig {
  clientId: string;
  clientSecret: string;
  enterpriseId: string;
  publicKeyId?: string;
  privateKey?: string;
}

interface BoxFolder {
  id: string;
  name: string;
  parent?: {
    id: string;
    name: string;
  };
}

interface BoxFile {
  id: string;
  name: string;
  size: number;
  parent?: {
    id: string;
    name: string;
  };
}

export class BoxService {
  private config: BoxConfig;
  private accessToken?: string;
  private tokenExpiry?: Date;

  constructor() {
    this.config = {
      clientId: process.env.BOX_CLIENT_ID!,
      clientSecret: process.env.BOX_CLIENT_SECRET!,
      enterpriseId: process.env.BOX_ENTERPRISE_ID!,
      publicKeyId: process.env.BOX_PUBLIC_KEY_ID,
      privateKey: process.env.BOX_PRIVATE_KEY
    };

    if (!this.config.clientId || !this.config.clientSecret || !this.config.enterpriseId) {
      throw new Error('Box.com configuration is incomplete');
    }
  }

  /**
   * Get or refresh access token using JWT authentication
   */
  private async getAccessToken(): Promise<string> {
    // Check if current token is still valid
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      // For now, use client credentials flow (simpler setup)
      // In production, you'd use JWT with RSA keys
      const response = await fetch('https://api.box.com/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          box_subject_type: 'enterprise',
          box_subject_id: this.config.enterpriseId
        })
      });

      if (!response.ok) {
        throw new Error(`Box authentication failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = new Date(Date.now() + (data.expires_in * 1000) - 60000); // 1 minute buffer

      return this.accessToken;
    } catch (error) {
      console.error('Box authentication error:', error);
      throw error;
    }
  }

  /**
   * Make authenticated request to Box API
   */
  private async apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = await this.getAccessToken();
    
    const response = await fetch(`https://api.box.com/2.0${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Box API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Create a new folder
   */
  async createFolder(name: string, parentId: string = '0'): Promise<BoxFolder> {
    try {
      const data = await this.apiRequest('/folders', {
        method: 'POST',
        body: JSON.stringify({
          name,
          parent: { id: parentId }
        })
      });

      return {
        id: data.id,
        name: data.name,
        parent: data.parent
      };
    } catch (error) {
      console.error(`Error creating Box folder "${name}":`, error);
      throw error;
    }
  }

  /**
   * Upload a file to Box
   */
  async uploadFile(
    fileName: string, 
    fileContent: Buffer | string, 
    parentFolderId: string = '0'
  ): Promise<BoxFile> {
    try {
      const token = await this.getAccessToken();
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('attributes', JSON.stringify({
        name: fileName,
        parent: { id: parentFolderId }
      }));
      
      // Handle different file content types
      let fileBlob: Blob;
      if (typeof fileContent === 'string') {
        fileBlob = new Blob([fileContent], { type: 'text/plain' });
      } else {
        fileBlob = new Blob([fileContent]);
      }
      
      formData.append('file', fileBlob, fileName);

      const response = await fetch('https://upload.box.com/api/2.0/files/content', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Box upload error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      const file = data.entries[0];

      return {
        id: file.id,
        name: file.name,
        size: file.size,
        parent: file.parent
      };
    } catch (error) {
      console.error(`Error uploading file "${fileName}" to Box:`, error);
      throw error;
    }
  }

  /**
   * Get folder contents
   */
  async getFolderContents(folderId: string): Promise<{ folders: BoxFolder[], files: BoxFile[] }> {
    try {
      const data = await this.apiRequest(`/folders/${folderId}/items`);
      
      const folders: BoxFolder[] = [];
      const files: BoxFile[] = [];

      data.entries.forEach((item: any) => {
        if (item.type === 'folder') {
          folders.push({
            id: item.id,
            name: item.name,
            parent: item.parent
          });
        } else if (item.type === 'file') {
          files.push({
            id: item.id,
            name: item.name,
            size: item.size,
            parent: item.parent
          });
        }
      });

      return { folders, files };
    } catch (error) {
      console.error(`Error getting Box folder contents for folder ${folderId}:`, error);
      throw error;
    }
  }

  /**
   * Get file download URL
   */
  async getFileDownloadUrl(fileId: string): Promise<string> {
    try {
      const token = await this.getAccessToken();
      return `https://api.box.com/2.0/files/${fileId}/content?access_token=${token}`;
    } catch (error) {
      console.error(`Error getting download URL for file ${fileId}:`, error);
      throw error;
    }
  }

  /**
   * Create a shared link for a folder
   */
  async createFolderSharedLink(folderId: string): Promise<string> {
    try {
      const data = await this.apiRequest(`/folders/${folderId}`, {
        method: 'PUT',
        body: JSON.stringify({
          shared_link: {
            access: 'company',
            permissions: {
              can_download: true,
              can_preview: true
            }
          }
        })
      });

      return data.shared_link.url;
    } catch (error) {
      console.error(`Error creating shared link for folder ${folderId}:`, error);
      throw error;
    }
  }
}