'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { Plus, Search, FileText, CheckCircle, Percent, X } from 'lucide-react';

export const SubcontractDesk = ({ onToast }: { onToast: (t: string, m: string, s?: 'success'|'warning') => void }) => {
  const { data, mutate } = useSWR('/api/subcontracts', (url: string) => fetch(url).then(res => res.json()));
  const subcontracts = data?.data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vendorId, setVendorId] = useState('');
  const [projectId, setProjectId] = useState('PRJ-BOLE');
  const [costCodeId, setCostCodeId] = useState('CC-2201');
  const [contractValue, setContractValue] = useState(0);
  const [advancePercent, setAdvancePercent] = useState(20);
  const [retentionPercent, setRetentionPercent] = useState(5);
  const [advancePaid, setAdvancePaid] = useState(0);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick fetch for vendors
  const { data: vendorData } = useSWR('/api/p2p/suppliers', (url: string) => fetch(url).then(res => res.json()));
  const vendors = vendorData?.data || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId || !contractValue) {
      onToast('Validation Error', 'Vendor and Contract Value are required', 'warning');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/subcontracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId, projectId, costCodeId, contractValue, advancePercent, retentionPercent, advancePaid
        })
      });
      const result = await res.json();
      if (result.success) {
        onToast('Subcontract Registered', result.message);
        setIsModalOpen(false);
        mutate();
      } else {
        onToast('Error', result.message, 'warning');
      }
    } catch (err) {
      onToast('Error', 'Failed to register subcontract', 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#15181e]">Subcontracts Registry</h2>
            <p className="text-xs text-gray-500 font-medium">Manage subcontractor agreements, advances, and retention.</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#15181e] text-white text-xs font-bold rounded-xl hover:bg-[#c1540f] transition-all flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Register Subcontract
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subcontracts.map((sub: any) => (
          <div key={sub.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4">
              <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded-md ${
                sub.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {sub.status}
              </span>
            </div>
            
            <div className="text-[10px] font-bold text-gray-400 mb-1">{sub.code}</div>
            <h3 className="font-bold text-[#15181e] text-base mb-1 pr-16">{sub.vendorName}</h3>
            <p className="text-xs text-gray-500 font-medium mb-4">{sub.projectCode} · {sub.costCode}</p>
            
            <div className="space-y-2 mb-4 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 font-medium">Contract Value</span>
                <span className="font-bold font-mono text-[#15181e]">Br {sub.contractValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 font-medium">Certified to Date</span>
                <span className="font-bold font-mono text-blue-600">Br {sub.certifiedWork.toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#fdf1e7] border border-[#f3d3b3] p-2.5 rounded-xl">
                <div className="text-[10px] uppercase font-bold text-[#b23a24] mb-1">Advance ({sub.advancePercent}%)</div>
                <div className="font-mono font-bold text-[#8f3d0b]">Br {sub.advancePaid.toLocaleString()}</div>
                <div className="text-[9px] text-[#b23a24] mt-0.5 font-medium">{sub.unrecoveredAdvance > 0 ? `Unrecovered: Br ${sub.unrecoveredAdvance.toLocaleString()}` : 'Fully Recovered'}</div>
              </div>
              <div className="bg-[#e9f5f0] border border-[#bfe3d4] p-2.5 rounded-xl">
                <div className="text-[10px] uppercase font-bold text-[#1a7a5c] mb-1">Retention ({sub.retentionPercent}%)</div>
                <div className="font-mono font-bold text-[#1a7a5c]">Br {sub.totalRetention.toLocaleString()}</div>
                <div className="text-[9px] text-[#1a7a5c] mt-0.5 font-medium">Withheld safely</div>
              </div>
            </div>
          </div>
        ))}
        {subcontracts.length === 0 && (
          <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-gray-100 border-dashed">
            <p className="text-gray-400 font-medium text-sm">No subcontracts registered yet.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100 bg-[#faf9f8] flex justify-between items-center">
              <div>
                <h3 className="font-serif text-xl font-semibold text-[#15181e]">Register Subcontract</h3>
                <p className="text-xs text-gray-500 mt-0.5">Establish the contract baseline for future IPCs.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:text-black hover:border-gray-400 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Subcontractor (Vendor)</label>
                <select 
                  value={vendorId} onChange={e => setVendorId(e.target.value)} required
                  className="w-full text-sm font-bold text-gray-900 border border-gray-200 bg-gray-50/50 rounded-xl p-2.5 outline-none focus:border-[#c1540f] focus:bg-white transition-all"
                >
                  <option value="">-- Select Vendor --</option>
                  {vendors.map((v: any) => <option key={v.id} value={v.id}>{v.legalName}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Project</label>
                  <select 
                    value={projectId} onChange={e => setProjectId(e.target.value)}
                    className="w-full text-sm font-bold text-gray-900 border border-gray-200 bg-gray-50/50 rounded-xl p-2.5 outline-none focus:border-[#c1540f] focus:bg-white transition-all"
                  >
                    <option value="PRJ-BOLE">Bole Ring Road</option>
                    <option value="PRJ-CMC">CMC Superstructure</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Cost Code</label>
                  <select 
                    value={costCodeId} onChange={e => setCostCodeId(e.target.value)}
                    className="w-full text-sm font-bold text-gray-900 border border-gray-200 bg-gray-50/50 rounded-xl p-2.5 outline-none focus:border-[#c1540f] focus:bg-white transition-all"
                  >
                    <option value="CC-2201">CC-2201 (Substructures)</option>
                    <option value="CC-4102">CC-4102 (Finishing)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Total Contract Value (ETB)</label>
                <input 
                  type="number" value={contractValue || ''} onChange={e => setContractValue(Number(e.target.value))} required min="0"
                  className="w-full text-sm font-mono font-bold text-gray-900 border border-gray-200 bg-gray-50/50 rounded-xl p-2.5 outline-none focus:border-[#c1540f] focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1">Advance <Percent className="w-3 h-3"/></label>
                  <input 
                    type="number" value={advancePercent} onChange={e => setAdvancePercent(Number(e.target.value))} min="0" max="100"
                    className="w-full text-sm font-bold text-gray-900 border border-gray-200 bg-gray-50/50 rounded-xl p-2.5 outline-none focus:border-[#c1540f] focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1">Retention <Percent className="w-3 h-3"/></label>
                  <input 
                    type="number" value={retentionPercent} onChange={e => setRetentionPercent(Number(e.target.value))} min="0" max="100"
                    className="w-full text-sm font-bold text-gray-900 border border-gray-200 bg-gray-50/50 rounded-xl p-2.5 outline-none focus:border-[#c1540f] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#b23a24] mb-1.5">Initial Advance Paid (ETB) - if any</label>
                <input 
                  type="number" value={advancePaid || ''} onChange={e => setAdvancePaid(Number(e.target.value))} min="0"
                  className="w-full text-sm font-mono font-bold text-[#8f3d0b] border border-[#f3d3b3] bg-[#fdf1e7] rounded-xl p-2.5 outline-none focus:border-[#c1540f] transition-all"
                />
                <p className="text-[9px] text-gray-400 mt-1 font-medium">Amount actually disbursed upfront. IPCs will recover against this amount.</p>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-black">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-[#15181e] text-white text-xs font-bold rounded-xl hover:bg-[#c1540f] transition-all shadow-sm">
                  {isSubmitting ? 'Registering...' : 'Register Subcontract'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
