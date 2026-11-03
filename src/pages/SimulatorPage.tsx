import { useMemo, useState } from 'react';
import { Sliders, ArrowRight, RotateCcw } from 'lucide-react';
import { useFinancial } from '@/context/FinancialContext';
import {
  Button,
  GlassCard,
  SectionHeader,
  Slider,
  StatCard,
} from '@/components/ui';
import { StatusBadge } from '@/components/StatusBadge';
import {
  calculateEMI,
  calculateAffordability,
  totalObligations,
  formatCurrency,
  formatPercent,
} from '@/lib/calculations';
import type { PageId } from '@/components/Navbar';

export function SimulatorPage({
  onNavigate,
}: {
  onNavigate: (page: PageId) => void;
}) {
  const { input, thresholds } = useFinancial();

  const [borrowAmount, setBorrowAmount] = useState(input.emergencyAmount);
  const [interestRate, setInterestRate] = useState(14);
  const [duration, setDuration] = useState(input.repaymentDuration);
  const [income, setIncome] = useState(input.monthlyIncome);
  const [obligations, setObligations] = useState(totalObligations(input));

  const emi = useMemo(
    () => calculateEMI(borrowAmount, interestRate, duration),
    [borrowAmount, interestRate, duration],
  );

  const totalRepayment = emi * duration;
  const totalInterest = totalRepayment - borrowAmount;

  const affordability = useMemo(
    () => {
      const simInput = {
        ...input,
        monthlyIncome: income,
        existingEMI: obligations,
        bnplPayments: 0,
        creditCardPayments: 0,
      };
      return calculateAffordability(simInput, emi, thresholds);
    },
    [income, obligations, emi, thresholds, input],
  );

  const remainingAfter = income - obligations - emi;

  const reset = () => {
    setBorrowAmount(input.emergencyAmount);
    setInterestRate(14);
    setDuration(input.repaymentDuration);
    setIncome(input.monthlyIncome);
    setObligations(totalObligations(input));
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <SectionHeader
        icon={<Sliders className="h-5 w-5" />}
        title="What-If Simulator"
        subtitle="Change any variable and instantly see how it affects your EMI, remaining income, and affordability."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Controls */}
        <GlassCard className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Adjust Variables</h3>
            <Button size="sm" variant="ghost" onClick={reset}>
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          </div>

          <div className="space-y-6">
            <Slider
              label="Borrowing Amount"
              value={borrowAmount}
              onChange={setBorrowAmount}
              min={0}
              max={500000}
              step={5000}
              displayValue={formatCurrency(borrowAmount)}
            />
            <Slider
              label="Interest Rate"
              value={interestRate}
              onChange={setInterestRate}
              min={0}
              max={36}
              step={0.5}
              displayValue={`${interestRate}%`}
            />
            <Slider
              label="Repayment Duration"
              value={duration}
              onChange={setDuration}
              min={1}
              max={84}
              step={1}
              displayValue={`${duration} months`}
            />
            <Slider
              label="Monthly Income"
              value={income}
              onChange={setIncome}
              min={10000}
              max={300000}
              step={1000}
              displayValue={formatCurrency(income)}
            />
            <Slider
              label="Existing Obligations"
              value={obligations}
              onChange={setObligations}
              min={0}
              max={150000}
              step={500}
              displayValue={formatCurrency(obligations)}
            />
          </div>
        </GlassCard>

        {/* Live results */}
        <div className="space-y-4">
          <GlassCard
            glow={affordability.status === 'SAFE'}
            className="p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Affordability Status</p>
                <div className="mt-2">
                  <StatusBadge status={affordability.status} size="lg" />
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Projected Ratio</p>
                <p
                  className={
                    affordability.status === 'SAFE'
                      ? 'text-3xl font-bold text-emerald-400'
                      : affordability.status === 'STRETCH'
                        ? 'text-3xl font-bold text-amber-400'
                        : 'text-3xl font-bold text-red-400'
                  }
                >
                  {formatPercent(affordability.projectedObligationRatio)}
                </p>
              </div>
            </div>
          </GlassCard>

          <div className="grid gap-3 sm:grid-cols-2">
            <StatCard label="Monthly EMI" value={formatCurrency(emi)} accent="cyan" />
            <StatCard
              label="Total Interest"
              value={formatCurrency(totalInterest)}
              accent="amber"
            />
            <StatCard
              label="Total Repayment"
              value={formatCurrency(totalRepayment)}
              accent="orange"
            />
            <StatCard
              label="Remaining Income"
              value={formatCurrency(remainingAfter)}
              accent={remainingAfter >= 0 ? 'emerald' : 'red'}
            />
          </div>

          {/* Visual bar */}
          <GlassCard className="p-5">
            <p className="mb-3 text-sm font-medium text-slate-300">
              Obligation Ratio Visualization
            </p>
            <div className="relative h-6 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                style={{ width: `${Math.min(100, affordability.existingObligationRatio)}%` }}
              />
              <div
                className="absolute top-0 h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300"
                style={{
                  left: `${Math.min(100, affordability.existingObligationRatio)}%`,
                  width: `${Math.min(100 - affordability.existingObligationRatio, (emi / income) * 100)}%`,
                }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-cyan-500" /> Existing
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-orange-500" /> New EMI
              </span>
              <span>{formatPercent(affordability.projectedObligationRatio)} total</span>
            </div>
          </GlassCard>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button size="lg" onClick={() => onNavigate('hidden-cost')}>
          Hidden Cost Detector
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button size="lg" variant="secondary" onClick={() => onNavigate('final')}>
          Final Decision Report
        </Button>
      </div>
    </div>
  );
}
