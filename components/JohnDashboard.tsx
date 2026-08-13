'use client';

import React from 'react';
import { GRNCapture } from '@/components/GRNCapture';

export const JohnDashboard = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Site Management
          </div>
          <h1 className="font-serif text-3xl font-semibold text-[#15181e] mt-0.5">
            Welcome, John
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Log incoming deliveries and generate Goods Receiving Notes (GRN).
          </p>
        </div>
      </div>

      <GRNCapture />
    </div>
  );
};
