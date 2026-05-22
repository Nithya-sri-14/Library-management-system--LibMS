const cache = new Map();
const TTL = 30000;

const getCache = (req) => {
  const key = req.originalUrl;
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
};

const setCache = (req, data) => {
  cache.set(req.originalUrl, { data, timestamp: Date.now() });
};

const cacheMiddleware = (req, res, next) => {
  if (req.method !== 'GET') return next();
  const cached = getCache(req);
  if (cached) return res.json(cached);
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode === 200) setCache(req, body);
    originalJson(body);
  };
  next();
};

module.exports = cacheMiddleware;
