import { useState } from 'react';
import { api } from '../api.js';

const CATEGORIES = ['Pungli', 'Infrastruktur', 'Pelayanan Kesehatan', 'Pelayanan Administrasi', 'Pendidikan', 'Penyalahgunaan Anggaran', 'Lainnya'];
const empty = { title: '', category: CATEGORIES[0], agency: '', location: '', description: '' };

export default function ReportForm({ onDone }) {
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ticket, setTicket] = useState(null);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try { setTicket(await api('/reports', { method: 'POST', body: form })); setForm(empty); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  if (ticket) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-teal/40 bg-white p-6 text-center">
        <h2 className="font-display text-2xl font-extrabold">Laporan terkirim</h2>
        <p className="mt-2 text-sm text-ink/70">Simpan kode tiket ini untuk memantau progres di dasbor publik.</p>
        <p className="my-4 select-all rounded-lg bg-ink py-3 font-display text-3xl font-extrabold tracking-wide text-white">{ticket.id}</p>
        <button className="btn" onClick={onDone}>Lihat di dasbor</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-4 rounded-xl border border-ink/10 bg-white p-6">
      <div>
        <h2 className="font-display text-2xl font-extrabold">Laporkan masalah layanan publik</h2>
        <p className="text-sm text-ink/60">Tanpa perlu akun. Jangan cantumkan data pribadi pada uraian karena laporan tampil di dasbor publik.</p>
      </div>
      <label className="block text-sm font-semibold">Judul laporan
        <input required maxLength={120} className="field mt-1 font-normal" placeholder="Contoh: Pungutan tambahan di loket SIM" value={form.title} onChange={set('title')} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold">Kategori
          <select className="field mt-1 font-normal" value={form.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
        </label>
        <label className="block text-sm font-semibold">Instansi terkait (opsional)
          <input maxLength={80} className="field mt-1 font-normal" placeholder="Contoh: Dinas Perhubungan" value={form.agency} onChange={set('agency')} />
        </label>
      </div>
      <label className="block text-sm font-semibold">Lokasi kejadian
        <input required maxLength={120} className="field mt-1 font-normal" placeholder="Kecamatan, kota, atau nama kantor" value={form.location} onChange={set('location')} />
      </label>
      <label className="block text-sm font-semibold">Uraian kejadian
        <textarea required minLength={20} maxLength={1000} rows={5} className="field mt-1 font-normal" placeholder="Apa yang terjadi, kapan, dan siapa yang terlibat (minimal 20 karakter)" value={form.description} onChange={set('description')} />
      </label>
      {error && <p role="alert" className="rounded-lg bg-rust/10 p-3 text-sm text-rust">{error}</p>}
      <button className="btn" disabled={busy}>{busy ? 'Mengirim…' : 'Kirim laporan'}</button>
    </form>
  );
}
