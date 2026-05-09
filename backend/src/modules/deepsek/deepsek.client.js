const { env } = require('../../shared/env');

const deepsekKey = env.DEEPSEK_API_KEY;
const DEEPSEK_BASE = env.DEEPSEK_API_BASE;

if (!deepsekKey) {
  console.warn('[warn] DEEPSEK_API_KEY is not configured. Deepsek calls will fail.');
}

const getFetch = async () => {
  if (typeof fetch === 'function') {
    return fetch;
  }

  const { default: nodeFetch } = await import('node-fetch');
  return nodeFetch;
};

async function analyzeText(text) {
  if (!deepsekKey) {
    throw new Error('DEEPSEK_API_KEY not configured on server');
  }

  const url = `${DEEPSEK_BASE}/v1/analyze`;
  const request = await getFetch();

  const res = await request(url, {
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
