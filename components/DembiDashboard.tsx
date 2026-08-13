'use client';

import React from 'react';
import { PaymentVoucher } from '@/lib/types';
import { Check, X, ShieldAlert, CreditCard } from 'lucide-react';

interface DembiDashboardProps {
  activeTab: string;
  vouchers: PaymentVoucher[];
  onApproveVoucher: (code: string) => void;
  onDeclineVoucher: (code: string) => void;
}

export const DembiDashboard: React.FC<DembiDashboardProps> = ({
  activeTab,
  vouchers,
  onApproveVoucher,
  onDeclineVoucher,
}) => {
  // Items within Dembi's delegated ceiling (<= 500,000) needing approval
  const dembiQueue = vouchers.filter(
    (v) => v.amount <= 500000 && (v.status === 'ready_for_approval' || v.status === 'pending_docs')
  );

  // Items exceeding Dembi's ceiling (> 500,000) routed to Mesael automatically
  const routedToMesael = vouchers.filter((v) => 
    v.status === 'owner_reserved' || (['ready_for_approval', 'pending_docs'].includes(v.status) && v.amount > 500000)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
          Finance-wide · Delegated Ceiling (up to ETB 500,000)
        </div>
        <h1 className="font-serif text-3xl font-semibold text-[#15181e] mt-0.5">
          Finance Overview & Approvals
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Items within your ceiling can be approved directly. Anything above routes to Mesael automatically.
        </p>
      </div>

      {/* Stat Strip */}
      <div className="stat-line">
        <div className="stat-item">
          <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">Cash position</div>
          <div className="num text-xl sm:text-2xl font-bold text-[#15181e] mt-1">Br 4.29M</div>
          <div className="text-[11px] text-[#1a7a5c] font-semibold mt-0.5">↑ Br 312K this week</div>
        </div>
        <div className="stat-item">
          <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">Accounts payable</div>
          <div className="num text-xl sm:text-2xl font-bold text-[#15181e] mt-1">Br 1.94M</div>
          <div className="text-[11px] text-gray-500 mt-0.5">22 suppliers</div>
        </div>
        <div className="stat-item">
          <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">Budget exceptions</div>
          <div className="num text-xl sm:text-2xl font-bold text-[#b4550b] mt-1">3</div>
          <div className="text-[11px] text-[#b4550b] font-semibold mt-0.5">Over remaining balance</div>
        </div>
      </div>

      {activeTab === 'cash' ? (

        /* Cash & Banks View */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="tag-badge good">Healthy</span>
                <span className="text-xs text-gray-400">No ceiling limit</span>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-600">CBE Operating Account · 0847</div>
                <div className="num text-2xl font-bold text-[#15181e] mt-1">Br 3,614,200</div>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#c1540f] h-full w-[41%] rounded-full"></div>
              </div>
              <div className="text-[11px] text-gray-500 flex justify-between">
                <span>No ceiling</span>
                <span className="font-semibold text-gray-700">41% committed</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="tag-badge bad">Near ceiling</span>
                <span className="text-xs text-gray-400">Ceiling Br 15,000</span>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-600">Petty Cash — Site B, Adama</div>
                <div className="num text-2xl font-bold text-[#15181e] mt-1">Br 14,100</div>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#b23a24] h-full w-[94%] rounded-full"></div>
              </div>
              <div className="text-[11px] text-[#b23a24] font-semibold flex justify-between">
                <span>Ceiling Br 15,000</span>
                <span>94% used</span>
              </div>
            </div>

          </div>
        </div>

      ) : (

        /* Approvals Queue View */
        <div className="space-y-6">
          
          {/* Within DGM Ceiling Section */}
          <div className="panel space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-[#15181e]">Awaiting Your Approval</h2>
                <p className="text-xs text-gray-500">Items within your delegated ceiling (ETB 500,000 limit)</p>
              </div>
              <span className="tag-badge good">{dembiQueue.length} pending</span>
            </div>

            <div className="space-y-3">
              {dembiQueue.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">
                  All delegated items within your ceiling have been processed.
                </div>
              ) : (
                dembiQueue.map((v) => (
                  <div
                    key={v.id}
                    className="p-4 rounded-xl bg-white border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 interactive-row"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="mono text-[10.5px] text-gray-400 font-semibold">{v.code}</span>
                        <span className="text-xs font-semibold text-gray-500">· {v.project}</span>
                      </div>
                      <div className="font-bold text-sm text-[#15181e]">{v.title}</div>
                      <div className="text-xs text-gray-500">
                        {v.payee} · {v.method} · {v.docsCount} of {v.totalDocsRequired} documents attached
                      </div>
                      {v.attachments && v.attachments.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {v.attachments.map(a => (
                            <a key={a.url} href={a.url} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-white bg-[#15181e] px-2 py-1 rounded hover:bg-[#c1540f] transition-colors">
                              View {a.type} {a.version && a.version > 1 ? `(v${a.version})` : ''}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-200">
                      <div className="flex flex-col items-end">
                        <div className="num font-bold text-base text-[#15181e] text-right">
                          Br {v.amount.toLocaleString()}
                        </div>
                        {v.budgetAfter !== undefined && v.budgetAfter < 0 && (
                          <div className="text-[10px] font-bold text-[#b23a24] uppercase mt-0.5">
                            Over budget by Br {Math.abs(v.budgetAfter).toLocaleString()}
                          </div>
                        )}
                        {v.budgetAfter !== undefined && v.budgetAfter >= 0 && (
                          <div className="text-[10px] font-semibold text-gray-400 uppercase mt-0.5">
                            Br {v.budgetAfter.toLocaleString()} remains
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onApproveVoucher(v.code)}
                          disabled={v.budgetAfter !== undefined && v.budgetAfter < 0}
                          title={v.budgetAfter !== undefined && v.budgetAfter < 0 ? "Blocked: Exceeds line item budget" : "Approve Voucher"}
                          className={`px-3 py-1.5 rounded-lg border font-bold text-xs flex items-center gap-1 transition-all ${
                            v.budgetAfter !== undefined && v.budgetAfter < 0
                              ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'border-[#bfe3d4] bg-[#e9f5f0] text-[#1a7a5c] hover:bg-[#1a7a5c] hover:text-white'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => onDeclineVoucher(v.code)}
                          className="px-3 py-1.5 rounded-lg border border-[#f0c3b6] bg-[#fbebe7] text-[#b23a24] hover:bg-[#b23a24] hover:text-white font-bold text-xs flex items-center gap-1 transition-all"
                        >
                          <X className="w-3.5 h-3.5" /> Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Automatic Escalation Section: Items Above Ceiling */}
          <div className="panel space-y-4 opacity-90">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-[#15181e] flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#c1540f]" />
                  Routed to Mesael (Above Ceiling)
                </h2>
                <p className="text-xs text-gray-500">Items exceeding ETB 500,000 or marked owner-reserved for visibility</p>
              </div>
              <span className="tag-badge warn">{routedToMesael.length} items</span>
            </div>

            <div className="space-y-2.5">
              {routedToMesael.map((v) => (
                <div
                  key={v.id}
                  className="p-3.5 rounded-xl bg-gray-50/50 border border-gray-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-[#15181e]">{v.title}</div>
                    <div className="text-gray-500 text-[11px] mt-0.5">
                      Waiting on Mesael · Owner-Reserved Authority
                    </div>
                  </div>
                  <div className="num font-bold text-sm text-[#15181e]">
                    Br {v.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      )}

    </div>
  );
};
