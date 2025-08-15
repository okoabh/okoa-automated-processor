"use client";

import React, { useState, useRef, useEffect } from 'react';

interface TerminalInputProps {
  prompt?: string;
  placeholder?: string;
  onCommand?: (command: string) => void;
  className?: string;
  disabled?: boolean;
  initialValue?: string;
}

export function TerminalInput({
  prompt = "okoa@system:~$",
  placeholder = "Enter command...",
  onCommand,
  className = "",
  disabled = false,
  initialValue = ""
}: TerminalInputProps) {
  const [input, setInput] = useState(initialValue);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isActive, setIsActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
        if (input.trim()) {
          setHistory(prev => [input, ...prev]);
          onCommand?.(input);
          setInput('');
          setHistoryIndex(-1);
        }
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          setInput(history[newIndex]);
        }
        break;
      
      case 'ArrowDown':
        e.preventDefault();
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          setInput(history[newIndex]);
        } else if (historyIndex === 0) {
          setHistoryIndex(-1);
          setInput('');
        }
        break;
      
      case 'Tab':
        e.preventDefault();
        // Auto-complete could be implemented here
        break;
    }
  };

  return (
    <div className={`font-mono bg-black border border-gray-600 rounded ${className}`}>
      <div 
        className="flex items-center p-2 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        <span className="text-green-400 select-none mr-2">{prompt}</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsActive(true)}
          onBlur={() => setIsActive(false)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent text-white outline-none placeholder-gray-500"
        />
        <span className={`w-2 h-4 ml-1 ${isActive ? 'animate-blink bg-green-400' : 'bg-gray-600'}`} />
      </div>
    </div>
  );
}

interface TerminalFormProps {
  title: string;
  fields: Array<{
    key: string;
    label: string;
    type?: 'text' | 'number' | 'select' | 'textarea';
    options?: string[];
    required?: boolean;
    placeholder?: string;
  }>;
  onSubmit: (data: Record<string, any>) => void;
  className?: string;
}

export function TerminalForm({ title, fields, onSubmit, className = "" }: TerminalFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    fields.forEach(field => {
      if (field.required && !formData[field.key]) {
        newErrors[field.key] = `${field.label} is required`;
      }
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    onSubmit(formData);
  };

  const updateField = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const renderField = (field: any) => {
    const error = errors[field.key];
    const value = formData[field.key] || '';
    
    const baseInputClass = "bg-black border border-gray-600 text-green-400 px-2 py-1 rounded focus:border-cyan-400 outline-none font-mono";
    const errorClass = error ? "border-red-400" : "";
    
    switch (field.type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => updateField(field.key, e.target.value)}
            className={`${baseInputClass} ${errorClass}`}
          >
            <option value="">-- Select {field.label} --</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => updateField(field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className={`${baseInputClass} ${errorClass} resize-none`}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => updateField(field.key, e.target.value)}
            placeholder={field.placeholder}
            className={`${baseInputClass} ${errorClass}`}
          />
        );
      
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => updateField(field.key, e.target.value)}
            placeholder={field.placeholder}
            className={`${baseInputClass} ${errorClass}`}
          />
        );
    }
  };

  return (
    <div className={`font-mono bg-gray-900 border border-cyan-400 rounded-lg p-4 ${className}`}>
      <div className="text-center text-cyan-400 font-bold mb-4 border-b border-gray-600 pb-2">
        ═══ {title} ═══
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map(field => (
          <div key={field.key} className="space-y-1">
            <label className="text-yellow-400 text-sm flex items-center">
              {field.label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            {renderField(field)}
            {errors[field.key] && (
              <div className="text-red-400 text-xs">
                ⚠ {errors[field.key]}
              </div>
            )}
          </div>
        ))}
        
        <div className="flex space-x-2 mt-6">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-mono transition-colors"
          >
            [EXECUTE]
          </button>
          <button
            type="button"
            onClick={() => setFormData({})}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-mono transition-colors"
          >
            [RESET]
          </button>
        </div>
      </form>
    </div>
  );
}

// Specialized OKOA forms
export function NewDealForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const fields = [
    { key: 'name', label: 'Deal Name', type: 'text' as const, required: true, placeholder: 'Enter deal name...' },
    { 
      key: 'dealType', 
      label: 'Deal Type', 
      type: 'select' as const, 
      required: true,
      options: ['real-estate', 'acquisition', 'refinancing', 'development', 'commercial', 'residential']
    },
    { key: 'description', label: 'Description', type: 'textarea' as const, placeholder: 'Brief deal description...' }
  ];

  return (
    <TerminalForm
      title="CREATE NEW DEAL"
      fields={fields}
      onSubmit={onSubmit}
    />
  );
}