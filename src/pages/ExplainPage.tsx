import { useMemo } from 'react';
import { Lightbulb, ArrowRight, TrendingUp } from 'lucide-react';
import { useFinancial } from '@/context/FinancialContext';
import { Button, GlassCard, SectionHeader, StatCard } from '@/components/ui';
import { StatusBadge } from '@/components/StatusBadge';
import {
  calculateAffordability,
  calculateHealthScore,
  estimateNewEMI,
  generateExplanation,
  formatCurrency,
  formatPercent,
} from '@/lib/calculations';
import type { PageId } from '@/components/Navbar';

export function ExplainPage({
  onNavigate,
}: {
  onNavigate: (page: PageId) => void;
}) {
  const { input, thresholds } = useFinancial();

  const newEMI = useMemo(
    () => estimateNewEMI(input.emergencyAmount, input.repaymentDuration),
    [input.emergencyAmount, input.repaymentDuration],
  );

  const affordability = useMemo(
    () => calculateAffordability(input, newEMI, thresholds),
    [input, newEMI, thresholds],
  );

  const health = useMemo(
    () => calculateHealthScore(input, affordability),
    [input, affordability],
  );

  const explanations = useMemo(
    () => generateExplanation(input, affordability),
    [input, affordability],
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <SectionHeader
        icon={<Lightbulb className="h-5 w-5" />}
        title="Explain My Decision"
        subtitle="A plain-language explanation of your financial situation, generated from your actual details."
      />

      {/* Health score */}
      <GlassCard className="mb-6 p-6" glow>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  stroke={health.score >= 55 ? '#10b981' : health.score >= 35 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="6"
                  strokeDasharray={`${(health.score / 100) * 213.6} 213.6`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-2xl font-bold text-white">
                {health.score}
              </span>
            </div>
            <div>
              <p className="text-sm text-slate-400">Financial Health Score</p>
              <p className="text-xl font-bold text-white">{health.rating}</p>
            </div>
          </div>
          <StatusBadge status={affordability.status} size="lg" />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {health.factors.map((f) => (
            <div key={f.label} className="rounded-xl bg-white/[0.03] p-3">
              <p className="text-xs text-slate-500">{f.label}</p>
              <p className={`mt-1 text-sm font-semibold ${f.positive ? 'text-emerald-400' : 'text-amber-400'}`}>
                {f.value}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Key metrics */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Monthly Income" value={formatCurrency(input.monthlyIncome)} accent="cyan" />
        <StatCard label="Existing Obligations" value={formatCurrency(affordability.totalExistingObligations)} accent="orange" />
        <StatCard label="Remaining Income" value={formatCurrency(affordability.remainingIncome)} accent="emerald" />
        <StatCard label="Projected Ratio" value={formatPercent(affordability.projectedObligationRatio)} accent="slate" />
      </div>

      {/* Smart alert */}
      {affordability.projectedObligationRatio > thresholds.stretchMax && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <TrendingUp className="mt-0.5 h-4 w-4 shrink-0" />
          Smart Alert: Your projected obligations ({formatPercent(affordability.projectedObligationRatio)}) exceed the {thresholds.stretchMax}% affordability threshold. Borrowing now is classified as HIGH RISK.
        </div>
      )}

      {/* Explanations */}
      <div className="space-y-4">
        {explanations.map((text, i) => (
          <GlassCard key={i} className="p-5">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-sm font-bold text-cyan-400">
                {i + 1}
              </div>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
                {text}
              </p>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs text-slate-500">
        These explanations are generated from your entered financial details using rule-based logic. They are educational and do not constitute financial advice.
      </div>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button size="lg" onClick={() => onNavigate('final')}>
          Final Decision Report
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button size="lg" variant="secondary" onClick={() => onNavigate('assessment')}>
          Update Assessment
        </Button>
      </div>
    </div>
  );
}
