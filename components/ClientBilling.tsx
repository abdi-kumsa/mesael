'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { Search, FileOutput, CheckCircle, Percent } from 'lucide-react';

export const ClientBilling = ({ onToast }: { onToast: (t: string, m: string, s?: 'success'|'warning') => void }) => {
  const { data: conData } = useSWR('/api/otc/contracts', (url: string) => fetch(url).then(res => res.json()));
  const contracts = conData?.data || [];

  const { data: invData, mutate: mutateInvoices } = useSWR('/api/otc/invoices', (url: string) => fetch(url).then(res => res.json()));
  const invoices = invData?.data || [];

  const [selectedContract, setSelectedContract] = useState<string>('');
  const [milestoneName, setMilestoneName] = useState('');
  const [grossAmount, setGrossAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeContract = contracts.find((c: any) => c.id === selectedContract);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract || !milestoneName || grossAmount <= 0) {
      onToast('Validation', 'Enter a valid gross amount and milestone name.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/otc/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId: selectedContract, milestoneName, grossAmount })
      });
      const result = await res.json();
      if (result.success) {
        onToast('Invoice Raised', result.message);
        setGrossAmount(0);
        setMilestoneName('');
        mutateInvoices();
      } else {
        onToast('Error', result.message, 'warning');
      }
    } catch (err) {
      onToast('Error', 'Failed to generate Invoice', 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center text-pink-600">
            <FileOutput className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#15181e]">Client Billing</h2>
            <p className="text-xs text-gray-500 font-medium">Certify milestones and raise invoices.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
          <h3 className="font-bold text-sm text-[#15181e] mb-4">Raise Invoice</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Select Contract</label>
              <select
                value={selectedContract}
                onChange={e => setSelectedContract(e.target.value)}
                className="w-full text-sm font-bold text-gray-900 border border-gray-200 bg-gray-50/50 rounded-xl p-2.5 outline-none focus:border-pink-500 transition-all"
              >
                <option value="">-- Choose Contract --</option>
                {contracts.filter((c: any) => c.status === 'ACTIVE').map((c: any) => (
                  <option key={c.id} value={c.id}>{c.code} - {c.clientName}</option>
                ))}
              </select>
            </div>

            {activeContract && (
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Contract Value</span>
                  <span className="font-mono font-bold">Br {activeContract.contractValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Advance Rate</span>
                  <span className="font-bold text-pink-600">{activeContract.advancePercent}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Retention Rate</span>
                  <span className="font-bold text-[#1a7a5c]">{activeContract.retentionPercent}%</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Milestone Name</label>
              <input
                type="text"
                value={milestoneName}
                onChange={e => setMilestoneName(e.target.value)}
                disabled={!selectedContract}
                placeholder="e.g. 20% Superstructure"
                className="w-full text-sm font-bold text-gray-900 border border-gray-200 bg-gray-50/50 rounded-xl p-2.5 outline-none focus:border-pink-500 transition-all disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Gross Work Certified (ETB)</label>
              <input
                type="number"
                value={grossAmount || ''}
                onChange={e => setGrossAmount(Number(e.target.value))}
                min="0"
                disabled={!selectedContract}
                className="w-full text-sm font-mono font-bold text-gray-900 border border-gray-200 bg-gray-50/50 rounded-xl p-2.5 outline-none focus:border-pink-500 transition-all disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !selectedContract || grossAmount <= 0 || !milestoneName}
              className="w-full py-3 bg-[#15181e] text-white text-xs font-bold rounded-xl hover:bg-pink-600 transition-all disabled:opacity-50 disabled:hover:bg-[#15181e] shadow-sm"
            >
              {isSubmitting ? 'Raising...' : 'Raise Invoice'}
            </button>
          </form>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-sm text-[#15181e] px-1">Billing History</h3>
          
          {invoices.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center">
              <p className="text-gray-400 font-medium text-sm">No invoices raised yet.</p>
            </div>
          ) : (
            invoices.map((inv: any) => (
              <div key={inv.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      inv.status === 'COLLECTED' ? 'bg-green-50 text-green-700' :
                      inv.status === 'RECEIPTED' ? 'bg-blue-50 text-blue-700' :
                      'bg-orange-50 text-orange-700'
                    }`}>
                      {inv.status}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">{inv.code}</span>
                  </div>
                  <div className="font-bold text-[#15181e] text-sm mt-2">{inv.clientName}</div>
                  <div className="text-xs text-gray-500 font-medium">{inv.projectCode} · {inv.milestoneName}</div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 min-w-[200px]">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-gray-500 font-medium">Gross Certified</span>
                    <span className="font-mono font-bold">Br {inv.grossAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-gray-400 font-medium">Net After Deductions</span>
                    <span className="font-mono font-bold text-gray-600">Br {inv.netAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[11px] mb-2 pb-2 border-b border-gray-200">
                    <span className="text-gray-500 font-medium">VAT (15%)</span>
                    <span className="font-mono font-bold">Br {inv.vatAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-pink-600 font-bold">Total Payable</span>
                    <span className="font-mono font-bold text-pink-600">Br {inv.totalPayable.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
