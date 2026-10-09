import React, { useState, useMemo } from 'react';
import { CalculationResult, LoanParameters } from '../types/loan';
import { formatCurrency } from '../utils/calculator';
import { FileSpreadsheet, ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';

interface AmortizationScheduleProps {
  calcResult: CalculationResult;
  params: LoanParameters;
}

export const AmortizationSchedule: React.FC<AmortizationScheduleProps> = ({
  calcResult,
  params,
}) => {
  const [viewMode, setViewMode] = useState<'yearly' | 'monthly'>('yearly');
  const [filterPrepaymentsOnly, setFilterPrepaymentsOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 24;

  const currency = params.currencySymbol;

  // Filtered monthly data
  const filteredMonths = useMemo(() => {
    let list = calcResult.monthlySchedule;

    if (filterPrepaymentsOnly) {
      list = list.filter((m) => m.lumpSumPaid > 0);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.dateStr.toLowerCase().includes(q) ||
          `month ${m.monthIndex}`.includes(q) ||
          `year ${m.yearNumber}`.includes(q)
      );
    }

    return list;
  }, [calcResult.monthlySchedule, filterPrepaymentsOnly, searchQuery]);

  const totalPages = Math.ceil(filteredMonths.length / itemsPerPage) || 1;
  const paginatedMonths = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredMonths.slice(start, start + itemsPerPage);
  }, [filteredMonths, page, itemsPerPage]);

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'Month',
      'Date',
      'Year',
      'Beginning Balance',
      'Installment',
      'Principal',
      'Interest',
      'Lump Sum',
      'Ending Balance',
      'Annual Rate (%)',
      'Cumulative Interest',
    ];

    const rows = calcResult.monthlySchedule.map((m) => [
      m.monthIndex,
      m.dateStr,
      m.yearNumber,
      m.beginningBalance.toFixed(2),
      m.regularInstallment.toFixed(2),
      m.principalPaid.toFixed(2),
      m.interestPaid.toFixed(2),
      m.lumpSumPaid.toFixed(2),
      m.endingBalance.toFixed(2),
      m.annualRate.toFixed(2),
      m.cumulativeInterest.toFixed(2),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Amortization_Schedule_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 sm:p-6 shadow-xs ring-1 ring-slate-100 mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-100 text-slate-700 shadow-2xs">
            <FileSpreadsheet className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Amortization Schedule</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Full principal and interest payment breakdown by year or month.
            </p>
          </div>
        </div>

        {/* View mode toggle & CSV export button */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 bg-slate-100/80 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setViewMode('yearly');
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                viewMode === 'yearly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annual Summary
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('monthly');
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                viewMode === 'monthly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Breakdown
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 transition-colors shadow-2xs cursor-pointer"
            title="Download CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Monthly view filters */}
      {viewMode === 'monthly' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search year or date (e.g. 2027)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setFilterPrepaymentsOnly(!filterPrepaymentsOnly);
                setPage(1);
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md border transition-colors cursor-pointer ${
                filterPrepaymentsOnly
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-medium'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Prepayment Months Only</span>
            </button>
          </div>
        </div>
      )}

      {/* Tables */}
      <div className="mt-4 overflow-x-auto border border-slate-200/90 rounded-xl shadow-2xs">
        {viewMode === 'yearly' ? (
          /* YEARLY SUMMARY TABLE */
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Timeline</th>
                <th className="py-2.5 px-3 text-right">Beginning Balance</th>
                <th className="py-2.5 px-3 text-right">Principal Paid</th>
                <th className="py-2.5 px-3 text-right">Interest Paid</th>
                <th className="py-2.5 px-3 text-right">Lump Sum</th>
                <th className="py-2.5 px-3 text-right">Total Annual Paid</th>
                <th className="py-2.5 px-3 text-right">Ending Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white font-mono tabular-nums">
              {calcResult.yearlySchedule.map((yr) => (
                <tr key={yr.yearNumber} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">
                    Year {yr.yearNumber} <span className="text-slate-400 font-mono text-[11px]">({yr.calendarYear})</span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-600">
                    {formatCurrency(yr.beginningBalance, currency)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                    {formatCurrency(yr.totalPrincipal, currency)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-rose-600 font-semibold">
                    {formatCurrency(yr.totalInterest, currency)}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {yr.totalLumpSum > 0 ? (
                      <span className="text-teal-700 font-bold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200/60">
                        {formatCurrency(yr.totalLumpSum, currency)}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                    {formatCurrency(yr.totalPaid, currency)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-slate-800">
                    {formatCurrency(yr.endingBalance, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100/90 border-t-2 border-slate-300 font-mono tabular-nums font-bold text-slate-900 text-xs">
              <tr>
                <td className="py-2.5 px-3 font-sans">TOTALS</td>
                <td className="py-2.5 px-3 text-right">{formatCurrency(params.principal, currency)}</td>
                <td className="py-2.5 px-3 text-right text-slate-900">{formatCurrency(calcResult.totalPrincipal, currency)}</td>
                <td className="py-2.5 px-3 text-right text-rose-600">{formatCurrency(calcResult.totalInterest, currency)}</td>
                <td className="py-2.5 px-3 text-right text-teal-700">
                  {calcResult.totalLumpSum > 0 ? formatCurrency(calcResult.totalLumpSum, currency) : '—'}
                </td>
                <td className="py-2.5 px-3 text-right">{formatCurrency(calcResult.totalRepayment, currency)}</td>
                <td className="py-2.5 px-3 text-right">{formatCurrency(0, currency)}</td>
              </tr>
            </tfoot>
          </table>
        ) : (
          /* MONTHLY BREAKDOWN TABLE */
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Month</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Rate</th>
                <th className="py-2.5 px-3 text-right">Beginning Balance</th>
                <th className="py-2.5 px-3 text-right">Installment</th>
                <th className="py-2.5 px-3 text-right">Principal</th>
                <th className="py-2.5 px-3 text-right">Interest</th>
                <th className="py-2.5 px-3 text-right">Lump Sum</th>
                <th className="py-2.5 px-3 text-right">Ending Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white font-mono tabular-nums">
              {paginatedMonths.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 font-sans">
                    No matching monthly payment records found.
                  </td>
                </tr>
              ) : (
                paginatedMonths.map((m) => (
                  <tr
                    key={m.monthIndex}
                    className={`hover:bg-slate-50 transition-colors ${
                      m.lumpSumPaid > 0 ? 'bg-teal-50/30' : ''
                    }`}
                  >
                    <td className="py-2 px-3 font-sans font-semibold text-slate-800">
                      Mo {m.monthIndex}
                    </td>
                    <td className="py-2 px-3 font-sans text-slate-600">
                      {m.dateStr}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-600">
                      {m.annualRate.toFixed(2)}%
                    </td>
                    <td className="py-2 px-3 text-right text-slate-600">
                      {formatCurrency(m.beginningBalance, currency)}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-900 font-semibold">
                      {formatCurrency(m.regularInstallment, currency)}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-900 font-medium">
                      {formatCurrency(m.principalPaid, currency)}
                    </td>
                    <td className="py-2 px-3 text-right text-rose-600 font-medium">
                      {formatCurrency(m.interestPaid, currency)}
                    </td>
                    <td className="py-2 px-3 text-right">
                      {m.lumpSumPaid > 0 ? (
                        <span className="font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200/60">
                          {formatCurrency(m.lumpSumPaid, currency)}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-slate-900">
                      {formatCurrency(m.endingBalance, currency)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Monthly Pagination Controls */}
      {viewMode === 'monthly' && totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 text-xs text-neutral-600">
          <div>
            Showing {(page - 1) * itemsPerPage + 1} to{' '}
            {Math.min(filteredMonths.length, page * itemsPerPage)} of {filteredMonths.length} payment months
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-1.5 border border-neutral-200 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono tabular-nums font-medium text-neutral-800">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-1.5 border border-neutral-200 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
