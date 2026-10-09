import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Calculator, BookOpen, ShieldCheck, TrendingDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string | React.ReactNode;
}

const FAQS: FaqItem[] = [
  {
    question: 'How is a monthly loan installment calculated?',
    answer: (
      <div>
        <p className="mb-2">
          Monthly loan installments are calculated using the standard Equated Monthly Installment (EMI) amortization formula:
        </p>
        <div className="bg-slate-50 border border-slate-200/90 rounded-lg p-3 font-mono text-xs text-slate-800 my-2">
          Installment = P × [r(1 + r)^n] / [(1 + r)^n - 1]
        </div>
        <ul className="list-disc list-inside space-y-1 text-slate-600 text-xs mt-2">
          <li><strong>P (Principal):</strong> The total amount borrowed from the lender.</li>
          <li><strong>r (Periodic Monthly Interest Rate):</strong> The annual nominal interest rate divided by 12 months.</li>
          <li><strong>n (Total Installments):</strong> The total loan term in months (e.g., 30 years = 360 months).</li>
        </ul>
      </div>
    ),
  },
  {
    question: 'What is the Debt Service Ratio (DSR) and why do banks check it?',
    answer: (
      <div>
        <p className="mb-2">
          The <strong>Debt Service Ratio (DSR)</strong> is the primary risk assessment metric used by banks and credit institutions to determine loan eligibility. It measures the proportion of your monthly income that is committed to servicing debt:
        </p>
        <div className="bg-slate-50 border border-slate-200/90 rounded-lg p-3 font-mono text-xs text-slate-800 my-2">
          DSR (%) = (Total Monthly Debt Commitments + Proposed Loan Installment) / Monthly Income × 100%
        </div>
        <p className="text-slate-600 text-xs mt-2">
          Commercial banks typically cap borrowing between <strong>50% and 70% DSR</strong> depending on your income bracket. A lower DSR signifies higher disposable cash flow, reducing default risk and increasing loan approval probability.
        </p>
      </div>
    ),
  },
  {
    question: 'How does a lump sum prepayment save money on total interest?',
    answer: (
      <div>
        <p className="mb-2">
          When you make an unscheduled lump sum prepayment, 100% of the funds are applied directly to reducing your remaining principal balance rather than paying interest:
        </p>
        <ul className="list-disc list-inside space-y-1 text-slate-600 text-xs mt-1">
          <li><strong>Term Reduction:</strong> Keeping the monthly installment identical allows you to extinguish the loan years early, generating the maximum interest savings.</li>
          <li><strong>Installment Reduction:</strong> Recalculating the installment over the remaining term lowers your monthly cash outflow while maintaining your original payoff date.</li>
        </ul>
      </div>
    ),
  },
  {
    question: 'What is the difference between Gross and Net income for DSR?',
    answer: (
      <p>
        <strong>Gross Income</strong> represents your total earned income before mandatory statutory deductions (such as taxes, social security, or retirement contributions). <strong>Net Income</strong> is your take-home pay. While some lenders evaluate DSR based on gross income for higher income tiers, conservative underwriting and prudent financial planning prioritize net income to ensure realistic cash flow safety.
      </p>
    ),
  },
  {
    question: 'Is any of my financial information stored or transmitted to external servers?',
    answer: (
      <p>
        No. All calculations, DSR estimations, and amortization schedules are computed completely in your browser on the client-side. No financial figures, salaries, debts, or personal identifiable information are collected, tracked, or sent to any server.
      </p>
    ),
  },
];

export const FinancialSeoGuide: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section aria-labelledby="financial-guide-heading" className="mt-12 pt-8 border-t border-slate-200/80">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1.5">
          <BookOpen className="w-5 h-5 text-emerald-800" />
          <h2 id="financial-guide-heading" className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Financial Insights & Loan Guide
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
          Essential guidelines on loan installment mathematics, bank Debt Service Ratio (DSR) underwriting standards, and prepayment interest optimization strategies.
        </p>
      </div>

      {/* 3 Core Conceptual Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <article className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-emerald-100/80 text-emerald-800 flex items-center justify-center mb-3">
            <Calculator className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 mb-1.5">
            Equated Installments
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            In standard amortization schedules, early installments are heavily weighted toward interest charges. As principal is gradually paid down, subsequent payments allocate progressively higher portions to reducing principal balance.
          </p>
        </article>

        <article className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-teal-100/80 text-teal-800 flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 mb-1.5">
            DSR Underwriting
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Banks audit credit bureau records (credit cards, vehicle financing, student debt) to evaluate your total debt-to-income ratio. Keeping your DSR below 50% ensures favorable loan terms and interest rates.
          </p>
        </article>

        <article className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-amber-100/80 text-amber-800 flex items-center justify-center mb-3">
            <TrendingDown className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 mb-1.5">
            Prepayment Velocity
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Even modest lump sum prepayments made during the first 3 to 5 years compound into tens of thousands in interest savings, directly curbing compound interest accumulation.
          </p>
        </article>
      </div>

      {/* Frequently Asked Questions Accordion */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-emerald-800" />
          <h3 className="font-semibold text-sm text-slate-900">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="transition-colors">
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors focus:outline-hidden"
                  aria-expanded={isOpen}
                >
                  <span className="font-medium text-xs sm:text-sm text-slate-800">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-emerald-800' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed animate-fadeIn">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
