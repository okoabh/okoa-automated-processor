"use client";

import React, { useState } from 'react';
import { InteractiveButton } from '@/components/ascii/InteractiveButton';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFolderCreated: (folderId: string, folderName: string) => void;
}

export function CreateFolderModal({ isOpen, onClose, onFolderCreated }: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/folders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: folderName.trim() })
      });

      if (!response.ok) {
        throw new Error('Failed to create folder');
      }

      const { folderId } = await response.json();
      onFolderCreated(folderId, folderName.trim());
      onClose();
      setFolderName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-japanese-ink-charcoal bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-okoa-bg-primary border-thin border-okoa-fg-primary max-w-md w-full shadow-elevated">
        
        {/* Header */}
        <div className="bg-okoa-terminal-bg text-okoa-fg-primary p-4 border-b-thin border-okoa-fg-primary">
          <div className="font-mono text-sm leading-tight whitespace-pre">
{`┌─────────────────────────────────────────────────────┐
│                   CREATE FOLDER                     │
└─────────────────────────────────────────────────────┘`}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          
          {/* Folder Name Input */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-okoa-fg-primary font-mono mb-2">
              FOLDER NAME
            </label>
            <input
              type="text"
              required
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="w-full p-3 border-thin border-okoa-fg-primary bg-okoa-bg-secondary text-okoa-fg-primary font-mono text-sm focus:outline-none focus:border-okoa-interactive-primary transition-colors duration-normal"
              placeholder="Enter folder name..."
              maxLength={50}
            />
            <p className="text-xs text-okoa-fg-secondary font-mono mt-1">
              This will create a Box.com folder and processing workspace
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-okoa-bg-secondary border-thin border-okoa-fg-primary p-3 mb-4">
              <div className="text-xs font-mono text-okoa-fg-primary">
                ERROR: {error}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <InteractiveButton
              onClick={onClose}
              variant="secondary"
              disabled={isCreating}
              className="flex-1"
            >
              CANCEL
            </InteractiveButton>
            
            <InteractiveButton
              type="submit"
              variant="primary"
              disabled={isCreating || !folderName.trim()}
              className="flex-1"
            >
              {isCreating ? 'CREATING...' : 'CREATE FOLDER'}
            </InteractiveButton>
          </div>
        </form>
      </div>
    </div>
  );
}