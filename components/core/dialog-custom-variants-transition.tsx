'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogDescription,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/core/dialog';
import { Variants, Transition } from 'framer-motion';

export function DialogCustomVariantsTransition() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const customVariants: Variants = {
    initial: {
      scale: 0.9,
      filter: 'blur(10px)',
      y: '100%',
    },
    animate: {
      scale: 1,
      filter: 'blur(0px)',
      y: 0,
    },
  };

  const customTransition: Transition = {
    type: 'spring',
    bounce: 0,
    duration: 0.4,
  };

  return (
    <Dialog variants={customVariants} transition={customTransition}>
      <DialogTrigger className="bg-primary text-on-primary px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary-container transition-colors cursor-pointer">
        Join the waitlist
      </DialogTrigger>
      <DialogContent className="w-full max-w-md bg-surface-container-lowest p-6 border border-outline-variant/30 text-on-surface">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-on-surface">
            Join the waitlist
          </DialogTitle>
          <DialogDescription className="text-sm text-on-surface-variant mt-1">
            Enter your email address to receive updates when we launch.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="mt-6 p-4 bg-emerald-500/10 text-emerald-600 rounded-xl font-bold text-sm text-center border border-emerald-500/20">
            ✓ Thank you! You&apos;ve been added to the KINDRA waitlist.
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email) setSubmitted(true);
            }}
            className="mt-6 flex flex-col space-y-4"
          >
            <label htmlFor="waitlist-email" className="sr-only">
              Email
            </label>
            <input
              id="waitlist-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 w-full rounded-xl border border-outline-variant/40 bg-surface px-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your email"
              required
            />
            <button
              className="inline-flex items-center justify-center self-end rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary hover:bg-primary-container transition-colors cursor-pointer"
              type="submit"
            >
              Join now
            </button>
          </form>
        )}
        <DialogClose />
      </DialogContent>
    </Dialog>
  );
}
