'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { Receipt, Eye, CheckCircle2, AlertCircle, Calendar, Plus } from 'lucide-react';

interface YamrotDashboardProps {
  activeTab: string;
  onIssueReceipt: () => void;
  onMarkTaxReviewed: () => void;
}

export const YamrotDashboard: React.FC<YamrotDashboardProps> = ({
  activeTab,
  onIssueReceipt,
  onMarkTaxReviewed,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isReviewed, setIsReviewed] = useState(false);

  const { data: vatRes } = useSWR('/api/tax/vat', (url) => fetch(url).then(res => res.json()));
  const taxDecl = vatRes?.data;

  const { data: certRes, mutate: mutateCerts } = useSWR('/api/tax/clearance', (url) => fetch(url).then(res => res.json()));
  const certificates = certRes?.data || [];

  const [newCertType, setNewCertType] = useState('');
  const [newCertIssueDate, setNewCertIssueDate] = useState('');
  const [newCertExpiryDate, setNewCertExpiryDate] = useState('');
  const [isAddingCert, setIsAddingCert] = useState(false);

  const handleMarkReviewedClick = () => {
    onMarkTaxReviewed();
    setIsReviewed(true);
  };

  const handleAddCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCertType || !newCertIssueDate) return;
    
    await fetch('/api/tax/clearance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: newCertType,
        issueDate: newCertIssueDate,
        expiryDate: newCertExpiryDate || null
      })
    });
    setNewCertType('');
    setNewCertIssueDate('');
    setNewCertExpiryDate('');
    setIsAddingCert(false);
    mutateCerts();
  };

  const calculateDaysRemaining = (expiryStr: string | null) => {
    if (!expiryStr) return null;
    const diff = new Date(expiryStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Client Ledger, Invoicing & Tax Compliance
          </div>
          <h1 className="font-serif text-3xl font-semibold text-[#15181e] mt-0.5">
            Welcome, Yamrot
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Collections to chase and the VAT filing clock.
          </p>
        </div>
        <button
          onClick={onIssueReceipt}
          className="bg-[#15181e] hover:bg-[#c1540f] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all self-start sm:self-auto"
        >
          <Receipt className="w-4 h-4" />
          Issue Official Receipt
        </button>
      </div>

      {/* Stat Strip */}
      <div className="stat-line">
        <div className="stat-item">
          <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">Outstanding invoices</div>
          <div className="num text-xl sm:text-2xl font-bold text-[#15181e] mt-1">Br 4.96M</div>
          <div className="text-[11px] text-[#b23a24] font-semibold mt-0.5">Br 480K overdue &gt; 30 days</div>
        </div>
        <div className="stat-item">
          <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">VAT declaration</div>
          <div className="num text-xl sm:text-2xl font-bold text-[#b4550b] mt-1">4 days</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Br 686,355 net payable</div>
        </div>
        <div className="stat-item">
          <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">Receipts, August</div>
          <div className="num text-xl sm:text-2xl font-bold text-[#1a7a5c] mt-1">3</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Br 4.48M collected</div>
        </div>
      </div>

      {activeTab === 'tax' && (

        /* Ethiopian Tax Centre Engine */
        <div className="space-y-6">
          
          {/* Configurable Tax Rates Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-gray-200">
              <div className="text-xs font-semibold text-gray-400">VAT</div>
              <div className="num text-2xl font-bold text-[#15181e] mt-1">15%</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-gray-200">
              <div className="text-xs font-semibold text-gray-400">Withholding</div>
              <div className="num text-2xl font-bold text-[#15181e] mt-1">2%</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-gray-200">
              <div className="text-xs font-semibold text-gray-400">Employment Tax</div>
              <div className="num text-2xl font-bold text-[#15181e] mt-1">10–35%</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-gray-200">
              <div className="text-xs font-semibold text-gray-400">Pension</div>
              <div className="num text-2xl font-bold text-[#15181e] mt-1">7 / 11%</div>
            </div>
          </div>

          {/* Monthly VAT Declaration Engine Panel */}
          {taxDecl && (
            <div className="panel space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-[#15181e]">Monthly VAT Declaration — {taxDecl.period}</h2>
                  <p className="text-xs text-gray-500">Aggregated sales and purchases format for Revenues Authority submission</p>
                </div>
                <span className="tag-badge warn">{taxDecl.dueDate}</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Total sales, from client invoices</span>
                  <span className="num font-bold text-gray-900">Br {taxDecl.totalSales.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Total purchases, from payment vouchers</span>
                  <span className="num font-bold text-gray-900">Br {taxDecl.totalPurchases.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 font-bold text-sm text-[#c1540f]">
                  <span>Net VAT Payable</span>
                  <span className="num">Br {taxDecl.netVatPayable.toLocaleString()}</span>
                </div>
              </div>

              {/* Interactive Preview Drawer Box */}
              {showPreview && (
                <div className="p-4 rounded-xl bg-[#faf9f8] border border-gray-200 font-mono text-xs leading-relaxed text-gray-700 space-y-1 animate-fade-in">
                  <div>TIN: {taxDecl.tin} · Filing Period: {taxDecl.period}</div>
                  <div>Total Sales: Br {taxDecl.totalSales.toLocaleString()} · Total Purchases: Br {taxDecl.totalPurchases.toLocaleString()}</div>
                  <div>Output VAT (15%): Br {taxDecl.outputVat.toLocaleString()} · Input VAT (15%): Br {taxDecl.inputVat.toLocaleString()}</div>
                  <div className="font-bold text-[#c1540f]">Net VAT Payable to ERCA: Br {taxDecl.netVatPayable.toLocaleString()}</div>
                </div>
              )}

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {showPreview ? 'Hide preview' : 'Preview declaration'}
                </button>
                <button
                  onClick={handleMarkReviewedClick}
                  disabled={isReviewed}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isReviewed
                      ? 'bg-[#1a7a5c] text-white cursor-default'
                      : 'bg-[#15181e] hover:bg-[#c1540f] text-white shadow-sm'
                  }`}
                >
                  {isReviewed ? 'Reviewed ✓' : 'Mark reviewed'}
                </button>
              </div>
            </div>
          )}

          {/* Tax Clearances Expiry Tracking */}
          <div className="panel space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Tax Clearances & Compliance Tracking
              </h2>
              <button 
                onClick={() => setIsAddingCert(!isAddingCert)}
                className="text-xs font-bold text-[#c1540f] flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>

            {isAddingCert && (
              <form onSubmit={handleAddCert} className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-3 mb-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Certificate Type</label>
                  <input type="text" value={newCertType} onChange={e => setNewCertType(e.target.value)} required className="w-full text-xs p-2 rounded border border-gray-200" placeholder="e.g. VAT Registration"/>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Issue Date</label>
                    <input type="date" value={newCertIssueDate} onChange={e => setNewCertIssueDate(e.target.value)} required className="w-full text-xs p-2 rounded border border-gray-200" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Expiry Date (Optional)</label>
                    <input type="date" value={newCertExpiryDate} onChange={e => setNewCertExpiryDate(e.target.value)} className="w-full text-xs p-2 rounded border border-gray-200" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-[#15181e] text-white py-2 rounded text-xs font-bold hover:bg-[#c1540f]">Save Certificate</button>
              </form>
            )}

            <div className="divide-y divide-gray-100 text-xs">
              {certificates.map((cert: any) => {
                const daysLeft = calculateDaysRemaining(cert.expiryDate);
                return (
                  <div key={cert.id} className="py-2.5 flex justify-between items-center interactive-row px-2 -mx-2 rounded-lg hover:bg-gray-50/50">
                    <div>
                      <div className="font-bold text-gray-900">{cert.type}</div>
                      <div className="text-gray-400 text-[11px]">
                        Issued: {new Date(cert.issueDate).toLocaleDateString()}
                        {cert.expiryDate && ` · Expires: ${new Date(cert.expiryDate).toLocaleDateString()}`}
                      </div>
                    </div>
                    {daysLeft === null ? (
                      <span className="tag-badge good">No Expiry</span>
                    ) : daysLeft > 30 ? (
                      <span className="tag-badge good">Current</span>
                    ) : daysLeft > 0 ? (
                      <span className="tag-badge warn">Expires in {daysLeft} days</span>
                    ) : (
                      <span className="tag-badge bad">Expired</span>
                    )}
                  </div>
                );
              })}
              {certificates.length === 0 && (
                <div className="py-2 text-gray-400 text-xs text-center font-medium">No certificates logged.</div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
