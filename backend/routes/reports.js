import { Router } from 'express';
import crypto from 'crypto';
import { read, write } from '../db.js';
import { requireAdmin } from './auth.js';

const STATUSES = ['baru', 'verifikasi', 'proses', 'selesai', 'ditolak'];
const router = Router();

router.get('/stats', (_req, res) => {
  const { reports, projects } = read();
  const by = (s) => reports.filter((r) => r.status === s).length;
  const done = reports.filter((r) => r.status === 'selesai').length;
  res.json({
    total: reports.length,
    selesai: done,
    proses: by('proses') + by('verifikasi'),
    baru: by('baru'),
    ditolak: by('ditolak'),
    tingkatPenyelesaian: reports.length ? Math.round((done / reports.length) * 100) : 0,
    totalAnggaran: projects.reduce((a, p) => a + p.budget, 0),
    totalRealisasi: projects.reduce((a, p) => a + p.spent, 0),
  });
});

router.get('/', (req, res) => {
  const { reports } = read();
  const list = req.query.status ? reports.filter((r) => r.status === req.query.status) : reports;
  res.json([...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
});

router.post('/', (req, res) => {
  const { title, category, agency, location, description } = req.body || {};
  const clean = (v, max) => String(v || '').trim().slice(0, max);
  const data = {
    title: clean(title, 120), category: clean(category, 40), agency: clean(agency, 80),
    location: clean(location, 120), description: clean(description, 1000),
  };
  if (!data.title || !data.category || !data.location || data.description.length < 20) {
    return res.status(400).json({ error: 'Lengkapi judul, kategori, lokasi, dan uraian (minimal 20 karakter).' });
  }
  const db = read();
  const now = new Date().toISOString();
  const report = {
    id: 'TL-' + crypto.randomBytes(3).toString('hex').toUpperCase(),
    ...data, agency: data.agency || 'Belum ditentukan', status: 'baru', createdAt: now,
    timeline: [{ status: 'baru', note: 'Laporan diterima sistem.', at: now }],
  };
  db.reports.push(report);
  write(db);
  res.status(201).json(report);
});

router.patch('/:id', requireAdmin, (req, res) => {
  const db = read();
  const report = db.reports.find((r) => r.id === req.params.id);
  if (!report) return res.status(404).json({ error: 'Laporan tidak ditemukan.' });
  const { status, note } = req.body || {};
  if (!STATUSES.includes(status)) return res.status(400).json({ error: 'Status tidak valid.' });
  const text = String(note || '').trim().slice(0, 300);
  if (!text) return res.status(400).json({ error: 'Catatan tindak lanjut wajib diisi agar publik dapat memantau.' });
  report.status = status;
  report.timeline.push({ status, note: text, at: new Date().toISOString() });
  write(db);
  res.json(report);
});

export default router;
