import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Zap,
  Shield,
  PiggyBank,
  HandCoins,
  TrendingDown,
} from 'lucide-react';
import { useFinancial } from '@/context/FinancialContext';
import { Button, GlassCard, NumberInput, SectionHeader, SelectInput, StatCard } from '@/components/ui';
import { StatusBadge } from '@/components/StatusBadge';
import { generateScenarios, formatCurrency, formatPercent } from '@/lib/calculations';
import type { Urgency } from '@/lib/types';
import type { PageId } from '@/components/Navbar';

const urgencyOptions: { label: string; value: Urgency }[] = [
  { label: 'Immediately', value: 'Immediately' },
  { label: 'Within a week', value: 'Within a week' },
  { label: 'Within a month', value: 'Within a month' },
  { label: 'Flexible', value: 'Flexible' },
];

const scenarioIcons = [PiggyBank, TrendingDown, Zap, HandCoins];

export function EmergencyPage({
  onNavigate,
}: {
  onNavigate: (page: PageId) => void;
}) {
  const { input, setInput } = useFinancial();
  const [urgency, setUrgency] = useState<Urgency>('Within a week');
  const [reason, setReason] = useState(input.emergencyCategory);
  const [comfortableRepay, setComfortableRepay] = useState(
    Math.max(5000, Math.round(input.monthlyIncome * 0.2)),
  );

  const scenarios = useMemo(
    () => generateScenarios(input),
    [input],
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <SectionHeader
        icon={<AlertTriangle className="h-5 w-5" />}
        title="Emergency Mode"
        subtitle="Facing an Emergency? Make a Clear Financial Decision."
      />

      {/* Emergency inputs */}
      <GlassCard className="mb-6 p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <NumberInput
            label="How much money do you need?"
            value={input.emergencyAmount}
            onChange={(v) => setInput({ emergencyAmount: v })}
            prefix="₹"
            min={0}
            step={1000}
          />
          <SelectInput
            label="What is the reason?"
            value={reason}
            onChange={(v) => {
              setReason(v);
              setInput({ emergencyCategory: v as typeof input.emergencyCategory });
            }}
            options={[
              { label: 'Medical', value: 'Medical' },
              { label: 'Education', value: 'Education' },
              { label: 'Travel', value: 'Travel' },
              { label: 'Home Repair', value: 'Home Repair' },
              { label: 'Other', value: 'Other' },
            ]}
          />
          <SelectInput
            label="How urgently do you need it?"
            value={urgency}
            onChange={(v) => setUrgency(v as Urgency)}
            options={urgencyOptions}
          />
          <NumberInput
            label="How much savings do you have?"
            value={input.availableSavings}
            onChange={(v) => setInput({ availableSavings: v })}
            prefix="₹"
            min={0}
            step={1000}
          />
          <NumberInput
            label="How much can you comfortably repay monthly?"
            value={comfortableRepay}
            onChange={setComfortableRepay}
            prefix="₹"
            min={0}
            step={500}
          />
          <NumberInput
            label="Repayment Duration"
            value={input.repaymentDuration}
            onChange={(v) => setInput({ repaymentDuration: v })}
            suffix="months"
            min={1}
            max={120}
          />
        </div>
      </GlassCard>

      {/* Comfortable repayment check */}
      {scenarios.some((s) => s.monthlyEMI > comfortableRepay) && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
          <Shield className="mt-0.5 h-4 w-4 shrink-0" />
          Some borrowing scenarios exceed your comfortable monthly repayment of {formatCurrency(comfortableRepay)}. Consider a smaller amount or non-credit alternatives.
        </div>
      )}

      {/* Scenarios */}
      <h3 className="mb-4 text-xl font-bold text-white">
        Four Scenarios — Compare the Impact
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        {scenarios.map((scenario, i) => {
          const Icon = scenarioIcons[i] ?? HandCoins;
          const exceedsComfort = scenario.monthlyEMI > comfortableRepay;
          return (
            <GlassCard
              key={scenario.label}
              glow={scenario.recommended}
              className={`p-5 ${scenario.recommended ? 'border-cyan-500/30' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{scenario.label}</h4>
                    {scenario.recommended && (
                      <span className="text-xs font-semibold text-cyan-400">
                        Recommended approach
                      </span>
                    )}
                  </div>
                </div>
                <StatusBadge status={scenario.status} size="sm" />
              </div>

              <p className="mt-3 text-sm text-slate-400">
                {scenario.description}
              </p>

              <div className="mt-4 space-y-2 border-t border-white/10 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Borrow Amount</span>
                  <span className="font-medium text-white">
                    {scenario.borrowAmount > 0 ? formatCurrency(scenario.borrowAmount) : '₹0'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Monthly EMI</span>
                  <span className={exceedsComfort ? 'font-bold text-red-400' : 'font-bold text-cyan-400'}>
                    {scenario.monthlyEMI > 0 ? formatCurrency(scenario.monthlyEMI) : '₹0'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total Interest</span>
                  <span className="font-medium text-amber-400">
                    {scenario.totalInterest > 0 ? formatCurrency(scenario.totalInterest) : '₹0'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total Repayment</span>
                  <span className="font-medium text-slate-200">
                    {formatCurrency(scenario.totalRepayment)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Remaining Income</span>
                  <span className={scenario.remainingIncome >= 0 ? 'font-medium text-emerald-400' : 'font-medium text-red-400'}>
                    {formatCurrency(scenario.remainingIncome)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Projected Ratio</span>
                  <span className="font-medium text-slate-200">
                    {formatPercent(scenario.projectedObligationRatio)}
                  </span>
                </div>
              </div>

              {exceedsComfort && scenario.monthlyEMI > 0 && (
                <div className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
                  EMI exceeds your comfortable repayment of {formatCurrency(comfortableRepay)}.
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs text-slate-500">
        DECISION DESK does not automatically recommend borrowing. Always consider non-credit alternatives first, especially for emergencies.
      </div>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button size="lg" onClick={() => onNavigate('simulator')}>
          What-If Simulator
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button size="lg" variant="secondary" onClick={() => onNavigate('final')}>
          Final Decision Report
        </Button>
      </div>
    </div>
  );
}
