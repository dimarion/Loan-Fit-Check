import React, { useState } from 'react';
import { LoanParameters, LumpSumPayment, LumpSumFrequency, PrepaymentEffect } from '../types/loan';
import { Percent, Calendar, Plus, Trash2, Coins, Repeat } from 'lucide-react';

interface LoanInputsProps {
  params: LoanParameters;
  onChange: (updated: Partial<LoanParameters>) => void;
}

export const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'USD ($)' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)' },
  { code: 'GBP', symbol: '£', label: 'GBP (£)' },
  { code: 'CAD', symbol: 'C$', label: 'CAD (C$)' },
  { code: 'AUD', symbol: 'A$', label: 'AUD (A$)' },
  { code: 'MYR', symbol: 'RM', label: 'MYR (RM)' },
  { code: 'SGD', symbol: 'S$', label: 'SGD (S$)' },
  { code: 'JPY', symbol: '¥', label: 'JPY (¥)' },
  { code: 'INR', symbol: '₹', label: 'INR (₹)' },
];

export const LoanInputs: React.FC<LoanInputsProps> = ({
  params,
  onChange,
}) => {
  const totalTenureMonths = params.tenureYears * 12 + params.tenureMonths;
  const isMultiYear = totalTenureMonths > 12;
  const maxYears = Math.max(1, Math.ceil(totalTenureMonths / 12));

  // Lump sum local form state
  const [lumpSumAmount, setLumpSumAmount] = useState<number>(10000);
  const [selectedYear, setSelectedYear] = useState<number>(Math.min(2, maxYears));
  const [selectedMonth, setSelectedMonth] = useState<number>(Math.min(6, totalTenureMonths));
  const [frequency, setFrequency] = useState<LumpSumFrequency>('one_time');
  const [effect, setEffect] = useState<PrepaymentEffect>('reduce_tenure');

  const handlePrincipalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0;
    onChange({ principal: Math.max(0, val) });
  };

  const handleYearsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10) || 0;
    onChange({ tenureYears: Math.min(50, Math.max(0, val)) });
  };

  const handleMonthsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10) || 0;
    onChange({ tenureMonths: Math.min(11, Math.max(0, val)) });
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0;
    onChange({ fixedAnnualRate: Math.max(0, Math.min(40, val)) });
  };

  const handleAddLumpSum = () => {
    if (lumpSumAmount <= 0) return;

    const targetMonth = isMultiYear
      ? Math.min(totalTenureMonths, Math.max(1, selectedYear * 12))
      : Math.min(totalTenureMonths, Math.max(1, selectedMonth));

    const newPayment: LumpSumPayment = {
      id: `ls-${Date.now()}`,
      month: targetMonth,
      year: isMultiYear ? selectedYear : undefined,
      amount: lumpSumAmount,
      effect,
      frequency,
      note: isMultiYear ? `Year ${selectedYear} prepayment` : `Month ${selectedMonth} prepayment`,
    };

    onChange({ lumpSums: [...params.lumpSums, newPayment] });
  };

  const handleRemoveLumpSum = (id: string) => {
    onChange({ lumpSums: params.lumpSums.filter((l) => l.id !== id) });
  };

  const getFrequencyLabel = (freq?: LumpSumFrequency) => {
    switch (freq) {
      case 'annually':
        return 'Annually';
      case 'semi_annually':
        return 'Every 6 Mo';
      case 'quarterly':
        return 'Every 3 Mo';
      case 'monthly':
        return 'Monthly';
      case 'one_time':
      default:
        return 'One-time';
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 sm:p-6 shadow-xs ring-1 ring-slate-100 h-full flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="pb-4 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-100 text-slate-700 shadow-2xs">
            <Coins className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Loan Configuration</h2>
            <p className="text-xs text-slate-500 mt-0.5">Adjust principal, tenure, interest rate, and lump sum prepayments.</p>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {/* 1. Principal Loan Amount */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="principal-input" className="text-xs font-semibold text-slate-700">Principal Amount</label>
              <span className="text-xs text-slate-800 font-mono font-bold tabular-nums">
                {params.currencySymbol}{params.principal.toLocaleString()}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">
                {params.currencySymbol}
              </span>
              <input
                id="principal-input"
                type="number"
                min="1000"
                step="5000"
                value={params.principal || ''}
                onChange={handlePrincipalChange}
                className="w-full pl-8 pr-3 py-1.5 text-sm font-mono tabular-nums bg-slate-50/70 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-300 focus:border-slate-500 transition-all"
                placeholder="e.g. 400000"
              />
            </div>

            {/* Quick amount increment buttons */}
            <div className="flex flex-wrap gap-1 mt-2">
              {[50000, 100000, 250000, 500000, 750000, 1000000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => onChange({ principal: amt })}
                  className={`text-[10px] px-2 py-0.5 rounded-md border transition-all cursor-pointer font-mono tabular-nums ${
                    params.principal === amt
                      ? 'bg-slate-800 text-white border-slate-800 font-semibold shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-800 hover:bg-slate-100/60'
                  }`}
                >
                  {params.currencySymbol}{amt >= 1000000 ? `${amt / 1000000}M` : `${amt / 1000}k`}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Loan Tenure */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">Tenure</label>
              <span className="text-xs text-slate-800 font-mono font-bold tabular-nums">
                {totalTenureMonths} Mos ({params.tenureYears}y {params.tenureMonths > 0 ? `${params.tenureMonths}m` : ''})
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="tenure-years-input" className="text-[10px] text-slate-500 mb-0.5 block">Years</label>
                <input
                  id="tenure-years-input"
                  type="number"
                  min="0"
                  max="40"
                  value={params.tenureYears}
                  onChange={handleYearsChange}
                  className="w-full px-2.5 py-1 text-sm font-mono tabular-nums bg-slate-50/70 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-300 focus:border-slate-500"
                />
              </div>
              <div>
                <label htmlFor="tenure-months-input" className="text-[10px] text-slate-500 mb-0.5 block">Months</label>
                <input
                  id="tenure-months-input"
                  type="number"
                  min="0"
                  max="11"
                  value={params.tenureMonths}
                  onChange={handleMonthsChange}
                  className="w-full px-2.5 py-1 text-sm font-mono tabular-nums bg-slate-50/70 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-300 focus:border-slate-500"
                />
              </div>
            </div>

            {/* Quick Tenure Buttons */}
            <div className="flex flex-wrap gap-1 mt-2">
              {[1, 5, 10, 15, 20, 30].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => onChange({ tenureYears: yr, tenureMonths: 0 })}
                  className={`text-[10px] px-2 py-0.5 rounded-md border transition-all cursor-pointer font-mono tabular-nums ${
                    params.tenureYears === yr && params.tenureMonths === 0
                      ? 'bg-slate-800 text-white border-slate-800 font-semibold shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-800 hover:bg-slate-100/60'
                  }`}
                >
                  {yr}y
                </button>
              ))}
            </div>
          </div>

          {/* 3. Fixed Annual Interest Rate */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="fixed-rate-input" className="text-xs font-semibold text-slate-700">Annual Interest Rate</label>
              <span className="text-xs font-bold text-slate-800 font-mono tabular-nums">
                {params.fixedAnnualRate.toFixed(2)}% p.a.
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="relative">
                <input
                  id="fixed-rate-input"
                  type="number"
                  step="0.05"
                  min="0"
                  max="35"
                  value={params.fixedAnnualRate}
                  onChange={handleRateChange}
                  className="w-full pr-8 pl-3 py-1.5 text-sm font-mono tabular-nums bg-slate-50/70 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-300 focus:border-slate-500"
                />
                <Percent className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
              <input
                type="range"
                min="0.5"
                max="20"
                step="0.05"
                value={params.fixedAnnualRate}
                onChange={handleRateChange}
                className="w-full accent-slate-800 cursor-pointer"
              />
            </div>
          </div>

          {/* 4. Repayment Start Month */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="start-date-input" className="text-xs font-semibold text-slate-700">Commencement Month</label>
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <input
              id="start-date-input"
              type="month"
              value={params.startDate}
              onChange={(e) => onChange({ startDate: e.target.value })}
              className="w-full px-3 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-lg font-mono text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-300 focus:border-slate-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Amortization begins on the 1st installment
            </span>
          </div>
        </div>

        {/* 5. Lump Sum Prepayments Section inside Loan Configuration */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-teal-100 text-teal-800 shadow-2xs">
                <Coins className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Lump Sum Prepayments
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">
              {params.lumpSums.length > 0 ? (
                <span className="text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/70">{params.lumpSums.length} Prepayment{params.lumpSums.length === 1 ? '' : 's'} Active</span>
              ) : (
                'Add extra principal injections to accelerate payoff or reduce installments'
              )}
            </span>
          </div>

          {/* Lump Sum Form */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/90 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
              {/* Prepayment Amount */}
              <div>
                <label htmlFor="lump-sum-amount" className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Lump Sum Amount ({params.currencySymbol})
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                    {params.currencySymbol}
                  </span>
                  <input
                    id="lump-sum-amount"
                    type="number"
                    min="100"
                    step="1000"
                    value={lumpSumAmount || ''}
                    onChange={(e) => setLumpSumAmount(parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-2.5 py-1.5 text-xs font-mono tabular-nums bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-300 focus:border-slate-500"
                    placeholder="e.g. 10000"
                  />
                </div>
              </div>

              {/* Timing Condition */}
              <div>
                {isMultiYear ? (
                  <>
                    <label htmlFor="lump-sum-year" className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Payment Year
                    </label>
                    <select
                      id="lump-sum-year"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-300 focus:border-slate-500 cursor-pointer font-mono"
                    >
                      {Array.from({ length: maxYears }, (_, i) => i + 1).map((yr) => (
                        <option key={yr} value={yr}>
                          Year {yr} (Month {Math.min(totalTenureMonths, yr * 12)})
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <>
                    <label htmlFor="lump-sum-month" className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Payment Month
                    </label>
                    <select
                      id="lump-sum-month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-300 focus:border-slate-500 cursor-pointer font-mono"
                    >
                      {Array.from({ length: totalTenureMonths }, (_, i) => i + 1).map((mo) => (
                        <option key={mo} value={mo}>
                          Month {mo}
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </div>

              {/* Frequency */}
              <div>
                <label htmlFor="lump-sum-freq" className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Payment Frequency
                </label>
                <div className="relative">
                  <select
                    id="lump-sum-freq"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as LumpSumFrequency)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-300 focus:border-slate-500 cursor-pointer"
                  >
                    <option value="one_time">One-time (Single Payment)</option>
                    {isMultiYear && <option value="annually">Annually (Every Year)</option>}
                    <option value="semi_annually">Semi-Annually (Every 6 Mos)</option>
                    <option value="quarterly">Quarterly (Every 3 Mos)</option>
                    <option value="monthly">Monthly (Recurring)</option>
                  </select>
                </div>
              </div>

              {/* Prepayment Strategy */}
              <div>
                <label htmlFor="lump-sum-effect" className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Prepayment Strategy
                </label>
                <select
                  id="lump-sum-effect"
                  value={effect}
                  onChange={(e) => setEffect(e.target.value as PrepaymentEffect)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-300 focus:border-slate-500 cursor-pointer"
                >
                  <option value="reduce_tenure">Reduce Tenure (Max Savings)</option>
                  <option value="reduce_installment">Reduce Installment (Recast)</option>
                </select>
              </div>

              {/* Add Button */}
              <div>
                <button
                  type="button"
                  onClick={handleAddLumpSum}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Prepayment</span>
                </button>
              </div>
            </div>

            {/* List of active lump sums */}
            {params.lumpSums.length > 0 && (
              <div className="mt-3.5 pt-3.5 border-t border-slate-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                  Active Lump Sum Prepayments
                </span>
                <div className="flex flex-wrap gap-2">
                  {params.lumpSums.map((ls) => {
                    const timingText = isMultiYear && ls.year
                      ? `Year ${ls.year}`
                      : `Month ${ls.month}`;
                    const freqText = getFrequencyLabel(ls.frequency);
                    return (
                      <div
                        key={ls.id}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs shadow-2xs"
                      >
                        <span className="font-bold font-mono tabular-nums text-slate-900">
                          {params.currencySymbol}{ls.amount.toLocaleString()}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-700 font-medium">{timingText}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-600 flex items-center gap-1">
                          <Repeat className="w-3 h-3 text-slate-500" />
                          {freqText}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          ls.effect === 'reduce_tenure' ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                        }`}>
                          {ls.effect === 'reduce_tenure' ? 'Shorten Term' : 'Recast'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveLumpSum(ls.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-0.5 ml-1 cursor-pointer"
                          title="Remove lump sum"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
