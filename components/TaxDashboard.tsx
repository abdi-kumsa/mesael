'use client';

import React from 'react';
import useSWR, { mutate } from 'swr';
import { FileText, CheckCircle2 } from 'lucide-react';
import { ToastMessage } from '@/components/ToastContainer';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface TaxDashboardProps {
  onAddToast: (title: string, message: string, type: 'success' | 'warning' | 'info') => void;
}

export const TaxDashboard: React.FC<TaxDashboardProps> = ({ onAddToast }) => {
  const { data: statData } = useSWR('/api/payroll/statutory', fetcher);
  const liabilities = statData?.data || [];

  const handleSettleLiability = async (id: string) => {
    const ref = prompt("Enter the bank payment reference number:");
    if (!ref) return;

    try {
      const res = await fetch('/api/payroll/statutory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liabilityId: id, paymentRef: ref })
      });
      const result = await res.json();
      if (result.success) {
        mutate('/api/payroll/statutory');
        onAddToast('Success', 'Statutory liability marked as paid.', 'success');
      } else {
        onAddToast('Error', result.message, 'warning');
      }
    } catch {}
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Statutory Compliance</div>
          <h1 className="font-serif text-3xl font-semibold text-[#15181e] mt-0.5">Tax & Pension</h1>
          <p className="text-xs text-gray-500 mt-1">Manage monthly filings and track clearance of statutory liabilities.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-[#15181e]">Statutory Liabilities Queue</h3>
        </div>
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-400 font-bold">
              <th className="py-2">Period</th>
              <th className="py-2">Type</th>
              <th className="py-2 text-right">Amount</th>
              <th className="py-2">Due Date</th>
              <th className="py-2">Status</th>
              <th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {liabilities.length === 0 ? (
              <tr><td colSpan={6} className="py-4 text-center text-xs text-gray-500">No liabilities found.</td></tr>
            ) : (
              liabilities.map((liab: any) => (
                <tr key={liab.id}>
                  <td className="py-3 font-medium">{liab.periodMonth}/{liab.periodYear}</td>
                  <td className="py-3 text-xs font-bold text-gray-700">{liab.type.replace('_', ' ')}</td>
                  <td className="py-3 text-right font-mono font-bold text-red-600">Br {liab.amount.toLocaleString()}</td>
                  <td className="py-3 text-xs">{new Date(liab.dueDate).toLocaleDateString()}</td>
                  <td className="py-3">
                    {liab.status === 'PAID' ? (
                      <span className="text-green-700 bg-green-50 px-2 py-1 rounded text-[10px] font-bold uppercase">Paid ({liab.paymentRef})</span>
                    ) : (
                      <span className="text-red-700 bg-red-50 px-2 py-1 rounded text-[10px] font-bold uppercase">Unpaid</span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    {liab.status !== 'PAID' && (
                      <button onClick={() => handleSettleLiability(liab.id)} className="px-3 py-1.5 text-xs font-bold bg-[#15181e] text-white rounded hover:bg-[#c1540f]">Mark as Paid</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
