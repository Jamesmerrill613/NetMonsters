/**
 * CORS middleware for handling cross-origin requests
 */
const config = require('../config/config');

/**
 * Set CORS headers for all requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function corsMiddleware(req, res, next) {
  res.header("Access-Control-Allow-Origin", config.server.cors.origin);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  
  if (config.server.cors.credentials) {
    res.header("Access-Control-Allow-Credentials", "true");
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  next();
}

module.exports = corsMiddleware;
