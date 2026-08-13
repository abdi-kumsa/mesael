'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { FilePlus, Truck, Search, CheckCircle } from 'lucide-react';

export const TaxReceiptDesk = ({ onToast }: { onToast: (t: string, m: string, s?: 'success'|'warning') => void }) => {
  const { data: invData, mutate: mutateInvoices } = useSWR('/api/otc/invoices', (url: string) => fetch(url).then(res => res.json()));
  const invoices = invData?.data || [];
  const pendingInvoices = invoices.filter((i: any) => i.status === 'RAISED');

  const { data: receiptData, mutate: mutateReceipts } = useSWR('/api/otc/receipts', (url: string) => fetch(url).then(res => res.json()));
  const receipts = receiptData?.data || [];

  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [custodyTracker, setCustodyTracker] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || !receiptNumber) {
      onToast('Validation', 'Select an invoice and enter FS Receipt Number', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/otc/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: selectedInvoice, receiptNumber, custodyTracker })
      });
      const result = await res.json();
      if (result.success) {
        onToast('Receipt Issued', result.message);
        setReceiptNumber('');
        setCustodyTracker('');
        setSelectedInvoice('');
        mutateInvoices();
        mutateReceipts();
      } else {
        onToast('Error', result.message, 'warning');
      }
    } catch (err) {
      onToast('Error', 'Failed to issue receipt', 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-[#c1540f]">
            <FilePlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#15181e]">Tax Receipts & Dispatch</h2>
            <p className="text-xs text-gray-500 font-medium">Issue FS receipts against certified invoices and track custody.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
          <h3 className="font-bold text-sm text-[#15181e] mb-4">Issue Tax Receipt</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Pending Invoices</label>
              <select
                value={selectedInvoice}
                onChange={e => setSelectedInvoice(e.target.value)}
                className="w-full text-sm font-bold text-gray-900 border border-gray-200 bg-gray-50/50 rounded-xl p-2.5 outline-none focus:border-[#c1540f] transition-all"
              >
                <option value="">-- Select Invoice --</option>
                {pendingInvoices.map((inv: any) => (
                  <option key={inv.id} value={inv.id}>{inv.code} - {inv.clientName}</option>
                ))}
              </select>
            </div>

            {selectedInvoice && (
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Gross Amount</span>
                  <span className="font-mono">Br {pendingInvoices.find((i:any) => i.id === selectedInvoice)?.grossAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-pink-600 border-t border-gray-200 pt-2">
                  <span>Total Payable (+15% VAT)</span>
                  <span className="font-mono">Br {pendingInvoices.find((i:any) => i.id === selectedInvoice)?.totalPayable.toLocaleString()}</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Physical FS Receipt #</label>
              <input
                type="text"
                value={receiptNumber}
                onChange={e => setReceiptNumber(e.target.value)}
                placeholder="e.g. FS-900122"
                className="w-full text-sm font-mono font-bold text-gray-900 border border-gray-200 bg-gray-50/50 rounded-xl p-2.5 outline-none focus:border-[#c1540f] transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1">
                Custody Tracker <Truck className="w-3 h-3"/>
              </label>
              <input
                type="text"
                value={custodyTracker}
                onChange={e => setCustodyTracker(e.target.value)}
                placeholder="e.g. Dispatched via Messenger Abebe"
                className="w-full text-sm font-bold text-gray-900 border border-gray-200 bg-gray-50/50 rounded-xl p-2.5 outline-none focus:border-[#c1540f] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !selectedInvoice || !receiptNumber}
              className="w-full py-3 bg-[#15181e] text-white text-xs font-bold rounded-xl hover:bg-[#c1540f] transition-all disabled:opacity-50 disabled:hover:bg-[#15181e] shadow-sm"
            >
              {isSubmitting ? 'Issuing...' : 'Issue Receipt'}
            </button>
          </form>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-sm text-[#15181e] px-1">Issued Receipts & Dispatch Log</h3>
          
          {receipts.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center">
              <p className="text-gray-400 font-medium text-sm">No tax receipts issued yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {receipts.map((rcpt: any) => (
                <div key={rcpt.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-[10px] font-bold text-gray-400">{rcpt.invoiceCode}</div>
                      <div className="font-bold text-[#15181e]">{rcpt.receiptNumber}</div>
                    </div>
                    <span className="px-2 py-1 bg-green-50 text-green-700 text-[9px] font-bold uppercase tracking-wider rounded-md flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Issued
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500 font-medium mb-3">
                    {rcpt.clientName} <br/>
                    {rcpt.projectCode}
                  </div>

                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mb-3">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Payable</div>
                    <div className="font-mono font-bold text-pink-600">Br {rcpt.totalPayable.toLocaleString()}</div>
                  </div>

                  <div className="text-[11px] text-gray-400">
                    <span className="font-bold">Custody:</span> {rcpt.custodyTracker || 'Not Dispatched'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
