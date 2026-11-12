// US numbers only (NANP), normalized consistently for chat and form leads.
export function normalizeUsPhone(input: string): string | null {
  let digits = input.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1);
  if (digits.length !== 10) return null;
  const area = digits.slice(0, 3);
  const exchange = digits.slice(3, 6);
  const line = digits.slice(6);
  if (!/^[2-9]/.test(area) || !/^[2-9]/.test(exchange)) return null;
  if (area.endsWith('11') || exchange.endsWith('11')) return null;
  if (/^(\d)\1{9}$/.test(digits)) return null;
  if (exchange === '555' && /^01\d\d$/.test(line)) return null;
  return `+1${digits}`;
}
