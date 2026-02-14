const { getCorsHeaders, MODEL } = require('./_shared');

module.exports = (req, res) => {
  const origin = req.headers.origin || '';
  const headers = getCorsHeaders(origin);
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  return res.status(200).json({
    status: 'ok',
    model: MODEL,
    hasApiKey: !!process.env.API_KEY
  });
};
