"use client";

import React, { useState, useRef } from 'react';
import { InteractiveButton } from '@/components/ascii/InteractiveButton';

interface SimpleFileUploadProps {
  folderId: string;
  folderName: string;
  onUploadComplete?: (count: number) => void;
}

interface UploadFile {
  file: File;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export function SimpleFileUpload({ folderId, folderName, onUploadComplete }: SimpleFileUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: UploadFile[] = Array.from(selectedFiles).map(file => ({
      file,
      status: 'pending'
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    let completedCount = 0;

    for (let i = 0; i < files.length; i++) {
      if (files[i].status !== 'pending') continue;

      // Update status to uploading
      setFiles(prev => prev.map((f, idx) => 
        idx === i ? { ...f, status: 'uploading' } : f
      ));

      try {
        const formData = new FormData();
        formData.append('file', files[i].file);
        formData.append('folderId', folderId);

        const response = await fetch('/api/folders/upload', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        // Update status to completed
        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'completed' } : f
        ));

        completedCount++;

      } catch (error) {
        // Update status to error
        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { 
            ...f, 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Upload failed' 
          } : f
        ));
      }
    }

    setIsUploading(false);
    
    if (onUploadComplete && completedCount > 0) {
      onUploadComplete(completedCount);
    }
  };

  const clearFiles = () => {
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getStatusIcon = (status: UploadFile['status']): string => {
    switch (status) {
      case 'pending': return '⏳';
      case 'uploading': return '⬆️';
      case 'completed': return '✅';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white border-2 border-gray-900 p-6">
      
      {/* Header */}
      <div className="border-b border-gray-300 pb-4 mb-6">
        <h2 className="text-sm font-bold text-gray-900 font-mono mb-2">
          UPLOAD TO: {folderName.toUpperCase()}
        </h2>
        <p className="text-xs text-gray-600 font-mono">
          Files will be automatically processed after upload
        </p>
      </div>

      {/* File Input (Hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.xlsx,.xls,.ppt,.pptx"
      />

      {/* Upload Controls */}
      <div className="space-y-4 mb-6">
        <InteractiveButton
          onClick={() => fileInputRef.current?.click()}
          variant="primary"
          disabled={isUploading}
          className="w-full"
        >
          📄 SELECT FILES
        </InteractiveButton>

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
              onClick={clearFiles}
              variant="secondary"
              disabled={isUploading}
              className="w-full"
            >
              CLEAR
            </InteractiveButton>
          </div>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="border-t border-gray-300 pt-4">
          <h3 className="text-xs font-bold text-gray-900 font-mono mb-3">
            FILES ({files.length})
          </h3>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {files.map((fileUpload, index) => (
              <div key={index} className="border border-gray-300 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{getStatusIcon(fileUpload.status)}</span>
                    <span className="text-xs font-mono text-gray-900 truncate max-w-xs">
                      {fileUpload.file.name}
                    </span>
                  </div>
                  
                  <span className="text-xs font-mono text-gray-600">
                    {formatFileSize(fileUpload.file.size)}
                  </span>
                </div>

                {fileUpload.status === 'error' && fileUpload.error && (
                  <div className="text-xs text-red-600 font-mono mt-1">
                    ERROR: {fileUpload.error}
                  </div>
                )}

                {fileUpload.status === 'completed' && (
                  <div className="text-xs text-gray-600 font-mono mt-1">
                    Uploaded and queued for processing
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {files.length === 0 && (
        <div className="text-center py-8 border border-gray-300 bg-gray-50">
          <div className="text-2xl mb-2">📁</div>
          <p className="text-xs text-gray-600 font-mono mb-2">
            No files selected
          </p>
          <p className="text-xs text-gray-500 font-mono">
            Supported: PDF, DOC, TXT, Images, Excel, PowerPoint
          </p>
        </div>
      )}
    </div>
  );
}