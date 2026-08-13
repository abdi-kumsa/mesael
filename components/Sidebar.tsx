'use client';

import React, { useState } from 'react';
import { Menu, X, History, LogOut } from 'lucide-react';
import { Session } from 'next-auth';
import Image from 'next/image';
import logoImg from '../public/logo.png';

interface SidebarProps {
  session: Session | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSignOut: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  session,
  activeTab,
  onTabChange,
  onSignOut,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentRoleId = session?.user?.roleId || '';
  const currentRole = {
    name: session?.user?.name || '',
    title: session?.user?.title || '',
    avatar: session?.user?.avatar || '',
  };

  const getTabsForRole = (role: string) => {
    switch (role) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Global Overview' },
          { id: 'vouchers', label: 'Global Vouchers' },
          { id: 'projects', label: 'Project & Budgets' },
          { id: 'rentals', label: 'Equipment Rentals' },
          { id: 'users', label: 'User Management' },
          { id: 'governance', label: 'Governance & Rules' },
          { id: 'payroll', label: 'Payroll' },
          { id: 'statutory', label: 'Statutory' },
          { id: 'audit', label: 'System Audit Log' },
        ];
      case 'mesael':
        return [
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'approvals', label: 'Approvals (Owner)', badge: '2' },
          { id: 'rentals', label: 'Equipment Rentals' },
          { id: 'payroll', label: 'Payroll' },
          { id: 'reports', label: 'Financial Statements' },
        ];
      case 'dembi':
        return [
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'approvals', label: 'Approvals (<= 500k)', badge: '3' },
          { id: 'rentals', label: 'Equipment Rentals' },
          { id: 'subcontracts', label: 'Subcontracts' },
          { id: 'ipcs', label: 'IPC Certification' },
          { id: 'client_contracts', label: 'Client Contracts' },
          { id: 'client_billing', label: 'Client Billing' },
          { id: 'receivables', label: 'Receivables Ledger' },
          { id: 'cash', label: 'Cash & Banks' },
          { id: 'payroll', label: 'Payroll HR' },
          { id: 'reports', label: 'Reports & Peachtree' },
        ];
      case 'leta':
        return [
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'reports', label: 'Project Cost Report' },
          { id: 'requests', label: 'Payment Requests' },
          { id: 'rentals', label: 'Equipment Rentals' },
          { id: 'receivables', label: 'Receivables Ledger' },
          { id: 'pettycash', label: 'Petty Cash' },
          { id: 'vendors', label: 'Vendor Comparison' },
          { id: 'payroll', label: 'Payroll Desk' },
        ];
      case 'kalkidan':
        return [
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'treasury', label: 'Payment Execution', badge: '1' },
          { id: 'pettycash', label: 'Daily Petty Cash' },
          { id: 'ledger', label: 'Ledger & Recon' },
          { id: 'reports', label: 'Peachtree Queue', badge: '94' },
        ];
      case 'yamrot':
        return [
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'tax', label: 'Tax Centre', badge: 'VAT' },
          { id: 'tax_receipts', label: 'Tax Receipts (FS)' },
          { id: 'statutory', label: 'Statutory & Pension' },
        ];
      case 'firehiwot':
        return [
          { id: 'dashboard', label: 'Requisition Desk' },
          { id: 'subcontracts', label: 'Subcontracts' },
          { id: 'rentals', label: 'Equipment Rentals' },
        ];
      case 'samuel':
        return [
          { id: 'dashboard', label: 'Purchase Orders' },
          { id: 'suppliers', label: 'Supplier Master' },
          { id: 'rentals', label: 'Plant & Equipment Rentals' },
        ];
      case 'john':
        return [
          { id: 'dashboard', label: 'GRN Capture' },
          { id: 'ipcs', label: 'IPC Certification' },
          { id: 'rentals', label: 'Equipment Rentals' },
        ];
      default:
        return [];
    }
  };

  const tabs = getTabsForRole(currentRoleId);

  const SidebarContent = (
    <>
      {/* Brand & Logo */}
      <div className="p-6 border-b border-gray-100 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <Image src={logoImg} alt="Mesael Logo" className="w-full h-auto object-contain drop-shadow-sm" />
          </div>
          <div>
            <div className="font-bold text-base leading-none tracking-tight text-[#15181e]">Mesael Finance</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mt-1">
              Enterprise System
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                onTabChange(tab.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all flex items-center justify-between ${
                isActive
                  ? 'bg-[#15181e] text-white shadow-md'
                  : 'text-gray-600 hover:text-[#15181e] hover:bg-gray-100/80'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-[#c1540f] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-gray-100 space-y-2 bg-gray-50/50">

        <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#15181e] text-amber-500 font-bold text-xs flex items-center justify-center border border-amber-500/30">
              {currentRole.avatar}
            </div>
            <div className="leading-tight">
              <div className="font-bold text-xs text-[#15181e]">{currentRole.name}</div>
              <div className="text-[10px] text-gray-500">{currentRole.title}</div>
            </div>
          </div>
          <button
            onClick={() => {
              onSignOut();
              setMobileMenuOpen(false);
            }}
            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header (Only visible on small screens) */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 p-4 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center">
            <Image src={logoImg} alt="Mesael Logo" className="w-full h-auto object-contain" />
          </div>
          <div className="font-bold text-sm text-[#15181e]">Mesael Finance</div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 hover:text-black"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Off-Canvas Drawer Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-50 md:hidden backdrop-blur-sm animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Off-Canvas Drawer */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white flex flex-col transform transition-transform duration-300 ease-in-out md:hidden ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Close Button */}
        <button 
          onClick={() => setMobileMenuOpen(false)}
          className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
        {SidebarContent}
      </div>

      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 h-screen fixed top-0 left-0 bg-white border-r border-gray-200 z-40">
        {SidebarContent}
      </aside>
    </>
  );
};
