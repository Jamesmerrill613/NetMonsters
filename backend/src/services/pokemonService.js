/**
 * Pokemon service for handling Pokemon data operations
 */
const axios = require('axios');
const config = require('../config/config');
const logger = require('../utils/logger');
const { getPokemonTypeColor } = require('../constants/pokemonTypes');

class PokemonService {
  constructor() {
    this.baseUrl = config.pokeApi.baseUrl;
    this.timeout = config.pokeApi.timeout;
    this.retryAttempts = config.pokeApi.retryAttempts;
    this.retryDelay = config.pokeApi.retryDelay;
    
    // Create axios instance with default config
    this.apiClient = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout
    });
  }

  /**
   * Get Pokemon data from external API
   * @param {string|number} id - Pokemon ID or name
   * @returns {Promise<Object>} Pokemon data
   */
  async getPokemonFromApi(id) {
    try {
      logger.info(`Fetching Pokemon data for ID: ${id}`);
      const response = await this.apiClient.get(`pokemon/${id}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch Pokemon ${id}:`, error.message);
      throw new Error(`Failed to fetch Pokemon data: ${error.message}`);
    }
  }

  /**
   * Get move data from external API
   * @param {string} url - Move URL
   * @returns {Promise<Object>} Move data
   */
  async getMoveData(url) {
    try {
      const response = await axios.get(url, { timeout: this.timeout });
      const data = response.data;
      
      return {
        name: data.name,
        accuracy: data.accuracy,
        type: data.type.name,
        power: data.power,
        pp: data.pp,
        damage_class: data.damage_class.name
      };
    } catch (error) {
      logger.error(`Failed to fetch move data from ${url}:`, error.message);
      throw new Error(`Failed to fetch move data: ${error.message}`);
    }
  }

  /**
   * Get evolution chain data
   * @param {string} speciesUrl - Species URL
   * @returns {Promise<string>} Final evolution name
   */
  async getEvolutionName(speciesUrl) {
    try {
      const speciesResponse = await axios.get(speciesUrl, { timeout: this.timeout });
      const chainResponse = await axios.get(speciesResponse.data.evolution_chain.url, { timeout: this.timeout });
      
      let chain = chainResponse.data.chain;
      while (chain.evolves_to && chain.evolves_to.length > 0) {
        chain = chain.evolves_to[0];
      }
      
      return chain.species.name;
    } catch (error) {
      logger.error(`Failed to fetch evolution chain:`, error.message);
      throw new Error(`Failed to fetch evolution data: ${error.message}`);
    }
  }

  /**
   * Process Pokemon data into game format
   * @param {string|number} id - Pokemon ID
   * @returns {Promise<Object>} Processed Pokemon data
   */
  async processPokemonData(id) {
    try {
      const dbData = await this.getPokemonFromApi(id);
      logger.info(`Processing Pokemon: ${dbData.name}`);

      // Check if Pokemon should evolve
      const evolvesTo = await this.getEvolutionName(dbData.species.url);
      if (dbData.name !== evolvesTo) {
        logger.info(`${dbData.name} evolves to ${evolvesTo}`);
        return await this.processPokemonData(evolvesTo);
      }

      // Get random moves (excluding status moves)
      const moves = [];
      const availableMoves = dbData.moves.filter(move => move.move);
      
      while (moves.length < 4 && availableMoves.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableMoves.length);
        const moveData = await this.getMoveData(availableMoves[randomIndex].move.url);
        
        if (moveData.damage_class !== "status") {
          moves.push(moveData);
        }
        
        // Remove used move to avoid duplicates
        availableMoves.splice(randomIndex, 1);
      }

      // Format the data for the game
      const processedData = {
        id: dbData.id,
        name: dbData.name,
        moves: moves,
        height: dbData.height,
        weight: dbData.weight,
        sprites: {
          back: dbData.sprites.back_default,
          front: dbData.sprites.front_default
        },
        stats: {
          hp: dbData.stats[0].base_stat,
          attack: dbData.stats[1].base_stat,
          defense: dbData.stats[2].base_stat,
          special_attack: dbData.stats[3].base_stat,
          special_defense: dbData.stats[4].base_stat,
          speed: dbData.stats[5].base_stat
        },
        types: {
          primary: dbData.types[0].type.name,
          secondary: dbData.types.length > 1 ? dbData.types[1].type.name : null
        },
        type_color: getPokemonTypeColor(dbData.types[0].type.name)
      };

      // Fallback to Charizard if sprites are missing
      if (!processedData.sprites.back) {
        logger.warn(`Missing sprites for ${dbData.name}, falling back to Charizard`);
        return await this.processPokemonData(config.game.defaultPokemonId);
      }

      return processedData;
    } catch (error) {
      logger.error(`Failed to process Pokemon ${id}:`, error.message);
      throw error;
    }
  }

  /**
   * Generate random color (for testing/utility)
   * @returns {Object} Random RGB color
   */
  getRandomColor() {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    
    return {
      color: `rgb(${r},${g},${b})`
    };
  }
}

module.exports = PokemonService;
