'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants, Transition } from 'framer-motion';
import { X } from 'lucide-react';

interface DialogContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  variants?: Variants;
  transition?: Transition;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export interface DialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  variants?: Variants;
  transition?: Transition;
}

export function Dialog({
  children,
  open: controlledOpen,
  onOpenChange,
  variants,
  transition,
}: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

  const isOpen = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setIsOpen = (value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value);
    }
    setUncontrolledOpen(value);
  };

  return (
    <DialogContext.Provider value={{ isOpen, setIsOpen, variants, transition }}>
      {children}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a Dialog');
  }
  return context;
}

export interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export function DialogTrigger({ children, className = '', ...props }: DialogTriggerProps) {
  const { setIsOpen } = useDialog();
  return (
    <button
      type="button"
      onClick={() => setIsOpen(true)}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

export interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

const defaultVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 10 },
};

const defaultTransition: Transition = {
  type: 'spring',
  duration: 0.3,
  bounce: 0,
};

export function DialogContent({ children, className = '' }: DialogContentProps) {
  const { isOpen, setIsOpen, variants, transition } = useDialog();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, setIsOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog Container */}
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants || defaultVariants}
            transition={transition || defaultTransition}
            className={`relative z-10 rounded-2xl shadow-2xl overflow-hidden ${className}`}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function DialogHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex flex-col space-y-1.5 ${className}`}>{children}</div>;
}

export function DialogTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h2>;
}

export function DialogDescription({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>;
}

export function DialogClose({ className = '' }: { className?: string }) {
  const { setIsOpen } = useDialog();
  return (
    <button
      type="button"
      onClick={() => setIsOpen(false)}
      className={`absolute right-4 top-4 rounded-full p-1.5 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}
      aria-label="Close"
    >
      <X className="h-4 w-4" />
    </button>
  );
}
