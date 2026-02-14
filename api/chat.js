const { getCorsHeaders, checkRate, recordRate, callAI, MODEL } = require('./_shared');

module.exports = async (req, res) => {
  const origin = req.headers.origin || '';
  const headers = getCorsHeaders(origin);
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: true, message: 'Method not allowed' });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: true, message: 'API_KEY не настроен' });
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || req.headers['x-real-ip']
    || 'unknown';

  const limit = checkRate(ip);
  if (!limit.allowed) {
    return res.status(429).json({
      error: true,
      message: limit.reason,
      retryAfter: limit.retryAfter
    });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (e) {
    return res.status(400).json({ error: true, message: 'Неверный JSON' });
  }

  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    return res.status(400).json({ error: true, message: 'Нет сообщений' });
  }

  recordRate(ip);

  const result = await callAI(
    apiKey,
    body.messages.slice(-15),
    body.systemPrompt
  );

  if (result.error) {
    return res.status(502).json({
      error: true,
      message: result.message,
      detail: result.detail
    });
  }

  return res.status(200).json({
    content: result.content,
    model: MODEL,
    limits: (checkRate(ip).remaining) || null
  });
};
