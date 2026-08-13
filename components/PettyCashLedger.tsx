'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { Plus, Download, Receipt, ArrowUpRight, ArrowDownRight, Loader2, X } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export const PettyCashLedger = () => {
  const { data, error, isLoading } = useSWR('/api/petty-cash', fetcher);
  const transactions = data?.data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [type, setType] = useState<'IN' | 'OUT'>('OUT');

  const currentBalance = transactions.length > 0 ? transactions[0].balance : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/petty-cash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          amount: Number(amount),
          type,
        })
      });
      if (res.ok) {
        mutate('/api/petty-cash');
        setIsModalOpen(false);
        setDescription('');
        setAmount('');
        setType('OUT');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-sm font-bold text-gray-400">Loading Ledger...</div>;
  if (error) return <div className="p-8 text-center text-sm font-bold text-red-500">Failed to load ledger.</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#15181e]">Site Petty Cash Ledger</h2>
          <p className="text-xs text-gray-500">PRJ-CMC Residential Ph.2</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right mr-4 border-r border-gray-200 pr-4">
            <div className="text-[10px] font-bold text-gray-400 uppercase">Current Balance</div>
            <div className="text-xl font-mono font-bold text-[#1a7a5c]">Br {currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#15181e] hover:bg-[#c1540f] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            Log Transaction
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#faf9f8] border-b border-gray-200 text-gray-500 uppercase text-[10px] font-bold">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Logged By</th>
                <th className="py-3 px-4 text-right">In (Br)</th>
                <th className="py-3 px-4 text-right">Out (Br)</th>
                <th className="py-3 px-4 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((tx: any) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-mono text-gray-500">{new Date(tx.date).toLocaleDateString('en-GB')}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">{tx.description}</td>
                  <td className="py-3 px-4 text-gray-500">{tx.loggedBy?.name || 'Unknown'}</td>
                  <td className="py-3 px-4 text-right font-mono text-[#1a7a5c] font-semibold">
                    {tx.type === 'IN' ? `+${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-[#b23a24] font-semibold">
                    {tx.type === 'OUT' ? `-${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-gray-900 bg-gray-50/50">
                    {tx.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">No transactions recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal matching DocumentGate Modal styling (Right Side Drawer) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-end bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm h-full overflow-y-auto shadow-2xl flex flex-col border-l border-gray-200">
            
            <div className="p-6 border-b border-gray-200 relative bg-[#faf9f8]">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-black hover:border-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#c1540f]">
                Petty Cash
              </div>
              <h2 className="font-serif text-2xl font-semibold text-[#15181e] mt-1 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#c1540f]" />
                Log Transaction
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1 flex flex-col">
              <div className="space-y-4 flex-1">
                
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setType('OUT')}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all flex justify-center items-center gap-1 ${
                        type === 'OUT' ? 'bg-[#fbebe7] border-[#f0c3b6] text-[#b23a24]' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      <ArrowDownRight className="w-4 h-4" /> Expense
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('IN')}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all flex justify-center items-center gap-1 ${
                        type === 'IN' ? 'bg-[#e9f5f0] border-[#bfe3d4] text-[#1a7a5c]' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      <ArrowUpRight className="w-4 h-4" /> Replenish
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Amount (ETB)</label>
                  <input
                    required
                    type="number"
                    min="1"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-bold focus:outline-none focus:border-[#c1540f] focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="E.g. Transport for site labourers"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c1540f] focus:bg-white transition-colors"
                  />
                </div>

              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#15181e] text-white hover:bg-[#c1540f] disabled:bg-gray-400 transition-all shadow-md flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
