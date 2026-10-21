// Flattens en.json / am.json into a CSV for translation auditing.
// Usage: npm run extract-text  (writes content-map-generated.csv to project root)
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const en = JSON.parse(readFileSync(join(__dirname, '../src/locales/en.json'), 'utf-8'));
const am = JSON.parse(readFileSync(join(__dirname, '../src/locales/am.json'), 'utf-8'));

function flatten(obj, prefix = '') {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(value)) {
      return value.flatMap((item, i) => flatten(item, `${path}[${i}]`));
    }
    if (typeof value === 'object' && value !== null) {
      return flatten(value, path);
    }
    return [[path, value]];
  });
}

const enFlat = Object.fromEntries(flatten(en));
const amFlat = Object.fromEntries(flatten(am));

const rows = [['key', 'english', 'amharic']];
for (const key of Object.keys(enFlat)) {
  rows.push([key, enFlat[key] ?? '', amFlat[key] ?? '']);
}

const csv = rows
  .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  .join('\n');

writeFileSync(join(__dirname, '../content-map-generated.csv'), csv, 'utf-8');
console.log(`Wrote ${rows.length - 1} rows to content-map-generated.csv`);
