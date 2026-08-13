'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { Search, FileSignature, CheckCircle, Clock } from 'lucide-react';

export const IPCCertification = ({ onToast }: { onToast: (t: string, m: string, s?: 'success'|'warning') => void }) => {
  const { data: subData } = useSWR('/api/subcontracts', (url: string) => fetch(url).then(res => res.json()));
  const subcontracts = subData?.data || [];

  const [selectedSubcontract, setSelectedSubcontract] = useState<string>('');
  const [grossAmount, setGrossAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch IPCs for selected subcontract
  const { data: ipcData, mutate: mutateIpcs } = useSWR(
    selectedSubcontract ? `/api/subcontracts/${selectedSubcontract}/ipcs` : null,
    (url: string) => fetch(url).then(res => res.json())
  );
  const ipcs = ipcData?.data || [];

  const activeSub = subcontracts.find((s: any) => s.id === selectedSubcontract);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubcontract || grossAmount <= 0) {
      onToast('Validation', 'Enter a valid gross amount of work certified.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/subcontracts/${selectedSubcontract}/ipcs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grossAmount })
      });
      const result = await res.json();
      if (result.success) {
        onToast('IPC Certified', result.message);
        setGrossAmount(0);
        mutateIpcs();
      } else {
        onToast('Error', result.message, 'warning');
      }
    } catch (err) {
      onToast('Error', 'Failed to generate IPC', 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <FileSignature className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#15181e]">Interim Payment Certificates (IPC)</h2>
            <p className="text-xs text-gray-500 font-medium">Certify work done and auto-deduct advance and retention.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
          <h3 className="font-bold text-sm text-[#15181e] mb-4">Certify New Work</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Select Subcontract</label>
              <select
                value={selectedSubcontract}
                onChange={e => setSelectedSubcontract(e.target.value)}
                className="w-full text-sm font-bold text-gray-900 border border-gray-200 bg-gray-50/50 rounded-xl p-2.5 outline-none focus:border-indigo-500 transition-all"
              >
                <option value="">-- Choose Subcontract --</option>
                {subcontracts.filter((s: any) => s.status === 'ACTIVE').map((s: any) => (
                  <option key={s.id} value={s.id}>{s.code} - {s.vendorName}</option>
                ))}
              </select>
            </div>

            {activeSub && (
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Contract Value</span>
                  <span className="font-mono font-bold">Br {activeSub.contractValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Advance Unrecovered</span>
                  <span className="font-mono font-bold text-[#b23a24]">Br {activeSub.unrecoveredAdvance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Retention Rate</span>
                  <span className="font-bold text-[#1a7a5c]">{activeSub.retentionPercent}%</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Gross Work Certified (ETB)</label>
              <input
                type="number"
                value={grossAmount || ''}
                onChange={e => setGrossAmount(Number(e.target.value))}
                min="0"
                disabled={!selectedSubcontract}
                className="w-full text-sm font-mono font-bold text-gray-900 border border-gray-200 bg-gray-50/50 rounded-xl p-2.5 outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !selectedSubcontract || grossAmount <= 0}
              className="w-full py-3 bg-[#15181e] text-white text-xs font-bold rounded-xl hover:bg-indigo-600 transition-all disabled:opacity-50 disabled:hover:bg-[#15181e] shadow-sm"
            >
              {isSubmitting ? 'Generating...' : 'Generate IPC'}
            </button>
          </form>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-sm text-[#15181e] px-1">IPC Ledger</h3>
          {!selectedSubcontract ? (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 border-dashed text-center">
              <p className="text-gray-400 font-medium text-sm">Select a subcontract to view its IPC history.</p>
            </div>
          ) : ipcs.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center">
              <p className="text-gray-400 font-medium text-sm">No IPCs generated for this subcontract yet.</p>
            </div>
          ) : (
            ipcs.map((ipc: any) => (
              <div key={ipc.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Cycle {ipc.cycleNumber}</span>
                    <span className="text-[10px] font-bold text-gray-400">{ipc.code}</span>
                  </div>
                  <div className="text-xs text-gray-500 font-medium mt-1">
                    Certified by {ipc.certifiedBy} on {ipc.createdAt}
                  </div>
                  {ipc.voucherCode && (
                    <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                      {ipc.voucherStatus === 'paid' ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Clock className="w-3 h-3 text-orange-400" />}
                      Linked to {ipc.voucherCode} ({ipc.voucherStatus})
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 min-w-[200px]">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-gray-500 font-medium">Gross Certified</span>
                    <span className="font-mono font-bold">Br {ipc.grossAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#b23a24] font-medium">Advance Rec.</span>
                    <span className="font-mono font-bold text-[#b23a24]">- Br {ipc.advanceDeduction.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[11px] mb-2 pb-2 border-b border-gray-200">
                    <span className="text-[#1a7a5c] font-medium">Retention</span>
                    <span className="font-mono font-bold text-[#1a7a5c]">- Br {ipc.retentionDeduction.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#15181e] font-bold">Net Payable</span>
                    <span className="font-mono font-bold text-[#15181e]">Br {ipc.netAmount.toLocaleString()}</span>
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
