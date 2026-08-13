'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { ShieldCheck, Terminal, AlertTriangle, Users, Briefcase, FileText, Activity, LayoutDashboard, CheckCircle2, XCircle, X } from 'lucide-react';
import { PaymentVoucher } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface AdminDashboardProps {
  activeTab: string;
  vouchers?: PaymentVoucher[];
  onToast?: (title: string, message: string, type?: 'success' | 'warning') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeTab, vouchers = [], onToast }) => {
  const { data: auditData, error: auditError, isLoading: auditLoading } = useSWR('/api/audit', fetcher, { refreshInterval: 10000 });
  const { data: usersData, mutate: mutateUsers } = useSWR('/api/users', fetcher);
  const { data: projectsData, mutate: mutateProjects } = useSWR('/api/projects', fetcher);
  const { data: rulesData, mutate: mutateRules } = useSWR('/api/settings/rules', fetcher);
  const { data: delegationsData, mutate: mutateDelegations } = useSWR('/api/settings/delegations', fetcher);

  const [modalState, setModalState] = useState<{ type: 'provision_user' | 'edit_user' | 'init_project' | 'view_voucher' | 'edit_rule' | 'add_delegation', data?: any } | null>(null);
  
  // Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const logs = auditData?.data || [];
  const dbUsers = usersData?.data || [];
  const dbProjects = projectsData?.data || [];
  const dbRules = rulesData?.data || [];
  const dbDelegations = delegationsData?.data || [];

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      if (modalState?.type === 'provision_user') {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const result = await res.json();
        if (result.success) {
          onToast?.('User Provisioned', result.message);
          mutateUsers();
          setModalState(null);
        } else onToast?.('Error', result.message, 'warning');
      } else if (modalState?.type === 'edit_user') {
        const res = await fetch('/api/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: modalState.data.id, role: formData.role || modalState.data.role }),
        });
        const result = await res.json();
        if (result.success) {
          onToast?.('Access Updated', result.message);
          mutateUsers();
          setModalState(null);
        } else onToast?.('Error', result.message, 'warning');
      } else if (modalState?.type === 'init_project') {
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const result = await res.json();
        if (result.success) {
          onToast?.('Project Initialized', result.message);
          mutateProjects();
          setModalState(null);
        } else onToast?.('Error', result.message, 'warning');
      } else if (modalState?.type === 'edit_rule') {
        const res = await fetch('/api/settings/rules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const result = await res.json();
        if (result.success) {
          onToast?.('Rule Updated', 'Authority matrix threshold updated.');
          mutateRules();
          setModalState(null);
        } else onToast?.('Error', result.message, 'warning');
      } else if (modalState?.type === 'add_delegation') {
        const res = await fetch('/api/settings/delegations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const result = await res.json();
        if (result.success) {
          onToast?.('Delegation Created', 'User delegation is now active.');
          mutateDelegations();
          setModalState(null);
        } else onToast?.('Error', result.message, 'warning');
      }
    } catch (e) {
      onToast?.('Error', 'Failed to save changes', 'warning');
    }
    setIsSubmitting(false);
    setFormData({});
  };

  // Derived global metrics
  const totalVouchersValue = vouchers.reduce((acc, v) => acc + v.amount, 0);
  const pendingVouchers = vouchers.filter(v => v.status !== 'paid' && v.status !== 'declined');
  const pendingValue = pendingVouchers.reduce((acc, v) => acc + v.amount, 0);
  const stuckVouchers = vouchers.filter(v => v.status === 'ready_for_approval');

  return (
    <>
      <div className="space-y-8 animate-fade-in pb-12">
      {/* GOVERNANCE TAB */}
      {activeTab === 'governance' && (
        <div className="space-y-6">
          <div className="panel bg-white shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] border border-gray-200/60 p-6 rounded-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
              <h2 className="text-lg font-bold text-[#15181e] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#c1540f]" /> Authority Matrix (Thresholds)
              </h2>
            </div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  <th className="pb-3 font-bold">Role</th>
                  <th className="pb-3 font-bold text-right">Max Limit (ETB)</th>
                  <th className="pb-3 font-bold">Escalates To</th>
                  <th className="pb-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dbRules.map((rule: any) => (
                  <tr key={rule.id} className="hover:bg-gray-50/50">
                    <td className="py-4 font-bold">{rule.roleId}</td>
                    <td className="py-4 font-mono font-bold text-right">{rule.maxAmount.toLocaleString()}</td>
                    <td className="py-4 text-xs font-semibold text-gray-500">{rule.escalationRoleId}</td>
                    <td className="py-4 text-right">
                      <button onClick={() => { setFormData(rule); setModalState({ type: 'edit_rule', data: rule }); }} className="text-xs font-bold text-[#c1540f]">Edit Rule</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="panel bg-white shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] border border-gray-200/60 p-6 rounded-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
              <h2 className="text-lg font-bold text-[#15181e] flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-400" /> Active Delegations (OOF Proxy)
              </h2>
              <button 
                onClick={() => setModalState({ type: 'add_delegation' })}
                className="px-4 py-2 bg-[#15181e] hover:bg-[#c1540f] transition-colors text-white text-xs font-bold rounded-xl shadow-sm"
              >
                + New Delegation
              </button>
            </div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  <th className="pb-3 font-bold">Delegator</th>
                  <th className="pb-3 font-bold">Delegatee (Proxy)</th>
                  <th className="pb-3 font-bold">Valid Until</th>
                  <th className="pb-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dbDelegations.map((del: any) => (
                  <tr key={del.id} className="hover:bg-gray-50/50">
                    <td className="py-4 font-bold">{del.delegator.name}</td>
                    <td className="py-4 font-bold text-[#c1540f]">{del.delegatee.name}</td>
                    <td className="py-4 text-xs font-semibold">{new Date(del.endDate).toLocaleDateString()}</td>
                    <td className="py-4">
                      {del.isActive ? (
                        <span className="px-2.5 py-1 rounded-lg bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider">Active</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-[10px] font-bold uppercase tracking-wider">Revoked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Global Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/50 pb-6">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-[#c1540f] flex items-center gap-2 mb-1.5">
            <ShieldCheck className="w-4 h-4" /> Global Administration Console
          </div>
          <h1 className="font-serif text-4xl font-semibold text-[#15181e] tracking-tight">
            {activeTab === 'dashboard' && 'Financial Command Center'}
            {activeTab === 'users' && 'User & Access Management'}
            {activeTab === 'projects' && 'Project & Budget Configuration'}
            {activeTab === 'vouchers' && 'Global Voucher Directory'}
            {activeTab === 'audit' && 'Immutable Audit Logs'}
            {activeTab === 'governance' && 'Governance & Matrix Rules'}
          </h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            {activeTab === 'dashboard' && 'Overarching view of system health, budgets, and pending workflows.'}
            {activeTab === 'users' && 'Manage roles, permissions, and directory access.'}
            {activeTab === 'projects' && 'Configure master project data, cost codes, and budget limits.'}
            {activeTab === 'vouchers' && 'Unrestricted view of all financial transactions across all projects.'}
            {activeTab === 'audit' && 'Permanent audit log of every system action (Control FR-01-011).'}
          </p>
        </div>
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-gray-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all">
              <div className="flex items-center gap-3 text-gray-500 mb-4">
                <Activity className="w-5 h-5 text-[#1a7a5c]" />
                <span className="text-xs font-bold uppercase tracking-wider">Total Voucher Flow</span>
              </div>
              <div className="text-3xl font-bold text-[#15181e]">Br {(totalVouchersValue / 1000000).toFixed(2)}M</div>
              <div className="text-sm font-medium text-gray-400 mt-2">Lifetime system volume</div>
            </div>
            
            <div className="p-6 rounded-2xl bg-white border border-gray-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all">
              <div className="flex items-center gap-3 text-gray-500 mb-4">
                <FileText className="w-5 h-5 text-[#c1540f]" />
                <span className="text-xs font-bold uppercase tracking-wider">Pending Liability</span>
              </div>
              <div className="text-3xl font-bold text-[#15181e]">Br {pendingValue.toLocaleString()}</div>
              <div className="text-sm font-medium text-[#c1540f] mt-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Across {pendingVouchers.length} active workflows
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#15181e] text-white shadow-[0_8px_30px_-4px_rgba(0,0,0,0.2)]">
              <div className="flex items-center gap-3 text-gray-400 mb-4">
                <LayoutDashboard className="w-5 h-5 text-gray-300" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Approval Bottlenecks</span>
              </div>
              <div className="text-3xl font-bold text-white">{stuckVouchers.length} Vouchers</div>
              <div className="text-sm font-medium text-gray-400 mt-2">
                Awaiting L1 or Owner approval.
              </div>
            </div>
          </div>
          
          {/* Quick Actions & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="panel bg-white/50 backdrop-blur-sm border border-gray-200/50 p-6 rounded-2xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-6 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#c1540f]" /> System Health
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-green-50/50 border border-green-100">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-bold text-green-900">Database Connection</span>
                  </div>
                  <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-md">Stable</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-green-50/50 border border-green-100">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-bold text-green-900">API Latency</span>
                  </div>
                  <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-md">42ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="panel space-y-6 bg-white shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] border border-gray-200/60 p-6 rounded-2xl">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-[#15181e] flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-400" /> Directory
            </h2>
            <button 
              onClick={() => setModalState({ type: 'provision_user' })}
              className="px-4 py-2 bg-[#15181e] hover:bg-[#c1540f] transition-colors text-white text-xs font-bold rounded-xl shadow-sm"
            >
              + Provision New User
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  <th className="pb-3 font-bold">Name</th>
                  <th className="pb-3 font-bold">Email</th>
                  <th className="pb-3 font-bold">Role assignment</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dbUsers.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4 font-bold text-[#15181e]">{user.name}</td>
                    <td className="py-4 text-gray-500 font-medium">{user.email}</td>
                    <td className="py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-bold border border-gray-200/60">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button 
                        onClick={() => { setFormData({ role: user.role }); setModalState({ type: 'edit_user', data: user }); }}
                        className="text-xs font-bold text-[#c1540f] hover:text-[#9a4309] transition-colors"
                      >
                        Edit Access
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PROJECTS TAB */}
      {activeTab === 'projects' && (
        <div className="panel space-y-6 bg-white shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] border border-gray-200/60 p-6 rounded-2xl">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-[#15181e] flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-gray-400" /> Active Portfolios
            </h2>
            <button 
              onClick={() => setModalState({ type: 'init_project' })}
              className="px-4 py-2 bg-[#15181e] hover:bg-[#c1540f] transition-colors text-white text-xs font-bold rounded-xl shadow-sm"
            >
              + Initialize Project
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {dbProjects.map((proj: any) => (
              <div key={proj.id} className="p-6 rounded-2xl border border-gray-200/60 hover:border-gray-300 transition-colors bg-gray-50/30">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-[11px] font-bold text-gray-400 mb-1">{proj.code}</div>
                    <h3 className="text-lg font-bold text-[#15181e]">{proj.name}</h3>
                  </div>
                  <span className="px-2 py-1 rounded-md bg-green-100 text-green-800 text-[10px] font-bold uppercase tracking-wider">
                    {proj.status}
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Total Budget</span>
                    <span className="font-bold text-[#15181e]">Br {proj.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Committed</span>
                    <span className="font-bold text-[#c1540f]">Br {proj.committed.toLocaleString()}</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div 
                      className="h-full bg-[#c1540f]" 
                      style={{ width: `${proj.budget > 0 ? (proj.committed / proj.budget) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {dbProjects.length === 0 && (
              <div className="col-span-full text-center text-sm text-gray-400 py-10">No projects found.</div>
            )}
          </div>
        </div>
      )}

      {/* VOUCHERS TAB */}
      {activeTab === 'vouchers' && (
        <div className="panel space-y-6 bg-white shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] border border-gray-200/60 p-6 rounded-2xl">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-[#15181e] flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" /> Master Voucher Ledger
            </h2>
          </div>
          <div className="space-y-3">
            {vouchers.map(v => (
              <div key={v.id} className="p-4 rounded-xl border border-gray-100 hover:border-gray-300 transition-colors bg-white flex flex-col sm:flex-row justify-between items-center gap-4 group">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-[#8f3d0b]">{v.code}</span>
                    <span className="text-xs font-semibold text-gray-400 px-2 border-l border-gray-200">{v.project}</span>
                  </div>
                  <div className="text-sm font-bold text-[#15181e]">{v.title}</div>
                  <div className="text-xs font-medium text-gray-500 mt-0.5">Payee: {v.payee}</div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-sm font-bold text-[#15181e]">Br {v.amount.toLocaleString()}</div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mt-1">{v.status.replace(/_/g, ' ')}</div>
                  </div>
                  <button 
                    onClick={() => setModalState({ type: 'view_voucher', data: v })}
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 group-hover:border-gray-400 group-hover:text-gray-800 transition-colors"
                  >
                    <span className="font-serif italic font-bold">&rarr;</span>
                  </button>
                </div>
              </div>
            ))}
            {vouchers.length === 0 && (
              <div className="text-center text-sm font-medium text-gray-400 py-12">No vouchers in system.</div>
            )}
          </div>
        </div>
      )}

      {/* AUDIT TAB */}
      {activeTab === 'audit' && (
        <div className="panel space-y-4 bg-white shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] border border-gray-200/60 p-6 rounded-2xl">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold text-[#15181e]">System Audit Records</h2>
            <span className="text-xs text-gray-500 font-bold bg-gray-100 px-3 py-1 rounded-full">{logs.length} records</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {auditLoading && (
              <div className="text-center text-gray-400 py-10 animate-pulse font-sans">Loading system audit records...</div>
            )}
            
            {auditError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold flex items-center gap-2 font-sans">
                <AlertTriangle className="w-5 h-5" /> Failed to load audit records.
              </div>
            )}

            {!auditLoading && !auditError && logs.length === 0 && (
              <div className="text-center text-gray-400 py-10 font-sans">No audit records found.</div>
            )}
            
            {logs.map((log: any) => (
              <div
                key={log.id}
                className="p-5 rounded-xl bg-gray-50/50 border border-gray-200/60 hover:bg-white hover:shadow-md transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-gray-500 border-b border-gray-200/60 pb-3">
                  <span className="font-bold text-[#15181e] flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[#c1540f]" />
                    {log.action}
                  </span>
                  <span className="font-medium tracking-wide">{new Date(log.timestamp).toLocaleString()} · IP: {log.ipAddress}</span>
                </div>
                <div className="text-gray-800 font-sans font-medium text-sm leading-relaxed">
                  {log.details}
                </div>
                <div className="text-[10.5px] text-gray-400 pt-1">
                  Actor: <span className="font-bold text-gray-600">{log.user}</span> <span className="uppercase tracking-wider ml-1">({log.role})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
      
      {/* Modals for Interactivity Demo */}
      {modalState && (
        <div className="fixed inset-0 z-[200] flex items-center justify-end bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl flex flex-col border-l border-gray-200 animate-slide-in-right">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-[#faf9f8] relative">
              <button 
                onClick={() => setModalState(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-black hover:border-gray-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {modalState.type === 'view_voucher' ? (
                <>
                  <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#c1540f]">
                    System Voucher Record · {modalState.data?.code}
                  </div>
                  <h3 className="font-serif text-2xl font-semibold text-[#15181e] mt-1">
                    {modalState.data?.title || 'Voucher Details'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Prepared by {modalState.data?.preparedBy} · Status: {modalState.data?.status?.replace(/_/g, ' ')}
                  </p>
                </>
              ) : (
                <h3 className="text-lg font-bold text-[#15181e]">
                  {modalState.type === 'provision_user' && 'Provision User'}
                  {modalState.type === 'edit_user' && 'Edit User Access'}
                  {modalState.type === 'init_project' && 'Initialize Project Portfolio'}
                  {modalState.type === 'edit_rule' && 'Edit Authority Rule'}
                  {modalState.type === 'add_delegation' && 'Add Delegation'}
                </h3>
              )}
            </div>
            
            {/* Body */}
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              {modalState.type === 'init_project' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Project Name</label>
                    <input type="text" onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Merkato Plaza" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#c1540f] transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Client</label>
                    <input type="text" onChange={e => setFormData({...formData, client: e.target.value})} placeholder="e.g. Ministry of Tourism" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#c1540f] transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Total Budget (Br)</label>
                    <input type="number" onChange={e => setFormData({...formData, budget: e.target.value})} placeholder="0.00" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#c1540f] transition-colors" />
                  </div>
                </>
              )}

              {(modalState.type === 'provision_user' || modalState.type === 'edit_user') && (
                <>
                  {modalState.type === 'provision_user' && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Full Name</label>
                        <input type="text" onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Abebe Bikila" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#c1540f] transition-colors" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Email Address</label>
                        <input type="email" onChange={e => setFormData({...formData, email: e.target.value})} placeholder="name@mesaelfinance.com" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#c1540f] transition-colors" />
                      </div>
                    </>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Role Assignment</label>
                    <select defaultValue={formData.role || modalState.data?.role || 'leta'} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#c1540f] transition-colors bg-white">
                      <option value="leta">Preparer</option>
                      <option value="dembi">Approver (L1)</option>
                      <option value="kalkidan">Accountant</option>
                      <option value="yamrot">Tax Officer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </>
              )}

              {modalState.type === 'view_voucher' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">
                      Transaction Details
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-gray-500 font-semibold block mb-1">Project</label>
                        <div className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50/50 font-medium text-gray-900">
                          {modalState.data?.project}
                        </div>
                      </div>
                      <div>
                        <label className="text-gray-500 font-semibold block mb-1">Cost Code</label>
                        <div className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50/50 font-medium text-gray-900">
                          {modalState.data?.costCode?.split('·')[0]}
                        </div>
                      </div>
                      <div>
                        <label className="text-gray-500 font-semibold block mb-1">Payee Vendor</label>
                        <div className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50/50 font-medium text-gray-900">
                          {modalState.data?.payee}
                        </div>
                      </div>
                      <div>
                        <label className="text-gray-500 font-semibold block mb-1">Method</label>
                        <div className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50/50 font-medium text-gray-900">
                          {modalState.data?.method}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <label className="text-gray-500 font-semibold block mb-1">Amount (ETB)</label>
                        <div className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50/50 font-mono font-bold text-gray-900 text-sm">
                          {modalState.data?.amount?.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Attached Documents Checklist (Readonly) */}
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">
                      Attached Documents File
                    </h4>
                    <div className="space-y-2">
                      <div className="p-3 rounded-xl border border-gray-200 flex items-center justify-between bg-gray-50">
                        <div className="flex items-center gap-3 font-semibold text-xs text-gray-600">
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center text-white bg-[#1a7a5c]`}>✓</div>
                          System Generated Cover Page
                        </div>
                        <span className="text-[10px] uppercase font-bold text-gray-400">Attached</span>
                      </div>
                      <div className="p-3 rounded-xl border border-gray-200 flex items-center justify-between bg-gray-50">
                        <div className="flex items-center gap-3 font-semibold text-xs text-gray-600">
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center text-white bg-[#1a7a5c]`}>✓</div>
                          Uploaded PDF Evidence
                        </div>
                        <span className="text-[10px] uppercase font-bold text-[#c1540f]">View PDF</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {modalState.type === 'edit_rule' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Role ID</label>
                    <input type="text" readOnly value={formData.roleId || ''} className="w-full px-3 py-2 border rounded-xl bg-gray-50 text-sm font-medium" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Max Amount (ETB)</label>
                    <input type="number" value={formData.maxAmount || ''} onChange={e => setFormData({...formData, maxAmount: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm font-medium" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Escalates To (Role ID)</label>
                    <input type="text" value={formData.escalationRoleId || ''} onChange={e => setFormData({...formData, escalationRoleId: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm font-medium" />
                  </div>
                </div>
              )}

              {modalState.type === 'add_delegation' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Delegator (Out of Office)</label>
                    <select value={formData.delegatorId || ''} onChange={e => setFormData({...formData, delegatorId: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm font-medium">
                      <option value="">Select...</option>
                      {dbUsers.map((u: any) => <option key={u.id} value={u.id}>{u.name} ({u.roleId})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Delegatee (Proxy)</label>
                    <select value={formData.delegateeId || ''} onChange={e => setFormData({...formData, delegateeId: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm font-medium">
                      <option value="">Select...</option>
                      {dbUsers.map((u: any) => <option key={u.id} value={u.id}>{u.name} ({u.roleId})</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Start Date</label>
                      <input type="date" value={formData.startDate || ''} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm font-medium" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">End Date</label>
                      <input type="date" value={formData.endDate || ''} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm font-medium" />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-200 flex items-center justify-end gap-3 bg-[#faf9f8]">
              <button 
                onClick={() => setModalState(null)}
                className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-700 transition-colors"
                disabled={isSubmitting}
              >
                {modalState.type === 'view_voucher' ? 'Close' : 'Cancel'}
              </button>
              {modalState.type !== 'view_voucher' && (
                <button 
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#15181e] text-white hover:bg-[#c1540f] shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
