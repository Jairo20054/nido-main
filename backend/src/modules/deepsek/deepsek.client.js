const fetch = require('node-fetch');
const { env } = require('../../shared/env');

const deepsekKey = env.DEEPSEK_API_KEY || process.env.DEEPSEK_API_KEY || '';
const DEEPSEK_BASE = process.env.DEEPSEK_API_BASE || 'https://api.deepsek.ai';

if (!deepsekKey) {
  console.warn('[warn] DEEPSEK_API_KEY is not configured. Deepsek calls will fail.');
}

async function analyzeText(text) {
  if (!deepsekKey) {
    throw new Error('DEEPSEK_API_KEY not configured on server');
  }

  const url = `${DEEPSEK_BASE}/v1/analyze`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${deepsekKey}`,
    },
    body: JSON.stringify({ text }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data?.message || data?.error || `HTTP ${res.status}`;
    throw new Error(`Deepsek API error: ${message}`);
  }

  return data;
}

module.exports = { analyzeText };
