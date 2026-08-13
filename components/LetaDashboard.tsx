'use client';

import React, { useState } from 'react';
import { PaymentVoucher, VendorQuote } from '@/lib/types';
import { VENDOR_QUOTES } from '@/lib/mock-data';
import { Plus, Search, Filter, CheckCircle2, Clock, FileText } from 'lucide-react';
import { ProjectCostReport } from '@/components/ProjectCostReport';

interface LetaDashboardProps {
  activeTab: string;
  vouchers: PaymentVoucher[];
  onOpenNewVoucherModal: () => void;
  onSelectVendor: (vendor: VendorQuote) => void;
  onViewVoucher?: (code: string) => void;
}

export const LetaDashboard: React.FC<LetaDashboardProps> = ({
  activeTab,
  vouchers,
  onOpenNewVoucherModal,
  onSelectVendor,
  onViewVoucher,
}) => {
  const [filter, setFilter] = useState<'all' | 'needs_attention' | 'approved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // We filter vouchers if a specific filter is set, otherwise all.
  // Note: For the actual tables below, we split them statically when "all" is selected, 
  // but if a filter is clicked, we might want to hide the other table. For now, 
  // we'll apply the filter logic directly to the mapped arrays.

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Preparation, not approval
          </div>
          <h1 className="font-serif text-3xl font-semibold text-[#15181e] mt-0.5">
            Welcome, Leta
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Approval is always someone else's decision — Dembi or Mesael.
          </p>
        </div>
        <button
          onClick={onOpenNewVoucherModal}
          className="bg-[#15181e] hover:bg-[#c1540f] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Voucher (Document Gate)
        </button>
      </div>

      {/* Stat Strip */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100">
        <div className="flex-1 pb-6 md:pb-0 md:pr-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Awaiting approval</div>
            <div className="num text-3xl font-bold text-[#15181e] mt-0.5">2</div>
            <div className="text-xs text-gray-500 mt-0.5">Br 1.44M in total</div>
          </div>
        </div>
        <div className="flex-1 py-6 md:py-0 md:px-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-50 border border-yellow-100 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Documents pending</div>
            <div className="num text-3xl font-bold text-[#b4550b] mt-0.5">2</div>
            <div className="text-xs text-gray-500 mt-0.5">Blocking submission</div>
          </div>
        </div>
        <div className="flex-1 pt-6 md:pt-0 md:pl-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Approved this week</div>
            <div className="num text-3xl font-bold text-[#1a7a5c] mt-0.5">4</div>
            <div className="text-xs text-gray-500 mt-0.5">Br 613,550</div>
          </div>
        </div>
      </div>

      {/* Main Content Render based on Active Tab */}
      {activeTab === 'vendors' ? (
        
        /* Vendor Comparison Tab */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#15181e]">Vendor Comparison Engine</h2>
              <p className="text-xs text-gray-500">Reinforcement steel — Bole Ring Road, base course. Three quotes on file.</p>
            </div>
          </div>

          <div className="space-y-3">
            {VENDOR_QUOTES.map((vendor) => (
              <div
                key={vendor.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  vendor.isBestValue
                    ? 'bg-gradient-to-r from-[#e9f5f0]/80 to-white border-[#bfe3d4] shadow-sm'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#15181e]">{vendor.name}</span>
                    {vendor.isBestValue && (
                      <span className="tag-badge good">
                        ★ Best value
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">{vendor.location}</div>
                </div>

                <div className="flex items-center gap-6 text-xs text-gray-600">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Lead time</span>
                    <span className="font-bold text-gray-900">{vendor.leadTimeDays} days</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Terms</span>
                    <span className="font-bold text-gray-900">{vendor.advanceRequirement}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">On-time</span>
                    <span className="font-bold text-gray-900">{vendor.onTimeRatio}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4">
                  <div className="text-right">
                    <div className="num font-bold text-lg text-[#15181e]">Br {vendor.pricePerUnit.toFixed(2)}</div>
                    <div className="text-[10px] text-gray-500">{vendor.unit}</div>
                  </div>
                  <button
                    onClick={() => onSelectVendor(vendor)}
                    className="bg-[#15181e] hover:bg-[#c1540f] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
                  >
                    Select Payee
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      ) : activeTab === 'reports' ? (

        <ProjectCostReport />

      ) : activeTab === 'pettycash' ? (

        /* Petty Cash Operations Tab */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="panel space-y-3 p-5 sm:p-5">
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
              <div className="text-[11px] text-[#b23a24] font-semibold">
                94% used — Crossing threshold requires bank transfer request fallback.
              </div>
            </div>

            <div className="panel space-y-3 p-5 sm:p-5">
              <div className="flex justify-between items-center">
                <span className="tag-badge good">Healthy</span>
                <span className="text-xs text-gray-400">Ceiling Br 60,000</span>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-600">Petty Cash — Head Office</div>
                <div className="num text-2xl font-bold text-[#15181e] mt-1">Br 22,600</div>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#1a7a5c] h-full w-[38%] rounded-full"></div>
              </div>
              <div className="text-[11px] text-gray-500">
                38% used — Operational float within normal limits.
              </div>
            </div>
          </div>
        </div>

      ) : (

        /* Payment Requests Dual Tables View */
        <div className="space-y-6">
          
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 text-xs font-bold rounded-full whitespace-nowrap transition-all ${
                  filter === 'all' ? 'bg-[#15181e] text-white shadow-md' : 'bg-white border border-gray-200 text-[#15181e] hover:bg-gray-50'
                }`}
              >
                All <span className={filter === 'all' ? 'text-gray-400 mx-1' : 'text-gray-300 mx-1'}>·</span> {vouchers.length}
              </button>
              <button
                onClick={() => setFilter('needs_attention')}
                className={`px-4 py-2 text-xs font-bold rounded-full whitespace-nowrap transition-all ${
                  filter === 'needs_attention' ? 'bg-[#15181e] text-white shadow-md' : 'bg-white border border-gray-200 text-[#15181e] hover:bg-gray-50'
                }`}
              >
                Needs Attention <span className={filter === 'needs_attention' ? 'text-gray-400 mx-1' : 'text-gray-300 mx-1'}>·</span> {vouchers.filter((v) => v.status === 'pending_docs' || v.status === 'ready_for_approval').length}
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`px-4 py-2 text-xs font-bold rounded-full whitespace-nowrap transition-all ${
                  filter === 'approved' ? 'bg-[#15181e] text-white shadow-md' : 'bg-white border border-gray-200 text-[#15181e] hover:bg-gray-50'
                }`}
              >
                Approved <span className={filter === 'approved' ? 'text-gray-400 mx-1' : 'text-gray-300 mx-1'}>·</span> {vouchers.filter((v) => v.status === 'approved' || v.status === 'paid' || v.status === 'owner_reserved').length}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative min-w-[240px] hidden sm:block">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search voucher, supplier..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#c1540f]"
                />
              </div>
              <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold bg-white hover:bg-gray-50 text-[#15181e] h-9">
                <Filter className="w-4 h-4" /> Filter
              </button>
            </div>
          </div>

          {/* Needs Attention Table */}
          {(filter === 'all' || filter === 'needs_attention') && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2 text-sm font-bold text-[#15181e]">
                  <div className="w-5 h-5 rounded-full border border-orange-200 flex items-center justify-center text-orange-500 bg-orange-50 text-xs font-bold">!</div>
                  Needs Your Attention
                </div>
                <a href="#" className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1">View all &rarr;</a>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="text-[10px] uppercase font-bold text-gray-400 bg-[#faf9f8] border-b border-gray-100">
                    <tr>
                      <th className="px-5 py-3.5 tracking-wider">Voucher No.</th>
                      <th className="px-5 py-3.5 tracking-wider">Supplier</th>
                      <th className="px-5 py-3.5 tracking-wider">Description</th>
                      <th className="px-5 py-3.5 tracking-wider text-right">Amount (Br)</th>
                      <th className="px-5 py-3.5 tracking-wider">Issue</th>
                      <th className="px-5 py-3.5 tracking-wider">Requested By</th>
                      <th className="px-5 py-3.5 tracking-wider">Date</th>
                      <th className="px-5 py-3.5 tracking-wider text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {vouchers.filter(v => 
                      (v.status === 'pending_docs' || v.status === 'ready_for_approval') &&
                      (!searchQuery || v.title.toLowerCase().includes(searchQuery.toLowerCase()) || v.payee.toLowerCase().includes(searchQuery.toLowerCase()))
                    ).map((v) => (
                      <tr key={v.id} className="hover:bg-gray-50/80 transition-colors group">
                        <td className="px-5 py-4 font-semibold text-gray-900 mono text-[10.5px]">{v.code}</td>
                        <td className="px-5 py-4 text-gray-700 font-medium">{v.payee}</td>
                        <td className="px-5 py-4 text-gray-700">{v.title}</td>
                        <td className="px-5 py-4 font-bold text-[#15181e] num text-right">{v.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-5 py-4">
                          <span className={`tag-badge ${v.status === 'ready_for_approval' ? 'warn' : 'bad'}`}>
                            {v.status === 'ready_for_approval' ? 'Awaiting Approval' : 'Documents Pending'}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-semibold text-gray-900">{v.preparedBy || 'Leta'}</td>
                        <td className="px-5 py-4 text-gray-500">{new Date(v.date || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => onViewVoucher && onViewVoucher(v.code)}
                              className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 font-bold hover:bg-gray-100 text-[10px] transition-colors"
                            >
                              Review
                            </button>
                            <button className="text-gray-300 hover:text-gray-600">⋮</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {vouchers.filter(v => v.status === 'pending_docs' || v.status === 'ready_for_approval').length === 0 && (
                      <tr><td colSpan={8} className="px-5 py-10 text-center text-gray-400">No items need attention.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent Activity Table */}
          {(filter === 'all' || filter === 'approved') && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2 text-sm font-bold text-[#15181e]">
                  <Clock className="w-4 h-4 text-gray-400" />
                  Recent Activity
                </div>
                <a href="#" className="text-xs font-bold text-gray-500 hover:text-gray-700">View all</a>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="text-[10px] uppercase font-bold text-gray-400 bg-[#faf9f8] border-b border-gray-100">
                    <tr>
                      <th className="px-5 py-3.5 tracking-wider">Voucher No.</th>
                      <th className="px-5 py-3.5 tracking-wider">Supplier</th>
                      <th className="px-5 py-3.5 tracking-wider">Description</th>
                      <th className="px-5 py-3.5 tracking-wider text-right">Amount (Br)</th>
                      <th className="px-5 py-3.5 tracking-wider">Status</th>
                      <th className="px-5 py-3.5 tracking-wider">Requested By</th>
                      <th className="px-5 py-3.5 tracking-wider">Date</th>
                      <th className="px-5 py-3.5 tracking-wider text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {vouchers.filter(v => 
                      (v.status === 'approved' || v.status === 'paid' || v.status === 'owner_reserved') &&
                      (!searchQuery || v.title.toLowerCase().includes(searchQuery.toLowerCase()) || v.payee.toLowerCase().includes(searchQuery.toLowerCase()))
                    ).map((v) => (
                      <tr key={v.id} className="hover:bg-gray-50/80 transition-colors group">
                        <td className="px-5 py-4 font-semibold text-gray-900 mono text-[10.5px]">{v.code}</td>
                        <td className="px-5 py-4 text-gray-700 font-medium">{v.payee}</td>
                        <td className="px-5 py-4 text-gray-700">{v.title}</td>
                        <td className="px-5 py-4 font-bold text-[#15181e] num text-right">{v.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-5 py-4">
                          <span className={`tag-badge ${v.status === 'owner_reserved' ? 'warn' : 'good'}`}>
                            {v.status === 'owner_reserved' ? 'Owner-reserved' : 'Approved'}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-semibold text-gray-900">{v.preparedBy || 'Leta'}</td>
                        <td className="px-5 py-4 text-gray-500">{new Date(v.date || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => onViewVoucher && onViewVoucher(v.code)}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 font-bold hover:bg-gray-100 text-[10px] transition-colors mr-2"
                          >
                            View
                          </button>
                          <button className="text-gray-300 hover:text-gray-600">⋮</button>
                        </td>
                      </tr>
                    ))}
                    {vouchers.filter(v => v.status === 'approved' || v.status === 'paid' || v.status === 'owner_reserved').length === 0 && (
                      <tr><td colSpan={8} className="px-5 py-10 text-center text-gray-400">No recent activity.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      )}

    </div>
  );
};
