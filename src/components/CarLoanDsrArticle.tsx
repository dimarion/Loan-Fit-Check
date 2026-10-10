import React from 'react';
import { Car, CreditCard, ShieldAlert, ArrowUp } from 'lucide-react';

export const CarLoanDsrArticle: React.FC = () => {
  const scrollToCalculator = () => {
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  return (
    <article className="mt-8 bg-gradient-to-br from-white via-slate-50/60 to-emerald-50/20 border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs ring-1 ring-slate-100/80">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-semibold tracking-wide uppercase">
          <Car className="w-3.5 h-3.5" /> Auto Financing & Debt Advisory
        </span>
        <span className="text-xs text-slate-300 font-medium">·</span>
        <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
          <CreditCard className="w-3.5 h-3.5 text-rose-500" /> $30,000 Credit Card Impact
        </span>
      </div>

      <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
        What are my chances of getting a car loan
      </h2>

      <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3.5">
        <p>
          Dreaming of driving home your next car, but holding a $30,000 credit card balance? That card might be quietly stalling your auto financing before you even reach the dealership showroom.
        </p>

        <p>
          When auto lenders evaluate your car loan application, they scrutinize one critical benchmark: your <strong>Debt Service Ratio (DSR)</strong>. Even if you make on-time payments every month, banks assess revolving credit aggressively. Most commercial lenders estimate your monthly credit card obligation at <strong>3% to 5%</strong> of the outstanding balance. On a $30,000 balance, that translates to a massive <strong>$900 to $1,500 monthly debt commitment</strong> factored straight into your underwriting assessment.
        </p>

        <p>
          If your monthly income is $5,000, that single credit card pushes your baseline DSR to nearly <strong>30%</strong>—leaving virtually no room for an auto installment once existing rent, mortgage, or student loans are tallied. Because auto financiers enforce strict <strong>50% to 60% DSR caps</strong>, that $30,000 balance can trigger instant application rejections or force you into punishing double-digit interest rates.
        </p>

        <p>
          Don&apos;t let credit card debt park your driving dreams. Use our Debt Service Ratio Calculator to model your debt commitments, identify your borrowing headroom, and discover how strategic paydowns can secure your car loan approval today.
        </p>
      </div>

      <div className="mt-6 pt-5 border-t border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Banks evaluate credit card commitments on minimum monthly payments (3%–5%), not total limit.</span>
        </div>
        <button
          type="button"
          onClick={scrollToCalculator}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer shrink-0"
        >
          <span>Check Your DSR Above</span>
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
  );
};
