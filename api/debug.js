const { getCorsHeaders, callAI, DEFAULT_SYSTEM_PROMPT } = require('./_shared');

module.exports = async (req, res) => {
  const origin = req.headers.origin || '';
  const headers = getCorsHeaders(origin);
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'NO KEY' });
  }

  const result = await callAI(
    apiKey,
    [{ role: 'user', content: 'Say hello' }],
    DEFAULT_SYSTEM_PROMPT
  );

  return res.status(200).json(result);
};
