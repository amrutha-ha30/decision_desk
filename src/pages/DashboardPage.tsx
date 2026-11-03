import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';
import { BarChart3, Pencil, ArrowRight, Wallet } from 'lucide-react';
import { useFinancial } from '@/context/FinancialContext';
import { Button, GlassCard, NumberInput, SectionHeader, StatCard } from '@/components/ui';
import { formatCurrency, totalObligations } from '@/lib/calculations';
import type { PageId } from '@/components/Navbar';

const PIE_COLORS = ['#06b6d4', '#3b82f6', '#f97316', '#10b981'];

export function DashboardPage({
  onNavigate,
}: {
  onNavigate: (page: PageId) => void;
}) {
  const { input, setInput } = useFinancial();

  const obligationData = useMemo(
    () => [
      { name: 'EMI', value: input.existingEMI },
      { name: 'BNPL', value: input.bnplPayments },
      { name: 'Credit Card', value: input.creditCardPayments },
      { name: 'Remaining', value: Math.max(0, input.monthlyIncome - totalObligations(input)) },
    ],
    [input],
  );

  const barData = useMemo(
    () => [
      { name: 'Income', value: input.monthlyIncome, fill: '#06b6d4' },
      { name: 'EMI', value: input.existingEMI, fill: '#3b82f6' },
      { name: 'BNPL', value: input.bnplPayments, fill: '#f97316' },
      { name: 'Credit Card', value: input.creditCardPayments, fill: '#ef4444' },
      { name: 'Savings', value: input.availableSavings, fill: '#10b981' },
    ],
    [input],
  );

  const total = totalObligations(input);
  const remaining = input.monthlyIncome - total;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <SectionHeader
        icon={<BarChart3 className="h-5 w-5" />}
        title="Financial Obligation Dashboard"
        subtitle="All your monthly commitments in one place. Edit any field to update calculations instantly."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Monthly Income" value={formatCurrency(input.monthlyIncome)} accent="cyan" />
        <StatCard label="Existing EMI" value={formatCurrency(input.existingEMI)} accent="slate" />
        <StatCard label="BNPL Dues" value={formatCurrency(input.bnplPayments)} accent="slate" />
        <StatCard label="Credit Card Dues" value={formatCurrency(input.creditCardPayments)} accent="slate" />
        <StatCard
          label="Total Monthly Obligations"
          value={formatCurrency(total)}
          accent="orange"
        />
        <StatCard
          label="Remaining Income"
          value={formatCurrency(remaining)}
          sublabel={remaining < 0 ? 'Over budget' : 'Available for new commitments'}
          accent={remaining >= 0 ? 'emerald' : 'red'}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Pie chart */}
        <GlassCard className="p-6">
          <h3 className="mb-4 text-lg font-bold text-white">
            Income Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={obligationData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={55}
                paddingAngle={3}
              >
                {obligationData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#0f172a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                }}
                formatter={(v) => formatCurrency(Number(v))}
              />
              <Legend
                wrapperStyle={{ fontSize: '13px', color: '#94a3b8' }}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Bar chart */}
        <GlassCard className="p-6">
          <h3 className="mb-4 text-lg font-bold text-white">
            Financial Overview
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: '#0f172a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                }}
                formatter={(v) => formatCurrency(Number(v))}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Edit panel */}
      <GlassCard className="mt-6 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Pencil className="h-4 w-4 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Edit Financial Details</h3>
          <span className="text-xs text-slate-500">— updates all calculations instantly</span>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <NumberInput
            label="Monthly Income"
            value={input.monthlyIncome}
            onChange={(v) => setInput({ monthlyIncome: v })}
            prefix="₹"
            min={0}
            step={1000}
          />
          <NumberInput
            label="Existing EMI"
            value={input.existingEMI}
            onChange={(v) => setInput({ existingEMI: v })}
            prefix="₹"
            min={0}
            step={500}
          />
          <NumberInput
            label="BNPL Payments"
            value={input.bnplPayments}
            onChange={(v) => setInput({ bnplPayments: v })}
            prefix="₹"
            min={0}
            step={500}
          />
          <NumberInput
            label="Credit Card Payments"
            value={input.creditCardPayments}
            onChange={(v) => setInput({ creditCardPayments: v })}
            prefix="₹"
            min={0}
            step={500}
          />
          <NumberInput
            label="Available Savings"
            value={input.availableSavings}
            onChange={(v) => setInput({ availableSavings: v })}
            prefix="₹"
            min={0}
            step={1000}
          />
          <NumberInput
            label="Emergency Amount"
            value={input.emergencyAmount}
            onChange={(v) => setInput({ emergencyAmount: v })}
            prefix="₹"
            min={0}
            step={1000}
          />
        </div>
      </GlassCard>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button size="lg" onClick={() => onNavigate('affordability')}>
          Analyze Affordability
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button size="lg" variant="secondary" onClick={() => onNavigate('comparison')}>
          Compare Loans
        </Button>
        <Button size="lg" variant="ghost" onClick={() => onNavigate('emergency')}>
          Emergency Mode
        </Button>
      </div>

      {remaining < 0 && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <Wallet className="h-4 w-4 shrink-0" />
          Your existing obligations exceed your monthly income. Consider reducing commitments before taking new credit.
        </div>
      )}
    </div>
  );
}
