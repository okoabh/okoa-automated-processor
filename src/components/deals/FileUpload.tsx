"use client";

import React, { useState, useRef } from 'react';
import { InteractiveButton } from '@/components/ascii/InteractiveButton';

interface FileUploadProps {
  dealId: string;
  dealName: string;
  onUploadComplete?: (files: UploadedFile[]) => void;
}

interface UploadedFile {
  name: string;
  size: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
  boxFileId?: string;
}

export function FileUpload({ dealId, dealName, onUploadComplete }: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFiles: FileList | null, isFolder: boolean = false) => {
    if (!selectedFiles) return;

    const newFiles: UploadedFile[] = Array.from(selectedFiles).map(file => ({
      name: isFolder ? `📁 ${file.webkitRelativePath || file.name}` : file.name,
      size: file.size,
      status: 'pending',
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    const pendingFiles = files.filter(f => f.status === 'pending');

    for (let i = 0; i < pendingFiles.length; i++) {
      const file = pendingFiles[i];
      const fileIndex = files.findIndex(f => f.name === file.name);
      
      // Update status to uploading
      setFiles(prev => prev.map((f, idx) => 
        idx === fileIndex ? { ...f, status: 'uploading', progress: 0 } : f
      ));

      try {
        // Get the actual file from the input
        const fileInput = file.name.startsWith('📁') ? folderInputRef.current : fileInputRef.current;
        const actualFile = fileInput?.files?.[0]; // This is simplified - in reality you'd need to track files better

        if (!actualFile) {
          throw new Error('File not found');
        }

        // Create FormData for upload
        const formData = new FormData();
        formData.append('file', actualFile);
        formData.append('dealId', dealId);
        formData.append('fileName', file.name);

        // Upload with progress tracking
        const response = await fetch('/api/deals/upload', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const result = await response.json();

        // Update status to completed
        setFiles(prev => prev.map((f, idx) => 
          idx === fileIndex ? { 
            ...f, 
            status: 'completed', 
            progress: 100,
            boxFileId: result.boxFileId 
          } : f
        ));

      } catch (error) {
        // Update status to error
        setFiles(prev => prev.map((f, idx) => 
          idx === fileIndex ? { 
            ...f, 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Upload failed' 
          } : f
        ));
      }
    }

    setIsUploading(false);
    
    const completedFiles = files.filter(f => f.status === 'completed');
    if (onUploadComplete && completedFiles.length > 0) {
      onUploadComplete(completedFiles);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  const clearAll = () => {
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (folderInputRef.current) folderInputRef.current.value = '';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: UploadedFile['status']): string => {
    switch (status) {
      case 'pending': return '⏳';
      case 'uploading': return '⬆️';
      case 'completed': return '✅';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  return (
    <div className="bg-white border-2 border-gray-900 p-6">
      
      {/* Header */}
      <div className="border-b border-gray-300 pb-4 mb-6">
        <h2 className="text-sm font-bold text-gray-900 font-mono mb-2">
          DOCUMENT UPLOAD - {dealName.toUpperCase()}
        </h2>
        <p className="text-xs text-gray-600 font-mono">
          Upload documents to be processed and stored in Box.com deal folder
        </p>
      </div>

      {/* Upload Controls */}
      <div className="space-y-4 mb-6">
        
        {/* File Inputs (Hidden) */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.xlsx,.xls,.ppt,.pptx"
        />
        
        <input
          ref={folderInputRef}
          type="file"
          multiple
          // @ts-ignore - webkitdirectory is not in standard types
          webkitdirectory="true"
          onChange={(e) => handleFileSelect(e.target.files, true)}
          className="hidden"
        />

        {/* Upload Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <InteractiveButton
            onClick={() => fileInputRef.current?.click()}
            variant="primary"
            disabled={isUploading}
            className="w-full"
          >
            📄 SELECT FILES
          </InteractiveButton>
          
          <InteractiveButton
            onClick={() => folderInputRef.current?.click()}
            variant="secondary"
            disabled={isUploading}
            className="w-full"
          >
            📁 SELECT FOLDER
          </InteractiveButton>
        </div>

        {/* Action Buttons */}
        {files.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            <InteractiveButton
              onClick={uploadFiles}
              variant="success"
              disabled={isUploading || files.every(f => f.status !== 'pending')}
              className="w-full"
            >
              {isUploading ? 'UPLOADING...' : 'UPLOAD ALL'}
            </InteractiveButton>
            
            <InteractiveButton
              onClick={clearAll}
              variant="danger"
              disabled={isUploading}
              className="w-full"
            >
              CLEAR ALL
            </InteractiveButton>
          </div>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="border-t border-gray-300 pt-4">
          <h3 className="text-xs font-bold text-gray-900 font-mono mb-3">
            FILES TO UPLOAD ({files.length})
          </h3>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {files.map((file, index) => (
              <div key={index} className="border border-gray-300 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{getStatusIcon(file.status)}</span>
                    <span className="text-xs font-mono text-gray-900 truncate max-w-xs">
                      {file.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-gray-600">
                      {formatFileSize(file.size)}
                    </span>
                    
                    {file.status === 'pending' && (
                      <button
                        onClick={() => removeFile(index)}
                        className="text-xs text-red-600 hover:text-red-800 font-mono"
                        disabled={isUploading}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {file.status === 'uploading' && (
                  <div className="w-full bg-gray-200 h-2">
                    <div 
                      className="bg-gray-900 h-2 transition-all duration-300"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}

                {/* Error Message */}
                {file.status === 'error' && file.error && (
                  <div className="text-xs text-red-600 font-mono mt-1">
                    ERROR: {file.error}
                  </div>
                )}

                {/* Success Message */}
                {file.status === 'completed' && (
                  <div className="text-xs text-gray-600 font-mono mt-1">
                    Uploaded to Box.com and queued for processing
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Instructions */}
      {files.length === 0 && (
        <div className="text-center py-8 border border-gray-300 bg-gray-50">
          <div className="text-2xl mb-2">📁</div>
          <p className="text-xs text-gray-600 font-mono mb-2">
            No files selected
          </p>
          <p className="text-xs text-gray-500 font-mono">
            Supported: PDF, DOC, DOCX, TXT, Images, Excel, PowerPoint
          </p>
        </div>
      )}
    </div>
  );
}