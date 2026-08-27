import type { ReactNode } from 'react';

export function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  icon,
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between px-5 py-4 border-b border-slate-700/50">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-700/40 text-slate-300">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  accent = 'slate',
  sub,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  accent?: 'slate' | 'emerald' | 'amber' | 'red' | 'cyan';
  sub?: string;
}) {
  const accents: Record<string, string> = {
    slate: 'text-slate-300 bg-slate-700/40',
    emerald: 'text-emerald-300 bg-emerald-500/15',
    amber: 'text-amber-300 bg-amber-500/15',
    red: 'text-red-300 bg-red-500/15',
    cyan: 'text-cyan-300 bg-cyan-500/15',
  };
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
          {label}
        </span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${accents[accent]}`}>
          {icon}
        </div>
      </div>
      <div className="mt-3 text-3xl font-bold text-slate-100 tabular-nums">{value}</div>
      {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
    </Card>
  );
}

export function Gauge({
  value,
  max = 100,
  label,
  unit = '',
  color = 'cyan',
}: {
  value: number;
  max?: number;
  label: string;
  unit?: string;
  color?: 'cyan' | 'emerald' | 'amber' | 'red';
}) {
  const pct = Math.min(100, (value / max) * 100);
  const colors: Record<string, string> = {
    cyan: 'from-cyan-500 to-blue-500',
    emerald: 'from-emerald-500 to-teal-500',
    amber: 'from-amber-500 to-orange-500',
    red: 'from-red-500 to-rose-600',
  };
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="text-sm font-semibold text-slate-200 tabular-nums">
          {value.toFixed(unit === 'rpm' ? 0 : 1)}
          <span className="text-xs text-slate-500 ml-0.5">{unit}</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-700/60 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colors[color]} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
