import { useState } from 'react';
import Dashboard from './components/Dashboard.jsx';
import ReportForm from './components/ReportForm.jsx';
import AdminPanel from './components/AdminPanel.jsx';

const TABS = [
  { id: 'dasbor', label: 'Dasbor publik' },
  { id: 'lapor', label: 'Buat laporan' },
  { id: 'instansi', label: 'Panel instansi' },
];

export default function App() {
  const [tab, setTab] = useState('dasbor');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(
    Boolean(localStorage.getItem('adminToken'))
  );

  return (
    <div className="min-h-screen">
      <header className="bg-ink text-white">
        <div className="mx-auto max-w-6xl px-4 pb-6 pt-5">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-teal font-display text-lg font-extrabold">T</span>
            <span className="font-display text-xl font-extrabold">TransparansiLayanan</span>
          </div>
          <h1 className="mt-6 max-w-2xl font-display text-3xl font-extrabold leading-tight sm:text-4xl">
            Setiap rupiah dan setiap laporan bisa dilihat siapa saja.
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/70">
            Laporkan masalah layanan publik, pantau tindak lanjutnya, dan bandingkan serapan anggaran dengan progres di lapangan.
          </p>
          <nav className="mt-6 flex gap-1 overflow-x-auto" aria-label="Navigasi utama">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} aria-current={tab === t.id}
                className={`whitespace-nowrap rounded-t-lg px-4 py-2 text-sm font-semibold transition ${tab === t.id ? 'bg-paper text-ink' : 'text-white/70 hover:text-white'}`}>
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        {tab === 'dasbor' && <Dashboard />}
        {tab === 'lapor' && <ReportForm onDone={() => setTab('dasbor')} />}
        {tab === 'instansi' && (
          <AdminPanel 
            isLoggedIn={isAdminLoggedIn}
            onLoginSuccess={() => setIsAdminLoggedIn(true)} 
            onLogout={() => {
              localStorage.removeItem('adminToken');
              localStorage.removeItem('selectedInstansi');
              setIsAdminLoggedIn(false);
            }}
          />
        )}
      </main>
      <footer className="border-t border-ink/10 py-6 text-center text-xs text-ink/60">
        TransparansiLayanan · Techcomfest 2027 · Smart Governance & Public Service
      </footer>
    </div>
  );
}