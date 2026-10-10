import React, { useState, useMemo, useEffect } from 'react';
import {
  LoanParameters,
  DsrProfile,
} from './types/loan';
import {
  calculateFullLoan,
  calculateDsr,
  formatCurrency,
} from './utils/calculator';
import { Header } from './components/Header';
import { LoanInputs } from './components/LoanInputs';
import { DsrCalculator } from './components/DsrCalculator';
import { AmortizationSchedule } from './components/AmortizationSchedule';
import { PdfExportModal } from './components/PdfExportModal';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { FinancialSeoGuide } from './components/FinancialSeoGuide';
import { CarLoanDsrArticle } from './components/CarLoanDsrArticle';
import { MortgageAmortizationArticle } from './components/MortgageAmortizationArticle';
import {
  CreditCard,
  Percent,
  ArrowUpRight,
  Shield,
  ExternalLink,
} from 'lucide-react';

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Dynamic SEO title & Canonical URL sync
  useEffect(() => {
    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }

    if (activeSection === 'privacy') {
      document.title = 'Privacy Policy – The Loan Calculator';
      canonical.href = 'https://loanfitcheck.com/privacy-policy';
    } else if (activeSection === 'dsr') {
      document.title = 'Debt Service Ratio (DSR) Calculator – Bank Eligibility & Limits';
      canonical.href = 'https://loanfitcheck.com/debt-service-ratio-calculator';
    } else {
      document.title = 'Amortization Calculator: Monthly Loan Payment Schedule';
      canonical.href = 'https://loanfitcheck.com/';
    }
  }, [activeSection]);

  // Clean SEO URL & Hash Routing Handler
  useEffect(() => {
    const handleRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();

      if (path.includes('privacy') || hash.includes('privacy')) {
        setActiveSection('privacy');
      } else if (
        path.includes('debt-service-ratio') ||
        path.includes('dsr') ||
        hash === '#dsr' ||
        hash.includes('debt-service-ratio')
      ) {
        setActiveSection('dsr');
      } else if (
        path.includes('loan-installment') ||
        path.includes('amortization') ||
        hash === '#overview' ||
        hash === '' ||
        path === '/'
      ) {
        setActiveSection('overview');
      }
    };

    handleRoute();
    window.addEventListener('popstate', handleRoute);
    window.addEventListener('hashchange', handleRoute);
    return () => {
      window.removeEventListener('popstate', handleRoute);
      window.removeEventListener('hashchange', handleRoute);
    };
  }, []);

  const handleSelectSection = (sec: string) => {
    setActiveSection(sec);
    if (sec === 'privacy') {
      window.history.pushState({}, '', '/privacy-policy');
    } else if (sec === 'dsr') {
      window.history.pushState({}, '', '/debt-service-ratio-calculator');
    } else {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loan parameters state
  const [loanParams, setLoanParams] = useState<LoanParameters>({
    principal: 400000,
    tenureYears: 30,
    tenureMonths: 0,
    rateType: 'fixed',
    fixedAnnualRate: 6.25,
    variableStages: [],
    lumpSums: [
      { id: 'ls1', month: 24, amount: 20000, effect: 'reduce_tenure', note: 'Year 2 Bonus', frequency: 'one_time' },
    ],
    currency: 'USD',
    currencySymbol: '$',
    startDate: '2026-11',
  });

  // DSR Profile state
  const [dsrProfile, setDsrProfile] = useState<DsrProfile>({
    grossMonthlyIncome: 8500,
    coBorrowerIncome: 0,
    netMonthlyIncome: 6800,
    existingDebts: [
      { id: 'd1', name: 'Car Loan', monthlyAmount: 450, type: 'car' },
      { id: 'd2', name: 'Credit Cards', monthlyAmount: 180, type: 'credit_card' },
      { id: 'd3', name: 'Student Loan', monthlyAmount: 220, type: 'student' },
    ],
    dsrBasis: 'gross',
    targetDsrLimit: 60,
  });

  // Execute calculation engine
  const calcResult = useMemo(() => {
    return calculateFullLoan(loanParams);
  }, [loanParams]);

  // Execute DSR calculation
  const dsrResult = useMemo(() => {
    const totalMonths = loanParams.tenureYears * 12 + loanParams.tenureMonths;
    const initialRate = loanParams.fixedAnnualRate;

    return calculateDsr(
      dsrProfile,
      calcResult.initialMonthlyInstallment,
      initialRate,
      totalMonths
    );
  }, [dsrProfile, calcResult.initialMonthlyInstallment, loanParams]);

  const handleUpdateLoanParams = (updated: Partial<LoanParameters>) => {
    setLoanParams((prev) => ({ ...prev, ...updated }));
  };

  const handleUpdateDsr = (updated: Partial<DsrProfile>) => {
    setDsrProfile((prev) => ({ ...prev, ...updated }));
  };

  const currency = loanParams.currencySymbol;

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 pb-8">
      {/* Top Bar adhering to strict 3-zone contract */}
      <Header
        activeSection={activeSection}
        setActiveSection={handleSelectSection}
      />

      {activeSection === 'privacy' ? (
        <main className="pt-4 sm:pt-6">
          <PrivacyPolicy onBackToCalculator={() => handleSelectSection('overview')} />
        </main>
      ) : (
        <>
          {/* Main Banner running the full width of the screen */}
          <section className="w-full bg-emerald-800 text-white shadow-sm border-b border-emerald-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-9">
              <div className="relative flex flex-col md:flex-row items-center justify-center gap-4">
                <div className="text-center">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                    {activeSection === 'dsr'
                      ? 'Debt Service Ratio Calculator'
                      : 'Amortization Calculator: Monthly Loan Payment Schedule'}
                  </h1>
                </div>

                {/* Quick PDF Action trigger */}
                <div className="md:absolute md:right-0 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsPdfModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-emerald-950 bg-white hover:bg-emerald-50 rounded-lg transition-colors shadow-sm cursor-pointer"
                  >
                    <ArrowUpRight className="w-4 h-4 text-emerald-800" />
                    <span>Export Full PDF Summary</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Main Container */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
            {/* Tab 1: Loan Installment Calculator */}
            {activeSection === 'overview' && (
              <div className="space-y-6">
                {/* Split Section: Loan Configuration on Left, Monthly Installment & Total Interest Cards on Right */}
                <section className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  {/* Left Side: Loan Configuration & Lump Sum Prepayment Section */}
                  <div className="md:col-span-8 lg:col-span-8 xl:col-span-9 min-w-0">
                    <LoanInputs
                      params={loanParams}
                      onChange={handleUpdateLoanParams}
                    />
                  </div>

                  {/* Right Side: Monthly Installment and Total Interest Cards (reduced width & streamlined) */}
                  <div className="md:col-span-4 lg:col-span-4 xl:col-span-3 min-w-0 flex flex-col gap-4 md:sticky md:top-20">
                    {/* Card 1: Monthly Installment (Emerald/Teal Theme) */}
                    <div className="bg-gradient-to-br from-white via-emerald-50/25 to-teal-50/35 border border-emerald-200/90 rounded-xl p-4 sm:p-5 shadow-xs ring-1 ring-emerald-100/60 flex flex-col justify-between transition-all hover:shadow-sm">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 shadow-2xs">
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <span className="font-bold uppercase tracking-wider text-[11px] text-emerald-800">
                            Monthly Installment
                          </span>
                        </div>
                        <div className="text-2xl sm:text-3xl xl:text-4xl font-extrabold font-mono tabular-nums text-emerald-700 mt-2.5 truncate">
                          {formatCurrency(calcResult.initialMonthlyInstallment, currency)}
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Total Loan Interest (Warm Rose/Amber Theme) */}
                    <div className="bg-gradient-to-br from-white via-rose-50/25 to-amber-50/35 border border-rose-200/90 rounded-xl p-4 sm:p-5 shadow-xs ring-1 ring-rose-100/60 flex flex-col justify-between transition-all hover:shadow-sm">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700 shadow-2xs">
                            <Percent className="w-4 h-4" />
                          </div>
                          <span className="font-bold uppercase tracking-wider text-[11px] text-rose-800">
                            Total Loan Interest
                          </span>
                        </div>
                        <div className="text-2xl sm:text-3xl xl:text-4xl font-extrabold font-mono tabular-nums text-rose-600 mt-2.5 truncate">
                          {formatCurrency(calcResult.totalInterest, currency)}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Interactive Amortization Schedule preview */}
                <AmortizationSchedule
                  calcResult={calcResult}
                  params={loanParams}
                />

                {/* Mortgage Amortization Knowledge & Schedule Ad Copy Article */}
                <MortgageAmortizationArticle />
              </div>
            )}

            {/* Tab 2: Debt Service Ratio (DSR) & Affordability Only */}
            {activeSection === 'dsr' && (
              <div className="space-y-6">
                <DsrCalculator
                  dsrProfile={dsrProfile}
                  dsrResult={dsrResult}
                  currencySymbol={currency}
                  onChange={handleUpdateDsr}
                />
                <CarLoanDsrArticle />
              </div>
            )}

            {/* Tab 3: Amortization Schedule */}
            {activeSection === 'schedule' && (
              <div className="space-y-6 mt-6">
                <AmortizationSchedule
                  calcResult={calcResult}
                  params={loanParams}
                />
              </div>
            )}

            {/* SEO Financial Insights & Comprehensive FAQ Guide */}
            <FinancialSeoGuide />
          </main>
        </>
      )}

      {/* Footer with Google AdSense Compliance Links & Simple Financial Disclaimer */}
      <footer className="mt-16 border-t border-slate-200/90 bg-white/70 py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-emerald-800 flex items-center justify-center text-white font-bold text-xs">
                  T
                </div>
                <span className="font-bold text-slate-900 text-sm">LoanFit Check / The Loan Calculator</span>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[10px] px-2 py-0.5 rounded-md font-semibold">
                  loanfitcheck.com
                </span>
              </div>
              <p className="text-slate-500 text-xs mt-1 max-w-xl">
                Client-side financial installment modeling, Debt Service Ratio (DSR) capacity analysis, and loan prepayment schedule tools.
              </p>
            </div>

            {/* Essential Footer Links */}
            <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-600">
              <a
                href="/privacy-policy"
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectSection('privacy');
                }}
                className="cursor-pointer text-emerald-800 hover:text-emerald-950 underline font-semibold"
              >
                Privacy Policy
              </a>
              <span>·</span>
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-800 hover:underline inline-flex items-center gap-1"
              >
                Ad Choices <ExternalLink className="w-3 h-3" />
              </a>
              <span>·</span>
              <a
                href="/ads.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-800 hover:underline"
              >
                ads.txt
              </a>
              <span>·</span>
              <a
                href="mailto:Dimarion@gmail.com"
                className="hover:text-emerald-800 hover:underline"
              >
                Contact
              </a>
            </nav>
          </div>

          {/* Simple Financial Disclaimer */}
          <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200/80 rounded-lg px-4 py-3">
            <p>
              <strong className="text-slate-800 font-semibold">Financial Disclaimer:</strong> Calculations are estimates for informational purposes only and do not constitute financial advice or an offer of credit.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 pt-1 gap-2">
            <p>© 2026 LoanFit Check (loanfitcheck.com). All rights reserved.</p>
            <div className="flex items-center gap-3">
              <span>Client-Side Computation</span>
              <span>·</span>
              <span>No Financial Data Stored</span>
              <span>·</span>
              <span>Google AdSense Verified</span>
            </div>
          </div>
        </div>
      </footer>

      {/* PDF Export Modal */}
      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        loanParams={loanParams}
        calcResult={calcResult}
        dsrProfile={dsrProfile}
        dsrResult={dsrResult}
      />
    </div>
  );
}
