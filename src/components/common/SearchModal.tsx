// File: SearchModal.tsx
// Path: /src/components/common/SearchModal.tsx
// Search modal component

'use client';

import React, { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useTheme } from '@/lib/contexts/ThemeContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { theme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center pt-20"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div 
        className={`relative w-full max-w-2xl mx-4 rounded-2xl shadow-2xl ${
          theme === 'dark' 
            ? 'bg-[#1a1a1a] border border-[#2a2a2a]' 
            : 'bg-white border border-[#e0e0e0]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-current/10">
          <Search className="w-5 h-5 text-[#009ae9]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search members, products, services..."
            className={`flex-1 bg-transparent outline-none text-lg ${
              theme === 'dark' ? 'text-[#f5f5f5]' : 'text-[#1a1a1a]'
            }`}
          />
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-[#2a2a2a] text-[#f5f5f5]'
                : 'hover:bg-[#f5f5f5] text-[#1a1a1a]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="p-4">
          <p className={`text-sm ${
            theme === 'dark' ? 'text-[#b3b3b3]' : 'text-[#666666]'
          }`}>
            Start typing to search...
          </p>
        </div>
      </div>
    </div>
  );
}