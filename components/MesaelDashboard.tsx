'use client';

import React from 'react';
import { PaymentVoucher } from '@/lib/types';
import { Check, X, Download, ShieldCheck, TrendingUp, AlertTriangle } from 'lucide-react';
import { ProjectCostReport } from '@/components/ProjectCostReport';

interface MesaelDashboardProps {
  activeTab: string;
  vouchers: PaymentVoucher[];
  onApproveVoucher: (code: string) => void;
  onDeclineVoucher: (code: string) => void;
  onExportPDF: () => void;
}

export const MesaelDashboard: React.FC<MesaelDashboardProps> = ({
  activeTab,
  vouchers,
  onApproveVoucher,
  onDeclineVoucher,
  onExportPDF,
}) => {
  // Items needing Mesael's reserved approval
  const reservedQueue = vouchers.filter(
    (v) => v.status === 'owner_reserved' || (['ready_for_approval', 'pending_docs'].includes(v.status) && v.amount > 500000)
  );

  // All approved items across the company
  const approvedQueue = vouchers.filter((v) => v.status === 'approved' || v.status === 'paid');

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Owner / CEO Command Center
          </div>
          <h1 className="font-serif text-3xl font-semibold text-[#15181e] mt-0.5">
            Welcome, Mesael
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Two things need your decision. Everything else keeps moving without you.
          </p>
        </div>
        <button
          onClick={onExportPDF}
          className="bg-white hover:bg-gray-50 border border-gray-200 text-[#15181e] px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-[#c1540f]" />
          Download Financial PDF
        </button>
      </div>

      {/* Stat Strip */}
      <div className="stat-line">
        <div className="stat-item">
          <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">Cash position</div>
          <div className="num text-xl sm:text-2xl font-bold text-[#15181e] mt-1">Br 4.29M</div>
          <div className="text-[11px] text-[#1a7a5c] font-semibold mt-0.5">↑ Br 312K this week</div>
        </div>
        <div className="stat-item">
          <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">Waiting on you</div>
          <div className="num text-xl sm:text-2xl font-bold text-[#b4550b] mt-1">{reservedQueue.length}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">1 payment · 1 tax decision</div>
        </div>
        <div className="stat-item">
          <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">Receivables overdue</div>
          <div className="num text-xl sm:text-2xl font-bold text-[#b23a24] mt-1">Br 480K</div>
          <div className="text-[11px] text-[#b23a24] font-semibold mt-0.5">CMC Residential · 34 days</div>
        </div>
      </div>

      {activeTab === 'reports' ? (

        /* Financial Reports & Statements */
        <div className="space-y-6">
          
          {/* P&L Statement */}
          <div className="panel space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-[#15181e]">Profit & Loss Statement — Summary (YTD)</h2>
              <span className="text-xs text-gray-400 font-semibold">2026 Fiscal Year</span>
            </div>

            <div className="divide-y divide-gray-100 text-xs">
              <div className="py-2.5 flex justify-between interactive-row px-2 -mx-2 rounded-lg hover:bg-gray-50/50">
                <span className="text-gray-700">Contract Revenue</span>
                <span className="num font-bold text-gray-900">Br 24,860,000</span>
              </div>
              <div className="py-2.5 flex justify-between interactive-row px-2 -mx-2 rounded-lg hover:bg-gray-50/50">
                <span className="text-gray-700">Direct Project Cost</span>
                <span className="num font-bold text-gray-900">- Br 18,110,600</span>
              </div>
              <div className="py-2.5 flex justify-between interactive-row px-2 -mx-2 rounded-lg hover:bg-gray-50/50">
                <span className="text-gray-700">Overheads & Head Office</span>
                <span className="num font-bold text-gray-900">- Br 2,940,200</span>
              </div>
              <div className="py-3 flex justify-between font-bold text-sm text-[#1a7a5c] bg-[#e9f5f0]/50 -mx-5 px-5 rounded-b-xl">
                <span>Net Profit Before Tax</span>
                <span className="num">Br 3,809,200</span>
              </div>
            </div>
          </div>

          {/* Balance Sheet Snapshot */}
          <div className="panel space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-[#15181e]">Balance Sheet Snapshot</h2>
              <span className="text-xs text-gray-400 font-semibold">4 August 2026</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              
              {/* Assets */}
              <div className="space-y-2">
                <div className="font-bold text-gray-400 uppercase text-[10.5px]">Assets</div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>Cash & Bank</span>
                  <span className="num font-semibold">Br 4,286,400</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>Accounts Receivable</span>
                  <span className="num font-semibold">Br 3,105,000</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>Fixed Assets, Net</span>
                  <span className="num font-semibold">Br 2,294,700</span>
                </div>
                <div className="flex justify-between py-2 font-bold text-gray-900 border-t border-gray-200">
                  <span>Total Assets</span>
                  <span className="num">Br 9,686,100</span>
                </div>
              </div>

              {/* Liabilities & Capital */}
              <div className="space-y-2">
                <div className="font-bold text-gray-400 uppercase text-[10.5px]">Liabilities & Capital</div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>Accounts Payable</span>
                  <span className="num font-semibold">Br 1,940,150</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 font-bold text-[#c1540f]">
                  <span>Owner Capital Account (Sole Proprietor)</span>
                  <span className="num">Br 15,830,400</span>
                </div>
                <div className="flex justify-between py-2 font-bold text-gray-900 border-t border-gray-200">
                  <span>Total Liabilities & Equity</span>
                  <span className="num">Br 17,770,550</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      ) : activeTab === 'reports' ? (
        
        /* Financial Reports Tab (The Holy Grail) */
        <ProjectCostReport />

      ) : (

        /* Owner-Reserved Approvals Engine */
        <div className="space-y-6">
          
          <div className="panel space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-[#15181e]">Owner-Reserved Approvals</h2>
                <p className="text-xs text-gray-500">Any amount · Exclusive proprietor authority</p>
              </div>
              <span className="tag-badge warn">{reservedQueue.length} awaiting decision</span>
            </div>

            <div className="space-y-3">
              {reservedQueue.map((v) => (
                <div
                  key={v.id}
                  className="p-4 rounded-xl bg-[#fdf1e7]/40 border border-[#f3d3b3] flex flex-col sm:flex-row sm:items-center justify-between gap-4 interactive-row"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="mono text-[10.5px] text-[#8f3d0b] font-bold">{v.code}</span>
                      <span className="text-xs font-semibold text-gray-600">· {v.project}</span>
                    </div>
                    <div className="font-bold text-sm text-[#15181e]">{v.title}</div>
                    <div className="text-xs text-gray-500">
                      Payee: <span className="font-semibold text-gray-800">{v.payee}</span> · {v.method} · Prepared by {v.preparedBy}
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
                        <div className="text-[10px] font-semibold text-[#8f3d0b] uppercase mt-0.5">
                          Br {v.budgetAfter.toLocaleString()} remains
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onApproveVoucher(v.code)}
                        disabled={v.budgetAfter !== undefined && v.budgetAfter < 0}
                        title={v.budgetAfter !== undefined && v.budgetAfter < 0 ? "Blocked: Exceeds line item budget" : "Approve Voucher"}
                        className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1 shadow-sm transition-all ${
                          v.budgetAfter !== undefined && v.budgetAfter < 0
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-[#15181e] hover:bg-[#c1540f] text-white'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => onDeclineVoucher(v.code)}
                        className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs flex items-center gap-1 transition-all"
                      >
                        <X className="w-3.5 h-3.5" /> Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Tax Clearance Renewal Item */}
              <div className="p-4 rounded-xl bg-white border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 interactive-row">
                <div className="space-y-1">
                  <div className="text-[10.5px] font-bold text-gray-400 uppercase">Tax Filing Decision</div>
                  <div className="font-bold text-sm text-[#15181e]">Tax clearance renewal — Q3 filing</div>
                  <div className="text-xs text-gray-500">Prepared by Yamrot · Certificate expires in 11 days</div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <span className="tag-badge warn">Expires 17 Aug</span>
                  <button
                    onClick={() => onApproveVoucher('Tax Clearance Renewal')}
                    className="px-3.5 py-2 rounded-xl bg-[#15181e] hover:bg-[#c1540f] text-white font-bold text-xs"
                  >
                    Approve
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Company-Wide Approvals Overview */}
          <div className="panel space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2">
              Recent Company-Wide Approvals
            </h2>
            <div className="divide-y divide-gray-100 text-xs">
              {approvedQueue.length === 0 ? (
                <div className="py-4 text-center text-gray-400">No recently approved vouchers found.</div>
              ) : (
                approvedQueue.map(v => (
                  <div key={v.id} className="py-2.5 flex flex-col sm:flex-row sm:justify-between sm:items-center interactive-row px-2 -mx-2 rounded-lg hover:bg-gray-50/50 gap-2">
                    <div>
                      <div className="font-bold text-gray-900 flex items-center gap-2">
                        {v.title}
                        <span className="text-[9px] uppercase tracking-wider font-bold bg-[#e9f5f0] text-[#1a7a5c] px-1.5 py-0.5 rounded-sm">
                          {v.status === 'paid' ? 'Paid' : 'Approved'}
                        </span>
                      </div>
                      <div className="text-gray-500 text-[11px] mt-0.5">
                        {v.code} · {v.project} · Payee: {v.payee}
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="num font-bold text-gray-900">Br {v.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      <div className="text-gray-400 text-[10px]">
                        {v.date ? new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      )}

    </div>
  );
};
