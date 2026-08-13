'use client';

import React, { useState } from 'react';
import { SupplierMaster } from '@/components/SupplierMaster';
import { PurchaseOrderList } from '@/components/PurchaseOrderList';

export const SamuelDashboard = ({ activeTab }: { activeTab: string }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Procurement Division
          </div>
          <h1 className="font-serif text-3xl font-semibold text-[#15181e] mt-0.5">
            Welcome, Samuel
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Convert requisitions to purchase orders, and manage supplier master data.
          </p>
        </div>
      </div>

      {activeTab === 'dashboard' ? (
        <PurchaseOrderList />
      ) : activeTab === 'suppliers' ? (
        <SupplierMaster />
      ) : (
        <div className="p-8 text-center text-sm font-bold text-gray-400">Select a tab from the sidebar.</div>
      )}
    </div>
  );
};
