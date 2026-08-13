'use client';

import React, { useState, useRef } from 'react';
import useSWR from 'swr';
import { X, Lock, CheckCircle, UploadCloud, FileCheck, Loader2 } from 'lucide-react';

interface DocumentGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
}

export const DocumentGateModal: React.FC<DocumentGateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [purchaseOrderId, setPurchaseOrderId] = useState<string>('');
  const [ipcId, setIpcId] = useState<string>('');
  const [project, setProject] = useState('');
  const [projectId, setProjectId] = useState('PRJ-BOLE'); // Default fallback
  const [costCode, setCostCode] = useState('');
  const [costCodeId, setCostCodeId] = useState('CC-2201'); // Default fallback
  const [payee, setPayee] = useState('');
  const [method, setMethod] = useState<'RTGS' | 'Cheque' | 'Petty cash'>('RTGS');
  const [amount, setAmount] = useState(0);

  // Fetch POs
  const { data: poData } = useSWR('/api/p2p/orders', (url: string) => fetch(url).then(res => res.json()));
  const orders = poData?.data || [];

  // Fetch all IPCs (this would typically be a specific endpoint for unvouchered IPCs)
  const { data: subData } = useSWR('/api/subcontracts', (url: string) => fetch(url).then(res => res.json()));
  const subcontracts = subData?.data || [];
  // Flatten IPCs
  const allIpcs = subcontracts.flatMap((s: any) => s.ipcs.map((ipc: any) => ({
    ...ipc,
    vendorName: s.vendorName,
    projectCode: s.projectCode,
    projectId: s.projectId,
    costCode: s.costCode,
    costCodeId: s.costCodeId
  })));

  const [docs, setDocs] = useState<{ [key: string]: string | null }>({
    taxInvoice: null,
  });

  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});

  const fileInputRefs = {
    po: useRef<HTMLInputElement>(null),
    proforma: useRef<HTMLInputElement>(null),
    grn: useRef<HTMLInputElement>(null),
    taxInvoice: useRef<HTMLInputElement>(null),
  };

  if (!isOpen) return null;

  const totalRequired = 1; // Only Tax Invoice required if 3-way match is enabled digitally
  const attachedCount = Object.values(docs).filter(Boolean).length;
  const isGateUnlocked = (purchaseOrderId !== '' || ipcId !== '') && attachedCount === totalRequired;

  const handlePoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setPurchaseOrderId(id);
    setIpcId(''); // Clear IPC
    const po = orders.find((o: any) => o.id === id);
    if (po) {
      setPayee(po.supplier.legalName);
      setProject(`${po.requisition.project.code} - ${po.requisition.project.name}`);
      setProjectId(po.requisition.project.id);
      setCostCode(`${po.requisition.costCode.code}`);
      setCostCodeId(po.requisition.costCode.id);
      const total = po.items.reduce((s: number, i: any) => s + (i.quantity * i.unitPrice), 0);
      setAmount(total);
    } else {
      setPayee(''); setProject(''); setCostCode(''); setAmount(0);
    }
  };

  const handleIpcChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setIpcId(id);
    setPurchaseOrderId(''); // Clear PO
    const ipc = allIpcs.find((i: any) => i.id === id);
    if (ipc) {
      setPayee(ipc.vendorName);
      setProject(ipc.projectCode);
      setProjectId(ipc.projectId); // Assumes we added this in flatten
      setCostCode(ipc.costCode);
      setCostCodeId(ipc.costCodeId);
      setAmount(ipc.netAmount);
    } else {
      setPayee(''); setProject(''); setCostCode(''); setAmount(0);
    }
  };

  const budgetBefore = 612900;
  const budgetRemaining = budgetBefore - amount;

  const handleFileChange = async (key: keyof typeof docs, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading((prev) => ({ ...prev, [key]: true }));

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setDocs((prev) => ({ ...prev, [key]: data.url }));
      }
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleSubmit = () => {
    if (!isGateUnlocked) return;
    
    // Map docs into attachments array for new schema
    const attachments = Object.entries(docs)
      .filter(([_, url]) => url !== null)
      .map(([key, url]) => ({
        fileName: url?.split('-').pop() || 'document',
        url: url,
        type: key.toUpperCase()
      }));

    onSubmit({
      projectId,
      costCodeId,
      title: `Payment for ${payee}`,
      payee,
      method,
      amount,
      purchaseOrderId,
      ipcId,
      docsAttached: docs, // legacy fallback
      attachments // new phase 2 model
    });
  };

  const renderDocUpload = (key: keyof typeof docs, title: string) => {
    const isAttached = !!docs[key];
    const isUploading = uploading[key];

    return (
      <div
        onClick={() => !isUploading && !isAttached && fileInputRefs[key as keyof typeof fileInputRefs].current?.click()}
        className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
          isAttached
            ? 'bg-[#e9f5f0] border-[#bfe3d4] text-[#1a7a5c]'
            : isUploading
            ? 'bg-blue-50 border-blue-200 text-blue-600'
            : 'bg-gray-50 border-gray-200 text-gray-700 cursor-pointer hover:bg-gray-100 hover:border-gray-300'
        }`}
      >
        <div className="flex items-center gap-3 font-semibold text-xs">
          <div
            className={`w-6 h-6 rounded-md flex items-center justify-center text-white shrink-0 ${
              isAttached ? 'bg-[#1a7a5c]' : isUploading ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            {isUploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isAttached ? (
              <FileCheck className="w-3.5 h-3.5" />
            ) : (
              <UploadCloud className="w-3.5 h-3.5" />
            )}
          </div>
          <div className="truncate pr-2">{title}</div>
        </div>
        
        {isAttached ? (
          <a
            href={docs[key] as string}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[10px] uppercase font-bold text-[#1a7a5c] underline hover:text-[#0f543e]"
          >
            View File
          </a>
        ) : isUploading ? (
          <span className="text-[10px] uppercase font-bold text-blue-500">Uploading...</span>
        ) : (
          <span className="text-[10px] uppercase font-bold text-[#b23a24]">Required</span>
        )}

        <input
          type="file"
          ref={fileInputRefs[key as keyof typeof fileInputRefs]}
          onChange={(e) => handleFileChange(key, e)}
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-end bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl flex flex-col border-l border-gray-200">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 relative bg-[#faf9f8]">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-black hover:border-gray-400"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#c1540f]">
            New Payment Voucher · PV-2026-00491
          </div>
          <h3 className="font-serif text-2xl font-semibold text-[#15181e] mt-1">
            No document, no approval
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Nothing here reaches Dembi's queue until the counterfoil checklist is complete.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 flex-1">
          
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">
              Transaction Details
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Link Purchase Order (3-Way Match)
                </label>
                <select
                  className="w-full text-xs font-bold text-gray-900 border border-gray-200 bg-gray-50/50 rounded-xl p-2.5 outline-none focus:border-[#c1540f]"
                  value={purchaseOrderId}
                  onChange={handlePoChange}
                  disabled={ipcId !== ''}
                >
                  <option value="">-- Select PO --</option>
                  {orders.map((po: any) => (
                    <option key={po.id} value={po.id}>{po.code} - {po.supplier.legalName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Link IPC (Subcontractor)
                </label>
                <select
                  className="w-full text-xs font-bold text-gray-900 border border-gray-200 bg-gray-50/50 rounded-xl p-2.5 outline-none focus:border-[#c1540f]"
                  value={ipcId}
                  onChange={handleIpcChange}
                  disabled={purchaseOrderId !== ''}
                >
                  <option value="">-- Select IPC --</option>
                  {allIpcs.map((ipc: any) => (
                    <option key={ipc.id} value={ipc.id}>{ipc.code} - {ipc.vendorName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Payee / Vendor
              </label>
              <input
                type="text"
                className="w-full text-xs font-bold text-gray-900 border border-gray-200 bg-gray-50/50 rounded-xl p-2.5 outline-none focus:border-[#c1540f]"
                value={payee}
                onChange={(e) => setPayee(e.target.value)}
                readOnly={purchaseOrderId !== '' || ipcId !== ''}
              />
            </div>

            {purchaseOrderId && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Project Allocation
                  </label>
                  <input
                    type="text"
                    className="w-full text-xs font-bold text-gray-900 border border-gray-200 bg-gray-100 rounded-xl p-2.5 outline-none"
                    value={project}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Cost Code
                  </label>
                  <input
                    type="text"
                    className="w-full text-xs font-bold text-gray-900 border border-gray-200 bg-gray-100 rounded-xl p-2.5 outline-none"
                    value={costCode}
                    readOnly
                  />
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3 text-xs mt-4">
              <div>
                <label className="text-gray-500 font-semibold block mb-1">Method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50/50 font-medium text-gray-900 focus:outline-none focus:border-[#c1540f]"
                >
                  <option value="RTGS">RTGS Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Petty cash">Petty Cash</option>
                </select>
              </div>
              <div>
                <label className="text-gray-500 font-semibold block mb-1">Amount (ETB)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50/50 font-mono font-bold text-gray-900 text-sm focus:outline-none focus:border-[#c1540f]"
                />
              </div>
            </div>
          </div>

          {/* Real-time Budget Effect Calculation */}
          <div className="bg-[#fdf1e7] border border-[#f3d3b3] rounded-2xl p-4 text-xs space-y-1.5">
            <div className="flex justify-between text-gray-700">
              <span>Budget line balance, before</span>
              <span className="font-mono font-semibold">Br {budgetBefore.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>This request amount</span>
              <span className="font-mono font-semibold text-[#c1540f]">- Br {amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#f3d3b3] font-bold text-[#8f3d0b]">
              <span>Remaining after approval</span>
              <span className="font-mono">Br {budgetRemaining.toLocaleString()}</span>
            </div>
          </div>

          {/* Mandatory Attachments */}
          <div className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-[#15181e]">Mandatory Attachments</h4>
                <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                  PO and GRN are digitally verified through 3-Way Match. Only invoice is required.
                </p>
              </div>
              <div className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">
                {attachedCount} of {totalRequired} attached
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {renderDocUpload('taxInvoice', 'Original Tax Invoice / Receipt')}
            </div>
          </div>

          {/* Document Gate Status Banner */}
            <div className={`mt-4 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-3 ${
              isGateUnlocked
                ? 'bg-[#e9f5f0] text-[#1a7a5c] border border-[#bfe3d4]'
                : 'bg-[#fbebe7] text-[#b23a24] border border-[#f0c3b6]'
            }`}>
              {isGateUnlocked ? <CheckCircle className="w-5 h-5 shrink-0" /> : <Lock className="w-5 h-5 shrink-0" />}
              <span>
                {isGateUnlocked
                  ? `All 4 mandatory documents attached — Ready to send for approval`
                  : `${attachedCount} of 4 documents attached — routing to Dembi is locked`}
              </span>
            </div>

          </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-end gap-3 bg-[#faf9f8]">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-700 transition-colors"
          >
            Save as draft
          </button>
          <button
            disabled={!isGateUnlocked}
            onClick={handleSubmit}
            className={`px-6 py-2.5 text-xs font-bold rounded-xl transition-all shadow-sm ${
              isGateUnlocked 
                ? 'bg-[#15181e] text-white hover:bg-[#c1540f] transform hover:-translate-y-0.5' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Submit to Dembi
          </button>
        </div>

      </div>
    </div>
  );
};
