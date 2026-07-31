'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TreePine, AlertTriangle, HeartHandshake, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (tab: string) => void;
}

const SEARCH_ITEMS = [
  { id: '1', title: 'Urban Reforestation & Tree Planting', category: 'Volunteer Tasks', tab: 'volunteer_tasks', icon: TreePine },
  { id: '2', title: 'Report Road Pothole or Infrastructure Defect', category: 'Report Issue', tab: 'report_issue', icon: AlertTriangle },
  { id: '3', title: 'Green Karnataka Sapling Campaign', category: 'Campaigns', tab: 'campaigns', icon: TreePine },
  { id: '4', title: 'Redeem Eco Coffee Voucher (-150 Karma)', category: 'Rewards', tab: 'redeem_rewards', icon: HeartHandshake },
  { id: '5', title: 'Blood Donation Drive Week', category: 'Campaigns', tab: 'campaigns', icon: HeartHandshake },
];

export function SearchModal({ isOpen, onClose, onSelectAction }: SearchModalProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredItems = SEARCH_ITEMS.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', bounce: 0.1, duration: 0.3 }}
            className="relative z-10 w-full max-w-xl bg-surface-container-lowest border border-outline-variant/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Input Header */}
            <div className="p-4 border-b border-outline-variant/20 flex items-center gap-3">
              <Search className="w-5 h-5 text-primary shrink-0" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search civic missions, campaigns, rewards, tasks..."
                className="w-full bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/60 outline-none"
              />
              {query && (
                <button onClick={() => setQuery('')} className="p-1 text-on-surface-variant hover:text-on-surface">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Results List */}
            <div className="p-3 max-h-80 overflow-y-auto flex flex-col gap-1">
              {filteredItems.length === 0 ? (
                <div className="p-8 text-center text-xs text-on-surface-variant font-medium">
                  No matching missions found. Try searching &quot;tree&quot;, &quot;pothole&quot;, or &quot;rewards&quot;.
                </div>
              ) : (
                filteredItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectAction(item.tab);
                        onClose();
                      }}
                      className="w-full p-3 rounded-2xl flex items-center justify-between hover:bg-primary-container/10 hover:border-primary/20 border border-transparent transition-all group text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">{item.title}</h4>
                          <span className="text-[10px] text-on-surface-variant font-semibold">{item.category}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-on-surface-variant group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-surface-container-low/60 border-t border-outline-variant/20 flex justify-between items-center text-[10px] text-on-surface-variant font-medium">
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-surface border border-outline-variant/40 font-mono text-[9px]">ESC</kbd> to exit</span>
              <span className="font-semibold text-primary">KINDRA Search Engine</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
