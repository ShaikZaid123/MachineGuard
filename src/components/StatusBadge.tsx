import type { MachineStatus } from '@/services/types';

const STYLES: Record<MachineStatus, { dot: string; text: string; bg: string; border: string }> = {
  Healthy: {
    dot: 'bg-emerald-500',
    text: 'text-emerald-300',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  Warning: {
    dot: 'bg-amber-500',
    text: 'text-amber-300',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  Critical: {
    dot: 'bg-red-500',
    text: 'text-red-300',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
  },
};

export function StatusBadge({
  status,
  size = 'md',
}: {
  status: MachineStatus;
  size?: 'sm' | 'md';
}) {
  const s = STYLES[status];
  const pad = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${s.bg} ${s.border} ${s.text} ${pad} font-medium`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot} ${status !== 'Healthy' ? 'animate-pulse' : ''}`} />
      {status}
    </span>
  );
}

export { STYLES as STATUS_STYLES };
