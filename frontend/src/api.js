  const BASE = import.meta.env.VITE_API_URL || '';

  export async function api(path, { method = 'GET', body, token } = {}) {
    const res = await fetch(`${BASE}/api${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Permintaan gagal. Coba lagi.');
    return data;
  }

  export const STATUS = {
    baru: { label: 'Diterima', cls: 'bg-ink/10 text-ink' },
    verifikasi: { label: 'Diverifikasi', cls: 'bg-sky-100 text-sky-800' },
    proses: { label: 'Ditindaklanjuti', cls: 'bg-amber/15 text-amber' },
    selesai: { label: 'Selesai', cls: 'bg-teal/15 text-teal-dark' },
    ditolak: { label: 'Ditolak', cls: 'bg-rust/10 text-rust' },
  };

  export const rupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
  export const tanggal = (iso) => new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
