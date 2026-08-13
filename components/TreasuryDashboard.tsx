'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { PaymentVoucher } from '@/lib/types';
import { Landmark, ArrowRightLeft, Search, CheckCircle2, X, Wallet, FileText, UserCircle } from 'lucide-react';
import { ToastMessage } from '@/components/ToastContainer';

interface TreasuryDashboardProps {
  onAddToast: (title: string, message: string, type: 'success' | 'warning' | 'info') => void;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const TreasuryDashboard: React.FC<TreasuryDashboardProps> = ({ onAddToast }) => {
  const [activeTab, setActiveTab] = useState<'execution' | 'accounts' | 'reconciliation' | 'owner'>('execution');
  
  // Data Fetching
  const { data: treasuryData } = useSWR('/api/treasury', fetcher, { refreshInterval: 5000 });
  const { data: posData } = useSWR('/api/treasury/position', fetcher, { refreshInterval: 10000 });
  const { data: accountsData } = useSWR('/api/treasury/accounts', fetcher);
  const { data: recData } = useSWR('/api/treasury/reconciliation', fetcher);
  const { data: ownerData } = useSWR('/api/treasury/owner', fetcher);

  const vouchers: PaymentVoucher[] = treasuryData?.data || [];
  const bankAccounts = accountsData?.data || [];
  const pos = posData?.data || { totalBankBalance: 0, totalCommittedOutflow: 0, totalExpectedInflow: 0, projectedPosition: 0 };
  const reconciliations = recData?.data || [];
  const ownerTxs = ownerData?.data || [];

  // Execution Modal State
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<PaymentVoucher | null>(null);
  const [bankReference, setBankReference] = useState('');
  const [selectedBankAccountId, setSelectedBankAccountId] = useState('');

  // Owner Tx State
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const [ownerTxForm, setOwnerTxForm] = useState({ type: 'DRAWING', amount: '', description: '', date: new Date().toISOString().split('T')[0] });

  // Rec State
  const [isRecModalOpen, setIsRecModalOpen] = useState(false);
  const [recForm, setRecForm] = useState({ accountId: '', periodEnd: new Date().toISOString().split('T')[0], statementBal: '', systemBal: '' });

  const pendingReleaseCount = vouchers.filter((v: any) => v.status === 'approved' || v.status === 'pending_release').length;
  const paidCount = vouchers.filter((v: any) => v.status === 'paid').length;

  const handleOpenReleaseModal = (voucher: PaymentVoucher) => {
    setSelectedVoucher(voucher);
    setBankReference('');
    setSelectedBankAccountId('');
    setIsReleaseModalOpen(true);
  };

  const handleExecutePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVoucher) return;

    try {
      const res = await fetch('/api/treasury', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voucherId: selectedVoucher.id, bankReference, bankAccountId: selectedBankAccountId }),
      });
      const result = await res.json();
      
      if (result.success) {
        mutate('/api/treasury');
        mutate('/api/treasury/position');
        mutate('/api/treasury/accounts');
        setIsReleaseModalOpen(false);
        onAddToast('Payment Executed', `Voucher ${selectedVoucher.code} successfully marked as Paid.`, 'success');
      } else {
        onAddToast('Error', result.message, 'warning');
      }
    } catch (err) {
      onAddToast('Error', 'Failed to execute payment', 'warning');
    }
  };

  const handleCreateOwnerTx = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/treasury/owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ownerTxForm),
      });
      const result = await res.json();
      if (result.success) {
        mutate('/api/treasury/owner');
        setIsOwnerModalOpen(false);
        onAddToast('Transaction Logged', 'Owner transaction classified successfully.', 'success');
      }
    } catch (err) {}
  };

  const handleCreateRec = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/treasury/reconciliation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recForm),
      });
      const result = await res.json();
      if (result.success) {
        mutate('/api/treasury/reconciliation');
        setIsRecModalOpen(false);
        onAddToast('Reconciliation Logged', 'Bank reconciliation saved.', 'success');
      }
    } catch (err) {}
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Treasury & Execution
            </div>
            <h1 className="font-serif text-3xl font-semibold text-[#15181e] mt-0.5">
              Cash & Banks
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Manage bank accounts, execute payments, and monitor cash position.
            </p>
          </div>
        </div>

        {/* Cash Position Strip */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <div className="flex-1 pb-6 md:pb-0 md:pr-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <Landmark className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Current Balance</div>
              <div className="num text-3xl font-bold text-[#15181e] mt-0.5">Br {pos.totalBankBalance.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-0.5">All accounts combined</div>
            </div>
          </div>
          <div className="flex-1 py-6 md:py-0 md:px-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
              <ArrowRightLeft className="w-5 h-5 text-[#b4550b]" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Pending Outflow</div>
              <div className="num text-3xl font-bold text-[#b4550b] mt-0.5">Br {pos.totalCommittedOutflow.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-0.5">{pendingReleaseCount} Vouchers waiting</div>
            </div>
          </div>
          <div className="flex-1 py-6 md:py-0 md:px-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Expected Inflow</div>
              <div className="num text-3xl font-bold text-[#1a7a5c] mt-0.5">Br {pos.totalExpectedInflow.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-0.5">Unpaid Invoices</div>
            </div>
          </div>
          <div className="flex-1 pt-6 md:pt-0 md:pl-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">30-Day Forecast</div>
              <div className={`num text-3xl font-bold mt-0.5 ${pos.projectedPosition < 0 ? 'text-[#b23a24]' : 'text-[#15181e]'}`}>
                Br {pos.projectedPosition.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Projected liquidity</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200">
          {['execution', 'accounts', 'reconciliation', 'owner'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === tab ? 'text-[#c1540f] border-b-2 border-[#c1540f]' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {tab === 'execution' && 'Payment Execution'}
              {tab === 'accounts' && 'Bank Accounts'}
              {tab === 'reconciliation' && 'Reconciliation'}
              {tab === 'owner' && 'Owner Drawings'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'execution' && (
          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                    <th className="px-6 py-4">Voucher & Payee</th>
                    <th className="px-6 py-4">Project</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-50">
                  {vouchers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-400 text-xs">No vouchers waiting.</td>
                    </tr>
                  ) : (
                    vouchers.map((voucher: any) => (
                      <tr key={voucher.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 align-top">
                          <div className="font-bold text-[#c1540f]">{voucher.code}</div>
                          <div className="text-xs font-medium mt-1">{voucher.payee}</div>
                        </td>
                        <td className="px-6 py-4 align-top text-xs">{voucher.project?.code}</td>
                        <td className="px-6 py-4 align-top font-mono font-bold">Br {voucher.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 align-top">
                          {voucher.status === 'paid' ? (
                            <span className="text-green-700 bg-green-50 px-2 py-1 rounded text-[10px] font-bold uppercase">Paid</span>
                          ) : (
                            <span className="text-orange-700 bg-orange-50 px-2 py-1 rounded text-[10px] font-bold uppercase">Pending Release</span>
                          )}
                        </td>
                        <td className="px-6 py-4 align-top text-right">
                          {voucher.status !== 'paid' && (
                            <button onClick={() => handleOpenReleaseModal(voucher)} className="px-3 py-1.5 text-xs font-bold bg-[#15181e] text-white rounded hover:bg-[#c1540f]">Execute</button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'accounts' && (
          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm p-6">
            <h3 className="font-bold text-[#15181e] mb-4">Bank Account Register</h3>
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                  <th className="py-2">Bank & Account</th>
                  <th className="py-2">Number</th>
                  <th className="py-2">Purpose</th>
                  <th className="py-2 text-right">Book Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bankAccounts.map((acc: any) => (
                  <tr key={acc.id}>
                    <td className="py-3 font-medium">{acc.bankName} - {acc.accountName}</td>
                    <td className="py-3 font-mono text-xs">{acc.accountNumber}</td>
                    <td className="py-3 text-xs text-gray-500">{acc.purpose}</td>
                    <td className="py-3 text-right font-mono font-bold text-[#1a7a5c]">Br {acc.balance.toLocaleString()}</td>
                  </tr>
                ))}
                {bankAccounts.length === 0 && <tr><td colSpan={4} className="py-4 text-center text-xs text-gray-500">No bank accounts registered.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'reconciliation' && (
          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-[#15181e]">Bank Reconciliations</h3>
              <button onClick={() => setIsRecModalOpen(true)} className="px-3 py-1.5 text-xs font-bold bg-[#15181e] text-white rounded">New Rec</button>
            </div>
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                  <th className="py-2">Date</th>
                  <th className="py-2">Account</th>
                  <th className="py-2 text-right">System Bal</th>
                  <th className="py-2 text-right">Statement Bal</th>
                  <th className="py-2 text-right">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reconciliations.map((rec: any) => (
                  <tr key={rec.id}>
                    <td className="py-3">{new Date(rec.periodEnd).toLocaleDateString()}</td>
                    <td className="py-3">{rec.account.bankName}</td>
                    <td className="py-3 text-right font-mono">Br {rec.systemBal.toLocaleString()}</td>
                    <td className="py-3 text-right font-mono">Br {rec.statementBal.toLocaleString()}</td>
                    <td className={`py-3 text-right font-mono font-bold ${rec.variance === 0 ? 'text-green-600' : 'text-red-600'}`}>Br {rec.variance.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'owner' && (
          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-[#15181e]">Owner Capital & Drawings</h3>
              <button onClick={() => setIsOwnerModalOpen(true)} className="px-3 py-1.5 text-xs font-bold bg-[#15181e] text-white rounded">Log Event</button>
            </div>
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                  <th className="py-2">Date</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Description</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ownerTxs.map((tx: any) => (
                  <tr key={tx.id}>
                    <td className="py-3">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="py-3 text-xs font-bold">{tx.type}</td>
                    <td className="py-3 text-gray-600 text-xs">{tx.description}</td>
                    <td className={`py-3 text-right font-mono font-bold ${tx.type === 'DRAWING' ? 'text-red-600' : 'text-green-600'}`}>Br {tx.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Execution Modal */}
      {isReleaseModalOpen && selectedVoucher && (
        <div className="fixed inset-0 z-[200] flex items-center justify-end bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm h-full overflow-y-auto shadow-2xl flex flex-col border-l border-gray-200">
            <div className="p-6 border-b border-gray-200 relative bg-[#faf9f8]">
              <button onClick={() => setIsReleaseModalOpen(false)} className="absolute top-5 right-5 w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-black">✕</button>
              <h2 className="font-serif text-2xl font-semibold text-[#15181e] mt-1">Execute Transfer</h2>
            </div>
            <form onSubmit={handleExecutePayment} className="p-6 space-y-5 flex-1 flex flex-col">
              <div className="space-y-4 flex-1">
                <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl text-sm">
                  <div className="font-bold text-[#c1540f] mb-1">Confirm Outflow</div>
                  <div className="text-gray-700">Releasing <span className="font-mono font-bold">Br {selectedVoucher.amount.toLocaleString()}</span></div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Bank Account (Source of Funds)</label>
                  <select
                    required
                    value={selectedBankAccountId}
                    onChange={(e) => setSelectedBankAccountId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c1540f]"
                  >
                    <option value="">Select an account...</option>
                    {bankAccounts.map((acc: any) => (
                      <option key={acc.id} value={acc.id}>{acc.bankName} - {acc.accountName} (Bal: Br {acc.balance})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Bank Reference / Cheque No.</label>
                  <input
                    required
                    type="text"
                    value={bankReference}
                    onChange={(e) => setBankReference(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c1540f]"
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="submit" className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#15181e] text-white hover:bg-[#c1540f]">Confirm Execution</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rec Modal */}
      {isRecModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-end bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm h-full shadow-2xl flex flex-col border-l border-gray-200">
            <div className="p-6 border-b border-gray-200 relative bg-[#faf9f8]">
              <button onClick={() => setIsRecModalOpen(false)} className="absolute top-5 right-5 w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500">✕</button>
              <h2 className="font-serif text-2xl font-semibold">New Reconciliation</h2>
            </div>
            <form onSubmit={handleCreateRec} className="p-6 space-y-4">
              <select required value={recForm.accountId} onChange={(e) => setRecForm({...recForm, accountId: e.target.value})} className="w-full px-3 py-2 border rounded">
                <option value="">Select Account...</option>
                {bankAccounts.map((acc: any) => <option key={acc.id} value={acc.id}>{acc.bankName}</option>)}
              </select>
              <input required type="date" value={recForm.periodEnd} onChange={(e) => setRecForm({...recForm, periodEnd: e.target.value})} className="w-full px-3 py-2 border rounded" />
              <input required type="number" placeholder="System Balance" value={recForm.systemBal} onChange={(e) => setRecForm({...recForm, systemBal: e.target.value})} className="w-full px-3 py-2 border rounded" />
              <input required type="number" placeholder="Statement Balance" value={recForm.statementBal} onChange={(e) => setRecForm({...recForm, statementBal: e.target.value})} className="w-full px-3 py-2 border rounded" />
              <button type="submit" className="w-full py-2 bg-black text-white rounded font-bold">Save</button>
            </form>
          </div>
        </div>
      )}

      {/* Owner Modal */}
      {isOwnerModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-end bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm h-full shadow-2xl flex flex-col border-l border-gray-200">
            <div className="p-6 border-b border-gray-200 relative bg-[#faf9f8]">
              <button onClick={() => setIsOwnerModalOpen(false)} className="absolute top-5 right-5 w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500">✕</button>
              <h2 className="font-serif text-2xl font-semibold">Log Owner Event</h2>
            </div>
            <form onSubmit={handleCreateOwnerTx} className="p-6 space-y-4">
              <select required value={ownerTxForm.type} onChange={(e) => setOwnerTxForm({...ownerTxForm, type: e.target.value})} className="w-full px-3 py-2 border rounded">
                <option value="DRAWING">Drawing</option>
                <option value="INJECTION">Injection</option>
                <option value="BUSINESS_PAID_BY_OWNER">Business Cost Paid By Owner</option>
                <option value="OWNER_COST_PAID_BY_BUSINESS">Owner Cost Paid By Business</option>
              </select>
              <input required type="date" value={ownerTxForm.date} onChange={(e) => setOwnerTxForm({...ownerTxForm, date: e.target.value})} className="w-full px-3 py-2 border rounded" />
              <input required type="number" placeholder="Amount" value={ownerTxForm.amount} onChange={(e) => setOwnerTxForm({...ownerTxForm, amount: e.target.value})} className="w-full px-3 py-2 border rounded" />
              <input required type="text" placeholder="Description" value={ownerTxForm.description} onChange={(e) => setOwnerTxForm({...ownerTxForm, description: e.target.value})} className="w-full px-3 py-2 border rounded" />
              <button type="submit" className="w-full py-2 bg-black text-white rounded font-bold">Save</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export const TreasuryDashboardWrapper: React.FC<TreasuryDashboardProps> = (props) => {
  return <TreasuryDashboard {...props} />;
};
