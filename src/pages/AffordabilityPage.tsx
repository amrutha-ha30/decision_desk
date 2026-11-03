import { useMemo, useState } from 'react';
import { ShieldCheck, ArrowRight, Settings2, AlertTriangle } from 'lucide-react';
import { useFinancial } from '@/context/FinancialContext';
import {
  Button,
  GlassCard,
  NumberInput,
  SectionHeader,
  StatCard,
} from '@/components/ui';
import { StatusBadge } from '@/components/StatusBadge';
import {
  calculateAffordability,
  estimateNewEMI,
  formatCurrency,
  formatPercent,
} from '@/lib/calculations';
import type { PageId } from '@/components/Navbar';

export function AffordabilityPage({
  onNavigate,
}: {
  onNavigate: (page: PageId) => void;
}) {
  const { input, thresholds, setThresholds } = useFinancial();
  const [showSettings, setShowSettings] = useState(false);

  const newEMI = useMemo(
    () => estimateNewEMI(input.emergencyAmount, input.repaymentDuration),
    [input.emergencyAmount, input.repaymentDuration],
  );

  const result = useMemo(
    () => calculateAffordability(input, newEMI, thresholds),
    [input, newEMI, thresholds],
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <SectionHeader
        icon={<ShieldCheck className="h-5 w-5" />}
        title="Smart Affordability Analysis"
        subtitle="A rule-based analysis of your borrowing capacity based on your current financial commitments."
      />

      {/* Status banner */}
      <GlassCard
        glow={result.status === 'HIGH RISK'}
        className="mb-6 overflow-hidden p-6"
      >
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div>
            <p className="text-sm text-slate-400">Your Affordability Status</p>
            <div className="mt-2">
              <StatusBadge status={result.status} size="lg" />
            </div>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-sm text-slate-400">Projected Obligation Ratio</p>
            <p
              className={
                result.status === 'SAFE'
                  ? 'text-3xl font-bold text-emerald-400'
                  : result.status === 'STRETCH'
                    ? 'text-3xl font-bold text-amber-400'
                    : 'text-3xl font-bold text-red-400'
              }
            >
              {formatPercent(result.projectedObligationRatio)}
            </p>
          </div>
        </div>

        {result.status === 'HIGH RISK' && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            Your projected obligations would exceed {thresholds.stretchMax}% of your income. Consider borrowing a smaller amount or exploring non-credit alternatives.
          </div>
        )}
      </GlassCard>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Existing Obligations"
          value={formatCurrency(result.totalExistingObligations)}
          accent="orange"
        />
        <StatCard
          label="Existing Obligation Ratio"
          value={formatPercent(result.existingObligationRatio)}
          accent="slate"
        />
        <StatCard
          label="Remaining Income"
          value={formatCurrency(result.remainingIncome)}
          accent={result.remainingIncome >= 0 ? 'emerald' : 'red'}
        />
        <StatCard
          label="New Estimated EMI"
          value={formatCurrency(result.newEMI)}
          sublabel={`For ₹${input.emergencyAmount.toLocaleString('en-IN')} over ${input.repaymentDuration} months`}
          accent="cyan"
        />
        <StatCard
          label="Projected Obligations"
          value={formatCurrency(result.projectedObligations)}
          accent="orange"
        />
        <StatCard
          label="Remaining After New EMI"
          value={formatCurrency(result.remainingAfterNewEMI)}
          accent={result.remainingAfterNewEMI >= 0 ? 'emerald' : 'red'}
        />
      </div>

      {/* Threshold settings */}
      <GlassCard className="mt-6 p-6">
        <button
          onClick={() => setShowSettings((v) => !v)}
          className="flex w-full items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">
              Configurable Thresholds
            </h3>
          </div>
          <span className="text-sm text-slate-500">
            {showSettings ? 'Hide' : 'Show'}
          </span>
        </button>

        {showSettings && (
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <NumberInput
              label="SAFE limit (% of income)"
              value={thresholds.safeMax}
              onChange={(v) => setThresholds({ ...thresholds, safeMax: v })}
              suffix="%"
              min={0}
              max={100}
            />
            <NumberInput
              label="STRETCH limit (% of income)"
              value={thresholds.stretchMax}
              onChange={(v) => setThresholds({ ...thresholds, stretchMax: v })}
              suffix="%"
              min={0}
              max={100}
            />
            <div className="sm:col-span-2 rounded-xl bg-white/[0.03] p-4 text-sm text-slate-400">
              <p>
                <span className="font-semibold text-emerald-400">SAFE</span>:
                Projected ratio at or below {thresholds.safeMax}%.{' '}
                <span className="font-semibold text-amber-400">STRETCH</span>:
                Between {thresholds.safeMax}% and {thresholds.stretchMax}%.{' '}
                <span className="font-semibold text-red-400">HIGH RISK</span>:
                Above {thresholds.stretchMax}%.
              </p>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Disclaimer */}
      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs text-slate-500">
        These indicators are illustrative and based on configurable thresholds. They do not represent official bank lending decisions or guaranteed loan approval.
      </div>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button size="lg" onClick={() => onNavigate('comparison')}>
          Compare Loan Options
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button size="lg" variant="secondary" onClick={() => onNavigate('explain')}>
          Explain My Decision
        </Button>
      </div>
    </div>
  );
}
