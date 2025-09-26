// utils/csv.ts
import { BenchResult } from '@/lib/bench';

export function resultsToCsv(rows: BenchResult[]) {
  const header = 'op,region,count,avg_ms,p95_ms,raw\n';
  const lines = rows.map(r => {
    const raw = `[${r.raw.map(v => v.toFixed(1)).join(' ')}]`;
    return `${r.op},${r.region},${r.count},${r.avg_ms},${r.p95_ms},${raw}`;
  });
  return header + lines.join('\n');
}

export function downloadText(text: string, filename: string) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
