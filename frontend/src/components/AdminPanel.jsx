import { useEffect, useState } from 'react';
import { api, STATUS, rupiah } from '../api.js';
import { Badge } from './Dashboard.jsx';

function ReportRow({ r, token, onSaved }) {
  const [status, setStatus] = useState(r.status);
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState('');
  const save = async () => {
    setMsg('');
    try { await api(`/reports/${r.id}`, { method: 'PATCH', token, body: { status, note } }); setNote(''); setMsg('Tersimpan dan langsung tampil di dasbor publik.'); onSaved(); }
    catch (e) { setMsg(e.message); }
  };
  return (
    <li className="rounded-xl border border-ink/10 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div><p className="font-semibold">{r.title}</p><p className="text-xs text-ink/60">{r.id} · {r.agency} · {r.location}</p></div>
        <Badge status={r.status} />
      </div>
      <p className="my-3 text-sm">{r.description}</p>
      <div className="grid gap-2 sm:grid-cols-[180px_1fr_auto]">
        <select className="field" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status baru">
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <input className="field" placeholder="Catatan tindak lanjut (tampil ke publik)" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} />
        <button className="btn" onClick={save}>Simpan status</button>
      </div>
      {msg && <p className="mt-2 text-xs text-ink/70" role="status">{msg}</p>}
    </li>
  );
}

function ProjectRow({ p, token, onSaved }) {
  const [spent, setSpent] = useState(p.spent);
  const [progress, setProgress] = useState(p.progress);
  const [msg, setMsg] = useState('');
  const save = async () => {
    try { await api(`/projects/${p.id}`, { method: 'PATCH', token, body: { spent, progress } }); setMsg('Tersimpan.'); onSaved(); }
    catch (e) { setMsg(e.message); }
  };
  return (
    <li className="rounded-xl border border-ink/10 bg-white p-4">
      <p className="font-semibold">{p.name}</p>
      <p className="text-xs text-ink/60">Pagu {rupiah(p.budget)}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_140px_auto]">
        <label className="text-xs font-semibold">Realisasi (Rp)<input type="number" className="field mt-1 font-normal" value={spent} onChange={(e) => setSpent(e.target.value)} /></label>
        <label className="text-xs font-semibold">Progres fisik (%)<input type="number" min="0" max="100" className="field mt-1 font-normal" value={progress} onChange={(e) => setProgress(e.target.value)} /></label>
        <button className="btn self-end" onClick={save}>Perbarui</button>
      </div>
      {msg && <p className="mt-2 text-xs text-ink/70" role="status">{msg}</p>}
    </li>
  );
}

export default function AdminPanel() {
  const [token, setToken] = useState(sessionStorage.getItem('tl_token') || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);

  const load = () => Promise.all([api('/reports'), api('/projects')]).then(([r, p]) => { setReports(r); setProjects(p); }).catch((e) => setError(e.message));
  useEffect(() => { if (token) load(); }, [token]);

  const login = async (e) => {
    e.preventDefault(); setError('');
    try { const { token: t } = await api('/auth/login', { method: 'POST', body: { password } }); sessionStorage.setItem('tl_token', t); setToken(t); }
    catch (err) { setError(err.message); }
  };
  const logout = () => { sessionStorage.removeItem('tl_token'); setToken(''); setPassword(''); };

  if (!token) {
    return (
      <form onSubmit={login} className="mx-auto max-w-sm space-y-4 rounded-xl border border-ink/10 bg-white p-6">
        <h2 className="font-display text-2xl font-extrabold">Masuk petugas instansi</h2>
        <input type="password" required className="field" placeholder="Kata sandi" value={password} onChange={(e) => setPassword(e.target.value)} aria-label="Kata sandi" />
        {error && <p role="alert" className="text-sm text-rust">{error}</p>}
        <button className="btn w-full">Masuk</button>
      </form>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-extrabold">Panel verifikasi instansi</h2>
        <button className="text-sm font-semibold underline" onClick={logout}>Keluar</button>
      </div>
      {error && <p role="alert" className="rounded-lg bg-rust/10 p-3 text-sm text-rust">{error}</p>}
      <section>
        <h3 className="mb-3 font-display text-xl font-extrabold">Laporan masuk</h3>
        <ul className="space-y-3">{reports.map((r) => <ReportRow key={r.id + r.timeline.length} r={r} token={token} onSaved={load} />)}</ul>
      </section>
      <section>
        <h3 className="mb-3 font-display text-xl font-extrabold">Realisasi proyek</h3>
        <ul className="space-y-3">{projects.map((p) => <ProjectRow key={p.id} p={p} token={token} onSaved={load} />)}</ul>
      </section>
    </div>
  );
}
