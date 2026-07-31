'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Bot, ChevronRight, Zap } from 'lucide-react';

export function FloatingAIButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'gemma'; text: string; time: string }>>([
    {
      sender: 'gemma',
      text: "👋 Hi! I'm Gemma AI, your 24/7 Kindra civic assistant. How can I help you make kindness count today?",
      time: 'Just now',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg = {
      sender: 'user' as const,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    // Simulate Gemma AI response
    setTimeout(() => {
      let gemmaReply = "I've logged your query! Gemma AI Vision and verified location mapping are ready to analyze photo evidence or guide you to local volunteer missions.";
      
      const lower = text.toLowerCase();
      if (lower.includes('tree') || lower.includes('plant')) {
        gemmaReply = "🌱 Great initiative! We have active urban reforestation drives in Karnataka (8,420 trees planted) and Maharashtra. Submit a sapling photo for +50 instant Karma!";
      } else if (lower.includes('pothole') || lower.includes('report')) {
        gemmaReply = "🚨 To report a pothole or civic hazard, click 'Report Issue' in your dashboard. Upload a photo, and Gemma AI Vision will automatically route it to the PWD department within 30 seconds.";
      } else if (lower.includes('karma') || lower.includes('reward')) {
        gemmaReply = "🏆 You earn Karma by completing verified good deeds. Karma points can be redeemed for local coffee vouchers, public transport passes, or eco-badges!";
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'gemma',
          text: gemmaReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <>
      {/* Floating Circular Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 pointer-events-auto">
        {/* Tooltip hint on hover */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 text-white text-xs font-semibold shadow-lg border border-slate-700/60 backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Ask Gemma AI</span>
          </motion.div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group w-14 h-14 rounded-full bg-gradient-to-tr from-primary via-indigo-600 to-emerald-500 text-white shadow-[0_8px_30px_rgba(0,82,204,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-white/20"
          title="Ask Gemma AI Assistant"
          aria-label="Ask Gemma AI Assistant"
        >
          {/* Subtle Pulse Animation */}
          {!isOpen && (
            <span className="absolute -inset-1 rounded-full bg-primary/30 animate-ping pointer-events-none opacity-75" />
          )}

          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <div className="relative flex items-center justify-center">
              <Bot className="w-7 h-7 text-white group-hover:rotate-12 transition-transform" />
              <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
          )}
        </button>
      </div>

      {/* Expandable Gemma Chat Panel Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
            className="fixed bottom-24 right-6 z-50 w-[92vw] sm:w-[380px] max-h-[540px] h-[520px] bg-surface-container-lowest/95 backdrop-blur-xl border border-outline-variant/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-primary/10 via-indigo-500/10 to-emerald-500/10 border-b border-outline-variant/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white shadow-sm">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                    Gemma AI Assistant
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </h3>
                  <p className="text-[11px] text-on-surface-variant font-medium">24/7 Verified Civic Intelligence</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-4 py-2 bg-surface-container-low/50 border-b border-outline-variant/20 flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <button
                onClick={() => handleSendMessage('How do I report a pothole?')}
                className="px-2.5 py-1 rounded-full bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-primary hover:border-primary/40 whitespace-nowrap transition-colors flex items-center gap-1 shrink-0"
              >
                <Zap className="w-3 h-3 text-amber-500" />
                Report Pothole
              </button>
              <button
                onClick={() => handleSendMessage('How to earn Karma?')}
                className="px-2.5 py-1 rounded-full bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-primary hover:border-primary/40 whitespace-nowrap transition-colors flex items-center gap-1 shrink-0"
              >
                Earn Karma
              </button>
              <button
                onClick={() => handleSendMessage('Tree planting drives')}
                className="px-2.5 py-1 rounded-full bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-primary hover:border-primary/40 whitespace-nowrap transition-colors flex items-center gap-1 shrink-0"
              >
                Tree Planting
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-primary text-on-primary rounded-tr-none font-medium'
                        : 'bg-surface-container-high/70 text-on-surface border border-outline-variant/30 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-on-surface-variant/70 mt-1 px-1">{msg.time}</span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-surface-container-high/60 border border-outline-variant/20 text-xs text-on-surface-variant w-24">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
            </div>

            {/* Input Footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-surface-container-lowest border-t border-outline-variant/20 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask Gemma anything about civic missions..."
                className="flex-1 bg-surface border border-outline-variant/40 rounded-xl px-3 py-2 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="w-8 h-8 rounded-xl bg-primary text-on-primary flex items-center justify-center disabled:opacity-40 hover:bg-blue-600 transition-colors cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
