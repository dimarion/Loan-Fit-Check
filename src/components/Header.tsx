import React from 'react';

interface HeaderProps {
  activeSection: string;
  setActiveSection: (sec: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeSection,
  setActiveSection,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 py-2.5 md:py-0 flex flex-wrap md:flex-nowrap items-center justify-between gap-3 md:gap-6">
        {/* Brand */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setActiveSection('overview');
          }}
          className="flex items-center gap-2 group cursor-pointer shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-900 via-slate-800 to-teal-800 flex items-center justify-center text-white font-black text-sm shadow-xs transition-transform group-hover:scale-105">
            T
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
            The Loan Calculator
          </span>
        </a>

        {/* Navigation links */}
        <nav className="flex items-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveSection('overview')}
            className={`cursor-pointer whitespace-nowrap shrink-0 transition-all px-3.5 py-1.5 rounded-lg border text-xs sm:text-sm ${
              activeSection === 'overview'
                ? 'bg-emerald-800 text-white font-semibold border-emerald-900 shadow-2xs hover:bg-emerald-900'
                : 'bg-emerald-100/90 text-emerald-900 border-emerald-300/80 font-medium hover:bg-emerald-200 hover:text-emerald-950 hover:border-emerald-400'
            }`}
          >
            Loan Installment Calculator
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('dsr')}
            className={`cursor-pointer whitespace-nowrap shrink-0 transition-all px-3.5 py-1.5 rounded-lg border text-xs sm:text-sm ${
              activeSection === 'dsr'
                ? 'bg-emerald-800 text-white font-semibold border-emerald-900 shadow-2xs hover:bg-emerald-900'
                : 'bg-emerald-100/90 text-emerald-900 border-emerald-300/80 font-medium hover:bg-emerald-200 hover:text-emerald-950 hover:border-emerald-400'
            }`}
          >
            Debt Service Ratio
          </button>
        </nav>
      </div>
    </header>
  );
};
