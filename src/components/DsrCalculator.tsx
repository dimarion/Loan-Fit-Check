import React, { useState } from 'react';
import { DsrProfile, DsrResult, ExistingDebtCommitment } from '../types/loan';
import { formatCurrency } from '../utils/calculator';
import { Plus, Trash2, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface DsrCalculatorProps {
  dsrProfile: DsrProfile;
  dsrResult: DsrResult;
  currencySymbol: string;
  onChange: (updated: Partial<DsrProfile>) => void;
}

export const DsrCalculator: React.FC<DsrCalculatorProps> = ({
  dsrProfile,
  dsrResult,
  currencySymbol,
  onChange,
}) => {
  const [newDebtName, setNewDebtName] = useState('');
  const [newDebtAmount, setNewDebtAmount] = useState<number>(300);
  const [newDebtType, setNewDebtType] = useState<ExistingDebtCommitment['type']>('car');

  const handleAddDebt = () => {
    if (newDebtAmount <= 0) return;
    const newDebt: ExistingDebtCommitment = {
      id: `debt-${Date.now()}`,
      name: newDebtName.trim() || `${newDebtType.charAt(0).toUpperCase() + newDebtType.slice(1)} Loan`,
      monthlyAmount: newDebtAmount,
      type: newDebtType,
    };
    onChange({ existingDebts: [...dsrProfile.existingDebts, newDebt] });
    setNewDebtName('');
    setNewDebtAmount(300);
  };

  const handleRemoveDebt = (id: string) => {
    onChange({ existingDebts: dsrProfile.existingDebts.filter((d) => d.id !== id) });
  };

  const handleUpdateDebtAmount = (id: string, amount: number) => {
    onChange({
      existingDebts: dsrProfile.existingDebts.map((d) =>
        d.id === id ? { ...d, monthlyAmount: Math.max(0, amount) } : d
      ),
    });
  };

  // Get status color and text for DSR
  const getRiskBadge = (level: DsrResult['riskLevel']) => {
    switch (level) {
      case 'healthy':
        return {
          title: 'Healthy / Low Risk',
          desc: 'Excellent bank approval probability. Debt service is within conservative guidelines (< 35%).',
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
          dotColor: 'bg-emerald-500',
        };
      case 'moderate':
        return {
          title: 'Moderate / Standard',
          desc: 'Acceptable for prime retail lenders (35% - 50%). Adequate disposable cash buffer maintained.',
          color: 'text-slate-700 bg-slate-100 border-slate-300',
          dotColor: 'bg-slate-600',
        };
      case 'high':
        return {
          title: 'Elevated / Restricted',
          desc: 'Stricter underwriting scrutiny (50% - 60%). Some banks may request additional proof of collateral or co-signers.',
          color: 'text-amber-700 bg-amber-50 border-amber-200',
          dotColor: 'bg-amber-500',
        };
      case 'critical':
        return {
          title: 'Critical / High Risk',
          desc: 'Exceeds standard lending policy caps (> 60%). High likelihood of loan rejection unless debt is consolidated.',
          color: 'text-rose-700 bg-rose-50 border-rose-200',
          dotColor: 'bg-rose-500',
        };
    }
  };

  const riskInfo = getRiskBadge(dsrResult.riskLevel);

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 sm:p-6 shadow-xs ring-1 ring-slate-100 mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-teal-50 text-teal-700 shadow-2xs">
            <CheckCircle className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Debt Service Ratio (DSR) & Affordability</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluate debt-to-income capacity, bank eligibility thresholds, and borrowing headroom.
            </p>
          </div>
        </div>

        {/* DSR Basis Indicator */}
        <div className="inline-flex items-center px-3 py-1.5 bg-slate-100/90 rounded-lg border border-slate-200 self-start sm:self-auto text-xs font-semibold text-slate-700">
          Gross Income Basis
        </div>
      </div>

      {/* Main DSR Meter & Risk Overview */}
      <div className="pt-5">
        <div className="p-4 sm:p-5 bg-slate-50/80 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  New Debt Service Ratio (DSR)
                </span>
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-bold shadow-2xs ${riskInfo.color}`}>
                  {riskInfo.title}
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-slate-900 mt-1">
                {dsrResult.newDsr.toFixed(1)}%
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
                {riskInfo.desc}
              </p>
            </div>

            {/* Quick comparison box */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 shrink-0 bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
              <div>
                <span className="text-[11px] text-slate-500 font-medium block">Existing DSR</span>
                <span className="text-base font-bold font-mono tabular-nums text-slate-800">
                  {dsrResult.currentDsr.toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Before proposed loan</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium block">DSR Delta</span>
                <span className="text-base font-bold font-mono tabular-nums text-slate-800">
                  +{(dsrResult.newDsr - dsrResult.currentDsr).toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">From this facility</span>
              </div>
            </div>
          </div>

          {/* DSR Visual Bar Gauge */}
          <div className="mt-5">
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 font-mono tabular-nums">
              <span>0%</span>
              <span className="text-emerald-700 font-medium">35% (Healthy)</span>
              <span className="text-slate-600 font-medium">50% (Standard)</span>
              <span className="text-amber-700 font-medium">60% (Limit)</span>
              <span className="text-rose-700 font-medium">100%</span>
            </div>

            {/* Segmented meter */}
            <div className="relative h-3.5 bg-slate-200 rounded-full overflow-hidden flex shadow-2xs">
              <div className="w-[35%] bg-emerald-400/90 h-full border-r border-white/50" title="Healthy (<35%)" />
              <div className="w-[15%] bg-slate-400/90 h-full border-r border-white/50" title="Moderate (35-50%)" />
              <div className="w-[15%] bg-amber-400/90 h-full border-r border-white/50" title="High (50-65%)" />
              <div className="w-[35%] bg-rose-400/90 h-full" title="Critical (>65%)" />

              {/* Pin indicator for current position */}
              <div
                className="absolute top-0 bottom-0 w-2 bg-slate-950 shadow-md transform -translate-x-1/2 transition-all duration-300 rounded-full"
                style={{ left: `${Math.min(100, Math.max(0, dsrResult.newDsr))}%` }}
              />
            </div>
          </div>

          {/* Key Affordability Metrics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-200/80">
            <div>
              <span className="text-[11px] text-slate-500 block font-medium">Remaining Monthly Disposable Cash</span>
              <span className="text-sm font-bold font-mono tabular-nums text-emerald-700 mt-0.5 block">
                {formatCurrency(dsrResult.remainingDisposableIncome, currencySymbol)}
              </span>
              <span className="text-[10px] text-slate-400">After all debt & new loan payment</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block font-medium">Max Installment at {dsrProfile.targetDsrLimit}% Cap</span>
              <span className="text-sm font-bold font-mono tabular-nums text-slate-800 mt-0.5 block">
                {formatCurrency(dsrResult.maxAllowedInstallment, currencySymbol)}
              </span>
              <span className="text-[10px] text-slate-400">Permitted bank borrowing buffer</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block font-medium">Max Loan Principal Capacity</span>
              <span className="text-sm font-bold font-mono tabular-nums text-slate-800 mt-0.5 block">
                {formatCurrency(dsrResult.maxAffordableLoan, currencySymbol)}
              </span>
              <span className="text-[10px] text-slate-400">Based on target rate & tenure</span>
            </div>
          </div>
        </div>
      </div>

      {/* Income & Existing Debts Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Left Column: Monthly Income (Emerald Tint) */}
        <div className="p-4.5 rounded-xl border border-emerald-100/90 bg-gradient-to-br from-emerald-50/30 to-slate-50/50 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">1. Monthly Income Streams</h4>
            <span className="text-xs text-emerald-700 font-mono font-bold tabular-nums">
              Total: {formatCurrency(dsrResult.totalMonthlyIncome, currencySymbol)}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="primary-income-input" className="text-xs font-semibold text-slate-700 block mb-1">
                Primary Applicant Gross Monthly Income
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                  {currencySymbol}
                </span>
                <input
                  id="primary-income-input"
                  type="number"
                  min="0"
                  step="250"
                  value={dsrProfile.grossMonthlyIncome || ''}
                  onChange={(e) => onChange({ grossMonthlyIncome: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-8 pr-3 py-1.5 text-xs font-mono tabular-nums bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  placeholder="e.g. 7500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="co-borrower-income-input" className="text-xs font-semibold text-slate-700 block mb-1">
                Co-Borrower / Secondary Monthly Income (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                  {currencySymbol}
                </span>
                <input
                  id="co-borrower-income-input"
                  type="number"
                  min="0"
                  step="250"
                  value={dsrProfile.coBorrowerIncome || ''}
                  onChange={(e) => onChange({ coBorrowerIncome: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-8 pr-3 py-1.5 text-xs font-mono tabular-nums bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  placeholder="e.g. 3500"
                />
              </div>
            </div>

            {dsrProfile.dsrBasis === 'net' && (
              <div>
                <label htmlFor="net-income-input" className="text-xs font-semibold text-slate-700 block mb-1">
                  Net Take-Home Monthly Income (After Tax & Social Deductions)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                    {currencySymbol}
                  </span>
                  <input
                    id="net-income-input"
                    type="number"
                    min="0"
                    step="250"
                    value={dsrProfile.netMonthlyIncome || ''}
                    onChange={(e) => onChange({ netMonthlyIncome: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-8 pr-3 py-1.5 text-xs font-mono tabular-nums bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    placeholder="e.g. 8200"
                  />
                </div>
              </div>
            )}

            {/* Target DSR Threshold Slider */}
            <div className="pt-2 border-t border-emerald-100">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-700 font-semibold">Target Bank DSR Ceiling</span>
                <span className="font-mono tabular-nums font-bold text-emerald-800">{dsrProfile.targetDsrLimit}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="80"
                step="5"
                value={dsrProfile.targetDsrLimit}
                onChange={(e) => onChange({ targetDsrLimit: parseInt(e.target.value, 10) || 60 })}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Most commercial banks enforce a 60% or 70% strict ceiling for loan approvals.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Existing Debt Commitments (Rose/Amber Tint) */}
        <div className="p-4.5 rounded-xl border border-rose-100/90 bg-gradient-to-br from-rose-50/20 to-slate-50/50 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900">2. Existing Debt Commitments</h4>
            <span className="text-xs text-rose-700 font-mono font-bold tabular-nums">
              Total: {formatCurrency(dsrResult.totalExistingMonthlyDebts, currencySymbol)}/mo
            </span>
          </div>

          {/* List of existing debts */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {dsrProfile.existingDebts.map((debt) => (
              <div
                key={debt.id}
                className="flex items-center justify-between gap-2 p-2.5 bg-white rounded-lg border border-slate-200 text-xs shadow-2xs"
              >
                <div className="truncate">
                  <span className="font-semibold text-slate-800 block truncate">{debt.name}</span>
                  <span className="text-[10px] text-slate-400 capitalize">{debt.type} loan</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="relative w-24">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={debt.monthlyAmount}
                      onChange={(e) => handleUpdateDebtAmount(debt.id, parseFloat(e.target.value) || 0)}
                      className="w-full pl-5 pr-1 py-1 text-xs font-mono tabular-nums bg-slate-50 border border-slate-200 rounded text-right focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveDebt(debt.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer p-0.5"
                    title="Remove debt item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add custom debt row */}
          <div className="mt-3 pt-3 border-t border-rose-100">
            <span className="text-[11px] font-bold text-slate-700 block mb-1.5">Add Commitment</span>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="e.g. Car Loan"
                value={newDebtName}
                onChange={(e) => setNewDebtName(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  placeholder="Amount"
                  value={newDebtAmount || ''}
                  onChange={(e) => setNewDebtAmount(parseFloat(e.target.value) || 0)}
                  className="w-full pl-5 pr-2 py-1.5 text-xs font-mono tabular-nums bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>
              <button
                type="button"
                onClick={handleAddDebt}
                className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
