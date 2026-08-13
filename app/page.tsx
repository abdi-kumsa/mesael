'use client';

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import useSWR, { mutate } from 'swr';
import { PaymentVoucher, VendorQuote } from '@/lib/types';
import { Sidebar } from '@/components/Sidebar';
import { LetaDashboard } from '@/components/LetaDashboard';
import { DembiDashboard } from '@/components/DembiDashboard';
import { MesaelDashboard } from '@/components/MesaelDashboard';
import { KalkidanDashboard } from '@/components/KalkidanDashboard';
import { YamrotDashboard } from '@/components/YamrotDashboard';
import { RentalDashboard } from '@/components/RentalDashboard';
import { TreasuryDashboardWrapper } from '@/components/TreasuryDashboard';
import { DocumentGateModal } from '@/components/DocumentGateModal';
import { AdminDashboard } from '@/components/AdminDashboard';
import { FirehiwotDashboard } from '@/components/FirehiwotDashboard';
import { SamuelDashboard } from '@/components/SamuelDashboard';
import { JohnDashboard } from '@/components/JohnDashboard';
import { SubcontractDesk } from '@/components/SubcontractDesk';
import { IPCCertification } from '@/components/IPCCertification';
import { ClientContractDesk } from '@/components/ClientContractDesk';
import { ClientBilling } from '@/components/ClientBilling';
import { TaxReceiptDesk } from '@/components/TaxReceiptDesk';
import { ReceivablesLedger } from '@/components/ReceivablesLedger';
import { PayrollDashboard } from '@/components/PayrollDashboard';
import { TaxDashboard } from '@/components/TaxDashboard';
import { ToastContainer, ToastMessage } from '@/components/ToastContainer';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function HomePage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Real Database SWR Fetching
  const { data: vouchersData } = useSWR('/api/vouchers', fetcher, { refreshInterval: 5000 });
  const vouchers: PaymentVoucher[] = vouchersData?.data || [];

  if (status === 'loading') {
    return <div className="min-h-screen bg-[#fbfaf8] flex items-center justify-center font-bold text-sm">Loading Application...</div>;
  }

  const currentRoleId = session?.user?.roleId || '';
  const currentUserName = session?.user?.name || '';

  const addToast = (title: string, message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    const newToast: ToastMessage = {
      id: String(Date.now()),
      title,
      message,
      type,
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  // POST to Real API: Create Voucher
  const handleCreateVoucher = async (formData: any) => {
    try {
      const res = await fetch('/api/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      
      if (result.success) {
        setIsModalOpen(false);
        mutate('/api/vouchers');
        addToast('Voucher Created & Budget Updated', result.message);
      } else {
        addToast('Error', result.message, 'warning');
      }
    } catch (error) {
      addToast('Error', 'Failed to create voucher', 'warning');
    }
  };

  // POST to Real API: Approve/Decline
  const handleApprovalAction = async (code: string, action: 'approve' | 'decline') => {
    try {
      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voucherCode: code, action }),
      });
      const result = await res.json();

      if (result.success) {
        mutate('/api/vouchers');
        if (action === 'approve') {
          addToast(
            'Approved & Propagated Across System',
            result.message
          );
        } else {
          addToast('Voucher Declined', result.message);
        }
      } else {
        addToast('Error', result.message || 'Approval failed', 'warning');
      }
    } catch (error) {
      addToast('Error', 'Failed to process approval', 'warning');
    }
  };

  // Mocked for Phase 4 (as these were not converted to DB yet)
  const handleIssueReceipt = () => {
    addToast(
      'Receipt Issued & Ledger Updated',
      'Issued Official Receipt OR-2026-0332 for Br 480,000. Cash Position increased & Overdue Receivables reduced!'
    );
  };

  const handleRunPeachtreeExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      addToast(
        'Staged Export Synced',
        '94 journal lines for August staged and synced to Peachtree statutory ledger. Immutable audit log recorded.'
      );
    }, 1000);
  };

  const handleMarkTaxReviewed = () => {
    addToast(
      'Tax Declaration Reviewed',
      'July 2026 VAT declaration verified and ready for online ERCA submission.'
    );
  };

  const handleSelectVendor = (vendor: VendorQuote) => {
    addToast(
      'Vendor Selected',
      `${vendor.name} selected as payee at Br ${vendor.pricePerUnit.toFixed(2)}/${vendor.unit}. Opening 4-Document Gate modal.`
    );
    setIsModalOpen(true);
  };

  const handleExportPDF = () => {
    addToast(
      'Financial Report Exported',
      'Mesael Construction YTD Profit & Loss and Balance Sheet snapshot exported as PDF.'
    );
  };

  const handleViewVoucher = (code: string) => {
    addToast(
      'Reviewing Voucher',
      `Opening document viewer and history for voucher ${code}.`
    );
  };

  return (
    <div className="min-h-screen bg-[#fbfaf8]">
      
      {/* Sidebar Navigation */}
      <Sidebar
        session={session}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSignOut={handleSignOut}
      />

      {/* Main Content Stage */}
      <div className="md:ml-64 lg:ml-72 min-h-screen flex flex-col">
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 md:py-10">
        
        {activeTab === 'rentals' && (
          <RentalDashboard onAddToast={addToast} roleId={currentRoleId} />
        )}

        {activeTab === 'cash' && (
          <TreasuryDashboardWrapper onAddToast={addToast} />
        )}

        {activeTab === 'subcontracts' && (
          <SubcontractDesk onToast={addToast} />
        )}

        {activeTab === 'ipcs' && (
          <IPCCertification onToast={addToast} />
        )}

        {activeTab === 'client_contracts' && (
          <ClientContractDesk onToast={addToast} />
        )}

        {activeTab === 'client_billing' && (
          <ClientBilling onToast={addToast} />
        )}

        {activeTab === 'tax_receipts' && (
          <TaxReceiptDesk onToast={addToast} />
        )}

        {activeTab === 'receivables' && (
          <ReceivablesLedger onToast={addToast} />
        )}

        {activeTab === 'payroll' && (
          <PayrollDashboard onAddToast={addToast} roleId={currentRoleId} />
        )}

        {activeTab === 'statutory' && (
          <TaxDashboard onAddToast={addToast} />
        )}

        {currentRoleId === 'leta' && !['rentals', 'cash', 'subcontracts', 'ipcs', 'client_contracts', 'client_billing', 'tax_receipts', 'receivables', 'payroll', 'statutory'].includes(activeTab) && (
          <LetaDashboard
            activeTab={activeTab}
            vouchers={vouchers}
            onOpenNewVoucherModal={() => setIsModalOpen(true)}
            onSelectVendor={handleSelectVendor}
            onViewVoucher={handleViewVoucher}
          />
        )}

        {currentRoleId === 'dembi' && !['rentals', 'cash', 'subcontracts', 'ipcs', 'client_contracts', 'client_billing', 'tax_receipts', 'receivables', 'payroll', 'statutory'].includes(activeTab) && (
          <DembiDashboard
            activeTab={activeTab}
            vouchers={vouchers}
            onApproveVoucher={(code) => handleApprovalAction(code, 'approve')}
            onDeclineVoucher={(code) => handleApprovalAction(code, 'decline')}
          />
        )}

        {currentRoleId === 'mesael' && !['rentals', 'cash', 'subcontracts', 'ipcs', 'client_contracts', 'client_billing', 'tax_receipts', 'receivables', 'payroll', 'statutory'].includes(activeTab) && (
          <MesaelDashboard
            activeTab={activeTab}
            vouchers={vouchers}
            onApproveVoucher={(code) => handleApprovalAction(code, 'approve')}
            onDeclineVoucher={(code) => handleApprovalAction(code, 'decline')}
            onExportPDF={handleExportPDF}
          />
        )}

        {currentRoleId === 'kalkidan' && (
          <KalkidanDashboard
            activeTab={activeTab}
            vouchers={vouchers}
            onRunExport={handleRunPeachtreeExport}
            isExporting={isExporting}
            onToast={addToast}
          />
        )}

        {currentRoleId === 'yamrot' && !['tax_receipts'].includes(activeTab) && (
          <YamrotDashboard
            activeTab={activeTab}
            onIssueReceipt={handleIssueReceipt}
            onMarkTaxReviewed={handleMarkTaxReviewed}
          />
        )}

        {currentRoleId === 'firehiwot' && activeTab !== 'subcontracts' && activeTab !== 'ipcs' && activeTab !== 'rentals' && (
          <FirehiwotDashboard />
        )}

        {currentRoleId === 'samuel' && activeTab !== 'rentals' && (
          <SamuelDashboard activeTab={activeTab} />
        )}

        {currentRoleId === 'john' && activeTab !== 'subcontracts' && activeTab !== 'ipcs' && activeTab !== 'rentals' && (
          <JohnDashboard />
        )}

        {currentRoleId === 'admin' && !['rentals', 'cash', 'subcontracts', 'ipcs', 'client_contracts', 'client_billing', 'tax_receipts', 'receivables', 'payroll', 'statutory'].includes(activeTab) && (
          <AdminDashboard activeTab={activeTab} vouchers={vouchers} onToast={addToast} />
        )}

      </main>

      {/* Interactive 4-Document Gate Modal */}
      <DocumentGateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateVoucher}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400">
        Mesael Construction Operations Platform · Protected Enterprise System
      </footer>

      </div>
    </div>
  );
}
