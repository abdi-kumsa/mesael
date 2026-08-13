'use client';

import React from 'react';
import useSWR from 'swr';
import { Download, TrendingUp, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export const ProjectCostReport = () => {
  const { data, error, isLoading } = useSWR('/api/reports/project-cost', fetcher);

  if (isLoading) return <div className="p-8 text-center text-sm font-bold text-gray-400">Compiling Report...</div>;
  if (error || !data?.success) return <div className="p-8 text-center text-sm font-bold text-red-500">Failed to load project cost report.</div>;

  const { project, totals, revenue, profitability, costCodes } = data.data;

  const getStatusColor = (percent: number) => {
    if (percent >= 100) return 'bg-[#b23a24]'; // Over budget
    if (percent >= 90) return 'bg-[#c1540f]';  // Warning
    return 'bg-[#1a7a5c]';                     // Healthy
  };

  const getStatusText = (percent: number) => {
    if (percent >= 100) return 'text-[#b23a24]';
    if (percent >= 90) return 'text-[#c1540f]';
    return 'text-[#1a7a5c]';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#c1540f] flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" /> Project Cost Performance
          </div>
          <h2 className="text-2xl font-serif font-semibold text-[#15181e] mt-1">{project.name}</h2>
          <p className="text-xs text-gray-500">{project.code} · Client: {project.client}</p>
        </div>
        <button
          className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Global Totals Stat Strip (Cost) */}
      <div className="stat-line">
        <div className="stat-item">
          <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">Total Budget</div>
          <div className="num text-xl sm:text-2xl font-bold text-[#15181e] mt-1">Br {totals.budget.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="stat-item">
          <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#b4550b]">Total Committed</div>
          <div className="num text-xl sm:text-2xl font-bold text-[#b4550b] mt-1">Br {totals.committed.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="stat-item">
          <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#1a7a5c]">Total Actual (Paid)</div>
          <div className="num text-xl sm:text-2xl font-bold text-[#1a7a5c] mt-1">Br {totals.actual.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="stat-item">
          <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">Total Variance</div>
          <div className={`num text-xl sm:text-2xl font-bold mt-1 ${totals.variance < 0 ? 'text-[#b23a24]' : 'text-gray-900'}`}>
            Br {totals.variance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Profitability & Revenue Strip */}
      <div className="stat-line">
        <div className="stat-item">
          <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">Forecast Final Revenue</div>
          <div className="num text-xl sm:text-2xl font-bold text-[#15181e] mt-1">Br {revenue.forecastFinalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="stat-item">
          <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">Certified Revenue</div>
          <div className="num text-xl sm:text-2xl font-bold text-[#1a7a5c] mt-1">Br {revenue.certifiedRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="stat-item">
          <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">Forecast Final Cost</div>
          <div className="num text-xl sm:text-2xl font-bold text-[#b4550b] mt-1">Br {totals.forecastFinalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="stat-item bg-gray-50 border-l border-gray-200 pl-4">
          <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">Forecast Margin</div>
          <div className={`num text-xl sm:text-2xl font-bold mt-1 ${profitability.varianceToTarget < 0 ? 'text-[#b23a24]' : 'text-[#1a7a5c]'}`}>
            {profitability.forecastMarginPercent.toFixed(1)}% 
            <span className="text-xs ml-1 text-gray-500">
              (Br {profitability.forecastMargin.toLocaleString(undefined, { minimumFractionDigits: 0 })})
            </span>
          </div>
          <div className="text-[10px] text-gray-500 mt-1 font-semibold">
            {profitability.varianceToTarget < 0 ? 'Below' : 'Above'} target ({profitability.targetMarginPercent}%)
          </div>
        </div>
      </div>

      {/* Global Progress Bar */}
      <div className="panel space-y-2">
        <div className="flex justify-between items-end mb-1">
          <span className="text-xs font-bold text-gray-700">Overall Budget Utilization</span>
          <span className={`text-sm font-bold num ${getStatusText(totals.percentUsed)}`}>{totals.percentUsed.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden flex">
          {/* Actuals (Solid Green) */}
          <div 
            className="bg-[#1a7a5c] h-full" 
            style={{ width: `${Math.min(100, (totals.actual / totals.budget) * 100)}%` }}
            title="Actual (Paid)"
          />
          {/* Committed (Striped Orange/Yellow) */}
          <div 
            className="bg-[#c1540f] opacity-70 h-full" 
            style={{ width: `${Math.min(100, (totals.committed / totals.budget) * 100)}%` }}
            title="Committed (Unpaid)"
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase mt-1">
          <span>0%</span>
          <span>100% Limit</span>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#faf9f8] border-b border-gray-200 text-gray-500 uppercase text-[10px] font-bold">
                <th className="py-3 px-4">Cost Code</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Budget</th>
                <th className="py-3 px-4 text-right">Committed</th>
                <th className="py-3 px-4 text-right">Actual</th>
                <th className="py-3 px-4 text-right">Variance</th>
                <th className="py-3 px-4 w-32">Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {costCodes.map((cc: any) => (
                <tr key={cc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-mono text-gray-500 font-semibold">{cc.code}</td>
                  <td className="py-3 px-4 font-bold text-[#15181e]">{cc.name}</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-700 font-semibold">
                    {cc.budget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-[#b4550b] font-semibold">
                    {cc.committed.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-[#1a7a5c] font-semibold">
                    {cc.actual.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className={`py-3 px-4 text-right font-mono font-bold ${cc.variance < 0 ? 'text-[#b23a24]' : 'text-gray-900'}`}>
                    {cc.variance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden flex">
                        <div 
                          className="bg-[#1a7a5c] h-full" 
                          style={{ width: `${Math.min(100, (cc.actual / cc.budget) * 100)}%` }}
                        />
                        <div 
                          className="bg-[#c1540f] opacity-70 h-full" 
                          style={{ width: `${Math.min(100, (cc.committed / cc.budget) * 100)}%` }}
                        />
                      </div>
                      <span className={`text-[10px] font-bold num ${getStatusText(cc.percentUsed)}`}>
                        {cc.percentUsed.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
