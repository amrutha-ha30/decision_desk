import type { AffordabilityStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

const statusStyles: Record<AffordabilityStatus, string> = {
  SAFE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  STRETCH: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'HIGH RISK': 'bg-red-500/15 text-red-400 border-red-500/30',
};

const statusDot: Record<AffordabilityStatus, string> = {
  SAFE: 'bg-emerald-400',
  STRETCH: 'bg-amber-400',
  'HIGH RISK': 'bg-red-400',
};

export function StatusBadge({
  status,
  size = 'md',
}: {
  status: AffordabilityStatus;
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border font-semibold tracking-wide',
        statusStyles[status],
        size === 'sm' && 'px-2.5 py-1 text-xs',
        size === 'md' && 'px-3 py-1.5 text-sm',
        size === 'lg' && 'px-4 py-2 text-base',
      )}
    >
      <span className={cn('h-2 w-2 rounded-full', statusDot[status])} />
      {status}
    </span>
  );
}
