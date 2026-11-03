import {
  Scale,
  ShieldCheck,
  Calculator,
  TrendingDown,
  AlertTriangle,
  Sliders,
  FileText,
  Lightbulb,
  ArrowRight,
  Zap,
  BarChart3,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui';
import type { PageId } from '@/components/Navbar';

const features = [
  {
    icon: Calculator,
    title: 'Financial Assessment',
    desc: 'Enter your income, EMIs, BNPL dues and savings to get a complete financial picture.',
    page: 'assessment' as PageId,
  },
  {
    icon: BarChart3,
    title: 'Obligation Dashboard',
    desc: 'See all your monthly commitments in one place with interactive charts.',
    page: 'dashboard' as PageId,
  },
  {
    icon: ShieldCheck,
    title: 'Smart Affordability',
    desc: 'Rule-based analysis that classifies your borrowing capacity as SAFE, STRETCH or HIGH RISK.',
    page: 'affordability' as PageId,
  },
  {
    icon: TrendingDown,
    title: 'Loan Comparison',
    desc: 'Compare three loan options side by side with dynamically calculated EMIs and total costs.',
    page: 'comparison' as PageId,
  },
  {
    icon: AlertTriangle,
    title: 'Emergency Mode',
    desc: 'Facing an emergency? Compare four scenarios before you borrow a single rupee.',
    page: 'emergency' as PageId,
  },
  {
    icon: Sliders,
    title: 'What-If Simulator',
    desc: 'Change borrowing amount, interest rate, or income and see the impact in real time.',
    page: 'simulator' as PageId,
  },
  {
    icon: Zap,
    title: 'Hidden Cost Detector',
    desc: 'See the true cost of borrowing — interest, processing fees, and extra charges revealed.',
    page: 'hidden-cost' as PageId,
  },
  {
    icon: Lightbulb,
    title: 'Explain My Decision',
    desc: 'Plain-language explanations generated from your actual financial details.',
    page: 'explain' as PageId,
  },
  {
    icon: FileText,
    title: 'Final Decision Report',
    desc: 'A complete summary with a downloadable PDF report for your records.',
    page: 'final' as PageId,
  },
];

const steps = [
  { num: '01', title: 'Assess Your Finances', desc: 'Enter your income, existing EMIs, BNPL and credit card dues.' },
  { num: '02', title: 'Analyze Affordability', desc: 'See exactly how much room you have for new credit.' },
  { num: '03', title: 'Compare Options', desc: 'Evaluate loans, emergency scenarios and what-if changes.' },
  { num: '04', title: 'Decide with Clarity', desc: 'Download your report and make an informed choice.' },
];

export function LandingPage({
  onNavigate,
}: {
  onNavigate: (page: PageId) => void;
}) {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
          <div className="absolute -right-40 top-40 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />
          <div className="absolute left-1/2 top-80 h-64 w-64 -translate-x-1/2 rounded-full bg-orange-500/5 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-24 sm:px-6 sm:pt-28 sm:pb-32">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-1.5">
              <Scale className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-400">
                FinTel Squad · New Horizon College of Engineering
              </span>
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl">
              DECISION{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                DESK
              </span>
            </h1>

            <p className="mt-4 text-lg font-medium text-cyan-400 sm:text-xl">
              Think Before You Borrow.
            </p>

            <p className="mx-auto mt-6 max-w-2xl text-2xl font-bold text-white sm:text-3xl">
              Credit takes seconds. Clarity takes months.
            </p>

            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-400 sm:text-lg">
              Understand your financial situation, compare borrowing options and
              make informed decisions before committing to credit.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" onClick={() => onNavigate('assessment')}>
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() =>
                  document
                    .getElementById('features')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                Explore Features
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => onNavigate('simulator')}
              >
                Try Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-white/5 bg-white/[0.02] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold text-white">
            How It Works
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-slate-400">
            Four simple steps from financial uncertainty to a clear, informed
            decision.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.num}
                className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:border-cyan-500/30 hover:bg-cyan-500/[0.03]"
              >
                <p className="text-4xl font-extrabold text-cyan-500/30">
                  {step.num}
                </p>
                <h3 className="mt-3 text-lg font-bold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">
              Everything You Need to Decide
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-400">
              Nine powerful tools working together to give you complete clarity
              before you borrow.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <button
                  key={feature.title}
                  onClick={() => onNavigate(feature.page)}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left transition-all duration-300 hover:border-cyan-500/30 hover:bg-white/[0.05] hover:shadow-[0_0_30px_-8px_rgba(34,211,238,0.2)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">{feature.desc}</p>
                  <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-cyan-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Open <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/5 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-600/5 p-10 sm:p-14">
            <Wallet className="mx-auto h-12 w-12 text-cyan-400" />
            <h2 className="mt-6 text-3xl font-bold text-white">
              Ready to Think Before You Borrow?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-slate-400">
              Start your financial assessment now and get a complete picture of
              your borrowing situation in minutes.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" onClick={() => onNavigate('assessment')}>
                Start Assessment
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => onNavigate('final')}
              >
                View Final Report
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-cyan-400" />
              <span className="font-bold text-white">DECISION DESK</span>
            </div>
            <p className="text-sm text-slate-500">
              FinTel Squad · New Horizon College of Engineering
            </p>
          </div>
          <p className="mt-4 text-center text-xs text-slate-600 sm:text-left">
            DECISION DESK is an educational prototype. All calculations are
            illustrative and do not constitute financial advice or official bank
            lending decisions.
          </p>
        </div>
      </footer>
    </div>
  );
}
