import { useState } from 'react';
import { Menu, X, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PageId =
  | 'landing'
  | 'assessment'
  | 'dashboard'
  | 'affordability'
  | 'comparison'
  | 'emergency'
  | 'simulator'
  | 'hidden-cost'
  | 'explain'
  | 'final'
  | 'history'
  | 'awareness';

interface NavItem {
  id: PageId;
  label: string;
}

const navItems: NavItem[] = [
  { id: 'assessment', label: 'Assessment' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'affordability', label: 'Affordability' },
  { id: 'comparison', label: 'Loan Compare' },
  { id: 'emergency', label: 'Emergency' },
  { id: 'simulator', label: 'What-If' },
  { id: 'hidden-cost', label: 'Hidden Cost' },
  { id: 'explain', label: 'Explain' },
  { id: 'final', label: 'Final Decision' },
  { id: 'history', label: 'History' },
  { id: 'awareness', label: 'Awareness' },
];

export function Navbar({
  current,
  onNavigate,
}: {
  current: PageId;
  onNavigate: (page: PageId) => void;
}) {
  const [open, setOpen] = useState(false);

  const go = (page: PageId) => {
    onNavigate(page);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <button
          onClick={() => go('landing')}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
            <Scale className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold leading-tight text-white">
              DECISION DESK
            </p>
            <p className="text-[10px] leading-tight text-cyan-400">
              Think Before You Borrow
            </p>
          </div>
        </button>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => go(item.id)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200',
                current === item.id
                  ? 'bg-cyan-500/15 text-cyan-400'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white',
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-slate-950/95 px-4 py-3 lg:hidden">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-all',
                  current === item.id
                    ? 'bg-cyan-500/15 text-cyan-400'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
