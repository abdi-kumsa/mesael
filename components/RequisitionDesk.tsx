'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { Plus, Check, Trash2, FileText, BarChart3, Clock, AlertTriangle } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export const RequisitionDesk = () => {
  const { data: reqData, isLoading } = useSWR('/api/p2p/requisitions', fetcher);
  const { data: projectsData } = useSWR('/api/projects', fetcher);

  const [isAdding, setIsAdding] = useState(false);
  const [projectId, setProjectId] = useState('');
  const [costCodeId, setCostCodeId] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState([{ description: '', quantity: 1, unit: 'pcs' }]);

  const projects = projectsData?.data || [];
  const selectedProject = projects.find((p: any) => p.id === projectId);
  const costCodes = selectedProject?.costCodes || [];

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unit: 'pcs' }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !costCodeId) return alert('Select Project and Cost Code');
    
    const res = await fetch('/api/p2p/requisitions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, costCodeId, description, items })
    });
    
    if (res.ok) {
      setIsAdding(false);
      setProjectId('');
      setCostCodeId('');
      setDescription('');
      setItems([{ description: '', quantity: 1, unit: 'pcs' }]);
      mutate('/api/p2p/requisitions');
    }
  };

  const requisitions = reqData?.data || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Site Requests
          </div>
          <h2 className="text-2xl font-serif font-semibold text-[#15181e] mt-1">Purchase Requisitions</h2>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-[#15181e] hover:bg-[#c1540f] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Raise Requisition
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="panel space-y-4 bg-gray-50/50 border border-[#c1540f]/20">
          <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">New Purchase Requisition</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">Project</label>
              <select required value={projectId} onChange={e => setProjectId(e.target.value)} className="input-field w-full">
                <option value="">-- Select Project --</option>
                {projects.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">Cost Code (Budget Line)</label>
              <select required value={costCodeId} onChange={e => setCostCodeId(e.target.value)} className="input-field w-full" disabled={!projectId}>
                <option value="">-- Select Cost Code --</option>
                {costCodes.map((cc: any) => (
                  <option key={cc.id} value={cc.id}>{cc.code} - {cc.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">Justification / Remarks</label>
            <input required value={description} onChange={e => setDescription(e.target.value)} className="input-field w-full" placeholder="e.g. Urgent reinforcement for Block B column casting" />
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-100">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Requested Items</label>
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input required value={item.description} onChange={e => handleItemChange(idx, 'description', e.target.value)} className="input-field flex-1" placeholder="Item description / specification" />
                <input required type="number" min="1" step="0.01" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} className="input-field w-24 text-right" placeholder="Qty" />
                <input required value={item.unit} onChange={e => handleItemChange(idx, 'unit', e.target.value)} className="input-field w-24" placeholder="Unit (pcs, kg)" />
                {items.length > 1 && (
                  <button type="button" onClick={() => handleRemoveItem(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={handleAddItem} className="text-xs font-bold text-[#c1540f] hover:text-[#a0450c] flex items-center gap-1 mt-2">
              <Plus className="w-3.5 h-3.5" /> Add another item
            </button>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button type="submit" className="bg-[#1a7a5c] hover:bg-[#135c45] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Submit Requisition
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && <div className="text-xs text-gray-400 font-bold col-span-full">Loading...</div>}
        {requisitions.map((req: any) => (
          <div key={req.id} className="panel p-4 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between items-start mb-2">
                <div className="font-mono text-xs font-bold text-[#c1540f] bg-orange-50 px-2 py-0.5 rounded">{req.code}</div>
                <div className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  req.status === 'PENDING' ? 'bg-gray-100 text-gray-500' :
                  req.status === 'ORDERED' ? 'bg-[#1a7a5c]/10 text-[#1a7a5c]' : 'bg-red-50 text-red-600'
                }`}>
                  {req.status}
                </div>
              </div>
              <div className="font-bold text-[#15181e] text-sm leading-snug">{req.description}</div>
              <div className="text-xs text-gray-500 mt-1">{req.project.code} · {req.costCode.code}</div>
            </div>
            
            <div className="bg-[#faf9f8] -mx-4 -mb-4 p-4 border-t border-gray-100 text-xs">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Items</div>
              <ul className="space-y-1">
                {req.items.map((item: any) => (
                  <li key={item.id} className="flex justify-between text-gray-700">
                    <span className="truncate pr-2">{item.description}</span>
                    <span className="font-mono font-bold whitespace-nowrap">{item.quantity} {item.unit}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 pt-3 border-t border-gray-200 text-gray-500 flex justify-between items-center text-[10px]">
                <span>By {req.preparedBy.name}</span>
                <span>{new Date(req.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
