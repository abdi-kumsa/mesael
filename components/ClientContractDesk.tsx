'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { Plus, Search, Briefcase, CheckCircle, Percent, X } from 'lucide-react';

export const ClientContractDesk = ({ onToast }: { onToast: (t: string, m: string, s?: 'success'|'warning') => void }) => {
  const { data, mutate } = useSWR('/api/otc/contracts', (url: string) => fetch(url).then(res => res.json()));
  const contracts = data?.data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientId, setClientId] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newClientTin, setNewClientTin] = useState('');
  const [projectId, setProjectId] = useState('PRJ-BOLE');
  const [contractValue, setContractValue] = useState(0);
  const [advancePercent, setAdvancePercent] = useState(20);
  const [retentionPercent, setRetentionPercent] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick fetch for projects and clients
  // In a real app we'd fetch clients, but we'll allow creation here.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractValue) {
      onToast('Validation Error', 'Contract Value is required', 'warning');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/otc/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId, newClientName, newClientTin, projectId, contractValue, advancePercent, retentionPercent
        })
      });
      const result = await res.json();
      if (result.success) {
        onToast('Contract Registered', result.message);
        setIsModalOpen(false);
        mutate();
      } else {
        onToast('Error', result.message, 'warning');
      }
    } catch (err) {
      onToast('Error', 'Failed to register contract', 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#15181e]">Client Contracts</h2>
            <p className="text-xs text-gray-500 font-medium">Establish billing baselines for incoming revenue.</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#15181e] text-white text-xs font-bold rounded-xl hover:bg-[#c1540f] transition-all flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Register Contract
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {contracts.map((contract: any) => (
          <div key={contract.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all relative">
            <div className="absolute top-0 right-0 p-4">
              <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded-md ${
                contract.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {contract.status}
              </span>
            </div>
            
            <div className="text-[10px] font-bold text-gray-400 mb-1">{contract.code}</div>
            <h3 className="font-bold text-[#15181e] text-base mb-1 pr-16">{contract.clientName}</h3>
            <p className="text-xs text-gray-500 font-medium mb-4">{contract.projectCode} · {contract.projectName}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Contract Value</div>
                <div className="font-mono font-bold text-[#15181e]">Br {contract.contractValue.toLocaleString()}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Gross Billed</div>
                <div className="font-mono font-bold text-blue-600">Br {contract.grossInvoiced.toLocaleString()}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs border-t border-gray-100 pt-4">
              <div>
                <div className="text-[9px] uppercase font-bold text-gray-400">Total Collected</div>
                <div className="font-mono font-bold text-[#1a7a5c] mt-0.5">Br {contract.totalCollected.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[9px] uppercase font-bold text-gray-400">Advance Recov.</div>
                <div className="font-mono font-bold text-gray-600 mt-0.5">Br {contract.advanceRecovered.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[9px] uppercase font-bold text-gray-400">Retention Held</div>
                <div className="font-mono font-bold text-gray-600 mt-0.5">Br {contract.retentionWithheld.toLocaleString()}</div>
              </div>
            </div>
          </div>
        ))}
        {contracts.length === 0 && (
          <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-gray-100 border-dashed">
            <p className="text-gray-400 font-medium text-sm">No client contracts registered yet.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-end bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl flex flex-col border-l border-gray-200 animate-slide-in-right">
            <div className="p-6 border-b border-gray-100 bg-[#faf9f8] flex justify-between items-center">
              <div>
                <h3 className="font-serif text-xl font-semibold text-[#15181e]">Register Client Contract</h3>
                <p className="text-xs text-gray-500 mt-0.5">Establish billing baselines and deductions.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:text-black hover:border-gray-400 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1 flex flex-col">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">New Client Name</label>
                  <input 
                    type="text" value={newClientName} onChange={e => setNewClientName(e.target.value)} required
                    className="w-full text-sm font-bold text-gray-900 border border-gray-200 bg-gray-50/50 rounded-xl p-2.5 outline-none focus:border-purple-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Client TIN</label>
                  <input 
                    type="text" value={newClientTin} onChange={e => setNewClientTin(e.target.value)} required
                    className="w-full text-sm font-mono font-bold text-gray-900 border border-gray-200 bg-gray-50/50 rounded-xl p-2.5 outline-none focus:border-purple-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Project</label>
                <select 
                  value={projectId} onChange={e => setProjectId(e.target.value)}
                  className="w-full text-sm font-bold text-gray-900 border border-gray-200 bg-gray-50/50 rounded-xl p-2.5 outline-none focus:border-purple-500 transition-all"
                >
                  <option value="PRJ-BOLE">Bole Ring Road</option>
                  <option value="PRJ-CMC">CMC Superstructure</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Total Contract Value (ETB)</label>
                <input 
                  type="number" value={contractValue || ''} onChange={e => setContractValue(Number(e.target.value))} required min="0"
                  className="w-full text-sm font-mono font-bold text-gray-900 border border-gray-200 bg-gray-50/50 rounded-xl p-2.5 outline-none focus:border-purple-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1">Advance <Percent className="w-3 h-3"/></label>
                  <input 
                    type="number" value={advancePercent} onChange={e => setAdvancePercent(Number(e.target.value))} min="0" max="100"
                    className="w-full text-sm font-bold text-gray-900 border border-gray-200 bg-gray-50/50 rounded-xl p-2.5 outline-none focus:border-purple-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1">Retention <Percent className="w-3 h-3"/></label>
                  <input 
                    type="number" value={retentionPercent} onChange={e => setRetentionPercent(Number(e.target.value))} min="0" max="100"
                    className="w-full text-sm font-bold text-gray-900 border border-gray-200 bg-gray-50/50 rounded-xl p-2.5 outline-none focus:border-purple-500 transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-black">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-[#15181e] text-white text-xs font-bold rounded-xl hover:bg-purple-600 transition-all shadow-sm">
                  {isSubmitting ? 'Registering...' : 'Register Contract'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
