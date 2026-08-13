'use client';

import React, { useState } from 'react';
import { ChevronDown, Menu, X, ShieldCheck, LogOut, History } from 'lucide-react';
import { Session } from 'next-auth';

interface RoleNavbarProps {
  session: Session | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenAuditTrail: () => void;
  onSignOut: () => void;
}

export const RoleNavbar: React.FC<RoleNavbarProps> = ({
  session,
  activeTab,
  onTabChange,
  onOpenAuditTrail,
  onSignOut,
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentRoleId = session?.user?.roleId || '';
  const currentRole = {
    name: session?.user?.name || '',
    title: session?.user?.title || '',
    avatar: session?.user?.avatar || '',
  };

  const getTabsForRole = (role: string) => {
    switch (role) {
      case 'mesael':
        return [
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'approvals', label: 'Approvals (Owner Reserved)', badge: '2' },
          { id: 'reports', label: 'Financial Statements' },
        ];
      case 'dembi':
        return [
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'approvals', label: 'Approvals (<= 500k)', badge: '3' },
          { id: 'cash', label: 'Cash & Banks' },
          { id: 'reports', label: 'Reports & Peachtree' },
        ];
      case 'leta':
        return [
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'requests', label: 'Payment Requests' },
          { id: 'pettycash', label: 'Petty Cash' },
          { id: 'vendors', label: 'Vendor Comparison' },
        ];
      case 'kalkidan':
        return [
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'ledger', label: 'Ledger & Reconciliation' },
          { id: 'reports', label: 'Peachtree Queue', badge: '94' },
        ];
      case 'yamrot':
        return [
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'billing', label: 'Client Billing' },
          { id: 'tax', label: 'Tax Centre', badge: 'VAT' },
        ];
      default:
        return [];
    }
  };

  const tabs = getTabsForRole(currentRoleId);

  return (
    <header className="sticky top-0 z-50 bg-[#fbfaf8]/90 backdrop-blur-md border-b border-[#e5e9ee]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        
        {/* Brand logo & title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-gray-700 hover:text-black rounded-lg border border-gray-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <div className="w-8 h-8 rounded-lg bg-[#15181e] flex items-center justify-center font-serif font-bold text-amber-500 text-sm">
            M
          </div>
          <div>
            <div className="font-bold text-sm leading-none tracking-tight">Mesael Finance</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
              Construction & Contracting
            </div>
          </div>
        </div>

        {/* Desktop Tabs Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-[#eef1f5]/60 p-1 rounded-xl border border-gray-200/80">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white text-[#15181e] shadow-sm font-bold border border-gray-200/60'
                    : 'text-gray-600 hover:text-black hover:bg-white/40'
                }`}
              >
                {tab.label}
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-[#c1540f] text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Audit Trail CTA & User Profile Dropdown */}
        <div className="flex items-center gap-2">
          
          <button
            onClick={onOpenAuditTrail}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-gray-200 hover:border-gray-300 bg-white text-gray-700 hover:text-black transition-all"
            title="View Immutable Audit Log"
          >
            <History className="w-3.5 h-3.5 text-[#c1540f]" />
            <span>Audit Log</span>
          </button>

          {/* Avatar Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 p-1.5 px-2.5 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 transition-all text-left"
            >
              <div className="w-7 h-7 rounded-full bg-[#15181e] text-amber-500 font-bold text-xs flex items-center justify-center border border-amber-500/30">
                {currentRole.avatar}
              </div>
              <div className="hidden sm:block leading-tight">
                <div className="font-bold text-xs text-[#15181e]">{currentRole.name}</div>
                <div className="text-[10px] text-gray-500">{currentRole.title}</div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${roleMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Role Menu Dropdown */}
            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-gray-200 shadow-xl p-2 z-50 animate-fade-in">
                <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Authenticated Account</div>
                  <span className="text-[9.5px] bg-[#e9f5f0] text-[#1a7a5c] px-2 py-0.5 rounded-full font-bold">Active</span>
                </div>

                <div className="py-2 px-3">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-[#15181e] text-amber-500">
                       {currentRole.avatar}
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="font-bold text-sm leading-tight text-gray-900">{currentRole.name}</div>
                       <div className="text-xs text-gray-500">{session?.user?.email}</div>
                     </div>
                   </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2 px-1">
                  <button
                    onClick={() => {
                      onOpenAuditTrail();
                      setRoleMenuOpen(false);
                    }}
                    className="flex-1 text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 flex items-center gap-1.5"
                  >
                    <History className="w-3.5 h-3.5 text-[#c1540f]" /> Audit Log
                  </button>
                  <button
                    onClick={() => {
                      onSignOut();
                      setRoleMenuOpen(false);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                onTabChange(tab.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg flex items-center justify-between ${
                activeTab === tab.id
                  ? 'bg-[#c1540f] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px]">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
          <div className="pt-2 border-t border-gray-100 flex justify-between">
            <button onClick={onOpenAuditTrail} className="text-xs font-semibold text-gray-700">Audit Trail</button>
            <button onClick={onSignOut} className="text-xs font-bold text-rose-600">Sign Out</button>
          </div>
        </div>
      )}
    </header>
  );
};
