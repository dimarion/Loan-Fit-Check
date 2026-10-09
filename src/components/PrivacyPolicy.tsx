import React from 'react';
import { Shield, ArrowLeft, ExternalLink, Mail, Lock, Eye } from 'lucide-react';

interface PrivacyPolicyProps {
  onBackToCalculator?: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBackToCalculator }) => {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      {/* Return button */}
      {onBackToCalculator && (
        <div className="mb-6">
          <button
            type="button"
            onClick={onBackToCalculator}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Calculator</span>
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Privacy Policy</h1>
          </div>
          <p className="text-xs text-slate-500">
            Last Updated: October 2026 · Website: <span className="font-mono text-emerald-700">loanfitcheck.com</span>
          </p>
        </div>

        {/* Section 1: Overview */}
        <section className="space-y-2 text-sm text-slate-700 leading-relaxed">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-700" />
            1. Client-Side Financial Calculations
          </h2>
          <p>
            Your privacy is our highest priority. All loan amounts, interest rates, tenure inputs, and debt figures entered into <strong>LoanFit Check</strong> are calculated entirely in your browser (&ldquo;client-side&rdquo;). We do not store, transmit, or share your financial inputs with any server or third party.
          </p>
        </section>

        {/* Section 2: Google AdSense & Cookies */}
        <section className="space-y-2 text-sm text-slate-700 leading-relaxed">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-700" />
            2. Cookies and Advertising (Google AdSense)
          </h2>
          <p>
            We use Google AdSense to display advertisements on our website.
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-1 text-slate-600">
            <li>
              Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this website or other websites.
            </li>
            <li>
              Google&apos;s use of advertising cookies enables it and its partners to serve ads based on your visit to our site and/or other sites on the Internet.
            </li>
            <li>
              You may opt out of personalized advertising by visiting{' '}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 underline font-medium inline-flex items-center gap-1 hover:text-emerald-800"
              >
                Google Ads Settings <ExternalLink className="w-3 h-3" />
              </a>{' '}
              or via{' '}
              <a
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 underline font-medium inline-flex items-center gap-1 hover:text-emerald-800"
              >
                AboutAds Choices <ExternalLink className="w-3 h-3" />
              </a>.
            </li>
          </ul>
        </section>

        {/* Section 3: Web Server Logs */}
        <section className="space-y-2 text-sm text-slate-700 leading-relaxed">
          <h2 className="text-base font-semibold text-slate-900">3. Standard Log Files</h2>
          <p>
            Like standard websites, hosting servers may record anonymous technical logs (such as IP addresses, browser types, referring pages, and access times) strictly for security, performance optimization, and server administration.
          </p>
        </section>

        {/* Section 4: Contact Information */}
        <section className="space-y-2 text-sm text-slate-700 leading-relaxed pt-2 border-t border-slate-100">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Mail className="w-4 h-4 text-emerald-700" />
            4. Contact
          </h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at:{' '}
            <a
              href="mailto:Dimarion@gmail.com"
              className="text-emerald-700 font-semibold underline hover:text-emerald-900"
            >
              Dimarion@gmail.com
            </a>
          </p>
        </section>

        {/* Return Button at bottom */}
        {onBackToCalculator && (
          <div className="pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onBackToCalculator}
              className="px-4 py-2 text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-colors cursor-pointer"
            >
              ← Return to Calculator
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
