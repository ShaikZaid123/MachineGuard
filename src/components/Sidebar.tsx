import { Activity, LayoutDashboard, Cpu, AlertTriangle, Settings } from 'lucide-react';

export type Page = 'dashboard' | 'machines' | 'alerts';

interface SidebarProps {
  page: Page;
  onNavigate: (p: Page) => void;
  alertCount: number;
}

const NAV: { id: Page; label: string; icon: typeof Activity }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'machines', label: 'Machines', icon: Cpu },
  { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
];

export function Sidebar({ page, onNavigate, alertCount }: SidebarProps) {
  return (
    <aside className="hidden md:flex md:w-60 lg:w-64 flex-col bg-slate-900 border-r border-slate-800 h-screen sticky top-0">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/15 border border-cyan-500/30">
          <Activity className="h-5 w-5 text-cyan-400" />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-100 leading-tight">Predictive</div>
          <div className="text-xs text-slate-400 leading-tight">Maintenance System</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.id === 'alerts' && alertCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-red-500/20 text-red-300 text-xs font-semibold">
                  {alertCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Settings className="h-3.5 w-3.5" />
          <span>Prototype · Rule-based engine</span>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav({ page, onNavigate, alertCount }: SidebarProps) {
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 backdrop-blur border-t border-slate-800 flex">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = page === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs relative ${
              active ? 'text-cyan-300' : 'text-slate-400'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
            {item.id === 'alerts' && alertCount > 0 && (
              <span className="absolute top-1.5 right-1/4 inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-red-500/20 text-red-300 text-[10px] font-semibold">
                {alertCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
