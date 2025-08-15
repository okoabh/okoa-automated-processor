"use client";

import { useState, useEffect } from 'react';
import { InteractiveButton } from '@/components/ascii/InteractiveButton';
import { CreateDealModal } from '@/components/deals/CreateDealModal';
import { FileUpload } from '@/components/deals/FileUpload';
import Link from 'next/link';

interface Deal {
  _id: string;
  name: string;
  description: string;
  dealType: string;
  status: string;
  priority: string;
  createdAt: string;
  metadata?: {
    boxFolderId?: string;
    dealSize?: string;
    phase?: string;
  };
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showCreateDeal, setShowCreateDeal] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    try {
      const response = await fetch('/api/deals/list');
      if (response.ok) {
        const data = await response.json();
        setDeals(data.deals || []);
      }
    } catch (error) {
      console.error('Failed to load deals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDealCreated = (dealId: string) => {
    loadDeals(); // Refresh the list
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600';
      case 'MEDIUM': return 'text-yellow-600';
      case 'LOW': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 font-mono">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="text-sm font-mono">LOADING DEALS...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-mono">
      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="border-b border-gray-300 pb-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold font-mono mb-2">DEAL MANAGEMENT</h1>
              <p className="text-sm text-gray-600 font-mono">
                Create deals, upload documents, and manage processing workflows
              </p>
            </div>
            
            <div className="flex space-x-4">
              <Link href="/">
                <InteractiveButton variant="secondary">
                  ← BACK TO DASHBOARD
                </InteractiveButton>
              </Link>
              
              <InteractiveButton 
                onClick={() => setShowCreateDeal(true)}
                variant="primary"
              >
                + CREATE DEAL
              </InteractiveButton>
            </div>
          </div>
        </div>

        {/* Deals List */}
        {deals.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white border-2 border-gray-900 p-8">
              <div className="text-2xl mb-4">📋</div>
              <h3 className="text-sm font-bold font-mono mb-2">NO DEALS FOUND</h3>
              <p className="text-xs text-gray-600 font-mono mb-4">
                Create your first deal to get started with document processing
              </p>
              <InteractiveButton 
                onClick={() => setShowCreateDeal(true)}
                variant="primary"
              >
                CREATE FIRST DEAL
              </InteractiveButton>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Deal Cards */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold font-mono mb-4">
                ACTIVE DEALS ({deals.length})
              </h2>
              
              {deals.map((deal) => (
                <div 
                  key={deal._id} 
                  className={`bg-white border-2 p-4 cursor-pointer transition-all ${
                    selectedDeal?._id === deal._id 
                      ? 'border-gray-900 shadow-md' 
                      : 'border-gray-300 hover:border-gray-500'
                  }`}
                  onClick={() => setSelectedDeal(deal)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-sm font-mono text-gray-900">
                      {deal.name.toUpperCase()}
                    </h3>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-mono ${getPriorityColor(deal.priority)}`}>
                        {deal.priority}
                      </span>
                      <span className="text-xs font-mono text-gray-500">
                        {deal.status}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 font-mono mb-3 line-clamp-2">
                    {deal.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-gray-500">TYPE:</span>
                      <span className="ml-2 text-gray-900">{deal.dealType}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">CREATED:</span>
                      <span className="ml-2 text-gray-900">{formatDate(deal.createdAt)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">PHASE:</span>
                      <span className="ml-2 text-gray-900">{deal.metadata?.phase || 'Setup'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">BOX:</span>
                      <span className="ml-2 text-gray-900">
                        {deal.metadata?.boxFolderId ? '✅ Connected' : '❌ Not Setup'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Deal Actions */}
            <div>
              {selectedDeal ? (
                <div className="space-y-6">
                  <div className="bg-white border-2 border-gray-900 p-4">
                    <h2 className="text-sm font-bold font-mono mb-4">
                      DEAL ACTIONS - {selectedDeal.name.toUpperCase()}
                    </h2>
                    
                    <div className="space-y-3">
                      <InteractiveButton 
                        onClick={() => setShowFileUpload(true)}
                        variant="primary"
                        className="w-full"
                        disabled={!selectedDeal.metadata?.boxFolderId}
                      >
                        📤 UPLOAD DOCUMENTS
                      </InteractiveButton>
                      
                      <InteractiveButton 
                        onClick={() => window.open(`https://box.com/folder/${selectedDeal.metadata?.boxFolderId}`, '_blank')}
                        variant="secondary"
                        className="w-full"
                        disabled={!selectedDeal.metadata?.boxFolderId}
                      >
                        📁 OPEN BOX FOLDER
                      </InteractiveButton>
                      
                      <InteractiveButton 
                        onClick={() => console.log('View processing history')}
                        variant="secondary"
                        className="w-full"
                      >
                        📊 VIEW PROCESSING HISTORY
                      </InteractiveButton>
                      
                      <InteractiveButton 
                        onClick={() => console.log('Deal settings')}
                        variant="secondary"
                        className="w-full"
                      >
                        ⚙️ DEAL SETTINGS
                      </InteractiveButton>
                    </div>
                  </div>

                  {/* Deal Details */}
                  <div className="bg-gray-100 border border-gray-300 p-4">
                    <h3 className="text-xs font-bold font-mono mb-3">DEAL INFORMATION</h3>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="grid grid-cols-2 gap-2">
                        <span className="text-gray-600">ID:</span>
                        <span className="text-gray-900 break-all">{selectedDeal._id}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <span className="text-gray-600">TYPE:</span>
                        <span className="text-gray-900">{selectedDeal.dealType}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <span className="text-gray-600">STATUS:</span>
                        <span className="text-gray-900">{selectedDeal.status}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <span className="text-gray-600">SIZE:</span>
                        <span className="text-gray-900">{selectedDeal.metadata?.dealSize || 'Not specified'}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <span className="text-gray-600">BOX FOLDER:</span>
                        <span className="text-gray-900">{selectedDeal.metadata?.boxFolderId || 'Not created'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 border border-gray-300 p-8 text-center">
                  <div className="text-2xl mb-4">👆</div>
                  <p className="text-sm text-gray-600 font-mono">
                    SELECT A DEAL FROM THE LIST TO VIEW ACTIONS AND DETAILS
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modals */}
        <CreateDealModal 
          isOpen={showCreateDeal}
          onClose={() => setShowCreateDeal(false)}
          onDealCreated={handleDealCreated}
        />

        {showFileUpload && selectedDeal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-50 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-4 border-b border-gray-300 flex items-center justify-between">
                <h2 className="text-sm font-bold font-mono">FILE UPLOAD</h2>
                <button 
                  onClick={() => setShowFileUpload(false)}
                  className="text-gray-600 hover:text-gray-900 font-mono"
                >
                  ✕ CLOSE
                </button>
              </div>
              <div className="p-4">
                <FileUpload 
                  dealId={selectedDeal._id}
                  dealName={selectedDeal.name}
                  onUploadComplete={(files) => {
                    console.log('Files uploaded:', files);
                    setShowFileUpload(false);
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