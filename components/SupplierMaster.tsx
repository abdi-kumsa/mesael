'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { Plus, Check, Search, Building2, AlertTriangle, FileText } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export const SupplierMaster = () => {
  const { data, isLoading } = useSWR('/api/p2p/suppliers', fetcher);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ legalName: '', tin: '', vatStatus: 'REGISTERED', bank: '', account: '' });
  const [search, setSearch] = useState('');

  const suppliers = data?.data || [];
  const filtered = suppliers.filter((s: any) => s.legalName.toLowerCase().includes(search.toLowerCase()) || s.tin.includes(search));

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/p2p/suppliers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        bankDetails: { bank: formData.bank, account: formData.account }
      })
    });
    if (res.ok) {
      setIsAdding(false);
      setFormData({ legalName: '', tin: '', vatStatus: 'REGISTERED', bank: '', account: '' });
      mutate('/api/p2p/suppliers');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" /> Supplier Master Data
          </div>
          <h2 className="text-2xl font-serif font-semibold text-[#15181e] mt-1">Approved Vendors</h2>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-[#15181e] hover:bg-[#c1540f] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Register Supplier
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="panel space-y-4 bg-gray-50/50 border border-[#c1540f]/20">
          <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">New Supplier Onboarding</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-700">
            <div>
              <label className="block mb-1.5 uppercase text-[10px] tracking-wider text-gray-400">Legal Name</label>
              <input required value={formData.legalName} onChange={e => setFormData({...formData, legalName: e.target.value})} className="input-field w-full" placeholder="Company PLC" />
            </div>
            <div>
              <label className="block mb-1.5 uppercase text-[10px] tracking-wider text-gray-400">TIN Number</label>
              <input required value={formData.tin} onChange={e => setFormData({...formData, tin: e.target.value})} className="input-field w-full font-mono" placeholder="0012345678" />
            </div>
            <div>
              <label className="block mb-1.5 uppercase text-[10px] tracking-wider text-gray-400">VAT Status</label>
              <select value={formData.vatStatus} onChange={e => setFormData({...formData, vatStatus: e.target.value})} className="input-field w-full">
                <option value="REGISTERED">VAT Registered</option>
                <option value="UNREGISTERED">Not Registered</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block mb-1.5 uppercase text-[10px] tracking-wider text-gray-400">Bank</label>
                <input required value={formData.bank} onChange={e => setFormData({...formData, bank: e.target.value})} className="input-field w-full" placeholder="CBE" />
              </div>
              <div>
                <label className="block mb-1.5 uppercase text-[10px] tracking-wider text-gray-400">Account No.</label>
                <input required value={formData.account} onChange={e => setFormData({...formData, account: e.target.value})} className="input-field w-full font-mono" placeholder="1000..." />
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="bg-[#1a7a5c] hover:bg-[#135c45] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Register & Approve
            </button>
          </div>
        </form>
      )}

      <div className="panel space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search suppliers by name or TIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 w-full sm:w-80 text-xs font-bold text-gray-700"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#faf9f8] border-b border-gray-200 text-gray-500 uppercase text-[10px] font-bold">
                <th className="py-3 px-4">Supplier Name</th>
                <th className="py-3 px-4">TIN</th>
                <th className="py-3 px-4">VAT Status</th>
                <th className="py-3 px-4">Bank Mandate</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && <tr><td colSpan={5} className="py-4 text-center text-gray-400 font-bold">Loading...</td></tr>}
              {filtered.map((s: any) => {
                const bank = s.bankDetails ? JSON.parse(s.bankDetails) : null;
                return (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-900">{s.legalName}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-gray-500">{s.tin}</td>
                    <td className="py-3 px-4">
                      {s.vatStatus === 'REGISTERED' ? (
                        <span className="text-[#1a7a5c] font-bold bg-[#1a7a5c]/10 px-2 py-0.5 rounded text-[10px]">VAT</span>
                      ) : (
                        <span className="text-gray-400 font-bold bg-gray-100 px-2 py-0.5 rounded text-[10px]">NONE</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                      {bank ? `${bank.bank}: ${bank.account}` : 'Pending Proof'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {s.status === 'APPROVED' ? (
                        <span className="flex items-center justify-end gap-1 text-[#1a7a5c] font-bold">
                          <Check className="w-3.5 h-3.5" /> Approved
                        </span>
                      ) : (
                        <span className="flex items-center justify-end gap-1 text-[#b23a24] font-bold">
                          <AlertTriangle className="w-3.5 h-3.5" /> Blocked
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
