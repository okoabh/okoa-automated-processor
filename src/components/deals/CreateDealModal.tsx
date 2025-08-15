"use client";

import React, { useState } from 'react';
import { InteractiveButton } from '@/components/ascii/InteractiveButton';

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDealCreated: (dealId: string) => void;
}

interface DealFormData {
  name: string;
  description: string;
  dealType: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  expectedCloseDate?: string;
  dealSize?: string;
  notes?: string;
}

export function CreateDealModal({ isOpen, onClose, onDealCreated }: CreateDealModalProps) {
  const [formData, setFormData] = useState<DealFormData>({
    name: '',
    description: '',
    dealType: 'real-estate',
    priority: 'MEDIUM',
    expectedCloseDate: '',
    dealSize: '',
    notes: ''
  });
  
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/deals/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to create deal');
      }

      const { dealId } = await response.json();
      onDealCreated(dealId);
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        dealType: 'real-estate',
        priority: 'MEDIUM',
        expectedCloseDate: '',
        dealSize: '',
        notes: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  const handleChange = (field: keyof DealFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-50 border-2 border-gray-900 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        
        {/* Header */}
        <div className="bg-gray-900 text-gray-50 p-4 border-b-2 border-gray-900">
          <div className="font-mono text-sm leading-tight whitespace-pre">
{`┌─────────────────────────────────────────────────────────────────┐
│                         CREATE NEW DEAL                        │
└─────────────────────────────────────────────────────────────────┘`}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Deal Name */}
          <div>
            <label className="block text-xs font-bold text-gray-900 font-mono mb-2">
              DEAL NAME *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full p-3 border-2 border-gray-900 bg-white text-gray-900 font-mono text-sm focus:outline-none focus:ring-0"
              placeholder="Enter deal name..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-900 font-mono mb-2">
              DESCRIPTION *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full p-3 border-2 border-gray-900 bg-white text-gray-900 font-mono text-sm resize-none focus:outline-none focus:ring-0"
              placeholder="Describe the deal..."
            />
          </div>

          {/* Deal Type & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-900 font-mono mb-2">
                DEAL TYPE
              </label>
              <select
                value={formData.dealType}
                onChange={(e) => handleChange('dealType', e.target.value)}
                className="w-full p-3 border-2 border-gray-900 bg-white text-gray-900 font-mono text-sm focus:outline-none focus:ring-0"
              >
                <option value="real-estate">Real Estate</option>
                <option value="acquisition">Acquisition</option>
                <option value="investment">Investment</option>
                <option value="partnership">Partnership</option>
                <option value="development">Development</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-900 font-mono mb-2">
                PRIORITY
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
                className="w-full p-3 border-2 border-gray-900 bg-white text-gray-900 font-mono text-sm focus:outline-none focus:ring-0"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>
          </div>

          {/* Expected Close Date & Deal Size */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-900 font-mono mb-2">
                EXPECTED CLOSE DATE
              </label>
              <input
                type="date"
                value={formData.expectedCloseDate}
                onChange={(e) => handleChange('expectedCloseDate', e.target.value)}
                className="w-full p-3 border-2 border-gray-900 bg-white text-gray-900 font-mono text-sm focus:outline-none focus:ring-0"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-900 font-mono mb-2">
                DEAL SIZE
              </label>
              <input
                type="text"
                value={formData.dealSize}
                onChange={(e) => handleChange('dealSize', e.target.value)}
                className="w-full p-3 border-2 border-gray-900 bg-white text-gray-900 font-mono text-sm focus:outline-none focus:ring-0"
                placeholder="e.g., $5M, Large scale, etc."
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-900 font-mono mb-2">
              ADDITIONAL NOTES
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              className="w-full p-3 border-2 border-gray-900 bg-white text-gray-900 font-mono text-sm resize-none focus:outline-none focus:ring-0"
              placeholder="Additional information..."
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-white border-2 border-gray-900 p-4">
              <div className="text-xs font-mono text-red-600">
                ERROR: {error}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-6 border-t border-gray-300">
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
              disabled={isCreating}
              className="flex-1"
            >
              {isCreating ? 'CREATING...' : 'CREATE DEAL'}
            </InteractiveButton>
          </div>
        </form>
      </div>
    </div>
  );
}