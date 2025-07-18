/**
 * Application configuration
 */
const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true
    }
  },

  // Pokemon API configuration
  pokeApi: {
    baseUrl: 'https://pokeapi.co/api/v2/',
    timeout: 10000, // 10 seconds
    retryAttempts: 3,
    retryDelay: 1000 // 1 second
  },

  // Database configuration
  database: {
    path: process.env.DB_PATH || './pokemon_db/',
    maps: {
      pokemonIdMap: 'pokemon_id_map.json',
      speciesIdMap: 'species_id_map.json'
    }
  },

  // Game configuration
  game: {
    maxPlayers: 16,
    defaultPokemonId: 6, // Charizard fallback
    battleTimeout: 300000 // 5 minutes
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableConsole: process.env.NODE_ENV !== 'production',
    enableFile: process.env.NODE_ENV === 'production'
  }
};

module.exports = config;
