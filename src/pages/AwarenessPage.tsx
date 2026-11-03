import { Lightbulb, BookOpen, TrendingDown, Percent, Receipt, ShieldCheck, PiggyBank, ArrowRight } from 'lucide-react';
import { Button, GlassCard, SectionHeader } from '@/components/ui';
import type { PageId } from '@/components/Navbar';

const tips = [
  {
    icon: Percent,
    title: 'Understanding EMI',
    body: 'EMI (Equated Monthly Installment) is your monthly loan repayment. It includes both principal and interest. A longer tenure lowers your EMI but increases the total interest you pay over time. Always check the total repayment, not just the monthly amount.',
  },
  {
    icon: TrendingDown,
    title: 'How Interest Works',
    body: 'Interest is the cost of borrowing money. The reducing-balance method calculates interest on the outstanding principal, so you pay more interest early in the loan and less later. Even a 1-2% difference in interest rate can save or cost you thousands over the loan term.',
  },
  {
    icon: Receipt,
    title: 'Hidden Charges to Watch For',
    body: 'Beyond interest, loans may include processing fees, GST on fees, prepayment penalties, late payment charges, and insurance premiums. Always ask for the all-inclusive cost. The advertised rate is rarely the effective rate you actually pay.',
  },
  {
    icon: ShieldCheck,
    title: 'The 40% Rule',
    body: 'A common guideline is that your total monthly debt obligations should not exceed 40% of your monthly income. This leaves enough room for living expenses, savings, and unexpected costs. Exceeding this ratio puts you at risk of a debt spiral.',
  },
  {
    icon: PiggyBank,
    title: 'Build an Emergency Fund',
    body: 'Aim to save 3-6 months of living expenses in an easily accessible account. This buffer lets you handle emergencies without resorting to high-interest credit. If you do not have an emergency fund, start small — even one month of savings is better than none.',
  },
  {
    icon: BookOpen,
    title: 'BNPL and Credit Card Traps',
    body: 'Buy Now Pay Later and credit card EMIs feel small but can add up quickly. Missing payments triggers high late fees and interest rates (often 24-36% annually). Track all your BNPL and credit card dues together to understand your true monthly burden.',
  },
];

export function AwarenessPage({
  onNavigate,
}: {
  onNavigate: (page: PageId) => void;
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <SectionHeader
        icon={<Lightbulb className="h-5 w-5" />}
        title="Financial Awareness"
        subtitle="Educational tips to help you understand EMI, interest, repayment, and hidden charges."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        {tips.map((tip) => {
          const Icon = tip.icon;
          return (
            <GlassCard key={tip.title} className="p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">{tip.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {tip.body}
              </p>
            </GlassCard>
          );
        })}
      </div>

      <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs text-slate-500">
        These tips are for educational purposes only and do not constitute financial advice. Always consult a qualified financial advisor before making borrowing decisions.
      </div>

      <div className="mt-6 flex justify-center">
        <Button onClick={() => onNavigate('assessment')}>
          Start Your Assessment
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
