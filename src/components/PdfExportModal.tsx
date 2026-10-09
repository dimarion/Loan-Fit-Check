import React, { useState } from 'react';
import { LoanParameters, CalculationResult, DsrProfile, DsrResult } from '../types/loan';
import { generateRepaymentPlanPdf } from '../utils/pdfGenerator';
import { formatCurrency } from '../utils/calculator';
import { X, Download, FileText, CheckCircle2 } from 'lucide-react';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  loanParams: LoanParameters;
  calcResult: CalculationResult;
  dsrProfile: DsrProfile;
  dsrResult: DsrResult;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  loanParams,
  calcResult,
  dsrProfile,
  dsrResult,
}) => {
  const [borrowerName, setBorrowerName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    setIsGenerating(true);
    setSuccess(false);
    try {
      generateRepaymentPlanPdf({
        loanParams,
        calcResult,
        dsrProfile,
        dsrResult,
        borrowerName: borrowerName.trim() || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        setIsGenerating(false);
      }, 800);
    } catch (err) {
      console.error('PDF generation error:', err);
      setIsGenerating(false);
    }
  };

  const currency = loanParams.currencySymbol;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-neutral-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-neutral-800" />
            <h3 className="text-sm font-bold text-neutral-900">Download Loan Repayment & DSR PDF</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-neutral-600">
            Generate an executive-grade, client-ready PDF document including full loan specifications, Debt Service Ratio (DSR) assessment, variable rate timeline, and annual amortization schedule.
          </p>

          <div>
            <label htmlFor="client-name-input" className="text-xs font-semibold text-neutral-700 block mb-1">
              Client / Borrower Name (Optional)
            </label>
            <input
              id="client-name-input"
              type="text"
              placeholder="e.g. John Doe or Acme Corp"
              value={borrowerName}
              onChange={(e) => setBorrowerName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          {/* Quick Summary Review Box */}
          <div className="p-3.5 bg-neutral-50 rounded-md border border-neutral-200 text-xs space-y-2">
            <span className="font-semibold text-neutral-700 block uppercase tracking-wider text-[10px]">
              Document Contents Included:
            </span>
            <div className="grid grid-cols-2 gap-2 text-neutral-600 font-mono tabular-nums text-[11px]">
              <div>Principal: {formatCurrency(loanParams.principal, currency)}</div>
              <div>Rate: {loanParams.rateType === 'fixed' ? `${loanParams.fixedAnnualRate}% Fixed` : 'Variable Floating'}</div>
              <div>Initial Monthly: {formatCurrency(calcResult.initialMonthlyInstallment, currency)}</div>
              <div>DSR: {dsrResult.newDsr.toFixed(1)}% ({dsrResult.riskLevel.toUpperCase()})</div>
              <div>Total Interest: {formatCurrency(calcResult.totalInterest, currency)}</div>
              <div>Payoff: {calcResult.payoffDate}</div>
            </div>
            {calcResult.totalLumpSum > 0 && (
              <div className="text-[11px] text-emerald-700 font-semibold pt-1 border-t border-neutral-200">
                Prepayment Savings: {formatCurrency(calcResult.interestSavedComparedToBase, currency)} interest saved ({calcResult.monthsSaved} mo early)
              </div>
            )}
          </div>

          {success && (
            <div className="flex items-center gap-2 p-2.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>PDF successfully created and downloaded to your device!</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 bg-neutral-50 border-t border-neutral-200">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 active:scale-95 disabled:opacity-50 rounded transition-all cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isGenerating ? 'Generating PDF...' : 'Download PDF Report'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
