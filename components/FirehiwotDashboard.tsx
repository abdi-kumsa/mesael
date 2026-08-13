'use client';

import React from 'react';
import { RequisitionDesk } from '@/components/RequisitionDesk';

export const FirehiwotDashboard = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Office Engineering
          </div>
          <h1 className="font-serif text-3xl font-semibold text-[#15181e] mt-0.5">
            Welcome, Firehiwot
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage site requests and ensure budgets are protected before issuing requisitions.
          </p>
        </div>
      </div>

      <RequisitionDesk />
    </div>
  );
};
