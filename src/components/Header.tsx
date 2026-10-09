import React from 'react';
import { Download } from 'lucide-react';

interface HeaderProps {
  onExportPdf: () => void;
  activeSection: string;
  setActiveSection: (sec: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onExportPdf,
  activeSection,
  setActiveSection,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark with jewel gradient */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setActiveSection('overview');
          }}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-900 via-slate-800 to-teal-800 flex items-center justify-center text-white font-black text-sm shadow-xs transition-transform group-hover:scale-105">
            T
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            The Loan Calculator
          </span>
        </a>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveSection('overview')}
            className={`cursor-pointer whitespace-nowrap shrink-0 transition-all px-3 py-1.5 rounded-lg ${
              activeSection === 'overview'
                ? 'bg-slate-100 text-slate-900 font-semibold border border-slate-300/80 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            Loan Installment Calculator
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('dsr')}
            className={`cursor-pointer whitespace-nowrap shrink-0 transition-all px-3 py-1.5 rounded-lg ${
              activeSection === 'dsr'
                ? 'bg-slate-100 text-slate-900 font-semibold border border-slate-300/80 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            Debt Service Ratio
          </button>
        </nav>

        {/* Zone 3: 1 primary action button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onExportPdf}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF Plan</span>
          </button>
        </div>
      </div>
    </header>
  );
};
