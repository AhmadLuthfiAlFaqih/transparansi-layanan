import { Router } from 'express';
import { read, write } from '../db.js';
import { requireAdmin } from './auth.js';

const router = Router();

router.get('/', (_req, res) => res.json(read().projects));

router.patch('/:id', requireAdmin, (req, res) => {
  const db = read();
  const p = db.projects.find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Proyek tidak ditemukan.' });
  const spent = Number(req.body?.spent);
  const progress = Number(req.body?.progress);
  if (!Number.isFinite(spent) || spent < 0 || spent > p.budget) return res.status(400).json({ error: 'Realisasi anggaran tidak valid.' });
  if (!Number.isFinite(progress) || progress < 0 || progress > 100) return res.status(400).json({ error: 'Progres fisik harus 0-100.' });
  p.spent = spent; p.progress = progress; p.updatedAt = new Date().toISOString();
  write(db);
  res.json(p);
});

export default router;
