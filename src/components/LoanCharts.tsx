import React, { useState } from 'react';
import { CalculationResult, LoanParameters } from '../types/loan';
import { formatCurrency } from '../utils/calculator';
import { PieChart, TrendingDown, BarChart2 } from 'lucide-react';

interface LoanChartsProps {
  calcResult: CalculationResult;
  params: LoanParameters;
}

export const LoanCharts: React.FC<LoanChartsProps> = ({ calcResult, params }) => {
  const [activeTab, setActiveTab] = useState<'balance' | 'breakdown' | 'annual'>('balance');
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  const { yearlySchedule, totalPrincipal, totalInterest, totalLumpSum, totalRepayment } = calcResult;
  const currency = params.currencySymbol;

  // Donut chart calculations
  const principalShare = (totalPrincipal / (totalRepayment || 1)) * 100;
  const interestShare = (totalInterest / (totalRepayment || 1)) * 100;
  const lumpSumShare = totalLumpSum > 0 ? (totalLumpSum / (totalRepayment || 1)) * 100 : 0;

  // SVG coordinate calculations for Balance Curve
  const chartWidth = 700;
  const chartHeight = 260;
  const padding = { top: 20, right: 30, bottom: 35, left: 65 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const maxVal = params.principal || 1;
  const totalYears = Math.max(1, yearlySchedule.length);

  // Generate SVG path for actual ending balance
  const points = yearlySchedule.map((yr, idx) => {
    const x = padding.left + (idx / Math.max(1, totalYears - 1)) * innerWidth;
    const y = padding.top + innerHeight - (yr.endingBalance / maxVal) * innerHeight;
    return { x, y, year: yr.yearNumber, balance: yr.endingBalance, interest: yr.totalInterest };
  });

  const linePath = points.length > 0
    ? `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`
    : '';

  const areaPath = points.length > 0
    ? `M ${padding.left},${padding.top + innerHeight} L ${points.map((p) => `${p.x},${p.y}`).join(' L ')} L ${points[points.length - 1].x},${padding.top + innerHeight} Z`
    : '';

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-5 sm:p-6 shadow-xs mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200 gap-3">
        <div>
          <h3 className="text-base font-bold text-neutral-900 tracking-tight">Payment Visualizations & Balance Progression</h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Visualize your loan amortization curve, capital allocation, and interest mitigation dynamics.
          </p>
        </div>

        {/* View Switcher (Segmented buttons) */}
        <div className="inline-flex p-1 bg-neutral-100 rounded-lg border border-neutral-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('balance')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              activeTab === 'balance'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Balance Curve</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('breakdown')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              activeTab === 'breakdown'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Capital Breakdown</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('annual')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              activeTab === 'annual'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Annual Allocation</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Balance Amortization Payoff Curve */}
      {activeTab === 'balance' && (
        <div className="pt-4">
          <div className="flex flex-wrap items-center justify-between text-xs text-neutral-600 mb-2 gap-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-neutral-900 inline-block rounded-full" />
                <span>Loan Balance Curve</span>
              </span>
              {calcResult.monthsSaved > 0 && (
                <span className="text-emerald-700 font-medium">
                  · Accelerated payoff by {calcResult.monthsSaved} months
                </span>
              )}
            </div>
            {hoveredYear !== null && (
              <span className="font-mono tabular-nums text-neutral-900 font-medium">
                Year {hoveredYear}: Balance {formatCurrency(yearlySchedule[hoveredYear - 1]?.endingBalance || 0, currency)}
              </span>
            )}
          </div>

          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-64 select-none"
            >
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
                const y = padding.top + innerHeight * (1 - pct);
                const val = maxVal * pct;
                return (
                  <g key={pct}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={chartWidth - padding.right}
                      y2={y}
                      stroke="#E2E8F0"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 3.5}
                      textAnchor="end"
                      fontSize="9"
                      fill="#94A3B8"
                      className="font-mono tabular-nums"
                    >
                      {formatCurrency(val, currency, 0)}
                    </text>
                  </g>
                );
              })}

              {/* X axis labels */}
              {yearlySchedule
                .filter((_, idx) => idx === 0 || (idx + 1) % 5 === 0 || idx === yearlySchedule.length - 1)
                .map((yr) => {
                  const idx = yr.yearNumber - 1;
                  const x = padding.left + (idx / Math.max(1, totalYears - 1)) * innerWidth;
                  return (
                    <g key={yr.yearNumber}>
                      <line
                        x1={x}
                        y1={padding.top + innerHeight}
                        x2={x}
                        y2={padding.top + innerHeight + 5}
                        stroke="#94A3B8"
                      />
                      <text
                        x={x}
                        y={padding.top + innerHeight + 16}
                        textAnchor="middle"
                        fontSize="9"
                        fill="#64748B"
                        className="font-mono tabular-nums"
                      >
                        Yr {yr.yearNumber}
                      </text>
                    </g>
                  );
                })}

              {/* Shaded Area */}
              {areaPath && (
                <path
                  d={areaPath}
                  fill="rgba(15, 23, 42, 0.06)"
                />
              )}

              {/* Line */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="#0F172A"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}

              {/* Data points with interactive hover */}
              {points.map((p) => (
                <circle
                  key={p.year}
                  cx={p.x}
                  cy={p.y}
                  r={hoveredYear === p.year ? 5 : 2.5}
                  fill={hoveredYear === p.year ? '#0F172A' : '#475569'}
                  className="transition-all cursor-pointer"
                  onMouseEnter={() => setHoveredYear(p.year)}
                  onMouseLeave={() => setHoveredYear(null)}
                />
              ))}
            </svg>
          </div>
        </div>
      )}

      {/* Tab 2: Capital Allocation Donut / Proportions */}
      {activeTab === 'breakdown' && (
        <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Visual SVG Donut */}
          <div className="flex justify-center">
            <div className="relative w-52 h-52">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#F1F5F9"
                  strokeWidth="12"
                />

                {/* Principal Arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#0F172A"
                  strokeWidth="12"
                  strokeDasharray={`${(principalShare * 238.76) / 100} 238.76`}
                  strokeDashoffset="0"
                />

                {/* Interest Arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#E11D48"
                  strokeWidth="12"
                  strokeDasharray={`${(interestShare * 238.76) / 100} 238.76`}
                  strokeDashoffset={`-${(principalShare * 238.76) / 100}`}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] text-neutral-500 font-medium">Total Outflow</span>
                <span className="text-sm font-bold font-mono tabular-nums text-neutral-900 mt-0.5">
                  {formatCurrency(totalRepayment, currency, 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown Legend & Key Ratios */}
          <div className="space-y-4">
            <div className="p-3 bg-neutral-50 rounded-md border border-neutral-200">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-900" />
                  <span className="font-semibold text-neutral-800">Principal Repayment</span>
                </div>
                <span className="font-mono tabular-nums font-bold text-neutral-900">
                  {formatCurrency(totalPrincipal, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-1">
                <span>{principalShare.toFixed(1)}% of total repayment</span>
                <span>Original Loan Amount</span>
              </div>
            </div>

            <div className="p-3 bg-neutral-50 rounded-md border border-neutral-200">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                  <span className="font-semibold text-neutral-800">Total Borrowing Cost (Interest)</span>
                </div>
                <span className="font-mono tabular-nums font-bold text-rose-600">
                  {formatCurrency(totalInterest, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-1">
                <span>{interestShare.toFixed(1)}% of total repayment</span>
                <span>Financing Cost</span>
              </div>
            </div>

            {totalLumpSum > 0 && (
              <div className="p-3 bg-emerald-50/60 rounded-md border border-emerald-200">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <span className="font-semibold text-emerald-900">Lump Sum Prepayments Applied</span>
                  </div>
                  <span className="font-mono tabular-nums font-bold text-emerald-700">
                    {formatCurrency(totalLumpSum, currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-emerald-700 mt-1">
                  <span>Saved {formatCurrency(calcResult.interestSavedComparedToBase, currency)} interest</span>
                  <span>{lumpSumShare.toFixed(1)}% of volume</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Annual Principal vs Interest Allocation Stack */}
      {activeTab === 'annual' && (
        <div className="pt-4">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-3">
            <span className="text-xs">Stacked annual payments: Dark = Principal, Red = Interest</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-neutral-900 rounded-xs" />
                <span>Principal</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-xs" />
                <span>Interest</span>
              </span>
            </div>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {yearlySchedule.map((yr) => {
              const totalYrPaid = yr.totalPrincipal + yr.totalInterest + yr.totalLumpSum;
              const principalPct = (yr.totalPrincipal / (totalYrPaid || 1)) * 100;
              const interestPct = (yr.totalInterest / (totalYrPaid || 1)) * 100;
              return (
                <div key={yr.yearNumber} className="text-xs">
                  <div className="flex items-center justify-between text-neutral-700 mb-1">
                    <span className="font-medium font-mono tabular-nums">
                      Yr {yr.yearNumber} ({yr.calendarYear})
                    </span>
                    <span className="font-mono tabular-nums text-neutral-500">
                      Paid: {formatCurrency(totalYrPaid, currency, 0)} (Bal: {formatCurrency(yr.endingBalance, currency, 0)})
                    </span>
                  </div>
                  <div className="w-full h-3 bg-neutral-100 rounded-xs overflow-hidden flex">
                    <div
                      className="bg-neutral-900 h-full transition-all"
                      style={{ width: `${principalPct}%` }}
                      title={`Principal: ${formatCurrency(yr.totalPrincipal, currency)} (${principalPct.toFixed(0)}%)`}
                    />
                    <div
                      className="bg-rose-500 h-full transition-all"
                      style={{ width: `${interestPct}%` }}
                      title={`Interest: ${formatCurrency(yr.totalInterest, currency)} (${interestPct.toFixed(0)}%)`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
