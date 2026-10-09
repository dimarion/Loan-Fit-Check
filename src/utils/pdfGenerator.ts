import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LoanParameters, CalculationResult, DsrProfile, DsrResult } from '../types/loan';
import { formatCurrency, formatNumber } from './calculator';

export interface GeneratePdfOptions {
  loanParams: LoanParameters;
  calcResult: CalculationResult;
  dsrProfile: DsrProfile;
  dsrResult: DsrResult;
  borrowerName?: string;
  notes?: string;
}

export function generateRepaymentPlanPdf(options: GeneratePdfOptions): void {
  const { loanParams, calcResult, dsrProfile, dsrResult, borrowerName } = options;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const currency = loanParams.currencySymbol || '$';
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  // Primary colors
  const primaryColor: [number, number, number] = [15, 23, 42]; // Slate 900
  const secondaryColor: [number, number, number] = [71, 85, 105]; // Slate 600
  const accentColor: [number, number, number] = [16, 185, 129]; // Emerald 500
  const lightBg: [number, number, number] = [248, 250, 252]; // Slate 50
  const borderColor: [number, number, number] = [226, 232, 240]; // Slate 200

  let currentY = margin;

  // --- Header ---
  doc.setFillColor(...lightBg);
  doc.rect(margin, currentY, contentWidth, 68, 'F');
  doc.setDrawColor(...borderColor);
  doc.rect(margin, currentY, contentWidth, 68, 'S');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...primaryColor);
  doc.text('Loan Repayment Plan & DSR Assessment', margin + 16, currentY + 28);

  // Subtitle / Date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...secondaryColor);
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(`Generated on ${dateStr} · Ref: EQ-${Date.now().toString().slice(-6)}`, margin + 16, currentY + 46);

  if (borrowerName) {
    doc.text(`Client / Prepared for: ${borrowerName}`, margin + 16, currentY + 58);
  }

  currentY += 82;

  // --- Executive Metrics (4 KPI Cards in a row) ---
  const cardWidth = (contentWidth - 24) / 4;
  const cardHeight = 54;

  const kpis = [
    {
      label: 'Initial Monthly Payment',
      value: formatCurrency(calcResult.initialMonthlyInstallment, currency),
      subtext: loanParams.rateType === 'variable' ? 'Subject to rate adjustment' : 'Fixed installment',
    },
    {
      label: 'Total Interest',
      value: formatCurrency(calcResult.totalInterest, currency),
      subtext: calcResult.interestSavedComparedToBase > 0
        ? `Saved ${formatCurrency(calcResult.interestSavedComparedToBase, currency)}`
        : 'Over full tenure',
    },
    {
      label: 'Debt Service Ratio (DSR)',
      value: `${dsrResult.newDsr.toFixed(1)}%`,
      subtext: `Risk Rating: ${dsrResult.riskLevel.toUpperCase()}`,
    },
    {
      label: 'Estimated Payoff Date',
      value: calcResult.payoffDate,
      subtext: calcResult.monthsSaved > 0 ? `${calcResult.monthsSaved} mo early` : 'Full term',
    },
  ];

  kpis.forEach((kpi, idx) => {
    const cardX = margin + idx * (cardWidth + 8);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...borderColor);
    doc.roundedRect(cardX, currentY, cardWidth, cardHeight, 4, 4, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...secondaryColor);
    doc.text(kpi.label, cardX + 8, currentY + 14);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.text(kpi.value, cardX + 8, currentY + 31);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(kpi.subtext.includes('Saved') ? accentColor[0] : secondaryColor[0],
                     kpi.subtext.includes('Saved') ? accentColor[1] : secondaryColor[1],
                     kpi.subtext.includes('Saved') ? accentColor[2] : secondaryColor[2]);
    doc.text(kpi.subtext, cardX + 8, currentY + 45);
  });

  currentY += cardHeight + 16;

  // --- Loan Parameters & DSR Assessment Tables (Side by Side or 2 Tables) ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('1. Facility Parameters & Prepayment Summary', margin, currentY + 10);
  currentY += 16;

  const facilityRows = [
    ['Principal Loan Amount', formatCurrency(loanParams.principal, currency), 'Tenure', `${loanParams.tenureYears} Years (${loanParams.tenureYears * 12 + loanParams.tenureMonths} Months)`],
    ['Annual Interest Rate', `${loanParams.fixedAnnualRate.toFixed(2)}% Fixed p.a.`, 'Start Month', loanParams.startDate],
    ['Total Principal + Interest', formatCurrency(calcResult.totalRepayment, currency), 'Lump Sum Prepayments', formatCurrency(calcResult.totalLumpSum, currency)],
    ['Standard Payoff Date', calcResult.originalPayoffDate, 'Accelerated Payoff', calcResult.payoffDate],
    ['Total Interest Saved', formatCurrency(calcResult.interestSavedComparedToBase, currency), 'Tenure Reduced', `${Math.floor(calcResult.monthsSaved / 12)} Yrs ${calcResult.monthsSaved % 12} Mos`],
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [],
    body: facilityRows,
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 4.5,
      textColor: [30, 41, 59],
      lineColor: borderColor,
      lineWidth: 0.5,
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 140 },
      1: { cellWidth: 120 },
      2: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 120 },
      3: { cellWidth: 135 },
    },
  });

  // @ts-expect-error autoTable adds lastAutoTable to doc
  currentY = doc.lastAutoTable.finalY + 16;

  // --- DSR Assessment Section ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('2. Debt Service Ratio (DSR) & Affordability Analysis', margin, currentY + 10);
  currentY += 16;

  const dsrStatusText = dsrResult.riskLevel === 'healthy'
    ? 'Low Risk / High Approval Probability (Within standard 35% guideline)'
    : dsrResult.riskLevel === 'moderate'
    ? 'Moderate Risk / Standard Approval Range (Typical bank threshold 35% - 50%)'
    : dsrResult.riskLevel === 'high'
    ? 'Elevated Risk / Selective Approval (Above 55% guideline)'
    : 'Critical Risk / High Default Risk (Exceeds 70% guideline)';

  const dsrRows = [
    ['Monthly Recognised Income', formatCurrency(dsrResult.totalMonthlyIncome, currency), 'Assessment Basis', dsrProfile.dsrBasis === 'gross' ? 'Gross Monthly Income' : 'Net Take-Home Income'],
    ['Existing Monthly Debt Commitments', formatCurrency(dsrResult.totalExistingMonthlyDebts, currency), 'Current DSR (Before Loan)', `${dsrResult.currentDsr.toFixed(1)}%`],
    ['Proposed Loan Monthly Installment', formatCurrency(dsrResult.proposedInstallment, currency), 'New Total DSR (With Loan)', `${dsrResult.newDsr.toFixed(1)}%`],
    ['Remaining Disposable Cashflow', formatCurrency(dsrResult.remainingDisposableIncome, currency), 'Bank Risk Assessment', dsrStatusText],
    ['Max Installment at Target DSR (' + dsrProfile.targetDsrLimit + '%)', formatCurrency(dsrResult.maxAllowedInstallment, currency), 'Max Borrowing Capacity', formatCurrency(dsrResult.maxAffordableLoan, currency)],
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [],
    body: dsrRows,
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 4.5,
      textColor: [30, 41, 59],
      lineColor: borderColor,
      lineWidth: 0.5,
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 160 },
      1: { cellWidth: 100 },
      2: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 120 },
      3: { cellWidth: 135 },
    },
  });

  // @ts-expect-error autoTable adds lastAutoTable to doc
  currentY = doc.lastAutoTable.finalY + 16;

  // --- Annual Amortization Roll-up Schedule ---
  // If currentY is too close to bottom, add page
  if (currentY > pageHeight - 140) {
    doc.addPage();
    currentY = margin;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('Annual Amortization Schedule (Summary by Year)', margin, currentY + 10);
  currentY += 16;

  const tableHeaders = [
    ['Year', 'Calendar', 'Beginning Balance', 'Principal Paid', 'Interest Paid', 'Lump Sum', 'Total Paid', 'Ending Balance']
  ];

  const tableBody = calcResult.yearlySchedule.map((yr) => [
    `Year ${yr.yearNumber}`,
    yr.calendarYear.toString(),
    formatCurrency(yr.beginningBalance, currency, 0),
    formatCurrency(yr.totalPrincipal, currency, 0),
    formatCurrency(yr.totalInterest, currency, 0),
    yr.totalLumpSum > 0 ? formatCurrency(yr.totalLumpSum, currency, 0) : '-',
    formatCurrency(yr.totalPaid, currency, 0),
    formatCurrency(yr.endingBalance, currency, 0),
  ]);

  // Add total summary row
  tableBody.push([
    'TOTAL',
    'All Years',
    formatCurrency(loanParams.principal, currency, 0),
    formatCurrency(calcResult.totalPrincipal, currency, 0),
    formatCurrency(calcResult.totalInterest, currency, 0),
    calcResult.totalLumpSum > 0 ? formatCurrency(calcResult.totalLumpSum, currency, 0) : '-',
    formatCurrency(calcResult.totalRepayment, currency, 0),
    formatCurrency(0, currency, 0),
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: tableHeaders,
    body: tableBody,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: 3.5,
    },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 45 },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right' },
      7: { halign: 'right' },
    },
    didParseCell: (data) => {
      // Bold total row
      if (data.row.index === tableBody.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [241, 245, 249];
      }
    },
  });

  // --- Add Page Numbering & Legal Disclaimer Footer on all pages ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...secondaryColor);
    doc.text(
      'Disclaimer: This simulation is provided for informational and financial planning purposes only. Actual interest rates, bank eligibility, and amortization may vary according to official lending institution policies.',
      margin,
      pageHeight - 20,
      { maxWidth: contentWidth - 80 }
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 50, pageHeight - 20);
  }

  // Trigger file download
  const cleanName = (borrowerName || 'Loan').replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Repayment_Plan_${cleanName}_${Date.now()}.pdf`);
}
