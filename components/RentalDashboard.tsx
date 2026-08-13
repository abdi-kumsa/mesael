'use client';

import React, { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { Plus, Search, CheckCircle2, Clock, Truck, FileText, FileCheck2, Calculator } from 'lucide-react';
import { ToastMessage } from '@/components/ToastContainer';

interface RentalDashboardProps {
  onAddToast: (title: string, message: string, type: 'success' | 'warning' | 'info') => void;
  roleId?: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const RentalDashboard: React.FC<RentalDashboardProps> = ({ onAddToast, roleId = '' }) => {
  // Role permissions derived from org chart authority matrix (Section 4):
  // canManage     → Samuel (Plant unit owner), Dembi (approver): Register agreements, view all
  // canLogHours   → Firehiwot, John (site certifies hours), Samuel: Log daily hours from site
  // canReconcile  → Samuel (Plant unit reconciles invoiced vs certified hours), Dembi
  // Finance roles → Leta, Kalkidan: view agreements and advance balances (payment execution reference)
  // readOnly      → Mesael (CEO, approves payment above ceiling), Admin
  const canManage = ['samuel', 'dembi'].includes(roleId);
  const canLogHours = ['firehiwot', 'john', 'samuel'].includes(roleId);
  const canReconcile = ['samuel', 'dembi'].includes(roleId);
  const isFinanceView = ['leta', 'kalkidan'].includes(roleId);
  const isReadOnly = !canManage && !canLogHours && !isFinanceView;
  const { data: rentalsData, error } = useSWR('/api/rentals', fetcher, { refreshInterval: 5000 });
  const rentals = rentalsData?.data || [];

  const { data: projectsData } = useSWR('/api/projects', fetcher);
  const projects = projectsData?.data || [];

  const [isNewAgreementModalOpen, setIsNewAgreementModalOpen] = useState(false);
  const [isLogHoursModalOpen, setIsLogHoursModalOpen] = useState(false);
  const [selectedRentalId, setSelectedRentalId] = useState<string | null>(null);

  // New Agreement Form State
  const [equipmentName, setEquipmentName] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [advancePaid, setAdvancePaid] = useState('');
  const [projectId, setProjectId] = useState('');

  // Log Hours Form State
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [hoursWorked, setHoursWorked] = useState('');

  const handleCreateAgreement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/rentals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipmentName, vendorName, hourlyRate, advancePaid, projectId }),
      });
      const result = await res.json();
      if (result.success) {
        mutate('/api/rentals');
        setIsNewAgreementModalOpen(false);
        onAddToast('Agreement Registered', `Rental for ${equipmentName} created successfully.`, 'success');
        // Reset form
        setEquipmentName(''); setVendorName(''); setHourlyRate(''); setAdvancePaid(''); setProjectId('');
      } else {
        onAddToast('Error', result.message, 'warning');
      }
    } catch (err) {
      onAddToast('Error', 'Failed to create agreement', 'warning');
    }
  };

  const handleLogHours = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRentalId) return;

    try {
      const res = await fetch(`/api/rentals/${selectedRentalId}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logDate, hoursWorked }),
      });
      const result = await res.json();
      if (result.success) {
        mutate('/api/rentals');
        setIsLogHoursModalOpen(false);
        onAddToast('Hours Logged', `Successfully logged ${hoursWorked} hours.`, 'success');
        setHoursWorked('');
      } else {
        onAddToast('Error', result.message, 'warning');
      }
    } catch (err) {
      onAddToast('Error', 'Failed to log hours', 'warning');
    }
  };

  const handleReconcile = async (id: string) => {
    try {
      const res = await fetch(`/api/rentals/${id}/reconcile`, {
        method: 'POST',
      });
      const result = await res.json();
      if (result.success) {
        mutate('/api/rentals');
        const balanceInfo = result.data.balance > 0 
          ? `Mesael is owed Br ${result.data.balance.toLocaleString()}` 
          : result.data.balance < 0 
            ? `Mesael owes Br ${Math.abs(result.data.balance).toLocaleString()}`
            : 'Account is settled (Br 0)';
        
        onAddToast('Reconciliation Complete', `Total Cost: Br ${result.data.totalCost.toLocaleString()}. ${balanceInfo}.`, 'success');
      } else {
        onAddToast('Error', result.message, 'warning');
      }
    } catch (err) {
      onAddToast('Error', 'Failed to reconcile', 'warning');
    }
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Leakage Control
          </div>
          <h1 className="font-serif text-3xl font-semibold text-[#15181e] mt-0.5">
            Equipment Rentals
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {canManage ? 'Register agreements, log hours, and reconcile 100% advance payments against actual usage.' :
             canLogHours ? 'View rental agreements and log daily equipment hours from site.' :
             isFinanceView ? 'View rental agreements and advance balances for payment execution.' :
             'Read-only overview of equipment rentals and financial exposure.'}
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setIsNewAgreementModalOpen(true)}
            className="bg-[#15181e] hover:bg-[#c1540f] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Register Rental Agreement
          </button>
        )}
      </div>

      {/* Stat Strip */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100">
        <div className="flex-1 pb-6 md:pb-0 md:pr-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Active Rentals</div>
            <div className="num text-3xl font-bold text-[#15181e] mt-0.5">
              {rentals.filter((r: any) => r.status === 'ACTIVE').length}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">Currently on site</div>
          </div>
        </div>
        <div className="flex-1 py-6 md:py-0 md:px-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Unreconciled Advance</div>
            <div className="num text-3xl font-bold text-[#b4550b] mt-0.5">
              Br {rentals.filter((r: any) => r.status === 'ACTIVE').reduce((acc: number, r: any) => acc + r.advancePaid, 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">Financial exposure</div>
          </div>
        </div>
        <div className="flex-1 pt-6 md:pt-0 md:pl-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Reconciled</div>
            <div className="num text-3xl font-bold text-[#1a7a5c] mt-0.5">
              {rentals.filter((r: any) => r.status === 'RECONCILED').length}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">Closed this period</div>
          </div>
        </div>
      </div>

      {/* Rentals List */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="font-bold text-[#15181e]">Rental Agreements</h3>
            <p className="text-xs text-gray-500 mt-0.5">All registered equipment and hours billed</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                <th className="px-6 py-4">Equipment & Vendor</th>
                <th className="px-6 py-4">Project</th>
                <th className="px-6 py-4">Financials</th>
                <th className="px-6 py-4">Hours Billed</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {rentals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400 text-xs">
                    No rental agreements found.
                  </td>
                </tr>
              ) : (
                rentals.map((rental: any) => (
                  <tr key={rental.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 align-top">
                      <div className="font-bold text-gray-900">{rental.equipmentName}</div>
                      <div className="text-xs text-gray-500 mt-1">{rental.vendorName}</div>
                      {rental.status === 'RECONCILED' && (
                        <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-green-50 text-green-700 border border-green-200">
                          RECONCILED
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="font-medium text-gray-700">{rental.project?.code}</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">{rental.project?.name}</div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="text-xs flex justify-between mb-1">
                        <span className="text-gray-500">Rate:</span>
                        <span className="font-mono font-medium">Br {rental.hourlyRate.toLocaleString()}/hr</span>
                      </div>
                      <div className="text-xs flex justify-between">
                        <span className="text-gray-500">Advance:</span>
                        <span className="font-mono font-bold text-[#b4550b]">Br {rental.advancePaid.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="num font-bold text-gray-900 text-lg">{rental.totalHoursBilled} <span className="text-xs text-gray-400 font-normal">hrs</span></div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">
                        Cost: Br {(rental.totalHoursBilled * rental.hourlyRate).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top text-right space-y-2">
                      {rental.status === 'ACTIVE' && canLogHours && (
                        <button
                          onClick={() => {
                            setSelectedRentalId(rental.id);
                            setIsLogHoursModalOpen(true);
                          }}
                          className="block w-full text-center px-3 py-1.5 text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                        >
                          Log Hours
                        </button>
                      )}
                      {rental.status === 'ACTIVE' && canReconcile && (
                        <button
                          onClick={() => handleReconcile(rental.id)}
                          className="block w-full text-center px-3 py-1.5 text-xs font-bold bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-lg transition-colors border border-orange-200"
                        >
                          Reconcile
                        </button>
                      )}
                      {!canLogHours && !canReconcile && rental.status === 'ACTIVE' && (
                        <span className="text-[10px] text-gray-400 italic">View only</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

      {/* New Agreement Modal */}
      {isNewAgreementModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-end bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl flex flex-col border-l border-gray-200">
            <div className="p-6 border-b border-gray-200 relative bg-[#faf9f8]">
              <button
                onClick={() => setIsNewAgreementModalOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-black hover:border-gray-400"
              >
                <span className="sr-only">Close</span>
                ✕
              </button>
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#c1540f]">
                Leakage Control
              </div>
              <h2 className="font-serif text-2xl font-semibold text-[#15181e] mt-1 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#c1540f]" />
                Register Rental Agreement
              </h2>
            </div>
            <form onSubmit={handleCreateAgreement} className="p-6 space-y-5 flex-1 flex flex-col">
              <div className="space-y-4 flex-1">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Project</label>
                  <select
                    required
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c1540f] focus:bg-white transition-colors"
                  >
                    <option value="">Select a Project...</option>
                    {projects.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Equipment Description</label>
                  <input
                    required
                    type="text"
                    value={equipmentName}
                    onChange={(e) => setEquipmentName(e.target.value)}
                    placeholder="e.g. Dozer D8, Excavator CAT 320"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c1540f] focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Vendor / Owner</label>
                  <input
                    required
                    type="text"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="e.g. ABC Rentals PLC"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c1540f] focus:bg-white transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Hourly Rate (ETB)</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c1540f] focus:bg-white transition-colors font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">100% Advance Paid (ETB)</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={advancePaid}
                      onChange={(e) => setAdvancePaid(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c1540f] focus:bg-white transition-colors font-mono"
                    />
                  </div>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsNewAgreementModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#15181e] text-white hover:bg-[#c1540f] transition-all shadow-md"
                >
                  Register Agreement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Hours Modal */}
      {isLogHoursModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-end bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm h-full overflow-y-auto shadow-2xl flex flex-col border-l border-gray-200">
            <div className="p-6 border-b border-gray-200 relative bg-[#faf9f8]">
              <button
                onClick={() => setIsLogHoursModalOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-black hover:border-gray-400"
              >
                <span className="sr-only">Close</span>
                ✕
              </button>
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#c1540f]">
                Daily Log
              </div>
              <h2 className="font-serif text-2xl font-semibold text-[#15181e] mt-1 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#c1540f]" />
                Log Daily Hours
              </h2>
            </div>
            <form onSubmit={handleLogHours} className="p-6 space-y-5 flex-1 flex flex-col">
              <div className="space-y-4 flex-1">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Date</label>
                  <input
                    required
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Hours Worked</label>
                  <input
                    required
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="24"
                    value={hoursWorked}
                    onChange={(e) => setHoursWorked(e.target.value)}
                    placeholder="8.0"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors font-mono"
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsLogHoursModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
