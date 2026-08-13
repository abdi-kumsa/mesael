'use client';

import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'warning' | 'info';
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-[300] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-[#15181e] text-white rounded-xl p-3.5 text-xs sm:text-sm shadow-2xl flex items-start gap-3 border border-white/10 animate-fade-in"
        >
          <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-brand-400">{toast.title}</div>
            <div className="text-gray-300 mt-0.5 text-xs leading-relaxed">{toast.message}</div>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-gray-400 hover:text-white text-xs p-1"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};
