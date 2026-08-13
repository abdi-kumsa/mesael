'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { PackageOpen, Check, Search, AlertTriangle, Truck } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export const GRNCapture = () => {
  const { data: poData } = useSWR('/api/p2p/orders', fetcher);
  const { data: grnData } = useSWR('/api/p2p/grn', fetcher);

  const [activePO, setActivePO] = useState<any>(null);
  const [receiveData, setReceiveData] = useState<Record<string, { qty: string, condition: string }>>({});

  const orders = (poData?.data || []).filter((o: any) => o.status === 'ISSUED' || o.status === 'PARTIAL_RECEIVED');
  const grns = grnData?.data || [];

  const handleQtyChange = (itemId: string, qty: string) => {
    setReceiveData(prev => ({ ...prev, [itemId]: { ...prev[itemId], qty } }));
  };

  const handleConditionChange = (itemId: string, condition: string) => {
    setReceiveData(prev => ({ ...prev, [itemId]: { ...prev[itemId], condition: condition || 'GOOD' } }));
  };

  const handleSubmitGRN = async () => {
    // Collect submitted items (only those with quantity > 0)
    const items = activePO.items.map((item: any) => {
      const rd = receiveData[item.id];
      const qty = parseFloat(rd?.qty || '0');
      return {
        orderItemId: item.id,
        quantityReceived: qty,
        condition: rd?.condition || 'GOOD'
      };
    }).filter((i: any) => i.quantityReceived > 0);

    if (items.length === 0) return alert('Enter received quantities');

    const res = await fetch('/api/p2p/grn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: activePO.id, items })
    });

    if (res.ok) {
      setActivePO(null);
      setReceiveData({});
      mutate('/api/p2p/orders');
      mutate('/api/p2p/grn');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
        <PackageOpen className="w-3.5 h-3.5" /> Site Goods Receiving
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: POs pending delivery */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-2">Incoming Deliveries (POs)</h3>
          
          <div className="space-y-3">
            {orders.map((po: any) => (
              <div 
                key={po.id} 
                onClick={() => setActivePO(po)}
                className={`panel p-4 cursor-pointer transition-all ${activePO?.id === po.id ? 'border-[#1a7a5c] ring-1 ring-[#1a7a5c] shadow-md' : 'hover:border-gray-300'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Truck className="w-4 h-4 text-gray-400" />
                      <span className="font-mono text-xs font-bold text-[#15181e]">{po.code}</span>
                    </div>
                    <div className="text-sm font-bold text-[#c1540f]">{po.supplier.legalName}</div>
                  </div>
                  <div className="text-[10px] text-gray-500 text-right">
                    Ordered: {new Date(po.createdAt).toLocaleDateString()}
                    <div className="font-bold text-[#1a7a5c] mt-1">{po.items.length} Lines</div>
                  </div>
                </div>
              </div>
            ))}
            {orders.length === 0 && <div className="text-xs text-gray-400 text-center py-8">No incoming deliveries</div>}
          </div>
        </div>

        {/* Right Column: GRN Form */}
        <div className="space-y-4">
          {activePO ? (
            <div className="panel p-0 overflow-hidden border-[#1a7a5c]">
              <div className="bg-[#1a7a5c] p-4 text-white">
                <h3 className="font-bold text-sm">Log Delivery Against {activePO.code}</h3>
                <div className="text-xs opacity-80">{activePO.supplier.legalName}</div>
              </div>
              
              <div className="p-4 space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#faf9f8] border-b border-gray-200 text-gray-500 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="py-2 px-2">Item</th>
                        <th className="py-2 px-2 text-right">Ordered</th>
                        <th className="py-2 px-2 text-right w-24">Received</th>
                        <th className="py-2 px-2 w-32">Condition</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {activePO.items.map((item: any) => {
                        // In a real app we'd subtract already received quantities from previous GRNs
                        // For MVP, we'll assume receiving the full remaining amount
                        return (
                          <tr key={item.id}>
                            <td className="py-2 px-2 font-semibold text-gray-800">{item.description}</td>
                            <td className="py-2 px-2 text-right font-mono text-gray-500">{item.quantity} {item.unit}</td>
                            <td className="py-2 px-2 text-right">
                              <input 
                                type="number" 
                                min="0" max={item.quantity} step="0.01" 
                                value={receiveData[item.id]?.qty || ''} 
                                onChange={(e) => handleQtyChange(item.id, e.target.value)}
                                className="w-full text-right bg-white border border-gray-200 rounded p-1 focus:ring-1 focus:ring-[#1a7a5c] outline-none"
                                placeholder={item.quantity}
                              />
                            </td>
                            <td className="py-2 px-2">
                              <select 
                                value={receiveData[item.id]?.condition || 'GOOD'} 
                                onChange={(e) => handleConditionChange(item.id, e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded p-1 text-[10px] uppercase font-bold"
                              >
                                <option value="GOOD">Good</option>
                                <option value="DAMAGED">Damaged</option>
                                <option value="REJECTED">Rejected</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="bg-orange-50 border border-orange-100 p-3 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <div className="text-[10px] text-orange-800">
                    <strong>Photo Evidence Required:</strong> You will be prompted to attach photos of the delivery vehicle and waybill upon submission.
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button onClick={() => setActivePO(null)} className="text-xs font-bold text-gray-500 hover:text-gray-900">Cancel</button>
                  <button onClick={handleSubmitGRN} className="bg-[#1a7a5c] hover:bg-[#135c45] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> Confirm Receipt (GRN)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-2">Recent Receipts (GRNs)</h3>
              <div className="space-y-3">
                {grns.map((grn: any) => (
                  <div key={grn.id} className="panel p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-mono text-xs font-bold text-[#1a7a5c] bg-[#1a7a5c]/10 px-2 py-0.5 rounded">{grn.code}</span>
                      <span className="text-[10px] font-bold text-gray-500">{new Date(grn.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-xs font-bold text-gray-700">Against {grn.order.code}</div>
                    <div className="text-[10px] text-gray-500 mt-1">{grn.items.length} items received by {grn.receivedBy.name}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
