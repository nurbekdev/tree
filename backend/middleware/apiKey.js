/*
 * API Key Validation Middleware (for base station)
 */

function validateApiKey(req, res, next) {
  // Express.js converts all headers to lowercase
  // Check all possible variations
  const apiKey = req.headers['x-api-key'] || 
                 req.headers['x-apikey'] ||
                 req.headers['api-key'] ||
                 req.headers['apikey'];
  const expectedKey = process.env.API_KEY;

  // Debug logging - show ALL headers to find the issue
  console.log('=== API Key Validation Debug ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('All headers:', JSON.stringify(req.headers, null, 2));
  console.log('API Key variations checked:');
  console.log('  x-api-key:', req.headers['x-api-key'] || 'NOT FOUND');
  console.log('  x-apikey:', req.headers['x-apikey'] || 'NOT FOUND');
  console.log('  api-key:', req.headers['api-key'] || 'NOT FOUND');
  console.log('  apikey:', req.headers['apikey'] || 'NOT FOUND');
  console.log('Received API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NONE');
  console.log('Expected API Key:', expectedKey ? `${expectedKey.substring(0, 10)}...` : 'NONE');
  console.log('Match:', apiKey === expectedKey);
  console.log('================================');

  if (!expectedKey) {
    console.error('ERROR: API_KEY not set in environment variables!');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (!apiKey || apiKey !== expectedKey) {
    return res.status(401).json({ 
      error: 'Invalid API key',
      hint: 'Check that X-API-Key header matches API_KEY in backend .env file'
    });
  }

  next();
}

module.exports = { validateApiKey };

