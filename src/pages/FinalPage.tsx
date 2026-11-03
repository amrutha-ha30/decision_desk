import { useMemo } from 'react';
import {
  FileText,
  Download,
  RefreshCw,
  GitCompare,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { useFinancial } from '@/context/FinancialContext';
import { Button, GlassCard, SectionHeader, StatCard } from '@/components/ui';
import { StatusBadge } from '@/components/StatusBadge';
import {
  calculateAffordability,
  calculateHealthScore,
  estimateNewEMI,
  generateScenarios,
  generateExplanation,
  formatCurrency,
  formatPercent,
} from '@/lib/calculations';
import { generateReportPDF } from '@/lib/pdf';
import type { PageId } from '@/components/Navbar';

export function FinalPage({
  onNavigate,
}: {
  onNavigate: (page: PageId) => void;
}) {
  const { input, thresholds, saveAssessment } = useFinancial();

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

  const scenarios = useMemo(
    () => generateScenarios(input, thresholds),
    [input, thresholds],
  );

  const explanations = useMemo(
    () => generateExplanation(input, affordability),
    [input, affordability],
  );

  const risks = useMemo(() => {
    const list: { label: string; level: 'low' | 'medium' | 'high' }[] = [];
    if (affordability.projectedObligationRatio > thresholds.stretchMax) {
      list.push({ label: 'Projected obligations exceed safe limits', level: 'high' });
    }
    if (input.availableSavings < input.monthlyIncome) {
      list.push({ label: 'Insufficient savings buffer', level: 'medium' });
    }
    if (affordability.remainingAfterNewEMI < input.monthlyIncome * 0.3) {
      list.push({ label: 'Low remaining income after EMI', level: 'high' });
    }
    if (affordability.existingObligationRatio > 40) {
      list.push({ label: 'High existing obligation ratio', level: 'medium' });
    }
    if (list.length === 0) {
      list.push({ label: 'No major risks detected at current levels', level: 'low' });
    }
    return list;
  }, [affordability, input, thresholds]);

  const handleDownload = () => {
    generateReportPDF(input, affordability, health, scenarios, explanations);
    saveAssessment({
      id: `a${Date.now()}`,
      timestamp: Date.now(),
      input,
      affordability,
      healthScore: health.score,
      status: affordability.status,
    });
  };

  const handleRecalculate = () => {
    onNavigate('assessment');
  };

  const riskIcon = (level: 'low' | 'medium' | 'high') => {
    if (level === 'low') return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    if (level === 'medium') return <ShieldAlert className="h-4 w-4 text-amber-400" />;
    return <AlertTriangle className="h-4 w-4 text-red-400" />;
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <SectionHeader
        icon={<FileText className="h-5 w-5" />}
        title="Final Decision Dashboard"
        subtitle="Your complete financial summary with risks, alternatives, and a downloadable report."
      />

      {/* Status banner */}
      <GlassCard glow className="mb-6 p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="27" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
                <circle
                  cx="32"
                  cy="32"
                  r="27"
                  fill="none"
                  stroke={health.score >= 55 ? '#10b981' : health.score >= 35 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="5"
                  strokeDasharray={`${(health.score / 100) * 169.6} 169.6`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-lg font-bold text-white">{health.score}</span>
            </div>
            <div>
              <p className="text-sm text-slate-400">Financial Health Score</p>
              <p className="text-lg font-bold text-white">{health.rating}</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-400">Affordability Status</p>
            <div className="mt-2">
              <StatusBadge status={affordability.status} size="lg" />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Monthly Income" value={formatCurrency(input.monthlyIncome)} accent="cyan" />
        <StatCard label="Existing Commitments" value={formatCurrency(affordability.totalExistingObligations)} accent="orange" />
        <StatCard label="Remaining Income" value={formatCurrency(affordability.remainingIncome)} accent="emerald" />
        <StatCard label="Requested Borrowing" value={formatCurrency(input.emergencyAmount)} accent="slate" />
        <StatCard label="Estimated New EMI" value={formatCurrency(affordability.newEMI)} accent="cyan" />
        <StatCard label="Projected Obligation Ratio" value={formatPercent(affordability.projectedObligationRatio)} accent="slate" />
        <StatCard
          label="Total Borrowing Cost"
          value={formatCurrency(affordability.newEMI * input.repaymentDuration)}
          sublabel={`Over ${input.repaymentDuration} months`}
          accent="orange"
        />
        <StatCard
          label="Remaining After EMI"
          value={formatCurrency(affordability.remainingAfterNewEMI)}
          accent={affordability.remainingAfterNewEMI >= 0 ? 'emerald' : 'red'}
        />
        <StatCard label="Available Savings" value={formatCurrency(input.availableSavings)} accent="slate" />
      </div>

      {/* Risks and alternatives */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Risks */}
        <GlassCard className="p-6">
          <h3 className="mb-4 text-lg font-bold text-white">Financial Risks</h3>
          <div className="space-y-3">
            {risks.map((risk, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3">
                {riskIcon(risk.level)}
                <span className="text-sm text-slate-300">{risk.label}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Alternative scenarios summary */}
        <GlassCard className="p-6">
          <h3 className="mb-4 text-lg font-bold text-white">Alternative Scenarios</h3>
          <div className="space-y-3">
            {scenarios.map((s, i) => (
              <div key={i} className="rounded-xl bg-white/[0.03] p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{s.label}</span>
                  <StatusBadge status={s.status} size="sm" />
                </div>
                <div className="mt-2 flex gap-4 text-xs text-slate-400">
                  <span>EMI: {s.monthlyEMI > 0 ? formatCurrency(s.monthlyEMI) : '₹0'}</span>
                  <span>Interest: {formatCurrency(s.totalInterest)}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Action buttons */}
      <GlassCard className="mt-6 p-6">
        <h3 className="mb-4 text-center text-lg font-bold text-white">
          Take Action
        </h3>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" onClick={handleRecalculate}>
            <RefreshCw className="h-4 w-4" />
            Recalculate My Decision
          </Button>
          <Button size="lg" variant="secondary" onClick={() => onNavigate('emergency')}>
            <GitCompare className="h-4 w-4" />
            Compare Scenarios
          </Button>
          <Button size="lg" onClick={handleDownload}>
            <Download className="h-4 w-4" />
            Download My Financial Report
          </Button>
        </div>
      </GlassCard>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-center text-xs text-slate-500">
        Downloading the report also saves your assessment to History. All calculations are illustrative and do not constitute financial advice or official bank lending decisions.
      </div>

      <div className="mt-6 flex justify-center">
        <Button size="md" variant="ghost" onClick={() => onNavigate('history')}>
          View Assessment History
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
