/**
 * Simple logger utility
 */
const config = require('../config/config');

class Logger {
  constructor() {
    this.level = config.logging.level;
    this.enableConsole = config.logging.enableConsole;
  }

  info(message, ...args) {
    if (this.enableConsole) {
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }

  warn(message, ...args) {
    if (this.enableConsole) {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }

  error(message, ...args) {
    if (this.enableConsole) {
      console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }

  debug(message, ...args) {
    if (this.level === 'debug' && this.enableConsole) {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }
}

module.exports = new Logger();
