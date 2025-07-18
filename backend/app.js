/**
 * NetMonsters Backend Application
 * Main entry point for the refactored backend
 */
const express = require('express');
const config = require('./src/config/config');
const logger = require('./src/utils/logger');
const corsMiddleware = require('./src/middleware/cors');
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');
const apiRoutes = require('./src/routes/api');

class NetMonstersApp {
  constructor() {
    this.app = express();
    this.port = config.server.port;
    this.host = config.server.host;
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Setup middleware
   */
  setupMiddleware() {
    // CORS middleware
    this.app.use(corsMiddleware);
    
    // JSON parsing middleware
    this.app.use(express.json());
    
    // URL encoded parsing middleware
    this.app.use(express.urlencoded({ extended: true }));
    
    // Request logging middleware
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.url}`);
      next();
    });
  }

  /**
   * Setup routes
   */
  setupRoutes() {
    // API routes
    this.app.use('/v1', apiRoutes);
    
    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        message: 'NetMonsters Backend API',
        version: '2.0.0',
        status: 'running',
        endpoints: {
          health: '/v1/health',
          pokemon: '/v1/net_monsters/get_pokemon?id={id}',
          randomColor: '/v1/net_monsters/rand_color'
        }
      });
    });
  }

  /**
   * Setup error handling
   */
  setupErrorHandling() {
    // 404 handler
    this.app.use(notFoundHandler);
    
    // Global error handler
    this.app.use(errorHandler);
  }

  /**
   * Start the server
   */
  start() {
    this.app.listen(this.port, this.host, () => {
      logger.info(`NetMonsters Backend started on ${this.host}:${this.port}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`API Documentation: http://${this.host}:${this.port}/`);
    });
  }

  /**
   * Get the Express app instance
   * @returns {Express} Express app instance
   */
  getApp() {
    return this.app;
  }
}

// Create and start the application
const app = new NetMonstersApp();

// Start server if this file is run directly
if (require.main === module) {
  app.start();
}

module.exports = app;
