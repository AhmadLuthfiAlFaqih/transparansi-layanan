import { useEffect, useMemo, useState } from 'react';
import { api, STATUS, rupiah, tanggal } from '../api.js';

export const Badge = ({ status }) => (
  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS[status].cls}`}>{STATUS[status].label}</span>
);

function ProjectLedger({ p }) {
  const serapan = Math.round((p.spent / p.budget) * 100);
  const gap = serapan - p.progress;
  const flagged = gap > 20;
  return (
    <article className={`rounded-xl border bg-white p-4 ${flagged ? 'border-rust/50' : 'border-ink/10'}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-extrabold">{p.name}</h3>
          <p className="text-xs text-ink/60">{p.agency} · diperbarui {tanggal(p.updatedAt)}</p>
        </div>
        {flagged && <span className="rounded-full bg-rust/10 px-2.5 py-1 text-xs font-semibold text-rust">Perlu diaudit: serapan {gap} poin di atas progres</span>}
      </div>
      <div className="mt-4 space-y-3">
        <Bar label="Anggaran terserap" value={serapan} note={`${rupiah(p.spent)} dari ${rupiah(p.budget)}`} color="bg-ink" />
        <Bar label="Progres fisik" value={p.progress} note={`${p.progress}% selesai di lapangan`} color="bg-teal" />
      </div>
    </article>
  );
}

const Bar = ({ label, value, note, color }) => (
  <div>
    <div className="flex justify-between text-xs"><span className="font-semibold">{label}</span><span className="text-ink/60">{note}</span></div>
    <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('semua');
  const [open, setOpen] = useState(null);

  useEffect(() => {
    Promise.all([api('/reports/stats'), api('/reports'), api('/projects')])
      .then(([s, r, p]) => { setStats(s); setReports(r); setProjects(p); })
      .catch((e) => setError(e.message));
  }, []);

  const shown = useMemo(() => reports.filter((r) =>
    (filter === 'semua' || r.status === filter) &&
    (`${r.id} ${r.title} ${r.agency}`.toLowerCase().includes(q.toLowerCase()))), [reports, q, filter]);

  if (error) return <p className="rounded-lg bg-rust/10 p-4 text-sm text-rust">Gagal memuat data: {error}. Pastikan backend menyala dan VITE_API_URL benar.</p>;
  if (!stats) return <p className="text-sm text-ink/60">Memuat data…</p>;

  const cards = [
    ['Total laporan', stats.total], ['Selesai', stats.selesai], ['Sedang ditindaklanjuti', stats.proses],
    ['Belum direspons', stats.baru], ['Tingkat penyelesaian', `${stats.tingkatPenyelesaian}%`],
  ];

  return (
    <div className="space-y-10">
      <section aria-label="Ringkasan" className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {cards.map(([l, v]) => (
          <div key={l} className="rounded-xl border border-ink/10 bg-white p-4">
            <p className="font-display text-3xl font-extrabold">{v}</p>
            <p className="text-xs text-ink/60">{l}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="font-display text-2xl font-extrabold">Anggaran proyek dibandingkan progres fisik</h2>
        <p className="mb-4 text-sm text-ink/60">
          Total terserap {rupiah(stats.totalRealisasi)} dari {rupiah(stats.totalAnggaran)}. Proyek ditandai bila serapan anggaran melebihi progres fisik lebih dari 20 poin.
        </p>
        <div className="grid gap-4 md:grid-cols-2">{projects.map((p) => <ProjectLedger key={p.id} p={p} />)}</div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-extrabold">Status laporan warga</h2>
        <div className="my-4 flex flex-col gap-2 sm:flex-row">
          <input className="field sm:max-w-xs" placeholder="Cari kode tiket, judul, atau instansi" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Cari laporan" />
          <select className="field sm:max-w-[200px]" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter status">
            <option value="semua">Semua status</option>
            {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        {shown.length === 0 && <p className="rounded-lg border border-dashed border-ink/20 p-6 text-center text-sm text-ink/60">Tidak ada laporan yang cocok. Ubah kata kunci atau filter.</p>}
        <ul className="space-y-3">
          {shown.map((r) => (
            <li key={r.id} className="rounded-xl border border-ink/10 bg-white p-4">
              <button className="flex w-full flex-wrap items-start justify-between gap-2 text-left" onClick={() => setOpen(open === r.id ? null : r.id)} aria-expanded={open === r.id}>
                <div>
                  <p className="font-semibold">{r.title}</p>
                  <p className="text-xs text-ink/60">{r.id} · {r.agency} · {r.location} · {tanggal(r.createdAt)}</p>
                </div>
                <Badge status={r.status} />
              </button>
              {open === r.id && (
                <div className="mt-4 border-t border-ink/10 pt-4">
                  <p className="mb-3 text-sm">{r.description}</p>
                  <ol className="space-y-2 border-l-2 border-teal/40 pl-4">
                    {r.timeline.map((t, i) => (
                      <li key={i} className="text-sm"><Badge status={t.status} /> <span className="ml-1 text-xs text-ink/60">{tanggal(t.at)}</span><p className="mt-1">{t.note}</p></li>
                    ))}
                  </ol>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
