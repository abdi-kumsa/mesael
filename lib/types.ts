export type RoleId = 'mesael' | 'dembi' | 'leta' | 'kalkidan' | 'yamrot';

export interface UserRole {
  id: RoleId;
  name: string;
  avatar: string;
  title: string;
  tagline: string;
}

export interface PaymentVoucher {
  id: string;
  code: string;
  title: string;
  project: string;
  costCode: string;
  payee: string;
  amount: number;
  method: 'RTGS' | 'Cheque' | 'Petty cash';
  status: 'pending_docs' | 'ready_for_approval' | 'owner_reserved' | 'approved' | 'paid' | 'declined';
  preparedBy: string;
  assignedApprover: 'dembi' | 'mesael';
  docsCount: number;
  totalDocsRequired: number;
  docsAttached: {
    po: boolean;
    proforma: boolean;
    grn: boolean;
    taxInvoice: boolean;
  };
  attachments?: {
    id?: string;
    fileName: string;
    url: string;
    type: string;
    version?: number;
  }[];
  budgetBefore?: number;
  budgetAfter?: number;
  date?: string;
}

export interface VendorQuote {
  id: string;
  name: string;
  location: string;
  tenureOnRecord: string;
  leadTimeDays: number;
  advanceRequirement: string;
  onTimeRatio: string;
  pricePerUnit: number;
  unit: string;
  isBestValue: boolean;
}

export interface PeachtreeEntry {
  id: string;
  period: string;
  linesCount: number;
  exportDate: string | null;
  status: 'Synced' | 'Pending';
}

export interface ClientMilestoneContract {
  id: string;
  name: string;
  contractValue: number;
  billingType: string;
  statusText: string;
  statusType: 'good' | 'warn' | 'bad';
  milestones: {
    name: string;
    progressPercent: number;
    status: 'completed' | 'active' | 'pending' | 'overdue';
  }[];
}

export interface TaxDeclaration {
  period: string;
  dueDate: string;
  tin: string;
  totalSales: number;
  totalPurchases: number;
  outputVat: number;
  inputVat: number;
  netVatPayable: number;
  isReviewed: boolean;
}
