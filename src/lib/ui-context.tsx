import React, { createContext, useContext, useState, useCallback } from 'react';
import { InquiryForm } from '../components/InquiryForm';

interface UIContextType {
  openInquiry: () => void;
  closeInquiry: () => void;
}

const UIContext = createContext<UIContextType | null>(null);

export const UIProvider = ({ children }: { children: React.ReactNode }) => {
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  const openInquiry = useCallback(() => setIsInquiryOpen(true), []);
  const closeInquiry = useCallback(() => setIsInquiryOpen(false), []);

  const value = React.useMemo(() => ({ openInquiry, closeInquiry }), [openInquiry, closeInquiry]);

  return (
    <UIContext.Provider value={value}>
      {children}
      <InquiryForm isOpen={isInquiryOpen} onClose={closeInquiry} />
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
};
