import React from 'react';
import { Home, Calendar, Percent, ArrowDown, ExternalLink } from 'lucide-react';

export const MortgageAmortizationArticle: React.FC = () => {
  const handleScrollToSchedule = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const elem = document.getElementById('amortization-schedule');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <article className="mt-8 bg-gradient-to-br from-white via-slate-50/60 to-emerald-50/20 border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs ring-1 ring-slate-100/80">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-semibold tracking-wide uppercase">
          <Home className="w-3.5 h-3.5" /> Mortgage Knowledge Series
        </span>
        <span className="text-xs text-slate-300 font-medium">·</span>
        <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-emerald-700" /> Typical Terms & Interest Rates
        </span>
      </div>

      <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
        What is the Importance of Knowing My Mortgage Amortization Schedule
      </h2>

      <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3.5">
        <p>
          Purchasing a home is likely the largest financial transaction of your lifetime, yet many homeowners focus solely on their monthly payment without ever examining where their money actually goes. Understanding your mortgage amortization schedule is the difference between blindly paying decades of interest and taking proactive control of your home equity.
        </p>

        <p>
          A mortgage amortization schedule is a comprehensive timeline charting every single monthly payment across your entire loan. In the early years, the vast majority of your monthly check goes directly toward lender interest rather than your principal balance. By consulting your personalized{' '}
          <a
            href="#amortization-schedule"
            onClick={handleScrollToSchedule}
            className="text-emerald-800 hover:text-emerald-950 underline font-semibold decoration-emerald-500/50 hover:decoration-emerald-700 transition-colors inline-flex items-center gap-0.5 cursor-pointer"
          >
            amortization schedule
            <ArrowDown className="w-3 h-3 inline-block text-emerald-700" />
          </a>
          , you can see the precise month your payments flip toward building real net worth—and uncover how making even modest prepayments can shave years off your debt.
        </p>

        <p>
          When choosing a loan, term length defines your financial trajectory. The <strong>typical term for a residential mortgage is 30 years (360 months)</strong>, renowned for delivering manageable monthly installments. Alternatively, <strong>15-year mortgages</strong> offer accelerated equity growth and substantial interest savings, albeit with higher monthly cash obligations. Lenders also offer 10- and 20-year options tailored for refinancing and custom retirement timelines.
        </p>

        <p>
          Banks and mortgage institutions typically price loans using either <strong>fixed rates</strong> or <strong>adjustable-rate mortgages (ARMs)</strong>. Fixed-rate mortgages lock in one predictable annual percentage rate (APR) for the entire lifespan of the loan, shielding borrowers against inflation. Commercial lenders baseline these rates against long-term economic indicators—most notably the 10-Year U.S. Treasury yield and central bank benchmarks—with <strong>prime market rates commonly hovering between 5.5% and 7.25%</strong> depending on creditworthiness, loan-to-value ratios, and market liquidity.
        </p>

        <p>
          ARM loans, by contrast, utilize variable indexes such as the Secured Overnight Financing Rate (SOFR) plus a bank margin. Don’t leave your wealth to chance. Explore your full repayment roadmap today and model prepayments using our interactive mortgage tools.
        </p>
      </div>

      <div className="mt-6 pt-5 border-t border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Percent className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Interactive schedule above models 30-year, 15-year, fixed, and variable rate scenarios.</span>
        </div>
        <a
          href="#amortization-schedule"
          onClick={handleScrollToSchedule}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer shrink-0"
        >
          <span>View Amortization Schedule</span>
          <ArrowDown className="w-3.5 h-3.5" />
        </a>
      </div>
    </article>
  );
};
