import { Router } from 'express';
import crypto from 'crypto';

const password = () => process.env.ADMIN_PASSWORD || 'admin123';
const makeToken = () => crypto.createHmac('sha256', password()).update('instansi').digest('hex');

export const requireAdmin = (req, res, next) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (token !== makeToken()) return res.status(401).json({ error: 'Akses khusus petugas instansi.' });
  next();
};

const router = Router();
router.post('/login', (req, res) => {
  if (req.body?.password !== password()) return res.status(401).json({ error: 'Kata sandi salah.' });
  res.json({ token: makeToken() });
});

export default router;
