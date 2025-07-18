/**
 * Pokemon controller for handling HTTP requests
 */
const PokemonService = require('../services/pokemonService');
const logger = require('../utils/logger');

class PokemonController {
  constructor() {
    this.pokemonService = new PokemonService();
  }

  /**
   * Get Pokemon data endpoint
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getPokemon(req, res) {
    try {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({
          error: 'Pokemon ID is required',
          message: 'Please provide a Pokemon ID in the query parameters'
        });
      }

      logger.info(`Received request for Pokemon ID: ${id}`);
      const pokemonData = await this.pokemonService.processPokemonData(id);
      
      res.json(pokemonData);
    } catch (error) {
      logger.error(`Error in getPokemon controller:`, error.message);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to fetch Pokemon data'
      });
    }
  }

  /**
   * Get random color endpoint
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getRandomColor(req, res) {
    try {
      const color = this.pokemonService.getRandomColor();
      res.json(color);
    } catch (error) {
      logger.error(`Error in getRandomColor controller:`, error.message);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to generate random color'
      });
    }
  }
}

module.exports = PokemonController;
