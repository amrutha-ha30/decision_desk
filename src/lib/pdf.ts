import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type {
  FinancialInput,
  AffordabilityResult,
  HealthScoreResult,
  ScenarioResult,
} from '@/lib/types';
import { formatCurrency, formatPercent } from '@/lib/calculations';

export function generateReportPDF(
  input: FinancialInput,
  affordability: AffordabilityResult,
  health: HealthScoreResult,
  scenarios: ScenarioResult[],
  explanations: string[],
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setTextColor(6, 182, 212);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('DECISION DESK', 14, 18);
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Think Before You Borrow', 14, 25);
  doc.text('FinTel Squad · New Horizon College of Engineering', 14, 30);

  doc.setTextColor(30, 30, 30);
  y = 45;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Financial Decision Report', 14, y);
  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, y);
  y += 10;

  // Financial Summary table
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Financial Summary', 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Value']],
    body: [
      ['Monthly Income', formatCurrency(input.monthlyIncome)],
      ['Existing EMI', formatCurrency(input.existingEMI)],
      ['BNPL Payments', formatCurrency(input.bnplPayments)],
      ['Credit Card Payments', formatCurrency(input.creditCardPayments)],
      ['Total Existing Obligations', formatCurrency(affordability.totalExistingObligations)],
      ['Remaining Income', formatCurrency(affordability.remainingIncome)],
      ['Requested Borrowing Amount', formatCurrency(input.emergencyAmount)],
      ['Estimated New EMI', formatCurrency(affordability.newEMI)],
      ['Projected Obligation Ratio', formatPercent(affordability.projectedObligationRatio)],
      ['Total Borrowing Cost', formatCurrency(affordability.newEMI * input.repaymentDuration)],
    ],
    theme: 'striped',
    headStyles: { fillColor: [6, 182, 212], textColor: 255 },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // Affordability
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Affordability Analysis', 14, y);
  y += 4;

  const statusColor: Record<string, [number, number, number]> = {
    SAFE: [16, 185, 129],
    STRETCH: [245, 158, 11],
    'HIGH RISK': [239, 68, 68],
  };
  const [r, g, b] = statusColor[affordability.status];

  autoTable(doc, {
    startY: y,
    head: [['Indicator', 'Result']],
    body: [
      ['Affordability Status', affordability.status],
      ['Existing Obligation Ratio', formatPercent(affordability.existingObligationRatio)],
      ['Projected Obligation Ratio', formatPercent(affordability.projectedObligationRatio)],
      ['Remaining After New EMI', formatCurrency(affordability.remainingAfterNewEMI)],
      ['Financial Health Score', `${health.score}/100 (${health.rating})`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [6, 182, 212], textColor: 255 },
    styles: { fontSize: 9, cellPadding: 3 },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 1 && data.row.index === 0) {
        data.cell.styles.textColor = [r, g, b];
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // Scenarios
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Emergency Scenario Comparison', 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [['Scenario', 'Borrow', 'EMI', 'Total Interest', 'Status']],
    body: scenarios.map((s) => [
      s.label,
      s.borrowAmount > 0 ? formatCurrency(s.borrowAmount) : '₹0',
      s.monthlyEMI > 0 ? formatCurrency(s.monthlyEMI) : '₹0',
      formatCurrency(s.totalInterest),
      s.status,
    ]),
    theme: 'striped',
    headStyles: { fillColor: [249, 115, 22], textColor: 255 },
    styles: { fontSize: 8, cellPadding: 3 },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // Health factors
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('4. Health Score Factors', 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [['Factor', 'Value', 'Impact']],
    body: health.factors.map((f) => [
      f.label,
      f.value,
      f.positive ? 'Positive' : 'Negative',
    ]),
    theme: 'striped',
    headStyles: { fillColor: [6, 182, 212], textColor: 255 },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // Explanations
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('5. Decision Explanation', 14, y);
  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  explanations.forEach((text) => {
    const lines = doc.splitTextToSize(text, pageWidth - 28);
    if (y + lines.length * 5 > 280) {
      doc.addPage();
      y = 20;
    }
    doc.text(lines, 14, y);
    y += lines.length * 5 + 4;
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      'DECISION DESK — Educational prototype. Not financial advice or an official bank lending decision.',
      14,
      doc.internal.pageSize.getHeight() - 8,
    );
    doc.text(`Page ${i}/${pageCount}`, pageWidth - 30, doc.internal.pageSize.getHeight() - 8);
  }

  doc.save('decision-desk-report.pdf');
}
