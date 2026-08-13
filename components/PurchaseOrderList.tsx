'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { ShoppingCart, Check, FileText, ChevronRight, AlertTriangle } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export const PurchaseOrderList = () => {
  const { data: reqData } = useSWR('/api/p2p/requisitions', fetcher);
  const { data: poData } = useSWR('/api/p2p/orders', fetcher);
  const { data: supplierData } = useSWR('/api/p2p/suppliers', fetcher);

  const [activeReq, setActiveReq] = useState<any>(null);
  const [supplierId, setSupplierId] = useState('');
  const [prices, setPrices] = useState<Record<string, string>>({});

  const pendingReqs = (reqData?.data || []).filter((r: any) => r.status === 'PENDING');
  const purchaseOrders = poData?.data || [];
  const suppliers = (supplierData?.data || []).filter((s: any) => s.status === 'APPROVED');

  const handlePriceChange = (itemId: string, val: string) => {
    setPrices({ ...prices, [itemId]: val });
  };

  const handleConvertPO = async () => {
    if (!supplierId) return alert('Select a supplier');
    
    // Ensure all prices are filled
    const items = activeReq.items.map((item: any) => {
      const price = parseFloat(prices[item.id] || '0');
      return {
        description: item.description,
        quantity: item.quantity,
        unitPrice: price,
        unit: item.unit
      };
    });

    if (items.some((i: any) => i.unitPrice <= 0)) {
      return alert('Enter valid unit prices for all items.');
    }

    const res = await fetch('/api/p2p/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requisitionId: activeReq.id,
        supplierId,
        items
      })
    });

    if (res.ok) {
      setActiveReq(null);
      setSupplierId('');
      setPrices({});
      mutate('/api/p2p/requisitions');
      mutate('/api/p2p/orders');
    }
  };

  const calculateTotal = () => {
    if (!activeReq) return 0;
    return activeReq.items.reduce((sum: number, item: any) => {
      return sum + (item.quantity * parseFloat(prices[item.id] || '0'));
    }, 0);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
        <ShoppingCart className="w-3.5 h-3.5" /> Procurement Pipeline
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Pending Requisitions */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-2">Pending Requisitions ({pendingReqs.length})</h3>
          
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {pendingReqs.map((req: any) => (
              <div 
                key={req.id} 
                onClick={() => setActiveReq(req)}
                className={`panel p-3 cursor-pointer transition-all ${activeReq?.id === req.id ? 'border-[#c1540f] ring-1 ring-[#c1540f] shadow-md' : 'hover:border-gray-300'}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-xs font-bold text-[#15181e]">{req.code}</span>
                  <span className="text-[10px] text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-xs text-gray-700 font-medium truncate">{req.description}</div>
                <div className="text-[10px] text-gray-500 mt-2">{req.items.length} items requested by {req.preparedBy.name}</div>
              </div>
            ))}
            {pendingReqs.length === 0 && <div className="text-xs text-gray-400 text-center py-8">No pending requisitions</div>}
          </div>
        </div>

        {/* Right Column: PO Generation or PO List */}
        <div className="lg:col-span-2 space-y-4">
          
          {activeReq ? (
            <div className="panel p-0 overflow-hidden border-[#15181e]">
              <div className="bg-[#15181e] p-4 text-white">
                <h3 className="font-bold text-sm">Generate Purchase Order</h3>
                <div className="text-xs text-gray-400">Against {activeReq.code} • {activeReq.project.code}</div>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <label className="block mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">Select Approved Supplier</label>
                  <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="input-field w-full max-w-md">
                    <option value="">-- Select Vendor --</option>
                    {suppliers.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.legalName} ({s.tin})</option>
                    ))}
                  </select>
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#faf9f8] border-b border-gray-200 text-gray-500 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="py-2 px-3">Item Description</th>
                        <th className="py-2 px-3 text-right">Qty</th>
                        <th className="py-2 px-3 w-32 text-right">Unit Price (Br)</th>
                        <th className="py-2 px-3 w-32 text-right">Total (Br)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {activeReq.items.map((item: any) => {
                        const price = parseFloat(prices[item.id] || '0');
                        const total = item.quantity * price;
                        return (
                          <tr key={item.id}>
                            <td className="py-2 px-3 font-semibold">{item.description}</td>
                            <td className="py-2 px-3 text-right font-mono text-gray-600">{item.quantity} {item.unit}</td>
                            <td className="py-2 px-3 text-right">
                              <input 
                                type="number" 
                                min="0" step="0.01" 
                                value={prices[item.id] || ''} 
                                onChange={(e) => handlePriceChange(item.id, e.target.value)}
                                className="w-full text-right bg-white border border-gray-200 rounded p-1 focus:ring-1 focus:ring-[#c1540f] outline-none"
                                placeholder="0.00"
                              />
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-[#15181e] bg-gray-50">
                              {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-[#15181e] text-white">
                      <tr>
                        <td colSpan={3} className="py-3 px-3 text-right font-bold text-xs uppercase tracking-wider">Total PO Value</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-sm text-[#1a7a5c]">
                          Br {calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button onClick={() => setActiveReq(null)} className="text-xs font-bold text-gray-500 hover:text-gray-900">Cancel</button>
                  <button onClick={handleConvertPO} className="bg-[#1a7a5c] hover:bg-[#135c45] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> Issue Purchase Order
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-2">Issued Purchase Orders</h3>
              <div className="space-y-3">
                {purchaseOrders.map((po: any) => {
                  const total = po.items.reduce((s: number, i: any) => s + (i.quantity * i.unitPrice), 0);
                  return (
                    <div key={po.id} className="panel p-4 flex flex-col sm:flex-row justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-[#1a7a5c] bg-[#1a7a5c]/10 px-2 py-0.5 rounded">{po.code}</span>
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{po.status}</span>
                        </div>
                        <div className="text-sm font-bold text-[#15181e]">{po.supplier.legalName}</div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-1">
                          Ref: {po.requisition.code} <ChevronRight className="w-3 h-3" /> Project: {po.requisition.project.code}
                        </div>
                      </div>
                      <div className="text-right flex flex-col justify-between">
                        <div className="font-mono font-bold text-lg text-[#15181e]">Br {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        <div className="text-[10px] text-gray-400">{po.items.length} lines • Issued {new Date(po.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
