import { handleAudit } from '../server/audit.ts';
import { waitUntil } from '@vercel/functions';
import { sheetsConfigurationStatus } from '../server/leadIntegrations.ts';
import { checkProductionSheets } from '../server/sheetsDiagnostic.ts';

export const config = { maxDuration: 120 };

interface Req {
  method?: string;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
}
interface Res {
  status(code: number): Res;
  setHeader(name: string, value: string): void;
  json(body: unknown): void;
}

export default async function handler(req: Req, res: Res) {
  res.setHeader('Cache-Control', 'no-store');
  // Safe deployment diagnostic: no tokens, workbook IDs or visitor details.
  res.setHeader('X-Sheets-Configuration', sheetsConfigurationStatus(process.env));
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)
    && (req.body as { mode?: unknown }).mode === 'sheets_connection_check') {
    const result = await checkProductionSheets(req.body, process.env);
    return res.status(result.status).json(result.body);
  }
  const forwarded = req.headers['x-forwarded-for'];
  const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
  // Persist lead details before ending the request. A successful email alone
  // must not let Vercel freeze the remaining Sheets write after the response.
  const task = handleAudit(req.body, ip, process.env);
  waitUntil(task.then(() => {}, () => {}));
  const result = await task;
  if (result.sheetDelivery) {
    res.setHeader('X-Sheets-Delivery', result.sheetDelivery.saved ? 'saved' : result.sheetDelivery.code || 'unconfirmed');
  }
  res.status(result.status).json(result.body);
}
