"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { track } from './telemetry';

// The inquiry modal (dialog + select + form stack) is heavy and global —
// load it on the first open instead of shipping it in every page's bundle.
const InquiryForm = dynamic(
  () => import('../components/InquiryForm').then((m) => m.InquiryForm),
  { ssr: false },
);

interface UIContextType {
  openInquiry: () => void;
  closeInquiry: () => void;
}

const UIContext = createContext<UIContextType | null>(null);

export const UIProvider = ({ children }: { children: React.ReactNode }) => {
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  // Mount the modal only after the first open; keep it mounted afterwards so
  // the close animation and form state behave exactly as before.
  const [everOpened, setEverOpened] = useState(false);

  const openInquiry = useCallback(() => {
    track('inquiry_open');
    setEverOpened(true);
    setIsInquiryOpen(true);
  }, []);
  const closeInquiry = useCallback(() => {
    track('inquiry_close');
    setIsInquiryOpen(false);
  }, []);

  const value = React.useMemo(() => ({ openInquiry, closeInquiry }), [openInquiry, closeInquiry]);

  return (
    <UIContext.Provider value={value}>
      {children}
      {everOpened && <InquiryForm isOpen={isInquiryOpen} onClose={closeInquiry} />}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
};
