import { useMemo, useState } from 'react';
import { TrendingDown, ArrowRight, Plus, Trash2 } from 'lucide-react';
import { useFinancial } from '@/context/FinancialContext';
import { Button, GlassCard, NumberInput, SectionHeader } from '@/components/ui';
import { calculateLoan, formatCurrency } from '@/lib/calculations';
import type { LoanOption } from '@/lib/types';
import type { PageId } from '@/components/Navbar';

const defaultLoans: LoanOption[] = [
  {
    id: 'l1',
    name: 'Option A — Bank Personal Loan',
    lender: 'National Bank',
    loanAmount: 100000,
    annualInterestRate: 11.5,
    durationMonths: 24,
    processingFee: 2000,
    additionalCharges: 500,
  },
  {
    id: 'l2',
    name: 'Option B — NBFC Loan',
    lender: 'Quick Finance',
    loanAmount: 100000,
    annualInterestRate: 16,
    durationMonths: 18,
    processingFee: 1500,
    additionalCharges: 1000,
  },
  {
    id: 'l3',
    name: 'Option C — Digital Lender',
    lender: 'FinTech App',
    loanAmount: 100000,
    annualInterestRate: 20,
    durationMonths: 12,
    processingFee: 2500,
    additionalCharges: 750,
  },
];

export function ComparisonPage({
  onNavigate,
}: {
  onNavigate: (page: PageId) => void;
}) {
  const { input } = useFinancial();
  const [loans, setLoans] = useState<LoanOption[]>(defaultLoans);

  const calculations = useMemo(() => loans.map(calculateLoan), [loans]);

  const updateLoan = (id: string, patch: Partial<LoanOption>) => {
    setLoans((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    );
  };

  const addLoan = () => {
    setLoans((prev) => [
      ...prev,
      {
        id: `l${Date.now()}`,
        name: `Option ${String.fromCharCode(65 + prev.length)} — Custom`,
        lender: 'Custom',
        loanAmount: input.emergencyAmount || 50000,
        annualInterestRate: 15,
        durationMonths: 12,
        processingFee: 1000,
        additionalCharges: 0,
      },
    ]);
  };

  const removeLoan = (id: string) => {
    setLoans((prev) => prev.filter((l) => l.id !== id));
  };

  const cheapest = useMemo(() => {
    let min = Infinity;
    let idx = 0;
    calculations.forEach((c, i) => {
      if (c.totalCost < min) {
        min = c.totalCost;
        idx = i;
      }
    });
    return idx;
  }, [calculations]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <SectionHeader
        icon={<TrendingDown className="h-5 w-5" />}
        title="Loan Comparison System"
        subtitle="Compare loan options side by side. Change any field to see EMI and total cost update instantly."
      />

      <div className="mb-4 flex justify-end">
        <Button size="sm" variant="ghost" onClick={addLoan}>
          <Plus className="h-4 w-4" />
          Add Loan Option
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {loans.map((loan, i) => {
          const calc = calculations[i];
          const isCheapest = i === cheapest && loans.length > 1;
          return (
            <GlassCard
              key={loan.id}
              glow={isCheapest}
              className={`p-5 ${isCheapest ? 'border-cyan-500/30' : ''}`}
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white">{loan.name}</h3>
                  <p className="text-xs text-slate-500">{loan.lender}</p>
                </div>
                <button
                  onClick={() => removeLoan(loan.id)}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {isCheapest && (
                <div className="mb-3 rounded-lg bg-cyan-500/10 px-3 py-1 text-center text-xs font-semibold text-cyan-400">
                  Lowest Total Cost
                </div>
              )}

              <div className="space-y-3">
                <NumberInput
                  label="Loan Amount"
                  value={loan.loanAmount}
                  onChange={(v) => updateLoan(loan.id, { loanAmount: v })}
                  prefix="₹"
                  min={0}
                  step={1000}
                />
                <NumberInput
                  label="Interest Rate"
                  value={loan.annualInterestRate}
                  onChange={(v) => updateLoan(loan.id, { annualInterestRate: v })}
                  suffix="%"
                  min={0}
                  max={100}
                  step={0.5}
                />
                <NumberInput
                  label="Duration"
                  value={loan.durationMonths}
                  onChange={(v) => updateLoan(loan.id, { durationMonths: v })}
                  suffix="months"
                  min={1}
                  max={120}
                />
                <NumberInput
                  label="Processing Fee"
                  value={loan.processingFee}
                  onChange={(v) => updateLoan(loan.id, { processingFee: v })}
                  prefix="₹"
                  min={0}
                />
                <NumberInput
                  label="Additional Charges"
                  value={loan.additionalCharges}
                  onChange={(v) => updateLoan(loan.id, { additionalCharges: v })}
                  prefix="₹"
                  min={0}
                />
              </div>

              {/* Results */}
              <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
                <Row label="Monthly EMI" value={formatCurrency(calc.monthlyEMI)} highlight />
                <Row label="Total Interest" value={formatCurrency(calc.totalInterest)} />
                <Row label="Total Repayment" value={formatCurrency(calc.totalRepayment)} />
                <Row label="Processing Fee" value={formatCurrency(calc.processingFee)} />
                <Row label="Additional Charges" value={formatCurrency(calc.additionalCharges)} />
                <div className="flex items-center justify-between border-t border-white/10 pt-2">
                  <span className="text-sm font-semibold text-white">Total Cost</span>
                  <span className="text-lg font-bold text-orange-400">
                    {formatCurrency(calc.totalCost)}
                  </span>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button size="lg" onClick={() => onNavigate('emergency')}>
          Emergency Mode
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button size="lg" variant="secondary" onClick={() => onNavigate('simulator')}>
          What-If Simulator
        </Button>
        <Button size="lg" variant="ghost" onClick={() => onNavigate('hidden-cost')}>
          Hidden Cost Detector
        </Button>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-400">{label}</span>
      <span className={highlight ? 'font-bold text-cyan-400' : 'font-medium text-slate-200'}>
        {value}
      </span>
    </div>
  );
}
