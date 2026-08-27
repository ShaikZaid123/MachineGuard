import { useState } from 'react';
import { StoreProvider, useStore } from '@/store/StoreContext';
import { Sidebar, MobileNav, type Page } from '@/components/Sidebar';
import { Dashboard } from '@/pages/Dashboard';
import { MachineList } from '@/pages/MachineList';
import { MachineDetails } from '@/pages/MachineDetails';
import { AlertsPage } from '@/pages/AlertsPage';

function AppShell() {
  const [page, setPage] = useState<Page>('dashboard');
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const { alerts } = useStore();

  const unackCount = alerts.filter((a) => !a.acknowledged).length;

  const navigate = (p: Page) => {
    setPage(p);
    setSelectedMachine(null);
  };

  const selectMachine = (id: string) => {
    setSelectedMachine(id);
    setPage('machines');
  };

  return (
    <div className="min-h-screen flex bg-slate-950">
      <Sidebar page={page} onNavigate={navigate} alertCount={unackCount} />
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {page === 'dashboard' && <Dashboard onNavigate={navigate} />}
          {page === 'machines' && selectedMachine && (
            <MachineDetails
              machineId={selectedMachine}
              onBack={() => setSelectedMachine(null)}
            />
          )}
          {page === 'machines' && !selectedMachine && (
            <MachineList onSelect={selectMachine} />
          )}
          {page === 'alerts' && <AlertsPage onNavigate={navigate} />}
        </div>
      </main>
      <MobileNav page={page} onNavigate={navigate} alertCount={unackCount} />
    </div>
  );
}

function App() {
  return (
    <StoreProvider>
      <AppShell />
    </StoreProvider>
  );
}

export default App;
