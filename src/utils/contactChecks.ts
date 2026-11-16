// Phone and website rules shared by the audit form (browser) and the server, so the form
// can never accept something the server then rejects, or the other way round.

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

// The phone box starts as "+1 " and keeps that prefix: whatever is typed or pasted
// ("2022345678", "+1 202 234 5678", "(202) 234-5678") is shown as "+1 (202) 234-5678".
export const PHONE_PREFIX = '+1 ';

export function formatUsPhoneInput(raw: string): string {
  // A number pasted with another country code (+44 ..., +91 ...) is not shown as US digits,
  // which could otherwise turn it into a different, valid-looking US number.
  if (/^\s*\+\s*(?!1\b|1[\s\d().-])\d/.test(raw)) return PHONE_PREFIX;
  let digits = raw.replace(/\D/g, '');
  // Our own "+1", or a country code that was typed or pasted as well, is not part of the number:
  // no US area code starts with 1, so a leading 1 can only be the country code.
  if (raw.trim().startsWith('+1') && digits.startsWith('1')) digits = digits.slice(1);
  if (digits.startsWith('1')) digits = digits.slice(1);
  digits = digits.slice(0, 10);
  if (!digits) return PHONE_PREFIX;
  if (digits.length <= 3) return `${PHONE_PREFIX}(${digits}`;
  if (digits.length <= 6) return `${PHONE_PREFIX}(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `${PHONE_PREFIX}(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export const PHONE_ERROR = 'Enter a valid US phone number, including the area code.';
export const isValidUsPhone = (value: string) => normalizeUsPhone(value) !== null;

// A real-looking domain: letters, digits and hyphens in each part, a final part of 2+ letters
// (or an internationalised "xn--" one). "brighthome", "my website", "a.b" and "localhost" fail.
const DOMAIN = /^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:[a-z]{2,63}|xn--[a-z0-9-]{1,59})$/;

// "brighthome.com", "www.brighthome.com/about" or "https://brighthome.com" -> a clean https URL; '' if not valid.
// Only the format is checked: nothing is fetched, so a made-up domain such as "asdf.com" still passes.
export function normalizeWebsite(raw: unknown): string {
  if (typeof raw !== 'string' || raw.length > 2048) return '';
  const typed = raw.trim();
  if (!typed || /\s/.test(typed)) return '';
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(typed) ? typed : `https://${typed}`);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.port && !/^(80|443)$/.test(url.port)) return '';
    return DOMAIN.test(url.hostname) ? url.href : '';
  } catch { return ''; }
}

export const WEBSITE_ERROR = 'Enter a valid website, like brighthome.com, or tick "No website yet".';
