'use client';

import React, { useState } from 'react';
import { PeachtreeEntry } from '@/lib/types';
import { PEACHTREE_QUEUE } from '@/lib/mock-data';
import { RefreshCw, CheckCircle, AlertTriangle, Layers, X } from 'lucide-react';
import { PettyCashLedger } from '@/components/PettyCashLedger';
import { LedgerDesk } from '@/components/LedgerDesk';

import { PaymentVoucher } from '@/lib/types';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface KalkidanDashboardProps {
  activeTab: string;
  vouchers?: PaymentVoucher[];
  onRunExport: () => void;
  isExporting: boolean;
  onToast: (t: string, m: string, s?: 'success'|'warning') => void;
}

export const KalkidanDashboard: React.FC<KalkidanDashboardProps> = ({
  activeTab,
  vouchers,
  onRunExport,
  isExporting,
  onToast,
}) => {
  const [queue, setQueue] = useState<PeachtreeEntry[]>(PEACHTREE_QUEUE);
  
  // Treasury / Payment Release state
  const { data: accountsData } = useSWR('/api/treasury/accounts', fetcher);
  const bankAccounts = accountsData?.data || [];
  
  const { data: chequesData } = useSWR('/api/treasury/cheques', fetcher);
  const chequeBooks = chequesData?.data || [];
  
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<PaymentVoucher | null>(null);
  const [releaseForm, setReleaseForm] = useState({ bankAccountId: '', bankReference: '', chequeLeafId: '' });
  const [isReleasing, setIsReleasing] = useState(false);

  const approvedVouchers = (vouchers || []).filter((v: PaymentVoucher) => v.status === 'approved');

  const handleOpenReleaseModal = (voucher: PaymentVoucher) => {
    setSelectedVoucher(voucher);
    setReleaseForm({ bankAccountId: bankAccounts[0]?.id || '', bankReference: '', chequeLeafId: '' });
    setReleaseModalOpen(true);
  };

  const handleReleaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVoucher) return;
    
    setIsReleasing(true);
    try {
      const res = await fetch(`/api/vouchers/${selectedVoucher.id}/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(releaseForm),
      });
      const data = await res.json();
      
      if (data.success) {
        onToast('Payment Released', data.message);
        setReleaseModalOpen(false);
        // We mutate globally in page.tsx usually, but let's just trigger a hard reload or rely on the user clicking away
        window.location.reload(); 
      } else {
        onToast('Release Failed', data.message, 'warning');
      }
    } catch (err) {
      onToast('Error', 'Network error while releasing payment', 'warning');
    } finally {
      setIsReleasing(false);
    }
  };

  const handleRunExportClick = async () => {
    try {
      const res = await fetch('/api/ledger/export');
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'peachtree_export.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        onToast('Export Complete', 'Peachtree CSV downloaded.');
      } else {
        onToast('Export Failed', 'Could not generate export.', 'warning');
      }
    } catch (e) {
      onToast('Export Error', 'Network error during export.', 'warning');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Ledger, Reconciliation & Statutory Export
          </div>
          <h1 className="font-serif text-3xl font-semibold text-[#15181e] mt-0.5">
            Welcome, Kalkidan
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Where the books stand today. Nothing posted blind.
          </p>
        </div>
        <button
          onClick={handleRunExportClick}
          disabled={isExporting}
          className="bg-[#15181e] hover:bg-[#c1540f] disabled:bg-gray-400 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isExporting ? 'animate-spin' : ''}`} />
          {isExporting ? 'Exporting to Peachtree…' : 'Run Staged Export'}
        </button>
      </div>

      {/* Stat Strip */}
      <div className="stat-line">
        <div className="stat-item">
          <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">Lines matched</div>
          <div className="num text-xl sm:text-2xl font-bold text-[#1a7a5c] mt-1">128 / 142</div>
          <div className="text-[11px] text-gray-500 mt-0.5">90% matched</div>
        </div>
        <div className="stat-item">
          <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">Unmatched</div>
          <div className="num text-xl sm:text-2xl font-bold text-[#b23a24] mt-1">14</div>
          <div className="text-[11px] text-[#b23a24] font-semibold mt-0.5">Variance Br 6,240</div>
        </div>
        <div className="stat-item">
          <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">Staged for export</div>
          <div className="num text-xl sm:text-2xl font-bold text-[#b4550b] mt-1">94</div>
          <div className="text-[11px] text-gray-500 mt-0.5">August, not yet exported</div>
        </div>
      </div>

      {activeTab === 'pettycash' ? (
        <PettyCashLedger />
      ) : activeTab === 'ledger' ? (
        <LedgerDesk onToast={onToast} />
      ) : activeTab === 'treasury' ? (
        <div className="space-y-6">
          <div className="panel space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-[#15181e]">Payment Execution Queue</h2>
                <p className="text-xs text-gray-500">Approved vouchers ready for actual payment release.</p>
              </div>
              <span className="tag-badge warn">{approvedVouchers.length} ready</span>
            </div>

            <div className="space-y-3">
              {approvedVouchers.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">
                  No approved vouchers awaiting payment release.
                </div>
              ) : (
                approvedVouchers.map((v: PaymentVoucher) => (
                  <div
                    key={v.id}
                    className="p-4 rounded-xl bg-white border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 interactive-row"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="mono text-[10.5px] text-[#8f3d0b] font-bold">{v.code}</span>
                        <span className="text-xs font-semibold text-gray-600">· {v.project}</span>
                      </div>
                      <div className="font-bold text-sm text-[#15181e]">{v.title}</div>
                      <div className="text-xs text-gray-500">
                        Payee: <span className="font-semibold text-gray-800">{v.payee}</span> · {v.method}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      <div className="num font-bold text-base text-[#15181e] text-right">
                        Br {v.amount.toLocaleString()}
                      </div>
                      <button
                        onClick={() => handleOpenReleaseModal(v)}
                        className="px-4 py-2 rounded-xl bg-[#15181e] hover:bg-[#c1540f] text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2"
                      >
                        Release Payment
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="panel space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-[#15181e]">Cheque Register (FIN-TRE-04)</h2>
                <p className="text-xs text-gray-500">Track physical chequebooks and leaf statuses.</p>
              </div>
            </div>

            <div className="space-y-4">
              {chequeBooks.length === 0 ? (
                <div className="text-center py-4 text-gray-400 text-xs">No chequebooks registered.</div>
              ) : (
                chequeBooks.map((cb: any) => (
                  <div key={cb.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <div className="font-bold text-sm">{cb.bankAccount.bankName} - {cb.bankAccount.accountNumber}</div>
                      <div className="text-xs font-semibold text-gray-500">Leaves: {cb.startNumber} to {cb.endNumber}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {cb.leaves.map((leaf: any) => (
                        <div 
                          key={leaf.id} 
                          className={`px-2 py-1 text-[10px] font-bold rounded border ${
                            leaf.status === 'BLANK' ? 'bg-white text-gray-600 border-gray-300' :
                            leaf.status === 'ISSUED' ? 'bg-[#c1540f] text-white border-[#c1540f]' :
                            'bg-gray-200 text-gray-400 border-gray-200'
                          }`}
                          title={leaf.issuedTo ? `Issued to ${leaf.issuedTo}` : leaf.status}
                        >
                          {leaf.chequeNumber}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (

        /* Peachtree Export Queue Panel */
        <div className="space-y-6">
          <div className="panel space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-[#15181e]">Peachtree Export Queue</h2>
                <p className="text-xs text-gray-500">Staged entries sent on a controlled schedule. Peachtree remains statutory ledger.</p>
              </div>
              <span className="text-xs font-bold text-gray-400">Next export due in 3 days</span>
            </div>

            <div className="space-y-3">
              {queue.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-white border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 interactive-row"
                >
                  <div>
                    <div className="font-bold text-sm text-[#15181e]">{item.period}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {item.linesCount} journal lines · {item.exportDate ? `exported ${item.exportDate}` : 'not yet exported'}
                    </div>
                  </div>

                  <div>
                    {item.status === 'Synced' ? (
                      <span className="tag-badge good">Synced</span>
                    ) : (
                      <span className="tag-badge warn">Pending Export</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statutory Ledger Note */}
          <div className="bg-[#e9f5f0] border-l-4 border-[#1a7a5c] p-4 rounded-xl text-xs space-y-1">
            <h4 className="font-bold text-[#1a7a5c]">Statutory Ledger Guarantee (FR-09-016)</h4>
            <p className="text-gray-700 leading-relaxed">
              Peachtree remains the legal statutory ledger. This integration stages clean, matched entries and hands them across on a controlled schedule, avoiding retroactive backlogs.
            </p>
          </div>
        </div>

      )}

      {/* Release Payment Modal */}
      {releaseModalOpen && selectedVoucher && (
        <div className="fixed inset-0 z-[200] flex items-center justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl flex flex-col border-l border-gray-200 animate-slide-in-right">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#faf9f8]">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#15181e]">Release Payment</h3>
                <p className="text-xs text-gray-500 mt-1">Execute payment for {selectedVoucher.code}</p>
              </div>
              <button onClick={() => setReleaseModalOpen(false)} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleReleaseSubmit} className="p-6 space-y-5 flex-1 flex flex-col">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-sm">
                <div className="flex justify-between font-bold text-[#15181e]">
                  <span>{selectedVoucher.payee}</span>
                  <span className="num text-[#c1540f]">Br {selectedVoucher.amount.toLocaleString()}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">{selectedVoucher.title}</div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Source Bank Account</label>
                <select 
                  required
                  value={releaseForm.bankAccountId}
                  onChange={e => setReleaseForm({...releaseForm, bankAccountId: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#c1540f] bg-white"
                >
                  <option value="" disabled>Select account to pay from</option>
                  {bankAccounts.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {b.bankName} - {b.accountNumber} (Bal: Br {b.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedVoucher.method === 'Cheque' ? (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Select Cheque Leaf</label>
                  <select 
                    required
                    value={releaseForm.chequeLeafId}
                    onChange={e => setReleaseForm({...releaseForm, chequeLeafId: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#c1540f] bg-white"
                  >
                    <option value="" disabled>Select blank cheque from book</option>
                    {chequeBooks
                      .filter((cb: any) => cb.bankAccountId === releaseForm.bankAccountId)
                      .flatMap((cb: any) => cb.leaves)
                      .filter((leaf: any) => leaf.status === 'BLANK')
                      .map((leaf: any) => (
                        <option key={leaf.id} value={leaf.id}>
                          CHQ-{leaf.chequeNumber}
                        </option>
                      ))
                    }
                  </select>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Bank Reference (RTGS/CPO No)</label>
                  <input 
                    type="text" 
                    required
                    value={releaseForm.bankReference}
                    onChange={e => setReleaseForm({...releaseForm, bankReference: e.target.value})}
                    placeholder="e.g. TR-998822"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#c1540f]"
                  />
                </div>
              )}
              
              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={isReleasing || !releaseForm.bankAccountId || (selectedVoucher.method === 'Cheque' ? !releaseForm.chequeLeafId : !releaseForm.bankReference)}
                  className="w-full bg-[#15181e] hover:bg-[#c1540f] disabled:bg-gray-400 text-white font-bold text-sm py-3.5 rounded-xl transition-colors shadow-md"
                >
                  {isReleasing ? 'Executing...' : 'Confirm Release & Deduct Balance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
