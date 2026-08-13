'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { BookOpen, Plus, Activity, BookText } from 'lucide-react';

export const LedgerDesk = ({ onToast }: { onToast: (t: string, m: string, s?: 'success'|'warning') => void }) => {
  const { data: accData, mutate: mutateAcc } = useSWR('/api/ledger/accounts', (url) => fetch(url).then(res => res.json()));
  const accounts = accData?.data || [];

  const { data: jvData, mutate: mutateJv } = useSWR('/api/ledger/journals', (url) => fetch(url).then(res => res.json()));
  const journals = jvData?.data || [];

  const [activeTab, setActiveTab] = useState<'journals' | 'coa'>('journals');

  // Manual Journal State
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState([{ accountId: '', debit: 0, credit: 0 }, { accountId: '', debit: 0, credit: 0 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalDebit = lines.reduce((acc, l) => acc + Number(l.debit || 0), 0);
  const totalCredit = lines.reduce((acc, l) => acc + Number(l.credit || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const handleAddLine = () => {
    setLines([...lines, { accountId: '', debit: 0, credit: 0 }]);
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    const newLines = [...lines];
    (newLines[index] as any)[field] = value;
    setLines(newLines);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) {
      onToast('Validation', 'Debits must equal credits.', 'warning');
      return;
    }
    if (!description) {
      onToast('Validation', 'Description is required.', 'warning');
      return;
    }
    const validLines = lines.filter(l => l.accountId && (l.debit > 0 || l.credit > 0));
    if (validLines.length < 2) {
      onToast('Validation', 'At least two valid lines are required.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/ledger/journals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, lines: validLines })
      });
      const result = await res.json();
      if (result.success) {
        onToast('Journal Posted', result.message);
        setDescription('');
        setLines([{ accountId: '', debit: 0, credit: 0 }, { accountId: '', debit: 0, credit: 0 }]);
        mutateJv();
      } else {
        onToast('Error', result.message, 'warning');
      }
    } catch (err) {
      onToast('Error', 'Failed to post journal', 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-700">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#15181e]">General Ledger</h2>
            <p className="text-xs text-gray-500 font-medium">Double-entry accounting, COA, and journal management.</p>
          </div>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('journals')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'journals' ? 'bg-white text-[#15181e] shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Journal Entries
          </button>
          <button
            onClick={() => setActiveTab('coa')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'coa' ? 'bg-white text-[#15181e] shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Chart of Accounts
          </button>
        </div>
      </div>

      {activeTab === 'coa' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-bold text-sm text-[#15181e] mb-4">Chart of Accounts (COA)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 uppercase text-[10px] font-bold">
                  <th className="py-2 px-3">Code</th>
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {accounts.map((acc: any) => (
                  <tr key={acc.id} className="hover:bg-gray-50/50">
                    <td className="py-2.5 px-3 font-mono font-bold text-gray-900">{acc.code}</td>
                    <td className="py-2.5 px-3 font-semibold text-gray-700">{acc.name}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-[10px] font-bold">
                        {acc.type}
                      </span>
                    </td>
                  </tr>
                ))}
                {accounts.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-400 font-medium">No accounts found. Use the backend to seed the COA.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'journals' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Post Manual Journal Form */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
            <h3 className="font-bold text-sm text-[#15181e] mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4"/> Post Manual Journal
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Description / Memo</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full text-sm font-bold text-gray-900 border border-gray-200 bg-gray-50/50 rounded-xl p-2.5 outline-none focus:border-indigo-600 transition-all resize-none h-20"
                  placeholder="e.g. Monthly Depreciation"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Lines</label>
                {lines.map((line, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <select
                        value={line.accountId}
                        onChange={e => handleLineChange(idx, 'accountId', e.target.value)}
                        className="w-full text-xs font-semibold text-gray-900 border border-gray-200 bg-gray-50/50 rounded-lg p-2 outline-none focus:border-indigo-600 transition-all"
                      >
                        <option value="">- Select Account -</option>
                        {accounts.map((acc: any) => (
                          <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-20">
                      <input
                        type="number"
                        placeholder="Dr"
                        value={line.debit || ''}
                        onChange={e => {
                          handleLineChange(idx, 'debit', Number(e.target.value));
                          if (Number(e.target.value) > 0) handleLineChange(idx, 'credit', 0);
                        }}
                        className="w-full text-xs font-mono font-bold border border-gray-200 bg-gray-50/50 rounded-lg p-2 outline-none focus:border-indigo-600 transition-all"
                      />
                    </div>
                    <div className="w-20">
                      <input
                        type="number"
                        placeholder="Cr"
                        value={line.credit || ''}
                        onChange={e => {
                          handleLineChange(idx, 'credit', Number(e.target.value));
                          if (Number(e.target.value) > 0) handleLineChange(idx, 'debit', 0);
                        }}
                        className="w-full text-xs font-mono font-bold border border-gray-200 bg-gray-50/50 rounded-lg p-2 outline-none focus:border-indigo-600 transition-all"
                      />
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={handleAddLine}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800"
                >
                  + Add Line
                </button>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center text-xs">
                <span className="font-bold text-gray-500">Totals</span>
                <div className="flex gap-4">
                  <span className="font-mono font-bold text-gray-900">Dr {totalDebit.toLocaleString()}</span>
                  <span className="font-mono font-bold text-gray-900">Cr {totalCredit.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !isBalanced || !description}
                className="w-full py-3 bg-[#15181e] text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-sm"
              >
                {isSubmitting ? 'Posting...' : 'Post Journal'}
              </button>
            </form>
          </div>

          {/* View Journals */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-sm text-[#15181e] px-1">Posted Journals</h3>
            {journals.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center">
                <p className="text-gray-400 font-medium text-sm">No journal entries found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {journals.map((jv: any) => (
                  <div key={jv.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                      <div>
                        <div className="font-mono font-bold text-indigo-700 text-sm">{jv.code}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                          {new Date(jv.date).toLocaleDateString()} · Posted by {jv.preparedBy?.name}
                        </div>
                      </div>
                      <span className="tag-badge good">POSTED</span>
                    </div>
                    <div className="p-4">
                      <p className="text-xs font-medium text-gray-800 mb-4">{jv.description}</p>
                      
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-gray-100 text-gray-400 uppercase text-[9px] font-bold">
                            <th className="py-2">Account</th>
                            <th className="py-2 text-right">Debit (Br)</th>
                            <th className="py-2 text-right">Credit (Br)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {jv.lines.map((l: any) => (
                            <tr key={l.id}>
                              <td className="py-2">
                                <span className="font-mono font-bold mr-2 text-gray-900">{l.account.code}</span>
                                <span className="text-gray-600">{l.account.name}</span>
                              </td>
                              <td className="py-2 text-right font-mono font-bold text-gray-900">
                                {l.debit > 0 ? l.debit.toLocaleString() : ''}
                              </td>
                              <td className="py-2 text-right font-mono font-bold text-gray-900">
                                {l.credit > 0 ? l.credit.toLocaleString() : ''}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
