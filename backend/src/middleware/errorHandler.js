/**
 * Error handling middleware
 */
const logger = require('../utils/logger');

/**
 * Global error handler
 * @param {Error} error - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function errorHandler(error, req, res, next) {
  logger.error(`Unhandled error: ${error.message}`, error.stack);

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  const errorResponse = {
    error: 'Internal server error',
    message: isDevelopment ? error.message : 'Something went wrong'
  };

  if (isDevelopment) {
    errorResponse.stack = error.stack;
  }

  res.status(500).json(errorResponse);
}

/**
 * 404 handler for unknown routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
function notFoundHandler(req, res) {
  logger.warn(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.url} not found`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
