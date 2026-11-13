import { createHash } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import { webhookTarget, webhookUrl, type WebhookEnv } from './webhook.ts';

export interface ChatDeliveryEnv extends WebhookEnv {
  QSTASH_TOKEN?: string;
  QSTASH_URL?: string;
}

export interface TranscriptMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatLog {
  event: 'message' | 'audit_request';
  source: 'invo_chat';
  sessionId: string;
  timestamp: string;
  pagePath: '/free-audit' | '/free-audit-ads';
  lead: Record<string, string> | null;
  leadCaptured: boolean;
  askedToBookDirectly: boolean;
  transcript: TranscriptMessage[];
}

// Retries carry the same ID even after a reload. Never include timestamps in it.
export function chatEventId(payload: ChatLog): string {
  return createHash('sha256').update(JSON.stringify([
    payload.sessionId, payload.pagePath, payload.event, payload.transcript,
  ])).digest('hex');
}

// No database is needed: n8n/Sheets stores the history and QStash durably owns
// delivery once enqueue succeeds. Without QStash, direct delivery is best effort.
export async function deliverChatLog(env: ChatDeliveryEnv, payload: ChatLog): Promise<boolean> {
  const destination = webhookUrl(env);
  if (!destination) return false;
  const token = env.QSTASH_TOKEN?.trim();
  const queueBase = (env.QSTASH_URL?.trim() || 'https://qstash.upstash.io').replace(/\/+$/, '');
  const queue = `invo-chat-${webhookTarget(env)}`;
  const endpoint = token ? `${queueBase}/v2/enqueue/${queue}/${destination}` : destination;
  const eventId = chatEventId(payload);
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    headers['Upstash-Deduplication-Id'] = eventId;
    headers['Upstash-Retries'] = '3';
    headers['Upstash-Timeout'] = '15s';
  }
  const body = JSON.stringify({ ...payload, eventId, version: payload.transcript.length });
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST', headers, body, signal: AbortSignal.timeout(3_500),
      });
      if (response.ok) return true;
      // Configuration/authentication errors need attention, not rapid retries.
      if (response.status >= 400 && response.status < 500 && response.status !== 429) break;
    } catch { /* retry transient network failures with the same event ID */ }
    if (attempt === 0) await delay(250);
  }
  // Deliberately do not fall back to direct delivery if a configured queue fails:
  // bypassing FIFO would let an older queued snapshot overwrite a newer one.
  console.warn(`[chat] ${token ? 'queue acceptance' : 'webhook delivery'} failed; log remains pending`);
  return false;
}
