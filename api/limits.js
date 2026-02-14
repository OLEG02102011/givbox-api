const { getCorsHeaders, checkRate } = require('./_shared');

module.exports = (req, res) => {
  const origin = req.headers.origin || '';
  const headers = getCorsHeaders(origin);
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || req.headers['x-real-ip']
    || 'unknown';

  return res.status(200).json(checkRate(ip));
};
