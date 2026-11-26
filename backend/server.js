import express from 'express';
import cors from 'cors';
import auth from './routes/auth.js';
import reports from './routes/reports.js';
import projects from './routes/projects.js';

const app = express();
const origins = (process.env.CORS_ORIGIN || '*').split(',').map((s) => s.trim());

app.use(cors({ origin: origins.includes('*') ? '*' : origins }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', auth);
app.use('/api/reports', reports);
app.use('/api/projects', projects);
app.use((_req, res) => res.status(404).json({ error: 'Endpoint tidak ditemukan.' }));
app.use((err, _req, res, _next) => { console.error(err); res.status(500).json({ error: 'Terjadi kesalahan server.' }); });

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API berjalan di http://localhost:${PORT}`));
