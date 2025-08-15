"use client";

import { useState, useEffect } from 'react';
import { InteractiveButton } from '@/components/ascii/InteractiveButton';
import { CreateFolderModal } from '@/components/deals/CreateFolderModal';
import { SimpleFileUpload } from '@/components/SimpleFileUpload';
import Link from 'next/link';

interface Folder {
  _id: string;
  name: string;
  status: string;
  createdAt: number;
  documentCount: number;
  boxFolderId?: string;
}

export default function FoldersPage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      const response = await fetch('/api/folders/list');
      if (response.ok) {
        const data = await response.json();
        setFolders(data.folders || []);
      }
    } catch (error) {
      console.error('Failed to load folders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFolderCreated = () => {
    loadFolders();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 font-mono">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="text-sm font-mono">LOADING FOLDERS...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-okoa-bg-primary dark:bg-japanese-ink-charcoal text-okoa-fg-primary dark:text-japanese-paper-warm font-mono transition-colors duration-normal">
      <div className="max-w-4xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="border-b border-gray-300 pb-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold font-mono mb-2">DOCUMENT FOLDERS</h1>
              <p className="text-sm text-gray-600 font-mono">
                Create folders and upload documents for automatic processing
              </p>
            </div>
            
            <div className="flex space-x-4">
              <Link href="/">
                <InteractiveButton variant="secondary">
                  ← BACK
                </InteractiveButton>
              </Link>
              
              <InteractiveButton 
                onClick={() => setShowCreateFolder(true)}
                variant="primary"
              >
                + CREATE FOLDER
              </InteractiveButton>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {folders.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white border-2 border-gray-900 p-8">
              <div className="text-2xl mb-4">📁</div>
              <h3 className="text-sm font-bold font-mono mb-2">NO FOLDERS FOUND</h3>
              <p className="text-xs text-gray-600 font-mono mb-4">
                Create your first folder to start uploading and processing documents
              </p>
              <InteractiveButton 
                onClick={() => setShowCreateFolder(true)}
                variant="primary"
              >
                CREATE FIRST FOLDER
              </InteractiveButton>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Folder List */}
            <div>
              <h2 className="text-sm font-bold font-mono mb-4">
                FOLDERS ({folders.length})
              </h2>
              
              <div className="space-y-3">
                {folders.map((folder) => (
                  <div 
                    key={folder._id} 
                    className={`bg-white border-2 p-4 cursor-pointer transition-all ${
                      selectedFolder?._id === folder._id 
                        ? 'border-gray-900 shadow-md' 
                        : 'border-gray-300 hover:border-gray-500'
                    }`}
                    onClick={() => setSelectedFolder(folder)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-sm font-mono text-gray-900">
                        📁 {folder.name.toUpperCase()}
                      </h3>
                      <span className="text-xs font-mono text-gray-600">
                        {folder.documentCount} docs
                      </span>
                    </div>
                    
                    <div className="text-xs font-mono text-gray-500">
                      Created: {formatDate(folder.createdAt)}
                    </div>
                    
                    <div className="text-xs font-mono text-gray-500">
                      Box: {folder.boxFolderId ? '✅ Connected' : '❌ Not Setup'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Folder Actions */}
            <div>
              {selectedFolder ? (
                <div>
                  <h2 className="text-sm font-bold font-mono mb-4">
                    FOLDER ACTIONS
                  </h2>
                  
                  <div className="bg-white border-2 border-gray-900 p-4 mb-4">
                    <h3 className="text-sm font-bold font-mono mb-3">
                      {selectedFolder.name.toUpperCase()}
                    </h3>
                    
                    <div className="space-y-3">
                      <InteractiveButton 
                        onClick={() => setShowFileUpload(true)}
                        variant="primary"
                        className="w-full"
                        disabled={!selectedFolder.boxFolderId}
                      >
                        📤 UPLOAD DOCUMENTS
                      </InteractiveButton>
                      
                      {selectedFolder.boxFolderId && (
                        <InteractiveButton 
                          onClick={() => window.open(`https://app.box.com/folder/${selectedFolder.boxFolderId}`, '_blank')}
                          variant="secondary"
                          className="w-full"
                        >
                          📁 OPEN IN BOX.COM
                        </InteractiveButton>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-100 border border-gray-300 p-4">
                    <h4 className="text-xs font-bold font-mono mb-2">FOLDER INFO</h4>
                    <div className="space-y-1 text-xs font-mono">
                      <div>STATUS: {selectedFolder.status}</div>
                      <div>DOCUMENTS: {selectedFolder.documentCount}</div>
                      <div>CREATED: {formatDate(selectedFolder.createdAt)}</div>
                      <div>BOX ID: {selectedFolder.boxFolderId || 'Not connected'}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 border border-gray-300 p-8 text-center">
                  <div className="text-2xl mb-4">👆</div>
                  <p className="text-sm text-gray-600 font-mono">
                    SELECT A FOLDER TO VIEW OPTIONS
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Folder Modal */}
        <CreateFolderModal 
          isOpen={showCreateFolder}
          onClose={() => setShowCreateFolder(false)}
          onFolderCreated={handleFolderCreated}
        />

        {/* File Upload Modal */}
        {showFileUpload && selectedFolder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-50 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-4 border-b border-gray-300 flex items-center justify-between">
                <h2 className="text-sm font-bold font-mono">UPLOAD DOCUMENTS</h2>
                <button 
                  onClick={() => setShowFileUpload(false)}
                  className="text-gray-600 hover:text-gray-900 font-mono"
                >
                  ✕ CLOSE
                </button>
              </div>
              <div className="p-4">
                <SimpleFileUpload 
                  folderId={selectedFolder._id}
                  folderName={selectedFolder.name}
                  onUploadComplete={(count) => {
                    console.log(`${count} files uploaded`);
                    setShowFileUpload(false);
                    loadFolders(); // Refresh to update document counts
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}