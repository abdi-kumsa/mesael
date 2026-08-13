'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { DollarSign, Landmark, CheckCircle } from 'lucide-react';

export const ReceivablesLedger = ({ onToast }: { onToast: (t: string, m: string, s?: 'success'|'warning') => void }) => {
  const { data: invData, mutate: mutateInvoices } = useSWR('/api/otc/invoices', (url: string) => fetch(url).then(res => res.json()));
  const invoices = invData?.data || [];
  
  // We can collect against anything that's not COLLECTED. Usually RECEIPTED is when we collect, but maybe earlier.
  const collectibleInvoices = invoices.filter((i: any) => i.status !== 'COLLECTED');

  const { data: colData, mutate: mutateCollections } = useSWR('/api/otc/collections', (url: string) => fetch(url).then(res => res.json()));
  const collections = colData?.data || [];

  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [amountReceived, setAmountReceived] = useState(0);
  const [withholdingSuffered, setWithholdingSuffered] = useState(0);
  const [bankReference, setBankReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || amountReceived <= 0) {
      onToast('Validation', 'Select an invoice and enter amount received', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/otc/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: selectedInvoice, amountReceived, withholdingSuffered, bankReference })
      });
      const result = await res.json();
      if (result.success) {
        onToast('Collection Logged', result.message);
        setAmountReceived(0);
        setWithholdingSuffered(0);
        setBankReference('');
        setSelectedInvoice('');
        mutateInvoices();
        mutateCollections();
      } else {
        onToast('Error', result.message, 'warning');
      }
    } catch (err) {
      onToast('Error', 'Failed to log collection', 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-[#1a7a5c]">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#15181e]">Receivables Ledger</h2>
            <p className="text-xs text-gray-500 font-medium">Track unpaid invoices and log bank collections.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
          <h3 className="font-bold text-sm text-[#15181e] mb-4">Log Bank Collection</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Unpaid Invoices</label>
              <select
                value={selectedInvoice}
                onChange={e => setSelectedInvoice(e.target.value)}
                className="w-full text-sm font-bold text-gray-900 border border-gray-200 bg-gray-50/50 rounded-xl p-2.5 outline-none focus:border-[#1a7a5c] transition-all"
              >
                <option value="">-- Select Invoice --</option>
                {collectibleInvoices.map((inv: any) => (
                  <option key={inv.id} value={inv.id}>{inv.code} - Balance: Br {inv.balanceAmount.toLocaleString()}</option>
                ))}
              </select>
            </div>

            {selectedInvoice && (
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Payable</span>
                  <span className="font-mono font-bold">Br {collectibleInvoices.find((i:any) => i.id === selectedInvoice)?.totalPayable.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-pink-600">
                  <span>Balance Remaining</span>
                  <span className="font-mono">Br {collectibleInvoices.find((i:any) => i.id === selectedInvoice)?.balanceAmount.toLocaleString()}</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Amount Received in Bank (ETB)</label>
              <input
                type="number"
                value={amountReceived || ''}
                onChange={e => setAmountReceived(Number(e.target.value))}
                min="0"
                className="w-full text-sm font-mono font-bold text-gray-900 border border-gray-200 bg-gray-50/50 rounded-xl p-2.5 outline-none focus:border-[#1a7a5c] transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Withholding Tax Suffered (ETB)</label>
              <input
                type="number"
                value={withholdingSuffered || ''}
                onChange={e => setWithholdingSuffered(Number(e.target.value))}
                min="0"
                className="w-full text-sm font-mono font-bold text-gray-900 border border-gray-200 bg-gray-50/50 rounded-xl p-2.5 outline-none focus:border-[#1a7a5c] transition-all"
              />
              <p className="text-[10px] text-gray-400 mt-1">If client deducted withholding tax, enter it here. It acts as credit.</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Bank Reference / CPO #</label>
              <input
                type="text"
                value={bankReference}
                onChange={e => setBankReference(e.target.value)}
                placeholder="e.g. FT2026-11"
                className="w-full text-sm font-bold text-gray-900 border border-gray-200 bg-gray-50/50 rounded-xl p-2.5 outline-none focus:border-[#1a7a5c] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !selectedInvoice || amountReceived <= 0}
              className="w-full py-3 bg-[#15181e] text-white text-xs font-bold rounded-xl hover:bg-[#1a7a5c] transition-all disabled:opacity-50 disabled:hover:bg-[#15181e] shadow-sm"
            >
              {isSubmitting ? 'Logging...' : 'Log Collection'}
            </button>
          </form>
        </div>

        {/* Right Column: Collection History */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-sm text-[#15181e] px-1">Recent Collections</h3>
          
          <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-sm">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Invoice / Client</th>
                  <th className="py-3 px-4 text-right">Received (ETB)</th>
                  <th className="py-3 px-4 text-right">Withholding</th>
                  <th className="py-3 px-4">Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {collections.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400 font-medium">No collections logged yet.</td>
                  </tr>
                ) : (
                  collections.map((col: any) => (
                    <tr key={col.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-gray-600">{col.createdAt}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#15181e]">{col.invoiceCode}</div>
                        <div className="text-[10px] text-gray-500 truncate max-w-[150px]">{col.clientName}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#1a7a5c] text-right">
                        {col.amountReceived.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-gray-500 text-right">
                        {col.withholdingSuffered > 0 ? col.withholdingSuffered.toLocaleString() : '-'}
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] text-gray-400">
                        {col.bankReference || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
