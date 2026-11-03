import { useMemo, useState } from 'react';
import { Zap, AlertTriangle, ArrowRight, Plus, Trash2 } from 'lucide-react';
import { useFinancial } from '@/context/FinancialContext';
import { Button, GlassCard, NumberInput, SectionHeader } from '@/components/ui';
import { calculateEMI, formatCurrency } from '@/lib/calculations';
import type { PageId } from '@/components/Navbar';

interface CostBreakdown {
  id: string;
  label: string;
  principal: number;
  interestRate: number;
  duration: number;
  processingFee: number;
  additionalCharges: number;
}

export function HiddenCostPage({
  onNavigate,
}: {
  onNavigate: (page: PageId) => void;
}) {
  const { input } = useFinancial();

  const [items, setItems] = useState<CostBreakdown[]>([
    {
      id: 'c1',
      label: 'Personal Loan',
      principal: input.emergencyAmount || 100000,
      interestRate: 14,
      duration: 24,
      processingFee: 2000,
      additionalCharges: 500,
    },
    {
      id: 'c2',
      label: 'Credit Card EMI',
      principal: input.emergencyAmount || 100000,
      interestRate: 24,
      duration: 12,
      processingFee: 0,
      additionalCharges: 1500,
    },
  ]);

  const results = useMemo(
    () =>
      items.map((item) => {
        const emi = calculateEMI(item.principal, item.interestRate, item.duration);
        const totalRepayment = emi * item.duration;
        const totalInterest = totalRepayment - item.principal;
        const totalCost = totalRepayment + item.processingFee + item.additionalCharges;
        const extraCost = totalInterest + item.processingFee + item.additionalCharges;
        const extraPercent = item.principal > 0 ? (extraCost / item.principal) * 100 : 0;
        return { ...item, emi, totalRepayment, totalInterest, totalCost, extraCost, extraPercent };
      }),
    [items],
  );

  const update = (id: string, patch: Partial<CostBreakdown>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };

  const add = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `c${Date.now()}`,
        label: `Option ${prev.length + 1}`,
        principal: 50000,
        interestRate: 15,
        duration: 12,
        processingFee: 1000,
        additionalCharges: 0,
      },
    ]);
  };

  const remove = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <SectionHeader
        icon={<Zap className="h-5 w-5" />}
        title="Hidden Cost Detector"
        subtitle="See the true cost of borrowing. Interest, processing fees, and extra charges — all revealed."
      />

      <div className="mb-4 flex justify-end">
        <Button size="sm" variant="ghost" onClick={add}>
          <Plus className="h-4 w-4" />
          Add Comparison
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {results.map((r) => {
          const showWarning = r.extraPercent > 30;
          return (
            <GlassCard key={r.id} className="p-5" glow={showWarning}>
              <div className="mb-4 flex items-start justify-between">
                <input
                  type="text"
                  value={r.label}
                  onChange={(e) => update(r.id, { label: e.target.value })}
                  className="rounded-lg bg-transparent text-lg font-bold text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                />
                <button
                  onClick={() => remove(r.id)}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <NumberInput
                  label="Principal"
                  value={r.principal}
                  onChange={(v) => update(r.id, { principal: v })}
                  prefix="₹"
                  min={0}
                  step={1000}
                />
                <NumberInput
                  label="Interest Rate"
                  value={r.interestRate}
                  onChange={(v) => update(r.id, { interestRate: v })}
                  suffix="%"
                  min={0}
                  max={100}
                  step={0.5}
                />
                <NumberInput
                  label="Duration"
                  value={r.duration}
                  onChange={(v) => update(r.id, { duration: v })}
                  suffix="months"
                  min={1}
                  max={120}
                />
                <NumberInput
                  label="Processing Fee"
                  value={r.processingFee}
                  onChange={(v) => update(r.id, { processingFee: v })}
                  prefix="₹"
                  min={0}
                />
                <NumberInput
                  label="Additional Charges"
                  value={r.additionalCharges}
                  onChange={(v) => update(r.id, { additionalCharges: v })}
                  prefix="₹"
                  min={0}
                />
              </div>

              {/* Breakdown */}
              <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
                <CostRow label="Principal Amount" value={formatCurrency(r.principal)} color="text-white" />
                <CostRow label="Interest Amount" value={formatCurrency(r.totalInterest)} color="text-amber-400" />
                <CostRow label="Processing Fee" value={formatCurrency(r.processingFee)} color="text-orange-400" />
                <CostRow label="Additional Charges" value={formatCurrency(r.additionalCharges)} color="text-orange-400" />
                <div className="flex items-center justify-between border-t border-white/10 pt-2">
                  <span className="text-sm font-bold text-white">Total Repayment</span>
                  <span className="text-lg font-bold text-orange-400">
                    {formatCurrency(r.totalCost)}
                  </span>
                </div>
              </div>

              {/* Extra cost highlight */}
              <div className="mt-4 rounded-xl bg-white/[0.03] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">
                    Extra cost over principal
                  </span>
                  <span className="text-lg font-bold text-orange-400">
                    {formatCurrency(r.extraCost)} ({r.extraPercent.toFixed(1)}%)
                  </span>
                </div>

                {/* Visual bar */}
                <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    style={{
                      width: `${Math.min(100, (r.principal / r.totalCost) * 100)}%`,
                    }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-xs">
                  <span className="text-cyan-400">
                    Principal {((r.principal / r.totalCost) * 100).toFixed(0)}%
                  </span>
                  <span className="text-orange-400">
                    Extra {((r.extraCost / r.totalCost) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {showWarning && (
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  Warning: The total borrowing cost is {r.extraPercent.toFixed(0)}% higher than the principal. You are paying significantly more than you borrow.
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button size="lg" onClick={() => onNavigate('explain')}>
          Explain My Decision
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button size="lg" variant="secondary" onClick={() => onNavigate('final')}>
          Final Decision Report
        </Button>
      </div>
    </div>
  );
}

function CostRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-400">{label}</span>
      <span className={`font-medium ${color}`}>{value}</span>
    </div>
  );
}
