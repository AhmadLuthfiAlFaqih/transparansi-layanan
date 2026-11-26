# TransparansiLayanan

Platform pengaduan warga dan pemantauan anggaran/proyek layanan publik secara terbuka.
Techcomfest 2027, Sub-Tema 1: Smart Governance & Public Service.

## Fitur
- **Pelaporan warga**: formulir tanpa akun, menghasilkan kode tiket (TL-XXXXXX).
- **Dasbor publik**: statistik, pencarian dan filter laporan, linimasa tindak lanjut tiap laporan.
- **Buku anggaran**: serapan anggaran vs progres fisik; proyek ditandai "Perlu diaudit" bila selisih > 20 poin.
- **Panel instansi**: login, ubah status laporan (catatan wajib dan langsung publik), perbarui realisasi proyek.

## Struktur
```
transparansi-layanan/
├── backend/    Express API + db JSON (data/db.json)
├── frontend/   React + Vite + Tailwind CSS
└── render.yaml Blueprint deploy backend (opsional)
```

## Jalankan lokal
```bash
# Terminal 1
cd backend && npm install && npm run dev      # http://localhost:4000

# Terminal 2
cd frontend && npm install && npm run dev     # http://localhost:5173
```
Di mode dev, Vite memproksi `/api` ke port 4000 sehingga tidak perlu konfigurasi tambahan.
Kata sandi panel instansi bawaan: `admin123` (atur dengan env `ADMIN_PASSWORD`).

## API
| Method | Endpoint | Akses |
|---|---|---|
| GET | /api/reports, /api/reports/stats | Publik |
| POST | /api/reports | Publik |
| PATCH | /api/reports/:id | Instansi |
| GET | /api/projects | Publik |
| PATCH | /api/projects/:id | Instansi |
| POST | /api/auth/login | Publik |

## Deploy gratis (live online)
1. **Push ke GitHub**
   ```bash
   git init && git add . && git commit -m "TransparansiLayanan"
   git branch -M main && git remote add origin https://github.com/USERNAME/transparansi-layanan.git && git push -u origin main
   ```
2. **Backend di Render** (render.com, daftar gratis)
   - New > Web Service > pilih repo. Root Directory `backend`, Build `npm install`, Start `npm start`, Plan Free.
   - Environment: `ADMIN_PASSWORD` = sandi kuat Anda. `CORS_ORIGIN` isi nanti setelah frontend live.
   - Salin URL hasilnya, misalnya `https://transparansi-layanan-api.onrender.com`. Cek `/api/health`.
3. **Frontend di Vercel** (vercel.com, daftar gratis)
   - Add New > Project > pilih repo. **Root Directory: `frontend`**. Framework Vite terdeteksi otomatis.
   - Environment Variable: `VITE_API_URL` = URL Render dari langkah 2 (tanpa `/` di akhir). Klik Deploy.
4. **Hubungkan CORS**: kembali ke Render, set `CORS_ORIGIN` = URL Vercel (misal `https://transparansi-layanan.vercel.app`), lalu redeploy.
5. Buka URL Vercel: dasbor harus memuat data.

## Catatan penting
- Render gratis akan tidur setelah 15 menit tidak aktif; request pertama butuh sekitar 30-60 detik. Buka sebelum demo juri.
- Disk Render gratis bersifat sementara: data JSON kembali ke seed (`data/db.json`) saat redeploy/restart. Cukup untuk demo; untuk produksi ganti `db.js` dengan database terkelola.
- Login instansi memakai satu kata sandi bersama (prototipe). Produksi: akun per petugas, JWT, dan audit log.
