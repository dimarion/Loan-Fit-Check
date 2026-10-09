import React, { useState } from 'react';
import { LumpSumPayment, PrepaymentEffect, CalculationResult } from '../types/loan';
import { formatCurrency } from '../utils/calculator';
import { Plus, Trash2, PiggyBank, Clock, Sparkles } from 'lucide-react';

interface LumpSumManagerProps {
  lumpSums: LumpSumPayment[];
  currencySymbol: string;
  totalTenureMonths: number;
  calcResult: CalculationResult;
  onChange: (updated: LumpSumPayment[]) => void;
}

export const LumpSumManager: React.FC<LumpSumManagerProps> = ({
  lumpSums,
  currencySymbol,
  totalTenureMonths,
  calcResult,
  onChange,
}) => {
  const [amount, setAmount] = useState<number>(10000);
  const [month, setMonth] = useState<number>(12);
  const [effect, setEffect] = useState<PrepaymentEffect>('reduce_tenure');
  const [note, setNote] = useState<string>('');

  const handleAddPayment = () => {
    if (amount <= 0 || month < 1) return;

    const newPayment: LumpSumPayment = {
      id: `ls-${Date.now()}`,
      month,
      amount,
      effect,
      note: note.trim() || undefined,
    };

    const updated = [...lumpSums, newPayment].sort((a, b) => a.month - b.month);
    onChange(updated);
    setNote('');
  };

  const handleRemove = (id: string) => {
    onChange(lumpSums.filter((ls) => ls.id !== id));
  };

  const handleAddQuickPreset = (presetAmount: number, presetYear: number, presetEffect: PrepaymentEffect, presetNote: string) => {
    const targetMonth = presetYear * 12;
    if (targetMonth > totalTenureMonths) return;

    const newPayment: LumpSumPayment = {
      id: `ls-${Date.now()}-${Math.random()}`,
      month: targetMonth,
      amount: presetAmount,
      effect: presetEffect,
      note: presetNote,
    };

    const updated = [...lumpSums, newPayment].sort((a, b) => a.month - b.month);
    onChange(updated);
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-5 sm:p-6 shadow-xs mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200 gap-3">
        <div>
          <h3 className="text-base font-bold text-neutral-900 tracking-tight">Lump Sum Prepayments & Extra Principal Injections</h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Model one-time bonus prepayments or windfalls to either shorten loan tenure or lower ongoing monthly installments.
          </p>
        </div>

        {/* Impact Overview Pill/Summary */}
        {calcResult.interestSavedComparedToBase > 0 && (
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-200">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>
              Saves {formatCurrency(calcResult.interestSavedComparedToBase, currencySymbol)} interest
              {calcResult.monthsSaved > 0 && ` & ${calcResult.monthsSaved} months`}
            </span>
          </div>
        )}
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
        <div className="p-3.5 bg-neutral-50 rounded-md border border-neutral-200">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Total Prepayments</span>
            <PiggyBank className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-base font-bold font-mono tabular-nums text-neutral-900 mt-1">
            {formatCurrency(calcResult.totalLumpSum, currencySymbol)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">
            {lumpSums.length} scheduled payment{lumpSums.length === 1 ? '' : 's'}
          </div>
        </div>

        <div className="p-3.5 bg-neutral-50 rounded-md border border-neutral-200">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Interest Saved</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-base font-bold font-mono tabular-nums text-emerald-600 mt-1">
            {formatCurrency(calcResult.interestSavedComparedToBase, currencySymbol)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">
            Compared to base schedule
          </div>
        </div>

        <div className="p-3.5 bg-neutral-50 rounded-md border border-neutral-200">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Time Shaved Off</span>
            <Clock className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-base font-bold font-mono tabular-nums text-neutral-900 mt-1">
            {calcResult.monthsSaved > 0
              ? `${Math.floor(calcResult.monthsSaved / 12)}y ${calcResult.monthsSaved % 12}m`
              : '0 months'}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">
            Early payoff: {calcResult.payoffDate}
          </div>
        </div>
      </div>

      {/* Quick Injections */}
      <div className="mt-4 pt-4 border-t border-neutral-200">
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Quick Prepayment Scenarios</span>
        <div className="flex flex-wrap gap-2 mt-2">
          <button
            type="button"
            onClick={() => handleAddQuickPreset(10000, 1, 'reduce_tenure', 'Year 1 Bonus ($10k)')}
            className="text-xs px-2.5 py-1.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-md text-neutral-700 transition-colors cursor-pointer"
          >
            + {currencySymbol}10k at Year 1 (Cut Tenure)
          </button>
          <button
            type="button"
            onClick={() => handleAddQuickPreset(25000, 3, 'reduce_tenure', 'Year 3 Lump Sum ($25k)')}
            className="text-xs px-2.5 py-1.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-md text-neutral-700 transition-colors cursor-pointer"
          >
            + {currencySymbol}25k at Year 3 (Cut Tenure)
          </button>
          <button
            type="button"
            onClick={() => handleAddQuickPreset(30000, 5, 'reduce_installment', 'Year 5 Recast ($30k)')}
            className="text-xs px-2.5 py-1.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-md text-neutral-700 transition-colors cursor-pointer"
          >
            + {currencySymbol}30k at Year 5 (Recast / Lower Monthly)
          </button>
        </div>
      </div>

      {/* Scheduled Lump Sums List */}
      <div className="mt-5">
        <span className="text-xs font-semibold text-neutral-800 block mb-2">Scheduled Prepayments</span>
        {lumpSums.length === 0 ? (
          <div className="p-4 bg-neutral-50 rounded-md border border-neutral-200 text-center text-xs text-neutral-500">
            No lump sum prepayments added yet. Add a payment below to see how extra principal slashes your total interest.
          </div>
        ) : (
          <div className="overflow-x-auto border border-neutral-200 rounded-md">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-100/70 text-neutral-700 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-3">Timeline</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Frequency</th>
                  <th className="py-2.5 px-3">Strategy</th>
                  <th className="py-2.5 px-3">Note / Memo</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {lumpSums.map((ls) => {
                  const yr = Math.ceil(ls.month / 12);
                  const moInYr = ls.month % 12 === 0 ? 12 : ls.month % 12;
                  const freqName = ls.frequency === 'annually'
                    ? 'Annually'
                    : ls.frequency === 'semi_annually'
                    ? 'Every 6 Mo'
                    : ls.frequency === 'quarterly'
                    ? 'Every 3 Mo'
                    : ls.frequency === 'monthly'
                    ? 'Monthly'
                    : 'One-time';

                  return (
                    <tr key={ls.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono tabular-nums text-neutral-800">
                        {ls.year ? `Year ${ls.year}` : `Month ${ls.month}`} <span className="text-neutral-400">· Yr {yr}, Mo {moInYr}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono tabular-nums font-semibold text-neutral-900">
                        {formatCurrency(ls.amount, currencySymbol)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-700">
                          {freqName}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                          ls.effect === 'reduce_tenure'
                            ? 'bg-slate-100 text-slate-700 border border-slate-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {ls.effect === 'reduce_tenure' ? 'Shorten Term' : 'Recast'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-neutral-500">
                        {ls.note || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemove(ls.id)}
                          className="p-1 text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Remove prepayment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add New Prepayment Form */}
      <div className="mt-5 p-4 bg-neutral-50/80 rounded-md border border-neutral-200">
        <span className="text-xs font-semibold text-neutral-800 block mb-3">Add Custom Prepayment</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] text-neutral-500 block mb-1">Prepayment Month Index</label>
            <input
              type="number"
              min="1"
              max={totalTenureMonths}
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value, 10) || 1)}
              className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-white border border-neutral-200 rounded focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
            />
            <span className="text-[10px] text-neutral-400 mt-0.5 block">
              Year {Math.ceil(month / 12)} (Max: {totalTenureMonths} mo)
            </span>
          </div>

          <div>
            <label className="text-[11px] text-neutral-500 block mb-1">Lump Sum Amount ({currencySymbol})</label>
            <input
              type="number"
              min="100"
              step="1000"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-white border border-neutral-200 rounded focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <div>
            <label className="text-[11px] text-neutral-500 block mb-1">Prepayment Effect</label>
            <select
              value={effect}
              onChange={(e) => setEffect(e.target.value as PrepaymentEffect)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded focus:outline-hidden focus:ring-1 focus:ring-neutral-900 cursor-pointer"
            >
              <option value="reduce_tenure">Shorten Tenure (Max Interest Saved)</option>
              <option value="reduce_installment">Recast Monthly Payment (Cashflow Relief)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-neutral-500 block mb-1">Memo / Description (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Annual Bonus"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
            />
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={handleAddPayment}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Prepayment</span>
          </button>
        </div>
      </div>
    </div>
  );
};
