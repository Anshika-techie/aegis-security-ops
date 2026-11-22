function escapeCell(value) {
  const str = value == null ? '' : String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function toCsv(columns, rows) {
  const header = columns.map((c) => escapeCell(c.label ?? c.key)).join(',');
  const body = rows
    .map((row) => columns.map((c) => escapeCell(c.format ? c.format(row) : row[c.key])).join(','))
    .join('\n');
  return `${header}\n${body}`;
}

export function downloadCsv(filename, columns, rows) {
  const csv = toCsv(columns, rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
