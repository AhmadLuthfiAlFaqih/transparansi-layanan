import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const file = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data', 'db.json');

export const read = () => JSON.parse(fs.readFileSync(file, 'utf8'));
export const write = (data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));
