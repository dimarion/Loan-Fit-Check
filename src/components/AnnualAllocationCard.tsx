import React from 'react';
import { AmortizationYear } from '../types/loan';
import { formatCurrency } from '../utils/calculator';
import { BarChart3 } from 'lucide-react';

interface AnnualAllocationCardProps {
  yearlySchedule: AmortizationYear[];
  currencySymbol: string;
}

export const AnnualAllocationCard: React.FC<AnnualAllocationCardProps> = ({
  yearlySchedule,
  currencySymbol,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs ring-1 ring-slate-100 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-1.5">
              <div className="p-1 rounded-md bg-slate-100 text-slate-700">
                <BarChart3 className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Annual Payment Allocation
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Visual breakdown of principal vs interest over each calendar year.
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2.5 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-slate-700 rounded-xs shadow-2xs" />
              <span className="text-slate-600 font-medium">Principal</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-xs shadow-2xs" />
              <span className="text-slate-600 font-medium">Interest</span>
            </span>
          </div>
        </div>

        {/* Stacked Bars Scroll Area */}
        <div className="mt-3.5 space-y-2.5 max-h-56 overflow-y-auto pr-1">
          {yearlySchedule.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              No amortization data generated yet.
            </div>
          ) : (
            yearlySchedule.map((yr) => {
              const totalYrPaid = yr.totalPrincipal + yr.totalInterest + yr.totalLumpSum;
              const principalPct = Math.min(100, (yr.totalPrincipal / (totalYrPaid || 1)) * 100);
              const interestPct = Math.min(100, (yr.totalInterest / (totalYrPaid || 1)) * 100);

              return (
                <div key={yr.yearNumber} className="text-xs group">
                  <div className="flex items-center justify-between text-slate-700 mb-1">
                    <span className="font-semibold font-mono tabular-nums text-slate-900">
                      Yr {yr.yearNumber} <span className="text-slate-400 font-normal">({yr.calendarYear})</span>
                    </span>
                    <span className="font-mono tabular-nums text-[11px] text-slate-500">
                      Paid: <strong className="text-slate-800">{formatCurrency(totalYrPaid, currencySymbol, 0)}</strong>{' '}
                      <span className="text-slate-400">· Rem: {formatCurrency(yr.endingBalance, currencySymbol, 0)}</span>
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex shadow-2xs">
                    <div
                      className="bg-slate-700 h-full transition-all duration-300"
                      style={{ width: `${principalPct}%` }}
                      title={`Principal: ${formatCurrency(yr.totalPrincipal, currencySymbol)} (${principalPct.toFixed(0)}%)`}
                    />
                    <div
                      className="bg-rose-500 h-full transition-all duration-300"
                      style={{ width: `${interestPct}%` }}
                      title={`Interest: ${formatCurrency(yr.totalInterest, currencySymbol)} (${interestPct.toFixed(0)}%)`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 mt-3 text-[11px] text-slate-500 flex items-center justify-between">
        <span className="text-slate-600 font-medium">Principal share expands as loan balance reduces</span>
        <span className="font-mono tabular-nums text-slate-600 font-medium">{yearlySchedule.length} years total</span>
      </div>
    </div>
  );
};
