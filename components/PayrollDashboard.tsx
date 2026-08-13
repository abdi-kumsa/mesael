'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { Users, Clock, PlayCircle, CheckCircle2, UserCircle } from 'lucide-react';
import { ToastMessage } from '@/components/ToastContainer';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface PayrollDashboardProps {
  onAddToast: (title: string, message: string, type: 'success' | 'warning' | 'info') => void;
  roleId?: string;
}

export const PayrollDashboard: React.FC<PayrollDashboardProps> = ({ onAddToast, roleId = '' }) => {
  // Role permissions derived from org chart authority matrix:
  // canManage  → Finance Head (Leta/Kalkidan): Add Employee, Log Timesheet, Compute Payroll
  // canApprove → CEO (Mesael): Approve & Lock Run
  // readOnly   → Deputy CEO (Dembi), Admin: view all data, no action buttons
  const canManage = ['leta', 'kalkidan'].includes(roleId);
  const canApprove = roleId === 'mesael';
  const isReadOnly = !canManage && !canApprove;
  const [activeTab, setActiveTab] = useState<'employees' | 'timesheets' | 'run'>('employees');

  const { data: employeesData } = useSWR('/api/payroll/employees', fetcher);
  const { data: timesheetsData } = useSWR('/api/payroll/timesheets', fetcher);
  const { data: runData } = useSWR('/api/payroll/run', fetcher);
  
  const employees = employeesData?.data || [];
  const timesheets = timesheetsData?.data || [];
  const runs = runData?.data || [];

  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [empForm, setEmpForm] = useState({ name: '', basicSalary: '', type: 'PERMANENT' });

  const [isTsModalOpen, setIsTsModalOpen] = useState(false);
  const [tsForm, setTsForm] = useState({ employeeId: '', projectId: '', date: '', hoursWorked: '160', overtimeHours: '0' });

  const [runMonth, setRunMonth] = useState('');
  const [runYear, setRunYear] = useState('');

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/payroll/employees', { method: 'POST', body: JSON.stringify(empForm) });
      if (res.ok) {
        mutate('/api/payroll/employees');
        setIsEmpModalOpen(false);
        onAddToast('Success', 'Employee added successfully', 'success');
      }
    } catch {}
  };

  const handleLogTimesheet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/payroll/timesheets', { method: 'POST', body: JSON.stringify(tsForm) });
      if (res.ok) {
        mutate('/api/payroll/timesheets');
        setIsTsModalOpen(false);
        onAddToast('Success', 'Timesheet logged successfully', 'success');
      }
    } catch {}
  };

  const handleRunPayroll = async () => {
    if (!runMonth || !runYear) return;
    try {
      const res = await fetch('/api/payroll/run', { method: 'POST', body: JSON.stringify({ month: runMonth, year: runYear }) });
      const result = await res.json();
      if (result.success) {
        mutate('/api/payroll/run');
        onAddToast('Success', 'Payroll computed successfully', 'success');
      } else {
        onAddToast('Error', result.message, 'warning');
      }
    } catch {}
  };

  const handleApproveRun = async (runId: string) => {
    try {
      const res = await fetch('/api/payroll/approve', { method: 'POST', body: JSON.stringify({ runId }) });
      const result = await res.json();
      if (result.success) {
        mutate('/api/payroll/run');
        onAddToast('Success', 'Payroll approved and locked', 'success');
      } else {
        onAddToast('Error', result.message, 'warning');
      }
    } catch {}
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Human Capital & Compensation</div>
          <h1 className="font-serif text-3xl font-semibold text-[#15181e] mt-0.5">Payroll Engine</h1>
          <p className="text-xs text-gray-500 mt-1">Manage master data, track attendance, and execute monthly payroll runs.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        {['employees', 'timesheets', 'run'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === tab ? 'text-[#c1540f] border-b-2 border-[#c1540f]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {tab === 'employees' && 'Master Data'}
            {tab === 'timesheets' && 'Attendance'}
            {tab === 'run' && 'Payroll Desk'}
          </button>
        ))}
      </div>

      {isReadOnly && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-2">
          <span className="text-amber-600">⚠</span>
          Read-only view — payroll administration is restricted to Finance. Payroll approval is reserved for the CEO.
        </div>
      )}

      {activeTab === 'employees' && (
        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-[#15181e]">Employee Register</h3>
            {canManage && (
              <button onClick={() => setIsEmpModalOpen(true)} className="px-3 py-1.5 text-xs font-bold bg-[#15181e] text-white rounded">Add Employee</button>
            )}
          </div>
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                <th className="py-2">Name</th>
                <th className="py-2">Type</th>
                <th className="py-2 text-right">Basic Salary</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {employees.map((emp: any) => (
                <tr key={emp.id}>
                  <td className="py-3 font-medium">{emp.name}</td>
                  <td className="py-3 text-xs">{emp.type}</td>
                  <td className="py-3 text-right font-mono">Br {emp.basicSalary.toLocaleString()}</td>
                  <td className="py-3 text-xs font-bold text-green-600">{emp.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'timesheets' && (
        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-[#15181e]">Certified Timesheets</h3>
            {canManage && (
              <button onClick={() => setIsTsModalOpen(true)} className="px-3 py-1.5 text-xs font-bold bg-[#15181e] text-white rounded">Log Timesheet</button>
            )}
          </div>
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                <th className="py-2">Date</th>
                <th className="py-2">Employee</th>
                <th className="py-2 text-right">Hours</th>
                <th className="py-2 text-right">Overtime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {timesheets.map((ts: any) => (
                <tr key={ts.id}>
                  <td className="py-3 text-xs">{new Date(ts.date).toLocaleDateString()}</td>
                  <td className="py-3 font-medium">{ts.employee?.name}</td>
                  <td className="py-3 text-right font-mono">{ts.hoursWorked}</td>
                  <td className="py-3 text-right font-mono text-orange-600">{ts.overtimeHours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'run' && (
        <div className="space-y-6">
          {canManage && (
            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm p-6 flex gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Month (1-12)</label>
                <input type="number" value={runMonth} onChange={(e) => setRunMonth(e.target.value)} className="w-24 px-3 py-2 border rounded text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Year</label>
                <input type="number" value={runYear} onChange={(e) => setRunYear(e.target.value)} className="w-24 px-3 py-2 border rounded text-sm" />
              </div>
              <button onClick={handleRunPayroll} className="px-6 py-2 bg-[#c1540f] text-white font-bold rounded flex items-center gap-2">
                <PlayCircle className="w-4 h-4" /> Compute Payroll
              </button>
            </div>
          )}

          {runs.map((run: any) => (
            <div key={run.id} className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h3 className="font-bold text-[#15181e] text-lg">Run: {run.periodMonth}/{run.periodYear}</h3>
                  <div className={`text-[10px] font-bold uppercase tracking-wider mt-1 px-2 py-0.5 inline-block rounded ${run.status === 'LOCKED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{run.status}</div>
                </div>
                {run.status === 'DRAFT' && canApprove && (
                  <button onClick={() => handleApproveRun(run.id)} className="px-4 py-2 bg-[#15181e] text-white text-xs font-bold rounded">Approve & Lock Run</button>
                )}
              </div>
              <div className="p-6 grid grid-cols-4 gap-4 border-b border-gray-100">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Gross</div>
                  <div className="font-mono text-xl font-bold">Br {run.totalGross.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Tax</div>
                  <div className="font-mono text-xl font-bold text-red-600">Br {run.totalTax.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Pension</div>
                  <div className="font-mono text-xl font-bold text-orange-600">Br {run.totalPension.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Net Pay</div>
                  <div className="font-mono text-xl font-bold text-green-600">Br {run.totalNet.toLocaleString()}</div>
                </div>
              </div>
              <div className="p-6 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                      <th className="py-2">Employee</th>
                      <th className="py-2 text-right">Basic</th>
                      <th className="py-2 text-right">Gross</th>
                      <th className="py-2 text-right">Tax</th>
                      <th className="py-2 text-right">Net</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {run.payslips.map((slip: any) => (
                      <tr key={slip.id}>
                        <td className="py-2 font-medium">{slip.employee?.name}</td>
                        <td className="py-2 text-right font-mono">Br {slip.basic.toLocaleString()}</td>
                        <td className="py-2 text-right font-mono">Br {slip.gross.toLocaleString()}</td>
                        <td className="py-2 text-right font-mono text-red-600">Br {slip.incomeTax.toLocaleString()}</td>
                        <td className="py-2 text-right font-mono font-bold text-green-600">Br {slip.netPay.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {isEmpModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-end bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm h-full shadow-2xl flex flex-col p-6">
            <h2 className="font-serif text-2xl font-semibold mb-4">Add Employee</h2>
            <form onSubmit={handleCreateEmployee} className="space-y-4">
              <input required placeholder="Name" value={empForm.name} onChange={e => setEmpForm({...empForm, name: e.target.value})} className="w-full px-3 py-2 border rounded" />
              <input required type="number" placeholder="Basic Salary" value={empForm.basicSalary} onChange={e => setEmpForm({...empForm, basicSalary: e.target.value})} className="w-full px-3 py-2 border rounded" />
              <button type="submit" className="w-full py-2 bg-black text-white font-bold rounded">Save</button>
              <button type="button" onClick={() => setIsEmpModalOpen(false)} className="w-full py-2 bg-gray-100 text-black font-bold rounded">Cancel</button>
            </form>
          </div>
        </div>
      )}

      {isTsModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-end bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm h-full shadow-2xl flex flex-col p-6">
            <h2 className="font-serif text-2xl font-semibold mb-4">Log Timesheet</h2>
            <form onSubmit={handleLogTimesheet} className="space-y-4">
              <select required value={tsForm.employeeId} onChange={e => setTsForm({...tsForm, employeeId: e.target.value})} className="w-full px-3 py-2 border rounded">
                <option value="">Select Employee...</option>
                {employees.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
              <input required type="date" value={tsForm.date} onChange={e => setTsForm({...tsForm, date: e.target.value})} className="w-full px-3 py-2 border rounded" />
              <input required type="number" placeholder="Hours Worked" value={tsForm.hoursWorked} onChange={e => setTsForm({...tsForm, hoursWorked: e.target.value})} className="w-full px-3 py-2 border rounded" />
              <input required type="number" placeholder="Overtime Hours" value={tsForm.overtimeHours} onChange={e => setTsForm({...tsForm, overtimeHours: e.target.value})} className="w-full px-3 py-2 border rounded" />
              <button type="submit" className="w-full py-2 bg-black text-white font-bold rounded">Save</button>
              <button type="button" onClick={() => setIsTsModalOpen(false)} className="w-full py-2 bg-gray-100 text-black font-bold rounded">Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
