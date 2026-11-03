import { History, Trash2, ArrowRight, Calendar } from 'lucide-react';
import { useFinancial } from '@/context/FinancialContext';
import { Button, GlassCard, SectionHeader } from '@/components/ui';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCurrency } from '@/lib/calculations';
import type { PageId } from '@/components/Navbar';

export function HistoryPage({
  onNavigate,
}: {
  onNavigate: (page: PageId) => void;
}) {
  const { history, clearHistory } = useFinancial();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <SectionHeader
        icon={<History className="h-5 w-5" />}
        title="Assessment History"
        subtitle="Previously saved calculations so you can track how your financial situation changes over time."
      />

      {history.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <History className="mx-auto h-12 w-12 text-slate-600" />
          <p className="mt-4 text-lg font-medium text-slate-400">
            No saved assessments yet
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Generate a report from the Final Decision page to save your first assessment.
          </p>
          <Button className="mt-6" onClick={() => onNavigate('final')}>
            Go to Final Decision
            <ArrowRight className="h-4 w-4" />
          </Button>
        </GlassCard>
      ) : (
        <>
          <div className="mb-4 flex justify-end">
            <Button size="sm" variant="danger" onClick={clearHistory}>
              <Trash2 className="h-4 w-4" />
              Clear History
            </Button>
          </div>

          <div className="space-y-4">
            {history.map((record) => (
              <GlassCard key={record.id} className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {new Date(record.timestamp).toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-slate-500">
                        Income: {formatCurrency(record.input.monthlyIncome)} ·
                        Borrowing: {formatCurrency(record.input.emergencyAmount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Health Score</p>
                      <p className="text-lg font-bold text-cyan-400">
                        {record.healthScore}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Projected Ratio</p>
                      <p className="text-sm font-medium text-white">
                        {record.affordability.projectedObligationRatio.toFixed(1)}%
                      </p>
                    </div>
                    <StatusBadge status={record.status} size="sm" />
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </>
      )}

      <div className="mt-8 flex justify-center">
        <Button variant="ghost" onClick={() => onNavigate('final')}>
          Back to Final Decision
        </Button>
      </div>
    </div>
  );
}
